import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

// Import the interface from useMeasurements
import { TakeoffMeasurement } from '@/hooks/useMeasurements';
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
  pitSize?: string;
}

interface MeasurementCardProps {
  measurement: TakeoffMeasurement;
  onDelete: (id: string) => void;
  allMeasurements: TakeoffMeasurement[];
}

export function MeasurementCard({
  measurement,
  onDelete,
  allMeasurements,
}: MeasurementCardProps) {
  const getMeasurementTitle = () => {
    const typeMap: Record<string, string> = {
      trench: 'Trench',
      'hydro-excavation-trench': 'Hydro Trench',
      'bore-shot': 'Bore Shot',
      'hydro-excavation-pothole': 'Pothole',
      'hydro-excavation-hole': 'Hole',
      conduit: 'Conduit',
      vault: 'Vault',
    };

    const displayType = typeMap[measurement.type] || measurement.type;

    // Calculate sequence number by counting measurements of the same type that come before this one
    const sequenceNumber =
      allMeasurements
        .filter(m => m.type === measurement.type)
        .findIndex(m => m.id === measurement.id) + 1;

    // For vaults, include dimensions in the title
    if (measurement.type === 'vault' && measurement.vaultDimensions) {
      const { length, width, depth } = measurement.vaultDimensions;
      const trafficRatedPrefix = measurement.vaultTrafficRated
        ? 'Traffic Rated '
        : '';
      return `${trafficRatedPrefix}${displayType} ${sequenceNumber}: ${length}×${width}×${depth}`;
    }

    const lengthSuffix = measurement.length
      ? `: ${measurement.length.toFixed(2)}′`
      : '';

    return `${displayType} ${sequenceNumber}${lengthSuffix}`;
  };

  const renderConduitTotals = () => {
    if (!measurement.conduits || measurement.conduits.length === 0) return null;

    return (
      <div className='col-span-2'>
        <div className='text-xs font-semibold text-muted-foreground mb-1'>
          Conduit Totals:
        </div>
        <div className='space-y-1'>
          {measurement.conduits.map((conduit, index) => {
            const totalLength = conduit.count * (measurement.length || 0);
            return (
              <div key={index} className='text-sm'>
                {totalLength.toFixed(0)} LF of ({conduit.count}) -{' '}
                {conduit.sizeIn} {conduit.material}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTrenchFields = () => (
    <>
      {measurement.length && (
        <>
          <div className='text-xs font-semibold text-muted-foreground'>
            Comprimento:
          </div>
          <div className='text-sm'>
            {measurement.length.toFixed(2)} {measurement.unit === 'ft' ? 'm' : (measurement.unit === 'ft²' || measurement.unit === 'sq ft' ? 'm²' : measurement.unit)}
          </div>
        </>
      )}

      {measurement.trenchWidth && measurement.trenchDepth && (
        <>
          <div className='text-xs font-semibold text-muted-foreground'>
            Largura × Profundidade:
          </div>
          <div className='text-sm'>
            {measurement.trenchWidth} m × {measurement.trenchDepth} m
          </div>
        </>
      )}

      {measurement.spoilVolumeCY && (
        <>
          <div className='text-xs font-semibold text-muted-foreground'>
            {measurement.type === 'hydro-excavation-trench'
              ? 'Volume de Lama:'
              : 'Volume de Escavação:'}
          </div>
          <div className='text-sm'>
            {measurement.type === 'hydro-excavation-trench'
              ? (measurement.spoilVolumeCY * 2).toFixed(2)
              : measurement.spoilVolumeCY.toFixed(2)}{' '}
            m³
          </div>
        </>
      )}

      {measurement.backfill && (
        <>
          <div className='text-xs font-semibold text-muted-foreground'>
            Volume de Reaterro:
          </div>
          <div className='text-sm'>
            {measurement.backfill.volumeCY.toFixed(2)} m³ (
            {measurement.backfill.customType || measurement.backfill.type})
          </div>
        </>
      )}

      {measurement.conduits &&
        measurement.conduits.length > 0 &&
        renderConduitTotals()}
    </>
  );

  const renderBoreShotFields = () => (
    <>
      {measurement.length && (
        <>
          <div className='text-xs font-semibold text-muted-foreground'>
            Comprimento:
          </div>
          <div className='text-sm'>
            {measurement.length.toFixed(2)} {measurement.unit === 'ft' ? 'm' : (measurement.unit === 'ft²' || measurement.unit === 'sq ft' ? 'm²' : measurement.unit)}
          </div>
        </>
      )}

      {renderConduitTotals()}
    </>
  );

  const renderPotholeFields = () => {
    if (!measurement.hydroPotholingData) return null;

    // Calcular volume de lama para pothole
    // 8" = 0.2032m de diâmetro, raio = 0.1016m
    const radius = 0.1016; // raio em metros
    const depthInMeters =
      measurement.hydroPotholingData.depthUnit === 'inches'
        ? (measurement.hydroPotholingData.averageDepth * 0.0254) // converter polegadas para metros
        : (measurement.hydroPotholingData.averageDepth * 0.3048); // converter pés para metros
    const volumeM3 = Math.PI * radius * radius * depthInMeters;

    return (
      <>
        <div className='text-xs font-semibold text-muted-foreground'>
          Tipo de Superfície:
        </div>
        <div className='text-sm'>
          {measurement.hydroPotholingData.surfaceType === 'asphalt' ? 'Asfalto' :
           measurement.hydroPotholingData.surfaceType === 'concrete' ? 'Concreto' :
           measurement.hydroPotholingData.surfaceType === 'dirt' ? 'Terra' :
           measurement.hydroPotholingData.surfaceType}
        </div>

        <div className='text-xs font-semibold text-muted-foreground'>
          Profundidade:
        </div>
        <div className='text-sm'>
          {measurement.hydroPotholingData.depthUnit === 'inches' 
            ? `${(measurement.hydroPotholingData.averageDepth * 0.0254).toFixed(2)} m`
            : `${(measurement.hydroPotholingData.averageDepth * 0.3048).toFixed(2)} m`}
        </div>

        <div className='text-xs font-semibold text-muted-foreground'>
          Volume de Lama:
        </div>
        <div className='text-sm'>{volumeM3.toFixed(2)} m³</div>
      </>
    );
  };

  const renderVaultFields = () => {
    const details = [];

    if (measurement.vaultSpoilVolumeCY && measurement.vaultSpoilVolumeCY > 0) {
      details.push('Escavação');
    }
    if (
      measurement.vaultAsphaltRemovalCY &&
      measurement.vaultAsphaltRemovalCY > 0
    ) {
      details.push('Remoção de Asfalto');
    }
    if (
      measurement.vaultConcreteRemovalCY &&
      measurement.vaultConcreteRemovalCY > 0
    ) {
      details.push('Remoção de Concreto');
    }
    if (
      measurement.vaultAsphaltRestorationCY &&
      measurement.vaultAsphaltRestorationCY > 0
    ) {
      details.push('Restauração de Asfalto');
    }
    if (
      measurement.vaultConcreteRestorationCY &&
      measurement.vaultConcreteRestorationCY > 0
    ) {
      details.push('Restauração de Concreto');
    }
    if (measurement.vaultBackfillCY && measurement.vaultBackfillCY > 0) {
      details.push(`Reaterro (${measurement.vaultBackfillType || 'Desconhecido'})`);
    }

    return (
      <>
        {measurement.holeSize && (
          <>
            <div className='text-xs font-semibold text-muted-foreground'>
              Hole Size:
            </div>
            <div className='text-sm'>
              {measurement.holeSize.length}′ × {measurement.holeSize.width}′ ×{' '}
              {measurement.holeSize.depth}′
            </div>
          </>
        )}

        {details.length > 0 && (
          <>
            <div className='text-xs font-semibold text-muted-foreground'>
              Operações:
            </div>
            <div className='text-sm'>{details.join(', ')}</div>
          </>
        )}

        {measurement.vaultSpoilVolumeCY &&
          measurement.vaultSpoilVolumeCY > 0 && (
            <>
              <div className='text-xs font-semibold text-muted-foreground'>
                Volume de Escavação:
              </div>
              <div className='text-sm'>
                {measurement.vaultSpoilVolumeCY.toFixed(2)} m³
              </div>
            </>
          )}
      </>
    );
  };

  const renderGenericFields = () => (
    <>
      {measurement.length && (
        <>
          <div className='text-xs font-semibold text-muted-foreground'>
            Comprimento:
          </div>
          <div className='text-sm'>
            {measurement.length.toFixed(2)} {measurement.unit === 'ft' ? 'm' : (measurement.unit === 'ft²' || measurement.unit === 'sq ft' ? 'm²' : measurement.unit)}
          </div>
        </>
      )}

      {measurement.area && (
        <>
          <div className='text-xs font-semibold text-muted-foreground'>
            Area:
          </div>
          <div className='text-sm'>
            {measurement.area.toFixed(2)} sq {measurement.unit}
          </div>
        </>
      )}

      {measurement.pitSize && (
        <>
          <div className='text-xs font-semibold text-muted-foreground'>
            Size:
          </div>
          <div className='text-sm'>{measurement.pitSize}</div>
        </>
      )}
    </>
  );

  const renderMeasurementFields = () => {
    switch (measurement.type) {
      case 'trench':
      case 'hydro-excavation-trench':
        return renderTrenchFields();
      case 'bore-shot':
        return renderBoreShotFields();
      case 'hydro-excavation-pothole':
        return renderPotholeFields();
      case 'vault':
        return renderVaultFields();
      default:
        return renderGenericFields();
    }
  };

  return (
    <Card className='border border-border rounded bg-card hover:shadow-sm hover:border-border/80 transition-all duration-200'>
      <div className='p-3'>
        {/* Header */}
        <div className='flex items-start justify-between mb-3'>
          <div className='flex-1'>
            <div className='font-semibold text-sm text-foreground break-words hyphens-none'>
              {getMeasurementTitle()}
            </div>
          </div>

          <Button
            variant='outline'
            size='sm'
            onClick={() => onDelete(measurement.id)}
            className='h-6 w-6 p-0 text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 hover:border-red-400 ml-2 flex-shrink-0'
            aria-label={`Undo ${measurement.type} ${measurement.label}`}
            title='Undo (Ctrl+Z)'
          >
            ✕
          </Button>
        </div>

        {/* Body - Two column grid */}
        <div className='grid grid-cols-2 gap-2'>
          {renderMeasurementFields()}
        </div>

        {/* Notes */}
        {measurement.notes && (
          <div className='mt-3 pt-2 border-t border-border'>
            <div className='text-xs font-semibold text-muted-foreground mb-1'>
              Notes:
            </div>
            <div className='text-sm text-foreground break-words hyphens-none'>
              {measurement.notes}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
