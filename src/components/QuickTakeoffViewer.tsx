import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, AlertCircle, RefreshCw, FileX } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Configure PDF.js worker - usando CDN do unpkg com versão dinâmica
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Log da configuração do PDF.js (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  console.log('QuickTakeoffViewer - PDF.js version:', pdfjs.version);
  console.log('QuickTakeoffViewer - Worker:', pdfjs.GlobalWorkerOptions.workerSrc);
}

// PDF.js options para melhor compatibilidade - criado uma vez e reutilizado
const PDF_OPTIONS = {
  disableOptionalContent: true, // Desabilitar camadas opcionais que podem causar problemas
  disableFontFace: false, // Manter fontes para melhor renderização
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
};

interface TakeoffMeasurement {
  id: string;
  type:
    | 'select'
    | 'layout'
    | 'walls'
    | 'area'
    | 'openings'
    | 'slabs'
    | 'foundation'
    | 'structure'
    | 'finishes'
    | 'roofing'
    | 'note'
    | 'trench' // Mantido para compatibilidade
    | 'conduit' // Mantido para compatibilidade
    | 'vault' // Mantido para compatibilidade
    | 'bore-shot' // Mantido para compatibilidade
    | 'hydro-excavation-trench' // Mantido para compatibilidade
    | 'hydro-excavation-hole' // Mantido para compatibilidade
    | 'hydro-excavation-pothole'; // Mantido para compatibilidade
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
  fileType?: 'pdf' | 'image';
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  activeTool: string;
  measurements: TakeoffMeasurement[];
  onAddMeasurement: (measurement: Omit<TakeoffMeasurement, 'id'>) => void;
  onUpdateMeasurement?: (id: string, updates: Partial<TakeoffMeasurement>) => void;
  scale?: string;
  zoom: number;
  selectedColor?: string;
  trenchConfig: any;
  boreShotConfig: any;
  conduitConfig: any;
  hydroExcavationConfig: any;
  vaultConfig: any;
  areaConfig?: any;
}

const QuickTakeoffViewer: React.FC<QuickTakeoffViewerProps> = ({
  pdfUrl,
  fileType = 'pdf',
  currentPage,
  totalPages,
  setCurrentPage,
  setTotalPages,
  activeTool,
  measurements,
  onAddMeasurement,
  onUpdateMeasurement,
  scale: _scale,
  zoom,
  selectedColor,
  trenchConfig,
  boreShotConfig,
  conduitConfig,
  hydroExcavationConfig,
  vaultConfig,
  areaConfig,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<
    { x: number; y: number }[]
  >([]);
  const [pageDimensions, setPageDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });
  
  // Estados para ferramenta selecionar
  const [selectedMeasurements, setSelectedMeasurements] = useState<string[]>([]);
  const [isMoving, setIsMoving] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [moveStart, setMoveStart] = useState<{ x: number; y: number } | null>(null);
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; measurementId: string } | null>(null);

  // Estados para zoom e navegação
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [_containerSize, setContainerSize] = useState({ width: 0, height: 0 });


  // Estado para controle de erro e retry
  const [pdfError, setPdfError] = useState<Error | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const { toast } = useToast();

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
    
    // Calcular zoom inicial para caber na tela
    if (containerRef.current && width > 0 && height > 0) {
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      const scaleX = containerWidth / width;
      const scaleY = containerHeight / height;
      const initialScale = Math.min(scaleX, scaleY, 1); // Não aumentar além do tamanho original
      
      if (initialScale < 1 && initialScale > 0) {
        setZoomLevel(initialScale);
      }
    }
  };

  // Função para pan (arrastar) com mouse
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // A ferramenta "select" permite pan (mover visualização)
    if (activeTool === 'select') {
      if (e.button === 0) {
        // Botão esquerdo do mouse - iniciar pan
        setIsDragging(true);
        setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      }
      return;
    }

    // Outras ferramentas ativas não permitem pan
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
    // A ferramenta "select" permite pan
    if (activeTool === 'select' && isDragging) {
      const newOffset = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      };
      setPanOffset(newOffset);
      return;
    }

    // Outras ferramentas ativas não permitem pan
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

  // Função para zoom com roda do mouse
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // Permitir zoom sempre, mas usar Ctrl+Wheel para zoom quando ferramenta estiver ativa
    if (activeTool && activeTool !== 'select' && !e.ctrlKey) {
      return;
    }

    e.preventDefault();
    
    // Determinar direção do scroll (deltaY negativo = zoom in, positivo = zoom out)
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoomLevel = Math.max(0.1, Math.min(5, zoomLevel + delta));
    
    setZoomLevel(newZoomLevel);
  };

  // Função para resetar zoom e pan
  const resetView = () => {
    if (containerRef.current && pageDimensions.width > 0 && pageDimensions.height > 0) {
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      const scaleX = containerWidth / pageDimensions.width;
      const scaleY = containerHeight / pageDimensions.height;
      const fitScale = Math.min(scaleX, scaleY, 1);
      
      setZoomLevel(fitScale);
    } else {
      setZoomLevel(1);
    }
    setPanOffset({ x: 0, y: 0 });
  };

  // Calcular tamanho do container
  useEffect(() => {
    const updateContainerSize = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        setContainerSize({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };

    updateContainerSize();
    window.addEventListener('resize', updateContainerSize);
    return () => window.removeEventListener('resize', updateContainerSize);
  }, []);

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

  // Função auxiliar para calcular coordenadas do mouse
  const getMouseCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scale = zoom * zoomLevel;
    
    let x, y;
    if (fileType === 'image') {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      x = (e.clientX - centerX) / scale + pageDimensions.width / 2;
      y = (e.clientY - centerY) / scale + pageDimensions.height / 2;
    } else {
      x = (e.clientX - rect.left) / scale;
      y = (e.clientY - rect.top) / scale;
    }
    
    return { x, y };
  };

  // Função para verificar se um ponto está dentro de uma medição
  const isPointInMeasurement = (point: { x: number; y: number }, measurement: TakeoffMeasurement, tolerance: number = 10) => {
    if (measurement.coordinates.length < 2) return false;
    
    // Verificar se o ponto está próximo de alguma coordenada
    for (const coord of measurement.coordinates) {
      const distance = Math.sqrt(
        Math.pow(point.x - coord.x, 2) + Math.pow(point.y - coord.y, 2)
      );
      if (distance <= tolerance / (zoom * zoomLevel)) {
        return true;
      }
    }
    
    // Verificar se o ponto está na linha (para medições lineares)
    for (let i = 0; i < measurement.coordinates.length - 1; i++) {
      const p1 = measurement.coordinates[i];
      const p2 = measurement.coordinates[i + 1];
      const distance = distanceToLineSegment(point, p1, p2);
      if (distance <= tolerance / (zoom * zoomLevel)) {
        return true;
      }
    }
    
    return false;
  };

  // Função auxiliar para calcular distância de ponto a segmento de linha
  const distanceToLineSegment = (
    point: { x: number; y: number },
    lineStart: { x: number; y: number },
    lineEnd: { x: number; y: number }
  ) => {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeTool) return;
    
    // A ferramenta "select" - permitir seleção de medições, mas não interferir no pan
    if (activeTool === 'select') {
      // Prevenir que o evento se propague para o container (que faz pan)
      e.stopPropagation();
      
      const coords = getMouseCoordinates(e);
      if (!coords) return;

      // Verificar se clicou em uma medição existente
      let clickedMeasurement: TakeoffMeasurement | null = null;
      for (const measurement of measurements) {
        if (isPointInMeasurement(coords, measurement)) {
          clickedMeasurement = measurement;
          break;
        }
      }

      if (clickedMeasurement) {
        // Se Shift está pressionado, adicionar/remover da seleção
        if (e.shiftKey) {
          if (selectedMeasurements.includes(clickedMeasurement.id)) {
            setSelectedMeasurements(prev => prev.filter(id => id !== clickedMeasurement!.id));
          } else {
            setSelectedMeasurements(prev => [...prev, clickedMeasurement!.id]);
          }
        } else {
          // Selecionar apenas esta medição
          if (!selectedMeasurements.includes(clickedMeasurement.id)) {
            setSelectedMeasurements([clickedMeasurement.id]);
          }
        }

        // Verificar se clicou em um handle de redimensionamento (canto)
        const isResizeHandle = checkResizeHandle(coords, clickedMeasurement);
        if (isResizeHandle) {
          setIsResizing(true);
          setResizeStart({ x: coords.x, y: coords.y, measurementId: clickedMeasurement.id });
        } else {
          // Iniciar movimento da medição
          setIsMoving(true);
          setMoveStart(coords);
        }
      } else {
        // Clicou em área vazia - limpar seleção (a menos que Shift esteja pressionado)
        if (!e.shiftKey) {
          setSelectedMeasurements([]);
        }
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Calcular coordenadas considerando o posicionamento do canvas
    const rect = canvas.getBoundingClientRect();
    const scale = zoom * zoomLevel;
    
    // Para imagens, o canvas está centralizado, então precisamos calcular a partir do centro
    let x, y;
    if (fileType === 'image') {
      // Para imagens, o canvas está centralizado com transform translate
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      x = (e.clientX - centerX) / scale + pageDimensions.width / 2;
      y = (e.clientY - centerY) / scale + pageDimensions.height / 2;
    } else {
      // Para PDFs, cálculo normal
      x = (e.clientX - rect.left) / scale;
      y = (e.clientY - rect.top) / scale;
    }

    console.log('Mouse down at:', { x, y, activeTool, scale, zoom, zoomLevel, rect, fileType });
    setIsDrawing(true);
    setDrawingPoints([{ x, y }]);
  };

  // Verificar se o ponto está em um handle de redimensionamento
  const checkResizeHandle = (
    point: { x: number; y: number },
    measurement: TakeoffMeasurement
  ): boolean => {
    if (measurement.coordinates.length === 0) return false;
    
    // Verificar cantos (primeiro e último ponto)
    const tolerance = 8 / (zoom * zoomLevel);
    const firstPoint = measurement.coordinates[0];
    const lastPoint = measurement.coordinates[measurement.coordinates.length - 1];
    
    const distToFirst = Math.sqrt(
      Math.pow(point.x - firstPoint.x, 2) + Math.pow(point.y - firstPoint.y, 2)
    );
    const distToLast = Math.sqrt(
      Math.pow(point.x - lastPoint.x, 2) + Math.pow(point.y - lastPoint.y, 2)
    );
    
    return distToFirst <= tolerance || distToLast <= tolerance;
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // A ferramenta "select" - mover ou redimensionar
    if (activeTool === 'select') {
      const coords = getMouseCoordinates(e);
      if (!coords) return;

      if (isMoving && moveStart && selectedMeasurements.length > 0 && onUpdateMeasurement) {
        // Mover medições selecionadas
        const deltaX = coords.x - moveStart.x;
        const deltaY = coords.y - moveStart.y;
        
        selectedMeasurements.forEach(id => {
          const measurement = measurements.find(m => m.id === id);
          if (measurement) {
            const newCoordinates = measurement.coordinates.map(coord => ({
              x: coord.x + deltaX,
              y: coord.y + deltaY,
            }));
            onUpdateMeasurement(id, { coordinates: newCoordinates });
          }
        });
        
        setMoveStart(coords);
      } else if (isResizing && resizeStart && onUpdateMeasurement) {
        // Redimensionar medição
        const measurement = measurements.find(m => m.id === resizeStart.measurementId);
        if (measurement && measurement.coordinates.length > 0) {
          const centerX = measurement.coordinates.reduce((sum, c) => sum + c.x, 0) / measurement.coordinates.length;
          const centerY = measurement.coordinates.reduce((sum, c) => sum + c.y, 0) / measurement.coordinates.length;
          
          const startDist = Math.sqrt(
            Math.pow(resizeStart.x - centerX, 2) + Math.pow(resizeStart.y - centerY, 2)
          );
          const currentDist = Math.sqrt(
            Math.pow(coords.x - centerX, 2) + Math.pow(coords.y - centerY, 2)
          );
          
          if (startDist > 0) {
            const scale = currentDist / startDist;
            const newCoordinates = measurement.coordinates.map(coord => ({
              x: centerX + (coord.x - centerX) * scale,
              y: centerY + (coord.y - centerY) * scale,
            }));
            onUpdateMeasurement(resizeStart.measurementId, { coordinates: newCoordinates });
            setResizeStart({ ...resizeStart, x: coords.x, y: coords.y });
          }
        }
      }
      return;
    }

    if (!isDrawing || !activeTool) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Calcular coordenadas considerando o posicionamento do canvas
    const rect = canvas.getBoundingClientRect();
    const scale = zoom * zoomLevel;
    
    // Para imagens, o canvas está centralizado, então precisamos calcular a partir do centro
    let x, y;
    if (fileType === 'image') {
      // Para imagens, o canvas está centralizado com transform translate
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      x = (e.clientX - centerX) / scale + pageDimensions.width / 2;
      y = (e.clientY - centerY) / scale + pageDimensions.height / 2;
    } else {
      // Para PDFs, cálculo normal
      x = (e.clientX - rect.left) / scale;
      y = (e.clientY - rect.top) / scale;
    }

    // Estabilizar a caneta: manter apenas o ponto inicial e o ponto atual (dois pontos)
    setDrawingPoints(prev => {
      if (prev.length === 0) {
        return [{ x, y }];
      }
      // Manter apenas o primeiro ponto e atualizar o segundo com a posição atual
      const newPoints = [prev[0], { x, y }];
      // Forçar atualização imediata do canvas com os novos pontos
      requestAnimationFrame(() => {
        redrawCanvasWithPoints(newPoints);
      });
      return newPoints;
    });
  };

  // Função para redesenhar o canvas imediatamente com pontos específicos
  const redrawCanvasWithPoints = useCallback((points: { x: number; y: number }[]) => {
    const canvas = canvasRef.current;
    if (!canvas || !pageDimensions.width || !pageDimensions.height) return;

    const scale = zoom * zoomLevel;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpar e redesenhar tudo
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(scale, scale);

    // Desenhar medições existentes
    measurements.forEach(measurement => {
      if (measurement.coordinates.length < 2) return;
      
      const isSelected = selectedMeasurements.includes(measurement.id);
      
      // Desenhar linha da medição
      ctx.strokeStyle = isSelected ? '#ffff00' : measurement.color;
      ctx.lineWidth = isSelected ? 4 : 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = isSelected ? 'rgba(255, 255, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = isSelected ? 4 : 2;
      ctx.beginPath();
      ctx.moveTo(measurement.coordinates[0].x, measurement.coordinates[0].y);
      for (let i = 1; i < measurement.coordinates.length; i++) {
        ctx.lineTo(measurement.coordinates[i].x, measurement.coordinates[i].y);
      }
      ctx.stroke();
      
      // Desenhar handles de seleção (cantos) se estiver selecionada
      if (isSelected && activeTool === 'select') {
        ctx.fillStyle = '#ffff00';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        measurement.coordinates.forEach((coord, index) => {
          // Desenhar apenas no primeiro e último ponto
          if (index === 0 || index === measurement.coordinates.length - 1) {
            ctx.beginPath();
            ctx.arc(coord.x, coord.y, 6 / scale, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
          }
        });
      }
      
      ctx.shadowBlur = 0;
    });

    // Desenhar traço atual em tempo real com os pontos fornecidos
    if (points.length > 1) {
      const currentColor = selectedColor || getToolColor(activeTool);
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 2;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }, [measurements, activeTool, zoom, zoomLevel, pageDimensions, selectedColor, selectedMeasurements]);

  const handleCanvasMouseUp = () => {
    // A ferramenta "select" - finalizar mover/redimensionar
    if (activeTool === 'select') {
      setIsMoving(false);
      setIsResizing(false);
      setMoveStart(null);
      setResizeStart(null);
      return;
    }

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
      unit: 'm',
      color: selectedColor || getToolColor(activeTool),
      notes: '',
    };

    switch (activeTool) {
      case 'layout':
        return {
          ...baseMeasurement,
          type: 'layout',
        };

      case 'walls':
        return {
          ...baseMeasurement,
          type: 'walls',
          trenchWidth: trenchConfig?.width || 0.14, // Espessura padrão de parede em metros
          trenchDepth: trenchConfig?.depth || 2.7, // Altura padrão em metros
          spoilVolumeCY: calculateSpoilVolume(
            length,
            trenchConfig?.width || 0.14,
            trenchConfig?.depth || 2.7
          ),
        };

      case 'openings':
        return {
          ...baseMeasurement,
          type: 'openings',
          conduits: conduitConfig?.conduits || [],
        };

      case 'slabs':
        return {
          ...baseMeasurement,
          type: 'slabs',
          vaultDimensions: vaultConfig?.dimensions,
          vaultSpoilVolumeCY: vaultConfig?.spoilVolumeCY,
        };

      case 'foundation':
        return {
          ...baseMeasurement,
          type: 'foundation',
          conduits: boreShotConfig?.conduits || [],
        };

      case 'structure':
        return {
          ...baseMeasurement,
          type: 'structure',
          hydroExcavationType: hydroExcavationConfig?.type || 'trench',
          hydroHoleDimensions: hydroExcavationConfig?.holeDimensions,
        };

      case 'finishes':
        return {
          ...baseMeasurement,
          type: 'finishes',
          area: length * (areaConfig?.height || 1),
        };

      case 'roofing':
        return {
          ...baseMeasurement,
          type: 'roofing',
          area: length * (areaConfig?.height || 1),
        };

      // Mantido para compatibilidade
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
      select: '#6366f1',
      layout: '#3b82f6',
      walls: '#ef4444',
      area: '#10b981',
      openings: '#f59e0b',
      slabs: '#8b5cf6',
      foundation: '#92400e',
      structure: '#1e40af',
      finishes: '#ec4899',
      roofing: '#059669',
      note: '#6b7280',
      // Mantido para compatibilidade
      trench: '#ef4444',
      'bore-shot': '#3b82f6',
      conduit: '#10b981',
      'hydro-excavation': '#f59e0b',
      vault: '#8b5cf6',
      yardage: '#ec4899',
    };
    return colors[tool] || '#6b7280';
  };

  const calculateSpoilVolume = (
    length: number,
    width: number,
    depth: number
  ): number => {
    return length * width * depth; // Volume em metros cúbicos (m³)
  };

  const calculateAsphaltVolume = (
    length: number,
    width: number,
    thickness: number
  ): number => {
    return length * width * thickness; // Volume em metros cúbicos (m³)
  };

  const calculateConcreteVolume = (
    length: number,
    width: number,
    thickness: number
  ): number => {
    return length * width * thickness; // Volume em metros cúbicos (m³)
  };

  const calculateBackfillVolume = (
    length: number,
    width: number,
    depth: number
  ): number => {
    return length * width * depth; // Volume em metros cúbicos (m³)
  };

  // Draw measurements on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !pageDimensions.width || !pageDimensions.height) return;

    // Set canvas dimensions to match page (considerando zoomLevel)
    const scale = zoom * zoomLevel;
    const currentWidth = pageDimensions.width * scale;
    const currentHeight = pageDimensions.height * scale;
    
    // Só redimensionar se necessário para evitar redesenho desnecessário
    if (canvas.width !== currentWidth || canvas.height !== currentHeight) {
      canvas.width = currentWidth;
      canvas.height = currentHeight;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set zoom (considerando zoomLevel)
    ctx.save();
    ctx.scale(scale, scale);

    // Draw existing measurements
    measurements.forEach(measurement => {
      if (measurement.coordinates.length < 2) return;

      const isSelected = selectedMeasurements.includes(measurement.id);

      // Desenhar linha da medição
      ctx.strokeStyle = isSelected ? '#ffff00' : measurement.color;
      ctx.lineWidth = isSelected ? 4 : 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = isSelected ? 'rgba(255, 255, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = isSelected ? 4 : 2;
      ctx.beginPath();
      ctx.moveTo(measurement.coordinates[0].x, measurement.coordinates[0].y);

      for (let i = 1; i < measurement.coordinates.length; i++) {
        ctx.lineTo(measurement.coordinates[i].x, measurement.coordinates[i].y);
      }

      ctx.stroke();
      ctx.shadowBlur = 0;

      // Desenhar handles de seleção (cantos) se estiver selecionada
      if (isSelected && activeTool === 'select') {
        ctx.fillStyle = '#ffff00';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2 / scale;
        // Desenhar apenas no primeiro e último ponto
        const firstPoint = measurement.coordinates[0];
        const lastPoint = measurement.coordinates[measurement.coordinates.length - 1];
        
        [firstPoint, lastPoint].forEach(coord => {
          ctx.beginPath();
          ctx.arc(coord.x, coord.y, 6 / scale, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
        });
      }

      // Draw measurement label with background for visibility
      if (measurement.length) {
        const midPoint =
          measurement.coordinates[
            Math.floor(measurement.coordinates.length / 2)
          ];
        const text = `${measurement.length.toFixed(2)} m`;
        ctx.font = 'bold 14px Arial';
        const textMetrics = ctx.measureText(text);
        const textWidth = textMetrics.width;
        const textHeight = 16;
        
        // Draw background for text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(
          midPoint.x + 5 - 2,
          midPoint.y - textHeight - 2,
          textWidth + 4,
          textHeight + 4
        );
        
        // Draw text
        ctx.fillStyle = measurement.color;
        ctx.fillText(
          text,
          midPoint.x + 5,
          midPoint.y - 5
        );
      }
    });

    // Draw current drawing (será atualizado em tempo real via drawCurrentPath)
    if (drawingPoints.length > 1) {
      const currentColor = selectedColor || getToolColor(activeTool);
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 2;
      ctx.beginPath();
      ctx.moveTo(drawingPoints[0].x, drawingPoints[0].y);

      for (let i = 1; i < drawingPoints.length; i++) {
        ctx.lineTo(drawingPoints[i].x, drawingPoints[i].y);
      }

      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }, [measurements, drawingPoints, activeTool, zoom, zoomLevel, pageDimensions, selectedColor, selectedMeasurements]);

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
    <div className='h-full w-full flex flex-col overflow-hidden'>
      {/* PDF Controls */}
      <div className='pdf-controls bg-card border-b border-border flex-shrink-0 w-full sticky top-0 z-10'>
        <div className='flex flex-row items-center justify-between gap-1 sm:gap-2 md:gap-4 w-full px-1 sm:px-2 md:px-4 lg:px-6 py-1 sm:py-2 md:py-3 lg:py-4'>
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
        className='pdf-viewer-container flex-1 overflow-hidden bg-secondary/20 p-0 min-h-0 w-full h-full'
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{
          cursor: activeTool
            ? 'crosshair'
            : isDragging
              ? 'grabbing'
              : 'default',
        }}
      >
        <div
          className='relative bg-card shadow-lg mx-auto flex items-center justify-center'
          style={{
            width: '100%',
            height: '100%',
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
                  Use o botão de upload para carregar um arquivo PDF ou imagem
                </p>
              </div>
            </div>
          ) : fileType === 'image' ? (
            <div className="relative flex items-center justify-center w-full h-full overflow-hidden" ref={containerRef}>
              <img
                src={pdfUrl}
                alt="Planta carregada"
                id="takeoff-image"
                className="object-contain"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
                onLoad={(e) => {
                  const img = e.currentTarget;
                  const dimensions = {
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                  };
                  setPageDimensions(dimensions);
                  setTotalPages(1);
                  console.log('Imagem carregada com dimensões:', dimensions);
                  
                  // Calcular zoom inicial para caber na tela
                  if (containerRef.current && dimensions.width > 0 && dimensions.height > 0) {
                    const container = containerRef.current;
                    const containerWidth = container.clientWidth;
                    const containerHeight = container.clientHeight;
                    
                    const scaleX = containerWidth / dimensions.width;
                    const scaleY = containerHeight / dimensions.height;
                    const initialScale = Math.min(scaleX, scaleY, 1);
                    
                    if (initialScale < 1 && initialScale > 0) {
                      setZoomLevel(initialScale);
                    }
                  }
                }}
              />
              {/* Overlay Canvas for Measurements - Imagens */}
              {pageDimensions.width > 0 && pageDimensions.height > 0 && (
                <canvas
                  ref={canvasRef}
                  className='measurement-canvas absolute'
                    style={{
                      width: `${pageDimensions.width * zoom * zoomLevel}px`,
                      height: `${pageDimensions.height * zoom * zoomLevel}px`,
                      cursor: activeTool === 'select' ? 'default' : activeTool ? 'crosshair' : 'default',
                      pointerEvents: activeTool === 'select' ? 'none' : activeTool ? 'auto' : 'none',
                      zIndex: 10,
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={() => setIsDrawing(false)}
                />
              )}
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
              options={PDF_OPTIONS}
            >
              <div className="w-full h-full flex items-center justify-center overflow-hidden relative">
                <Page
                  pageNumber={currentPage}
                  scale={zoom}
                  onLoadSuccess={handlePageLoadSuccess}
                  onLoadError={error => {
                    console.error('Erro ao carregar página:', error);
                  }}
                  className="object-contain"
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  width={undefined}
                  height={undefined}
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
                {/* Overlay Canvas for Measurements */}
                {pageDimensions.width > 0 && pageDimensions.height > 0 && (
                  <canvas
                    ref={canvasRef}
                    className='measurement-canvas absolute top-0 left-0'
                    style={{
                      width: `${pageDimensions.width * zoom * zoomLevel}px`,
                      height: `${pageDimensions.height * zoom * zoomLevel}px`,
                      cursor: activeTool === 'select' ? 'default' : activeTool ? 'crosshair' : 'default',
                      pointerEvents: activeTool === 'select' ? 'none' : activeTool ? 'auto' : 'none',
                      zIndex: 10,
                    }}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={() => setIsDrawing(false)}
                  />
                )}
              </div>
            </Document>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickTakeoffViewer;
