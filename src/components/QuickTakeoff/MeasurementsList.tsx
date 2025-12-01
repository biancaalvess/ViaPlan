import React from 'react';
import { MeasurementCard } from '@/components/MeasurementCard';
import { TakeoffMeasurement } from '@/hooks/useMeasurements';

interface MeasurementsListProps {
  measurements: TakeoffMeasurement[];
  isMinimized: boolean;
  onDeleteMeasurement: (id: string) => void;
}

export const MeasurementsList: React.FC<MeasurementsListProps> = ({
  measurements,
  isMinimized,
  onDeleteMeasurement,
}) => {
  if (isMinimized) {
    return measurements.length > 0 ? (
      <div className='text-center p-1'>
        <div className='bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold'>
          {measurements.length}
        </div>
      </div>
    ) : null;
  }

  return (
    <div className='mb-4'>
      <h3 className='font-medium text-slate-800 mb-2'>Medições</h3>

      <div className='space-y-2'>
        {measurements.map(measurement => (
          <MeasurementCard
            key={measurement.id}
            measurement={measurement}
            onDelete={onDeleteMeasurement}
            allMeasurements={measurements}
          />
        ))}

        {measurements.length === 0 && (
          <div className='text-center text-slate-500 py-8'>
            <p className='text-sm'>Ainda não há medições.</p>
            <p className='text-xs mt-1'>
              Selecione uma ferramenta e comece a medir no plano.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
