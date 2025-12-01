import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ZoomIn, ZoomOut, RotateCcw, Save, Move, MousePointer
} from 'lucide-react';

// Imports corrigidos
import { Tool, Measurement, Point } from '@/types/takeoff';
import { calculateMeasurementStats, hitTest } from '@/utils/takeoffMath';

interface TakeoffCanvasBaseProps {
  imageUrl: string;
  measurements: Measurement[];
  tools: Tool[];
  activeToolId: string | null;
  pixelsPerUnit?: number;
  
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
  pixelsPerUnit = 1,
  onMeasurementAdd,
  onSelectMeasurement,
  selectedMeasurementId
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [dragStart, setDragStart] = useState<Point | null>(null);

  const activeTool = tools.find(t => t.id === activeToolId);
  const isSelectMode = !activeTool || activeTool.type === 'select';

  const getCanvasCoordinates = (e: React.MouseEvent): Point => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    const coords = getCanvasCoordinates(e);

    if (isSelectMode) {
      const hitId = hitTest(coords, measurements, zoom);
      onSelectMeasurement(hitId);
      return;
    }

    if (activeTool) {
      if (!isDrawing) {
        setIsDrawing(true);
        setCurrentPoints([coords]);
      } else {
        setCurrentPoints(prev => [...prev, coords]);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && dragStart) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }
    if (isDrawing) renderCanvas(getCanvasCoordinates(e));
  };

  const finishDrawing = () => {
    if (!isDrawing || !activeTool || currentPoints.length < 1) return;

    const stats = calculateMeasurementStats(
      currentPoints, 
      activeTool.type, 
      activeTool.config, 
      pixelsPerUnit
    );

    const newMeasurement: Measurement = {
      id: Date.now().toString(),
      type: stats.unit === 'sq ft' ? 'area' : 'distance',
      toolType: activeTool.type,
      label: `${activeTool.name} ${measurements.length + 1}`,
      points: [...currentPoints],
      color: activeTool.config?.color || '#FF0000',
      config: activeTool.config,
      ...stats
    };

    onMeasurementAdd(newMeasurement);
    setIsDrawing(false);
    setCurrentPoints([]);
    renderCanvas(null);
  };

  const renderCanvas = useCallback((previewPoint: Point | null) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    measurements.forEach(m => {
      const isSelected = m.id === selectedMeasurementId;
      ctx.beginPath();
      ctx.lineWidth = isSelected ? 4 / zoom : 2 / zoom;
      ctx.strokeStyle = m.color;
      
      if (m.points.length > 0) {
        ctx.moveTo(m.points[0].x, m.points[0].y);
        m.points.forEach(p => ctx.lineTo(p.x, p.y));
      }
      
      if (m.type === 'area') {
        ctx.fillStyle = m.color + '40';
        ctx.fill();
        ctx.lineTo(m.points[0].x, m.points[0].y); // Fechar loop visualmente
      }
      ctx.stroke();
    });

    if (isDrawing && currentPoints.length > 0) {
      ctx.beginPath();
      ctx.lineWidth = 2 / zoom;
      ctx.strokeStyle = activeTool?.config?.color || '#FF0000';
      ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
      currentPoints.forEach(p => ctx.lineTo(p.x, p.y));
      if (previewPoint) ctx.lineTo(previewPoint.x, previewPoint.y);
      ctx.stroke();
    }

    ctx.restore();
  }, [measurements, currentPoints, zoom, pan, selectedMeasurementId, activeTool]);

  useEffect(() => { renderCanvas(null); }, [renderCanvas]);

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <div className="absolute top-4 right-4 z-20 flex gap-2 bg-white/90 p-1 rounded-lg shadow border">
        <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.max(0.1, z - 0.1))}><ZoomOut className="w-4 h-4"/></Button>
        <span className="self-center px-2 text-xs font-mono">{Math.round(zoom * 100)}%</span>
        <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.min(5, z + 0.1))}><ZoomIn className="w-4 h-4"/></Button>
        <Button variant="ghost" size="icon" onClick={() => { setZoom(1); setPan({x:0, y:0}); }}><RotateCcw className="w-4 h-4"/></Button>
      </div>

      <div 
        ref={containerRef} 
        className="flex-1 relative overflow-hidden cursor-crosshair"
        onContextMenu={(e) => { e.preventDefault(); finishDrawing(); }}
      >
        <div 
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            backgroundImage: `url(${imageUrl})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain', // Importante para alinhar
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none'
          }}
        />
        <canvas
          ref={canvasRef}
          width={containerRef.current?.clientWidth || 800}
          height={containerRef.current?.clientHeight || 600}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={() => setIsPanning(false)}
          onDoubleClick={finishDrawing}
          className="absolute inset-0 z-10"
        />
      </div>
    </div>
  );
};