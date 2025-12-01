import React from 'react';
import { Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import PDFUpload from '../components/PDFUpload';
import { PlantInfo } from './PlantInfo';
import { Plant } from '@/hooks/usePlants';

interface TopToolbarProps {
  currentPlant: Plant | null;
  scale: string;
  zoom: number;
  canUndo: boolean;
  onFileSelect: (fileUrl: string) => void;
  onScaleChange: (scale: string) => void;
  onZoomChange: (zoom: number) => void;
  onUndo: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
}

const scaleOptions = [
  '1" = 100\'',
  '1" = 50\'',
  '1" = 20\'',
  '1" = 10\'',
  '1/4" = 1\'-0"',
  '1/8" = 1\'-0"',
  '1/16" = 1\'-0"',
  'Full Size (1:1)',
  'Custom',
];

export const TopToolbar: React.FC<TopToolbarProps> = ({
  currentPlant,
  scale,
  zoom,
  canUndo,
  onFileSelect,
  onScaleChange,
  onZoomChange,
  onUndo,
  onExportCSV,
  onExportJSON,
}) => {
  return (
    <div className='bg-white border-b border-slate-200 p-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <h1 className='text-2xl font-bold text-slate-800'>VIAPLAN</h1>

          {/* Plant Information */}
          {currentPlant && <PlantInfo plant={currentPlant} />}

          {/* File Upload */}
          <div className='flex items-center space-x-3'>
            <PDFUpload onFileSelect={onFileSelect} />
          </div>

          {/* Scale Selection */}
          <div className='flex items-center space-x-2'>
            <span className='text-sm font-medium'>Scale:</span>
            <Select value={scale} onValueChange={onScaleChange}>
              <SelectTrigger className='w-32'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {scaleOptions.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Zoom Controls */}
          <div className='flex items-center space-x-1'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onZoomChange(zoom - 0.1)}
            >
              <ZoomOut className='h-4 w-4' />
            </Button>
            <span className='text-sm px-2'>{Math.round(zoom * 100)}%</span>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onZoomChange(zoom + 0.1)}
            >
              <ZoomIn className='h-4 w-4' />
            </Button>

            {/* Undo Button */}
            <Button
              variant='outline'
              size='sm'
              onClick={onUndo}
              disabled={!canUndo}
              className='ml-2 text-red-600 border-red-600 hover:bg-red-50'
              title='Desfazer última ação'
            >
              <RotateCcw className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {/* Export Buttons */}
        <div className='flex items-center space-x-2'>
          <Button variant='outline' onClick={onExportCSV}>
            <Download className='h-4 w-4 mr-2' />
            Export CSV
          </Button>
          <Button variant='outline' onClick={onExportJSON}>
            <Download className='h-4 w-4 mr-2' />
            Export JSON
          </Button>
        </div>
      </div>
    </div>
  );
};
