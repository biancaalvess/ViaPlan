import React, { useState, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Trash2,
  MousePointer,
  Square,
  Circle,
  Minus,
} from 'lucide-react';
import { Tool, Point } from '../types/measurement';
import { Measurement } from '../types/takeoff';

interface TakeoffCanvasBaseProps {
  imageUrl: string;
  measurements: Measurement[];
  tools: Tool[];
  onMeasurementAdd: (measurement: Measurement) => void;
  onMeasurementUpdate: (id: string, measurement: Measurement) => void;
  onMeasurementDelete: (id: string) => void;
  onToolSelect: (tool: Tool) => void;
  showTools?: boolean;
  showAdvanced?: boolean;
  onExport?: () => void;
  className?: string;
}

export const TakeoffCanvasBase: React.FC<TakeoffCanvasBaseProps> = ({
  imageUrl,
  measurements,
  tools,
  onMeasurementAdd,
  onMeasurementUpdate,
  onMeasurementDelete,
  onToolSelect,
  showTools = true,
  showAdvanced = true,
  onExport,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [currentTool, setCurrentTool] = useState<Tool | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);

  const handleZoomIn = () => setScale(prev => Math.min(prev * 1.2, 5));
  const handleZoomOut = () => setScale(prev => Math.max(prev / 1.2, 0.1));
  const handleReset = () => setScale(1);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!currentTool) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;

      setStartPoint({ x, y });
      setCurrentPoints([{ x, y }]);
      setIsDrawing(true);
    },
    [currentTool, scale]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !startPoint) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;

      setCurrentPoints([startPoint, { x, y }]);
    },
    [isDrawing, startPoint, scale]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !currentTool || currentPoints.length < 2) {
      setIsDrawing(false);
      setStartPoint(null);
      setCurrentPoints([]);
      return;
    }

    const measurement: Measurement = {
      id: Date.now().toString(),
      type: getMeasurementType(currentTool.type),
      toolType: currentTool.type,
      label: `${currentTool.name} ${measurements.length + 1}`,
      value: calculateValue(currentPoints, currentTool.type),
      unit: getUnit(currentTool.type),
      points: [...currentPoints],
      config: currentTool.config,
      color: '#ef4444',
    };

    onMeasurementAdd(measurement);

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPoints([]);
  }, [
    isDrawing,
    currentTool,
    currentPoints,
    measurements.length,
    onMeasurementAdd,
  ]);

  const getToolIcon = (toolType: string) => {
    switch (toolType) {
      case 'select':
        return <MousePointer className='h-4 w-4' />;
      case 'trench':
        return <Square className='h-4 w-4' />;
      case 'bore-shot':
        return <Circle className='h-4 w-4' />;
      case 'vault':
        return <Square className='h-4 w-4' />;
      case 'hydro-excavation':
        return <Minus className='h-4 w-4' />;
      case 'conduit':
        return <Minus className='h-4 w-4' />;
      default:
        return <MousePointer className='h-4 w-4' />;
    }
  };

  const getToolColor = (toolType: string): string => {
    switch (toolType) {
      case 'trench':
        return '#3B82F6';
      case 'bore-shot':
        return '#10B981';
      case 'vault':
        return '#F59E0B';
      case 'hydro-excavation':
        return '#8B5CF6';
      case 'conduit':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getMeasurementType = (toolType: string): Measurement['type'] => {
    switch (toolType) {
      case 'trench':
        return 'area';
      case 'bore-shot':
        return 'distance';
      case 'vault':
        return 'count';
      case 'hydro-excavation':
        return 'area';
      case 'conduit':
        return 'distance';
      case 'yardage':
        return 'area';
      case 'concrete':
        return 'area';
      case 'asphalt':
        return 'area';
      case 'notes':
        return 'count';
      default:
        return 'distance';
    }
  };

  const calculateValue = (points: Point[], toolType: string): number => {
    if (points.length < 2) return 0;

    const [p1, p2] = points;
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    switch (toolType) {
      case 'trench':
        return distance * 3; // Assuming 3ft width
      case 'bore-shot':
        return distance;
      case 'vault':
        return 1; // Count
      case 'hydro-excavation':
        return distance * 2; // Assuming 2ft width
      case 'conduit':
        return distance;
      default:
        return distance;
    }
  };

  const getUnit = (toolType: string): string => {
    switch (toolType) {
      case 'trench':
        return 'sq ft';
      case 'bore-shot':
        return 'ft';
      case 'vault':
        return 'count';
      case 'hydro-excavation':
        return 'sq ft';
      case 'conduit':
        return 'ft';
      default:
        return 'ft';
    }
  };

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Toolbar */}
      {showTools && (
        <div className='flex-shrink-0 bg-white border-b border-gray-200 p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <h2 className='text-lg font-semibold text-gray-900'>
                Takeoff Tools
              </h2>
            </div>

            <div className='flex items-center space-x-2'>
              <Button variant='outline' size='sm' onClick={handleZoomOut}>
                <ZoomOut className='h-4 w-4' />
              </Button>
              <span className='text-sm text-gray-600 px-2'>
                {scale.toFixed(2)}x
              </span>
              <Button variant='outline' size='sm' onClick={handleZoomIn}>
                <ZoomIn className='h-4 w-4' />
              </Button>
              <Button variant='outline' size='sm' onClick={handleReset}>
                <RotateCcw className='h-4 w-4' />
              </Button>
              {onExport && (
                <Button variant='outline' size='sm' onClick={onExport}>
                  <Download className='h-4 w-4 mr-2' />
                  Export
                </Button>
              )}
            </div>
          </div>

          {/* Tools */}
          <div className='flex items-center space-x-2 mt-4'>
            {tools.map(tool => (
              <Button
                key={tool.id}
                variant={currentTool?.id === tool.id ? 'default' : 'outline'}
                size='sm'
                onClick={() => {
                  setCurrentTool(tool);
                  onToolSelect(tool);
                }}
                className='flex items-center space-x-2'
              >
                <div
                  className={`h-4 w-4 ${currentTool?.id === tool.id ? 'text-white' : 'text-gray-600'}`}
                >
                  {getToolIcon(tool.type)}
                </div>
                <span>{tool.name}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Canvas Area */}
      <div className='flex-1 relative bg-gray-50'>
        <canvas
          ref={canvasRef}
          className='w-full h-full cursor-crosshair'
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        />

        {/* Current tool indicator */}
        {currentTool && (
          <div className='absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg'>
            <div className='flex items-center gap-2'>
              {getToolIcon(currentTool.type)}
              <span className='text-sm font-medium'>{currentTool.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* Measurements Panel */}
      {showAdvanced && (
        <div className='flex-shrink-0 bg-white border-t border-gray-200 p-4'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Measurements
            </h3>
            <Badge variant='secondary'>{measurements.length} items</Badge>
          </div>

          <div className='space-y-2 max-h-48 overflow-y-auto'>
            {measurements.map(measurement => (
              <div
                key={measurement.id}
                className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
              >
                <div className='flex-1'>
                  <div className='font-medium text-gray-900'>
                    {measurement.label}
                  </div>
                  <div className='text-sm text-gray-600'>
                    {measurement.value.toFixed(2)} {measurement.unit}
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => onMeasurementDelete(measurement.id)}
                  className='text-red-600 hover:text-red-700'
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            ))}

            {measurements.length === 0 && (
              <div className='text-center py-6 text-gray-500'>
                <p className='text-sm'>No measurements yet.</p>
                <p className='text-xs mt-1'>
                  Select a tool and start measuring on the plan.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
