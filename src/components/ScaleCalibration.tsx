import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

// Ícones simplificados
const Ruler = ({ className }: { className?: string }) => <span className={className}>📏</span>;
const CheckCircle = ({ className }: { className?: string }) => <span className={className}>✅</span>;
const AlertCircle = ({ className }: { className?: string }) => <span className={className}>⚠️</span>;

interface ScaleCalibrationProps {
  onCalibrate: (scale: number, unit: string) => void;
  currentScale?: number;
  currentUnit?: string;
  onStartMeasurement?: () => void;
}

export function ScaleCalibration({
  onCalibrate,
  currentScale,
  currentUnit,
  onStartMeasurement,
}: ScaleCalibrationProps) {
  const [referenceLength, setReferenceLength] = useState('');
  const [pixelLength, setPixelLength] = useState('');
  const [unit, setUnit] = useState(currentUnit || 'm');
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [error, setError] = useState('');

  const handleCalibrate = () => {
    setError('');
    const refLength = parseFloat(referenceLength);
    const pixLength = parseFloat(pixelLength);

    if (!refLength || refLength <= 0) {
      setError('Comprimento real deve ser maior que zero');
      return;
    }

    if (!pixLength || pixLength <= 0) {
      setError('Comprimento em pixels deve ser maior que zero');
      return;
    }

    const scale = refLength / pixLength; // unidades reais por pixel
    onCalibrate(scale, unit);
    
    // Limpar erro se houver
    setError('');
  };

  const startMeasurement = () => {
    setIsMeasuring(true);
    onStartMeasurement?.();
  };

  const finishMeasurement = (pixels: number) => {
    setPixelLength(pixels.toString());
    setIsMeasuring(false);
  };

  const resetCalibration = () => {
    setReferenceLength('');
    setPixelLength('');
    setError('');
    setIsMeasuring(false);
  };

  const getScaleDescription = () => {
    if (!currentScale) return '';
    
    const ratio = 1 / currentScale;
    if (ratio < 1) {
      return `Escala: ${currentScale.toFixed(4)}:1`;
    } else {
      return `Escala: 1:${ratio.toFixed(0)}`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <div className="flex items-center">
            <Ruler className='mr-2 h-5 w-5' />
            Calibração de Escala
          </div>
          {currentScale && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetCalibration}
            >
              Resetar
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {error && (
          <div className='p-3 bg-red-50 border border-red-200 rounded-md'>
            <div className='flex items-center'>
              <AlertCircle className='h-4 w-4 text-red-600 mr-2' />
              <span className='text-sm text-red-600'>{error}</span>
            </div>
          </div>
        )}

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <Label htmlFor='reference-length'>Comprimento Real</Label>
            <Input
              id='reference-length'
              type='number'
              step='0.01'
              min="0"
              value={referenceLength}
              onChange={e => setReferenceLength(e.target.value)}
              placeholder='Ex: 10'
            />
          </div>
          <div>
            <Label htmlFor='unit'>Unidade</Label>
            <select
              id='unit'
              value={unit}
              onChange={e => setUnit(e.target.value)}
              className='w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='m'>Metros (m)</option>
              <option value='cm'>Centímetros (cm)</option>
              <option value='mm'>Milímetros (mm)</option>
              <option value='ft'>Pés (ft)</option>
              <option value='in'>Polegadas (in)</option>
              <option value='yd'>Jardas (yd)</option>
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor='pixel-length'>Comprimento em Pixels</Label>
          <div className='flex space-x-2'>
            <Input
              id='pixel-length'
              type='number'
              min="0"
              value={pixelLength}
              onChange={e => setPixelLength(e.target.value)}
              placeholder='Ex: 100'
              disabled={isMeasuring}
            />
            <Button
              type='button'
              variant='outline'
              onClick={startMeasurement}
              disabled={isMeasuring}
              className={isMeasuring ? 'bg-blue-100' : ''}
            >
              {isMeasuring ? 'Medindo...' : 'Medir'}
            </Button>
          </div>
          <p className='text-sm text-gray-600 mt-1'>
            {isMeasuring
              ? '📏 Clique no canvas para iniciar e termine medindo a distância correspondente'
              : 'Meça no canvas a distância correspondente ao comprimento real'}
          </p>
        </div>

        <Button
          onClick={handleCalibrate}
          className='w-full'
          disabled={!referenceLength || !pixelLength || isMeasuring}
        >
          <CheckCircle className='mr-2 h-4 w-4' />
          Calibrar Escala
        </Button>

        {currentScale && (
          <div className='p-4 bg-green-50 border border-green-200 rounded-md'>
            <div className='flex items-center justify-between mb-2'>
              <div>
                <p className='text-sm font-medium text-green-800'>
                  ✅ Escala Calibrada
                </p>
                <p className='text-sm text-green-600'>
                  1 pixel = {currentScale.toFixed(4)} {currentUnit}
                </p>
                <p className='text-xs text-green-600'>
                  {getScaleDescription()}
                </p>
              </div>
              <Badge
                variant='secondary'
                className='bg-green-100 text-green-800'
              >
                Ativo
              </Badge>
            </div>
            
            {/* Exemplo de conversão */}
            <div className="text-xs text-green-700 bg-green-100 p-2 rounded mt-2">
              <strong>Exemplo:</strong> 100 pixels = {(100 * currentScale).toFixed(2)} {currentUnit}
            </div>
          </div>
        )}

        <div className='text-xs text-gray-500 space-y-2 bg-gray-50 p-3 rounded-md'>
          <p>
            <strong>📋 Como calibrar:</strong>
          </p>
          <ol className='list-decimal list-inside space-y-1 ml-2'>
            <li>Digite o comprimento real conhecido de uma referência na planta</li>
            <li>Selecione a unidade de medida desejada</li>
            <li>Clique em "Medir" e desenhe no canvas essa mesma distância</li>
            <li>Clique em "Calibrar Escala" para finalizar</li>
          </ol>
          
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p><strong>💡 Dicas:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-gray-500">
              <li>Use elementos conhecidos como portas (≈0.8m) ou janelas</li>
              <li>Quanto maior a distância medida, mais precisa será a calibração</li>
              <li>Verifique se a planta não está distorcida antes de calibrar</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}