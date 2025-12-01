import React from 'react';
import { useTakeoffMeasurements } from '../hooks/useTakeoffMeasurements';
import { Measurement } from './Measurement';

interface TakeoffMeasurement {
  id: string;
  // adicione outros campos do measurement conforme necessário, por exemplo:
  // name?: string;
  // value?: number;
}

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
      <h3 className='font-medium text-slate-800 mb-2'>Measurements</h3>

        {measurements.map(measurement => (
          <Measurement
            key={measurement.id}
            measurement={measurement}
            onDelete={onDeleteMeasurement}
            allMeasurements={measurements}
          />
        ))}

        {measurements.length === 0 && (
          <div className='text-center text-slate-500 py-8'>
            <p className='text-sm'>No measurements yet.</p>
            <p className='text-xs mt-1'>
              Select a tool and start measuring on the plan.
            </p>
          </div>
        )}
    </div>
  );
};
