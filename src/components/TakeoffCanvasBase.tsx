import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  ZoomIn, ZoomOut, RotateCcw, MousePointer, Trash2, 
  Move, Save
} from 'lucide-react';
import { Tool, Measurement, Point } from '../types/takeoff';
import { calculateMeasurementStats, hitTest } from '../utils/takeoffMath';

interface TakeoffCanvasBaseProps {
  imageUrl: string;
  measurements: Measurement[];
  tools: Tool[];
  activeToolId: string | null; // ID da ferramenta ativa (ou null para Select)
  pixelsPerUnit?: number; // Fator de escala (Calibração)
  
  onMeasurementAdd: (m: Measurement) => void;
  onMeasurementUpdate: (id: string, m: Partial<Measurement>) => void;
  onMeasurementDelete: (id: string) => void;
  onSelectMeasurement: (id: string | null) => void;
  selectedMeasurementId?: string | null;
}

export const TakeoffCanvasBase: React.FC<TakeoffCanvasBaseProps> = ({
  imageUrl,
  measurements,
  tools,
  activeToolId,
  pixelsPerUnit = 1, // Default 1:1
  onMeasurementAdd,
  onMeasurementUpdate,
  onMeasurementDelete,
  onSelectMeasurement,
  selectedMeasurementId
}) => {
  // Estado Visual
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Estado de Desenho/Edição
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [dragStart, setDragStart] = useState<Point | null>(null);

  // Determinar ferramenta ativa
  const activeTool = tools.find(t => t.id === activeToolId);
  const isSelectMode = !activeTool || activeTool.type === 'select';

  // --- Funções de Coordenadas ---
  
  // Converte evento do mouse para coordenadas da imagem (desconsiderando zoom/pan)
  const getCanvasCoordinates = (e: React.MouseEvent): Point => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom
    };
  };

  // --- Handlers de Mouse ---

  const handleMouseDown = (e: React.MouseEvent) => {
    // 1. Pan (Espaço + Clique ou Roda do Mouse)
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    const coords = getCanvasCoordinates(e);

    // 2. Modo Seleção
    if (isSelectMode) {
      const hitId = hitTest(coords, measurements, zoom);
      if (hitId) {
        onSelectMeasurement(hitId);
      } else {
        onSelectMeasurement(null);
      }
      return;
    }

    // 3. Modo Desenho
    if (activeTool) {
      if (!isDrawing) {
        setIsDrawing(true);
        setCurrentPoints([coords]); // Início
      } else {
        // Adicionar ponto ao polígono/linha atual
        setCurrentPoints(prev => [...prev, coords]);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Lógica de Pan
    if (isPanning && dragStart) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    // Preview do desenho (linha elástica)
    if (isDrawing && currentPoints.length > 0) {
      const coords = getCanvasCoordinates(e);
      // Redesenhar canvas com linha temporária (implementado no useEffect de render)
      renderCanvas(coords); 
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Finalizar desenho (Double Click ou tecla Enter)
  const finishDrawing = () => {
    if (!isDrawing || !activeTool || currentPoints.length < 2) {
      // Se for ferramenta de ponto único (ex: vault), finalizar com 1 ponto
      if (activeTool && activeTool.type === 'vault' && currentPoints.length === 1) {
        // Pass trough
      } else {
        cancelDrawing();
        return;
      }
    }

    // Calcular estatísticas usando o utilitário corrigido
    const stats = calculateMeasurementStats(
      currentPoints, 
      activeTool.type, 
      activeTool.config, 
      pixelsPerUnit
    );

    const newMeasurement: Measurement = {
      id: Date.now().toString(),
      type: 'distance', // Simplificado, ideal vir do activeTool
      toolType: activeTool.type,
      label: `${activeTool.name} ${measurements.length + 1}`,
      points: [...currentPoints],
      color: activeTool.config?.color || '#000',
      config: activeTool.config,
      ...stats
    };

    onMeasurementAdd(newMeasurement);
    cancelDrawing();
  };

  const cancelDrawing = () => {
    setIsDrawing(false);
    setCurrentPoints([]);
    renderCanvas(null);
  };

  // --- Renderização (Canvas Puro) ---

  const renderCanvas = useCallback((previewPoint: Point | null) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Limpar
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Aplicar Transformações Globais (Zoom/Pan)
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // 1. Desenhar Imagem de Fundo (Se necessário carregar via Image Object)
    // Nota: Se a imagem for CSS background, não desenhamos aqui. 
    // Assumindo que queremos exportar, deveríamos desenhar. 
    // Para performance neste exemplo, mantemos transparente para ver o CSS atrás.

    // 2. Desenhar Medições Existentes
    measurements.forEach(m => {
      const isSelected = m.id === selectedMeasurementId;
      
      ctx.beginPath();
      ctx.lineWidth = isSelected ? 4 / zoom : 2 / zoom;
      ctx.strokeStyle = m.color || '#00f';
      
      // Desenhar Linha
      if (m.points.length > 0) {
        ctx.moveTo(m.points[0].x, m.points[0].y);
        m.points.forEach(p => ctx.lineTo(p.x, p.y));
      }
      
      // Se for área/vala, preencher levemente
      if (m.toolType === 'trench' || m.toolType === 'hydro-excavation') {
        ctx.fillStyle = m.color + '33'; // Transparência
        ctx.fill(); // Fecha o path automaticamente
      }
      
      ctx.stroke();

      // Desenhar Vértices (Se selecionado)
      if (isSelected) {
        ctx.fillStyle = '#fff';
        m.points.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4 / zoom, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
      }
    });

    // 3. Desenhar Medição em Progresso (Draft)
    if (currentPoints.length > 0) {
      ctx.beginPath();
      ctx.lineWidth = 2 / zoom;
      ctx.strokeStyle = activeTool?.config?.color || '#f00';
      ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
      
      for (let i = 1; i < currentPoints.length; i++) {
        ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
      }

      // Linha elástica até o mouse
      if (previewPoint) {
        ctx.lineTo(previewPoint.x, previewPoint.y);
      }

      ctx.stroke();
    }

    ctx.restore();
  }, [measurements, currentPoints, zoom, pan, selectedMeasurementId, activeTool]);

  // Efeito para redesenhar quando algo mudar
  useEffect(() => {
    renderCanvas(null);
  }, [renderCanvas]);

  // --- Controles de Zoom ---
  const handleZoom = (delta: number) => {
    setZoom(z => Math.max(0.1, Math.min(5, z + delta)));
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Barra de Ferramentas Interna */}
      <div className="flex items-center justify-between p-2 bg-white border-b">
        <div className="flex space-x-2">
           <span className="text-sm font-semibold text-gray-600">
             {activeTool ? `Ferramenta: ${activeTool.name}` : 'Modo: Seleção/Navegação'}
           </span>
           {isDrawing && (
             <Badge variant="destructive" className="animate-pulse">
               Desenhando... (Double-click p/ finalizar)
             </Badge>
           )}
        </div>
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm" onClick={() => handleZoom(-0.1)}><ZoomOut className="w-4 h-4"/></Button>
          <span className="text-xs self-center px-2">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="sm" onClick={() => handleZoom(0.1)}><ZoomIn className="w-4 h-4"/></Button>
          <Button variant="ghost" size="sm" onClick={() => { setZoom(1); setPan({x:0, y:0}); }}><RotateCcw className="w-4 h-4"/></Button>
        </div>
      </div>

      {/* Área do Canvas */}
      <div 
        ref={containerRef} 
        className="flex-1 relative overflow-hidden cursor-crosshair"
        onContextMenu={(e) => { e.preventDefault(); finishDrawing(); }} // Botão direito finaliza
      >
        {/* Imagem de Fundo (Renderizada via CSS para facilitar) */}
        <div 
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            backgroundImage: `url(${imageUrl})`,
            backgroundRepeat: 'no-repeat',
            position: 'absolute',
            top: 0, left: 0,
            width: '2000px', // Idealmente dinâmico baseado na img
            height: '2000px',
            pointerEvents: 'none' // Deixa cliques passarem para o canvas
          }}
        />

        <canvas
          ref={canvasRef}
          width={containerRef.current?.clientWidth || 800}
          height={containerRef.current?.clientHeight || 600}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onDoubleClick={finishDrawing}
          className="absolute top-0 left-0 z-10"
        />
        
        {/* Botão Flutuante para Finalizar (UX Mobile/Desktop) */}
        {isDrawing && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
             <Button onClick={finishDrawing} className="shadow-lg">
               <Save className="w-4 h-4 mr-2"/> Finalizar Medição
             </Button>
          </div>
        )}
      </div>
    </div>
  );
};