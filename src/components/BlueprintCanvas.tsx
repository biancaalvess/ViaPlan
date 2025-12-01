import React, { useEffect, useState, useRef } from 'react';

export type Tool =
  | 'select'
  | 'trench'
  | 'pipe'
  | 'box'
  | 'note'
  | 'measure'
  | null;

export interface Measurement {
  id: number;
  project_id: number;
  toolId: string;
  toolType: Tool;
  value: number;
  unit: string;
  coordinates: {
    type: 'Point' | 'LineString' | 'Polygon';
    coordinates: number[] | number[][] | number[][][];
  };
  color: string;
  created_by: string;
  created_at: string;
  description?: string;
  length?: number;
  area?: number;
}

interface BlueprintCanvasProps {
  tool: Tool;
  imageUrl: string;
  onMeasurement: (measurement: Measurement) => void;
  sheetId: string;
  measurements?: Measurement[];
  scale?: number;
  className?: string;
}

export default function BlueprintCanvas({
  tool,
  imageUrl,
  onMeasurement,
  sheetId,
  measurements = [],
  scale = 1,
  className = '',
}: BlueprintCanvasProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<number[][]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      setImage(img);
      drawCanvas();
    };
    img.onerror = () => {
      console.error('Erro ao carregar imagem:', imageUrl);
    };
  }, [imageUrl]);

  useEffect(() => {
    drawCanvas();
  }, [image, measurements, scale]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ajustar tamanho do canvas
    const containerWidth = containerRef.current?.clientWidth || 800;
    const aspectRatio = image.height / image.width;

    canvas.width = Math.min(containerWidth, image.width * scale);
    canvas.height = canvas.width * aspectRatio;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar imagem
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Desenhar medições existentes
    measurements.forEach(measurement => {
      drawMeasurement(ctx, measurement);
    });

    // Desenhar caminho atual se estiver desenhando
    if (isDrawing && currentPath.length > 0) {
      drawPath(ctx, currentPath, '#ff0000');
    }
  };

  const drawMeasurement = (
    ctx: CanvasRenderingContext2D,
    measurement: Measurement
  ) => {
    const { coordinates, color, toolType } = measurement;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;

    if (coordinates.type === 'Point') {
      // Desenhar ponto
      const [x, y] = coordinates.coordinates as number[];
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();

      // Adicionar ícone baseado no tipo de ferramenta
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      const icon = getToolIcon(toolType);
      ctx.fillText(icon, x, y + 4);
    } else if (coordinates.type === 'LineString') {
      // Desenhar linha
      const points = coordinates.coordinates as number[][];
      drawPath(ctx, points, color);
    } else if (coordinates.type === 'Polygon') {
      // Desenhar polígono
      const rings = coordinates.coordinates as number[][][];
      if (rings.length > 0) {
        const points = rings[0];
        drawPolygon(ctx, points, color);
      }
    }
  };

  const drawPath = (
    ctx: CanvasRenderingContext2D,
    points: number[][],
    color: string
  ) => {
    if (points.length < 2) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    const [firstX, firstY] = points[0];
    ctx.moveTo(firstX, firstY);

    for (let i = 1; i < points.length; i++) {
      const [x, y] = points[i];
      ctx.lineTo(x, y);
    }

    ctx.stroke();
  };

  const drawPolygon = (
    ctx: CanvasRenderingContext2D,
    points: number[][],
    color: string
  ) => {
    if (points.length < 3) return;

    ctx.strokeStyle = color;
    ctx.fillStyle = color + '40'; // Adicionar transparência
    ctx.lineWidth = 2;
    ctx.beginPath();

    const [firstX, firstY] = points[0];
    ctx.moveTo(firstX, firstY);

    for (let i = 1; i < points.length; i++) {
      const [x, y] = points[i];
      ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  const getToolIcon = (toolType: Tool): string => {
    switch (toolType) {
      case 'trench':
        return '🚧';
      case 'pipe':
        return '🔧';
      case 'box':
        return '📦';
      case 'note':
        return '📝';
      case 'measure':
        return '📏';
      default:
        return '📍';
    }
  };

  const getCanvasCoordinates = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!tool) return;

    const { x, y } = getCanvasCoordinates(event);

    if (tool === 'note' || tool === 'box') {
      // Ferramentas de ponto único
      createPointMeasurement(x, y);
    } else {
      // Ferramentas de desenho (linha/polígono)
      setIsDrawing(true);
      setCurrentPath([[x, y]]);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !tool) return;

    const { x, y } = getCanvasCoordinates(event);
    setCurrentPath(prev => [...prev, [x, y]]);
    drawCanvas();
  };

  const handleMouseUp = () => {
    if (!isDrawing || !tool || currentPath.length < 2) {
      setIsDrawing(false);
      setCurrentPath([]);
      return;
    }

    createPathMeasurement();
    setIsDrawing(false);
    setCurrentPath([]);
  };

  const createPointMeasurement = (x: number, y: number) => {
    const newMeasurement: Measurement = {
      id: Date.now(),
      project_id: 0,
      toolId: `${tool}_${Date.now()}`,
      toolType: tool,
      value: 0,
      unit: tool === 'note' ? 'text' : 'unit',
      coordinates: {
        type: 'Point',
        coordinates: [x, y],
      },
      color: getToolColor(tool),
      created_by: 'current_user',
      created_at: new Date().toISOString(),
      description: `${tool} measurement`,
    };

    onMeasurement(newMeasurement);
  };

  const createPathMeasurement = () => {
    if (!tool || currentPath.length < 2) return;

    const coordinates =
      tool === 'trench' || tool === 'measure'
        ? { type: 'LineString' as const, coordinates: currentPath }
        : { type: 'Polygon' as const, coordinates: [currentPath] };

    const length = calculatePathLength(currentPath);
    const area =
      tool === 'pipe' ? calculatePolygonArea(currentPath) : undefined;

    const newMeasurement: Measurement = {
      id: Date.now(),
      project_id: 0,
      toolId: `${tool}_${Date.now()}`,
      toolType: tool,
      value: length,
      unit: tool === 'measure' ? 'm' : 'unit',
      coordinates,
      color: getToolColor(tool),
      created_by: 'current_user',
      created_at: new Date().toISOString(),
      description: `${tool} measurement`,
      length,
      area,
    };

    onMeasurement(newMeasurement);
  };

  const getToolColor = (toolType: Tool): string => {
    switch (toolType) {
      case 'trench':
        return '#ff6b35';
      case 'pipe':
        return '#4ecdc4';
      case 'box':
        return '#45b7d1';
      case 'note':
        return '#96ceb4';
      case 'measure':
        return '#ffeaa7';
      default:
        return '#ddd';
    }
  };

  const calculatePathLength = (path: number[][]): number => {
    let length = 0;
    for (let i = 1; i < path.length; i++) {
      const [x1, y1] = path[i - 1];
      const [x2, y2] = path[i];
      length += Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
    return length;
  };

  const calculatePolygonArea = (path: number[][]): number => {
    if (path.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < path.length; i++) {
      const j = (i + 1) % path.length;
      area += path[i][0] * path[j][1];
      area -= path[j][0] * path[i][1];
    }
    return Math.abs(area) / 2;
  };

  if (!image) {
    return (
      <div
        className={`flex items-center justify-center h-96 bg-gray-100 border-2 border-dashed border-gray-300 ${className}`}
      >
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-500'>Carregando planta...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative border border-gray-300 bg-white overflow-auto ${className}`}
    >
      <canvas
        ref={canvasRef}
        className={`block max-w-full h-auto ${tool ? 'cursor-crosshair' : 'cursor-default'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setIsDrawing(false);
          setCurrentPath([]);
        }}
      />

      {/* Informações da ferramenta ativa */}
      {tool && (
        <div className='absolute top-2 left-2 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm'>
          Ferramenta: {tool} {getToolIcon(tool)}
        </div>
      )}

      {/* Contador de medições */}
      {measurements.length > 0 && (
        <div className='absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded text-sm'>
          {measurements.length} medições
        </div>
      )}
    </div>
  );
}
