import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, AlertCircle, RefreshCw, FileX } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ScaleCalibration } from './ScaleCalibration';

// Configure PDF.js worker - usando arquivo local do worker
// O Vite copia o worker para /public via plugin personalizado
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

// Log da configuração do PDF.js
console.log('QuickTakeoffViewer - PDF.js version:', pdfjs.version);
console.log(
  'QuickTakeoffViewer - Worker local:',
  pdfjs.GlobalWorkerOptions.workerSrc
);

// PDF.js options para melhor compatibilidade - será memoizado no componente
const createPdfOptions = () => ({
  disableOptionalContent: true, // Desabilitar camadas opcionais que podem causar problemas
  disableFontFace: false, // Manter fontes para melhor renderização
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
});

interface TakeoffMeasurement {
  id: string;
  type:
    | 'trench'
    | 'conduit'
    | 'vault'
    | 'yardage'
    | 'note'
    | 'bore-shot'
    | 'bore-pit'
    | 'concrete'
    | 'asphalt'
    | 'hydro-excavation-trench'
    | 'hydro-excavation-hole'
    | 'hydro-excavation-pothole';
  label: string;
  coordinates: { x: number; y: number }[];
  length?: number;
  area?: number;
  notes?: string;
  unit: string;
  color: string;
  trenchWidth?: number;
  trenchDepth?: number;
  spoilVolumeCY?: number;
  asphaltRemoval?: {
    width: number;
    thickness: number;
    volumeCY: number;
  };
  concreteRemoval?: {
    width: number;
    thickness: number;
    volumeCY: number;
  };
  backfill?: {
    type: string;
    customType?: string;
    width: number;
    depth: number;
    volumeCY: number;
  };
  conduits?: Array<{
    sizeIn: string;
    count: number;
    material: string;
  }>;
  hydroExcavationType?: 'trench' | 'hole' | 'potholing';
  hydroHoleShape?: 'rectangle' | 'circle';
  hydroHoleDimensions?: {
    length?: number;
    width?: number;
    diameter?: number;
    depth: number;
    depthUnit: 'inches' | 'feet';
  };
  hydroPotholingData?: {
    surfaceType: 'asphalt' | 'concrete' | 'dirt';
    averageDepth: number;
    depthUnit: 'inches' | 'feet';
    includeRestoration: boolean;
  };
  vaultDimensions?: {
    length: number;
    width: number;
    depth: number;
  };
  holeSize?: {
    length: number;
    width: number;
    depth: number;
  };
  vaultSpoilVolumeCY?: number;
  vaultAsphaltRemovalCY?: number;
  vaultConcreteRemovalCY?: number;
  vaultAsphaltRestorationCY?: number;
  vaultConcreteRestorationCY?: number;
  vaultBackfillCY?: number;
  vaultBackfillType?: string;
  vaultTrafficRated?: boolean;
}

interface QuickTakeoffViewerProps {
  pdfUrl: string;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  activeTool: string;
  measurements: TakeoffMeasurement[];
  onAddMeasurement: (measurement: Omit<TakeoffMeasurement, 'id'>) => void;
  scale: string;
  zoom: number;
  trenchConfig: any;
  boreShotConfig: any;
  conduitConfig: any;
  hydroExcavationConfig: any;
  vaultConfig: any;
}

const QuickTakeoffViewer: React.FC<QuickTakeoffViewerProps> = ({
  pdfUrl,
  currentPage,
  totalPages,
  setCurrentPage,
  setTotalPages,
  activeTool,
  measurements,
  onAddMeasurement,
  scale,
  zoom,
  trenchConfig,
  boreShotConfig,
  conduitConfig,
  hydroExcavationConfig,
  vaultConfig,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<
    { x: number; y: number }[]
  >([]);
  const [currentMeasurement, setCurrentMeasurement] = useState<any>(null);
  const [pageDimensions, setPageDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  // Estados para zoom e navegação
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Estado para histórico de medições (desfazer)
  const [measurementHistory, setMeasurementHistory] = useState<
    TakeoffMeasurement[]
  >([]);

  // Estado para controle de erro e retry
  const [pdfError, setPdfError] = useState<Error | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const { toast } = useToast();

  // Memoizar as opções do PDF.js para evitar recriações desnecessárias
  const pdfOptions = useMemo(() => createPdfOptions(), []);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('Document loaded successfully with', numPages, 'pages');
    setTotalPages(numPages);
  };

  const handlePageChange = useCallback((newPage: number) => {
    console.log('Changing page from', currentPage, 'to', newPage);
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }, [currentPage, totalPages, setCurrentPage]);

  const handlePageLoadSuccess = (page: any) => {
    const { width, height } = page.getViewport({ scale: 1 });
    setPageDimensions({ width, height });
    console.log('Page loaded with dimensions:', { width, height });
  };

  // Função para pan (arrastar) com mouse
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Estabilizar imagem quando ferramenta estiver ativa
    if (activeTool) {
      return;
    }

    if (e.button === 0) {
      // Botão esquerdo do mouse
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Estabilizar movimento quando ferramenta estiver ativa
    if (activeTool || !isDragging) {
      return;
    }

    if (isDragging) {
      const newOffset = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      };
      setPanOffset(newOffset);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Função para resetar zoom e pan
  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Função para desfazer última medição
  const undoLastMeasurement = () => {
    if (measurements.length === 0) {
      toast({
        title: 'Nada para desfazer',
        description: 'Não há medições para desfazer',
        variant: 'destructive',
      });
      return;
    }

    const lastMeasurement = measurements[measurements.length - 1];
    const newMeasurements = measurements.slice(0, -1);

    // Adicionar ao histórico
    setMeasurementHistory(prev => [...prev, lastMeasurement]);

    // Atualizar medições
    // TODO: Implementar callback para atualizar medições no componente pai

    toast({
      title: 'Medição Desfeita',
      description: `${lastMeasurement.label} foi removida`,
    });
  };

  // Navegação por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (currentPage > 1) {
            handlePageChange(currentPage - 1);
            toast({
              title: 'Página Anterior',
              description: `Página ${currentPage - 1} de ${totalPages}`,
            });
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (currentPage < totalPages) {
            handlePageChange(currentPage + 1);
            toast({
              title: 'Próxima Página',
              description: `Página ${currentPage + 1} de ${totalPages}`,
            });
          }
          break;
        case 'Home':
          e.preventDefault();
          if (currentPage !== 1) {
            handlePageChange(1);
            toast({
              title: 'Primeira Página',
              description: 'Página 1',
            });
          }
          break;
        case 'End':
          e.preventDefault();
          if (currentPage !== totalPages) {
            handlePageChange(totalPages);
            toast({
              title: 'Última Página',
              description: `Página ${totalPages}`,
            });
          }
          break;
        case '0':
          if (e.ctrlKey) {
            e.preventDefault();
            resetView();
            toast({
              title: 'View Resetada',
              description: 'Zoom voltou para 100% e posição centralizada',
            });
          }
          break;
        case 'r':
          if (e.ctrlKey) {
            e.preventDefault();
            resetView();
            toast({
              title: 'View Resetada',
              description: 'Zoom e posição resetados',
            });
          }
          break;
        case 'z':
          if (e.ctrlKey) {
            e.preventDefault();
            undoLastMeasurement();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, handlePageChange, toast, measurements]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeTool) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    console.log('Mouse down at:', { x, y, activeTool });
    setIsDrawing(true);
    setDrawingPoints([{ x, y }]);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !activeTool) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    setDrawingPoints(prev => [...prev, { x, y }]);
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawing || !activeTool) return;

    console.log('Mouse up, drawing points:', drawingPoints);
    setIsDrawing(false);

    if (drawingPoints.length < 2) {
      setDrawingPoints([]);
      return;
    }

    // Calculate measurement based on tool type
    const measurement = createMeasurementFromPoints(drawingPoints);
    if (measurement) {
      console.log('Adding measurement:', measurement);
      onAddMeasurement(measurement);
    }

    setDrawingPoints([]);
  };

  const createMeasurementFromPoints = (
    points: { x: number; y: number }[]
  ): Omit<TakeoffMeasurement, 'id'> | null => {
    if (points.length < 2) return null;

    const startPoint = points[0];
    const endPoint = points[points.length - 1];

    // Calculate length (simplified - in real implementation you'd use proper scale conversion)
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    const length = Math.sqrt(dx * dx + dy * dy) / 100; // Simplified scale conversion

    const baseMeasurement = {
      type: activeTool,
      label: `${activeTool.charAt(0).toUpperCase() + activeTool.slice(1)} ${measurements.filter(m => m.type === activeTool).length + 1}`,
      coordinates: points,
      length,
      unit: 'ft',
      color: getToolColor(activeTool),
      notes: '',
    };

    switch (activeTool) {
      case 'trench':
        return {
          ...baseMeasurement,
          type: 'trench',
          trenchWidth: trenchConfig?.width || 2,
          trenchDepth: trenchConfig?.depth || 3,
          spoilVolumeCY: calculateSpoilVolume(
            length,
            trenchConfig?.width || 2,
            trenchConfig?.depth || 3
          ),
          asphaltRemoval: trenchConfig?.asphaltRemoval
            ? {
                width: trenchConfig.asphaltRemoval.width,
                thickness: trenchConfig.asphaltRemoval.thickness,
                volumeCY: calculateAsphaltVolume(
                  length,
                  trenchConfig.asphaltRemoval.width,
                  trenchConfig.asphaltRemoval.thickness
                ),
              }
            : undefined,
          concreteRemoval: trenchConfig?.concreteRemoval
            ? {
                width: trenchConfig.concreteRemoval.width,
                thickness: trenchConfig.concreteRemoval.thickness,
                volumeCY: calculateConcreteVolume(
                  length,
                  trenchConfig.concreteRemoval.width,
                  trenchConfig.concreteRemoval.thickness
                ),
              }
            : undefined,
          backfill: trenchConfig?.backfill
            ? {
                type: trenchConfig.backfill.type,
                customType: trenchConfig.backfill.customType,
                width: trenchConfig.backfill.width,
                depth: trenchConfig.backfill.depth,
                volumeCY: calculateBackfillVolume(
                  length,
                  trenchConfig.backfill.width,
                  trenchConfig.backfill.depth
                ),
              }
            : undefined,
          conduits: conduitConfig?.conduits || [],
        };

      case 'bore-shot':
        return {
          ...baseMeasurement,
          type: 'bore-shot',
          conduits: boreShotConfig?.conduits || [],
        };

      case 'conduit':
        return {
          ...baseMeasurement,
          type: 'conduit',
          conduits: conduitConfig?.conduits || [],
        };

      case 'hydro-excavation':
        return {
          ...baseMeasurement,
          type: 'hydro-excavation-trench',
          hydroExcavationType: hydroExcavationConfig?.type || 'trench',
          hydroHoleShape: hydroExcavationConfig?.holeShape || 'rectangle',
          hydroHoleDimensions: hydroExcavationConfig?.holeDimensions,
          hydroPotholingData: hydroExcavationConfig?.potholingData,
          conduits: hydroExcavationConfig?.conduits || [],
        };

      case 'vault':
        return {
          ...baseMeasurement,
          type: 'vault',
          vaultDimensions: vaultConfig?.dimensions,
          holeSize: vaultConfig?.holeSize,
          vaultSpoilVolumeCY: vaultConfig?.spoilVolumeCY,
          vaultAsphaltRemovalCY: vaultConfig?.asphaltRemovalCY,
          vaultConcreteRemovalCY: vaultConfig?.concreteRemovalCY,
          vaultAsphaltRestorationCY: vaultConfig?.asphaltRestorationCY,
          vaultConcreteRestorationCY: vaultConfig?.concreteRestorationCY,
          vaultBackfillCY: vaultConfig?.backfillCY,
          vaultBackfillType: vaultConfig?.backfillType,
          vaultTrafficRated: vaultConfig?.trafficRated,
        };

      default:
        return { ...baseMeasurement, type: 'note' as const };
    }
  };

  const getToolColor = (tool: string): string => {
    const colors: Record<string, string> = {
      trench: '#ef4444',
      'bore-shot': '#3b82f6',
      conduit: '#10b981',
      'hydro-excavation': '#f59e0b',
      vault: '#8b5cf6',
      yardage: '#ec4899',
      note: '#6b7280',
    };
    return colors[tool] || '#6b7280';
  };

  const calculateSpoilVolume = (
    length: number,
    width: number,
    depth: number
  ): number => {
    return (length * width * depth) / 27; // Convert to cubic yards
  };

  const calculateAsphaltVolume = (
    length: number,
    width: number,
    thickness: number
  ): number => {
    return (length * width * thickness) / 27;
  };

  const calculateConcreteVolume = (
    length: number,
    width: number,
    thickness: number
  ): number => {
    return (length * width * thickness) / 27;
  };

  const calculateBackfillVolume = (
    length: number,
    width: number,
    depth: number
  ): number => {
    return (length * width * depth) / 27;
  };

  // Draw measurements on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !pageDimensions.width || !pageDimensions.height) return;

    // Set canvas dimensions to match page
    canvas.width = pageDimensions.width * zoom;
    canvas.height = pageDimensions.height * zoom;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set zoom
    ctx.save();
    ctx.scale(zoom, zoom);

    // Draw existing measurements
    measurements.forEach(measurement => {
      if (measurement.coordinates.length < 2) return;

      ctx.strokeStyle = measurement.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(measurement.coordinates[0].x, measurement.coordinates[0].y);

      for (let i = 1; i < measurement.coordinates.length; i++) {
        ctx.lineTo(measurement.coordinates[i].x, measurement.coordinates[i].y);
      }

      ctx.stroke();

      // Draw measurement label
      if (measurement.length) {
        const midPoint =
          measurement.coordinates[
            Math.floor(measurement.coordinates.length / 2)
          ];
        ctx.fillStyle = measurement.color;
        ctx.font = '12px Arial';
        ctx.fillText(
          `${measurement.length.toFixed(2)}'`,
          midPoint.x + 5,
          midPoint.y - 5
        );
      }
    });

    // Draw current drawing
    if (drawingPoints.length > 1) {
      ctx.strokeStyle = getToolColor(activeTool);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(drawingPoints[0].x, drawingPoints[0].y);

      for (let i = 1; i < drawingPoints.length; i++) {
        ctx.lineTo(drawingPoints[i].x, drawingPoints[i].y);
      }

      ctx.stroke();
    }

    ctx.restore();
  }, [measurements, drawingPoints, activeTool, zoom, pageDimensions]);

  if (!pdfUrl) {
    return (
      <div className='flex items-center justify-center h-full bg-gray-50'>
        <div className='text-center'>
          <div className='text-gray-400 text-6xl mb-4'>📄</div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Nenhum PDF carregado
          </h3>
          <p className='text-gray-500'>Faça upload de um PDF para começar</p>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col'>
      {/* PDF Controls */}
      <div className='pdf-controls bg-card border-b border-border flex-shrink-0 w-full sticky top-0 z-10'>
        <div className='flex flex-row items-center justify-between gap-2 sm:gap-4 md:gap-6 w-full px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4'>
          <div className='flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-shrink-0'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className='hover:bg-gray-100 flex-shrink-0'
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>

            <Button
              variant='outline'
              size='sm'
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className='hover:bg-gray-100 flex-shrink-0'
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div
        className='pdf-viewer-container flex-1 overflow-auto bg-secondary/20 p-2 sm:p-4 md:p-6 min-h-0'
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          cursor: activeTool
            ? 'crosshair'
            : isDragging
              ? 'grabbing'
              : 'default',
        }}
      >
        <div
          className='relative bg-card shadow-lg mx-auto w-full'
          style={{
            maxWidth: 'fit-content',
            minHeight: '100%',
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: 'center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          {!pdfUrl ? (
            <div className='flex items-center justify-center w-full h-full min-h-[calc(100vh-200px)] p-4 sm:p-6 md:p-8 lg:p-12'>
              <div className='text-center w-full max-w-md mx-auto px-4'>
                <div className='text-gray-400 text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-6'>📄</div>
                <p className='text-gray-600 dark:text-gray-300 font-medium text-base sm:text-lg md:text-xl mb-2 sm:mb-3'>
                  Nenhum PDF carregado
                </p>
                <p className='text-gray-500 dark:text-gray-400 text-sm sm:text-base'>
                  Use o botão de upload para carregar um arquivo PDF
                </p>
              </div>
            </div>
          ) : (
            <Document
              key={retryKey}
              file={pdfUrl}
              onLoadSuccess={(data) => {
                handleDocumentLoadSuccess(data);
                setPdfError(null);
              }}
              onLoadError={(error: Error) => {
                console.error('Error loading PDF:', error);
                setPdfError(error);

                // Handle specific PDF errors
                if (error.name === 'InvalidPDFException') {
                  console.error('❌ Invalid PDF structure detected:', {
                    error: error.message,
                    stack: error.stack,
                    pdfUrl: pdfUrl,
                  });

                  // Show user-friendly error message
                  toast({
                    title: 'Erro no PDF',
                    description:
                      'O arquivo PDF parece estar corrompido ou tem uma estrutura inválida. Por favor, tente fazer upload de um arquivo PDF diferente.',
                    variant: 'destructive',
                  });
                } else if (error.name === 'MissingPDFException') {
                  console.error('❌ PDF file not found:', error.message);
                  toast({
                    title: 'PDF Não Encontrado',
                    description:
                      'O arquivo PDF não pôde ser encontrado. Por favor, verifique a URL do arquivo e tente novamente.',
                    variant: 'destructive',
                  });
                } else if (error.name === 'UnexpectedResponseException') {
                  console.error(
                    '❌ Unexpected response from server:',
                    error.message
                  );
                  toast({
                    title: 'Erro do Servidor',
                    description:
                      'O servidor retornou uma resposta inesperada. Por favor, tente novamente mais tarde.',
                    variant: 'destructive',
                  });
                } else {
                  console.error('❌ Unknown PDF error:', error);
                  toast({
                    title: 'Erro ao Carregar PDF',
                    description:
                      'Ocorreu um erro ao carregar o PDF. Por favor, tente novamente.',
                    variant: 'destructive',
                  });
                }
              }}
              loading={
                <div className='flex items-center justify-center w-full h-full min-h-[400px] p-8'>
                  <div className='flex flex-col items-center gap-3'>
                    <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-red-600'></div>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Carregando PDF...
                    </p>
                  </div>
                </div>
              }
              error={
                <div className='flex items-center justify-center w-full h-full min-h-[400px] p-6'>
                  <div className='text-center w-full max-w-md mx-auto'>
                    <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 mb-4'>
                      <FileX className='w-8 h-8 text-red-600 dark:text-red-400' />
                    </div>
                    <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
                      Erro ao carregar PDF
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
                      Não foi possível carregar o arquivo. Verifique se está acessível e tente novamente.
                    </p>
                    <Button
                      variant='default'
                      size='sm'
                      className='bg-red-600 hover:bg-red-700 text-white'
                      onClick={() => {
                        setRetryKey(prev => prev + 1);
                        setPdfError(null);
                      }}
                    >
                      <RefreshCw className='w-4 h-4 mr-2' />
                      Tentar Novamente
                    </Button>
                    {pdfError && (
                      <details className='mt-4 text-left'>
                        <summary className='text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300'>
                          Detalhes do erro
                        </summary>
                        <p className='mt-2 text-xs text-gray-600 dark:text-gray-400 break-all bg-gray-50 dark:bg-gray-800 p-2 rounded'>
                          {pdfError.message || 'Erro desconhecido'}
                        </p>
                      </details>
                    )}
                  </div>
                </div>
              }
              options={pdfOptions}
            >
              <Page
                pageNumber={currentPage}
                scale={zoom}
                onLoadSuccess={handlePageLoadSuccess}
                onLoadError={error => {
                  console.error('Erro ao carregar página:', error);
                }}
                loading={
                  <div className='flex items-center justify-center w-full h-full min-h-[400px] p-8'>
                    <div className='flex flex-col items-center gap-3'>
                      <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-red-600'></div>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        Carregando página...
                      </p>
                    </div>
                  </div>
                }
                error={
                  <div className='flex items-center justify-center w-full h-full min-h-[400px] p-6'>
                    <div className='text-center w-full max-w-md mx-auto'>
                      <div className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/20 mb-3'>
                        <AlertCircle className='w-6 h-6 text-amber-600 dark:text-amber-400' />
                      </div>
                      <h4 className='text-base font-semibold text-gray-900 dark:text-gray-100 mb-1'>
                        Erro ao carregar página
                      </h4>
                      <p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
                        Página {currentPage} de {totalPages || '...'}
                      </p>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          const newPage = currentPage;
                          setCurrentPage(1);
                          setTimeout(() => setCurrentPage(newPage), 100);
                        }}
                      >
                        <RefreshCw className='w-4 h-4 mr-2' />
                        Tentar Novamente
                      </Button>
                    </div>
                  </div>
                }
              />
            </Document>
          )}

          {/* Overlay Canvas for Measurements */}
          {pageDimensions.width > 0 && pageDimensions.height > 0 && (
            <canvas
              ref={canvasRef}
              className='measurement-canvas'
              style={{
                width: `${pageDimensions.width * zoom * zoomLevel}px`,
                height: `${pageDimensions.height * zoom * zoomLevel}px`,
                cursor: activeTool ? 'crosshair' : 'default',
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: activeTool ? 'auto' : 'none',
              }}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={() => setIsDrawing(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickTakeoffViewer;
