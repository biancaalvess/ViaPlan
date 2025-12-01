import React from 'react';
import { FileText } from 'lucide-react';
import { Plant } from '@/hooks/usePlants';

interface PlantInfoProps {
  plant: Plant;
}

export const PlantInfo: React.FC<PlantInfoProps> = ({ plant }) => {
  if (!plant) return null;

  return (
    <div className='flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
      <FileText className='h-5 w-5 text-blue-600' />
      <div>
        <p className='text-sm font-medium text-blue-900'>{plant.name}</p>
        <p className='text-xs text-blue-700'>Código: {plant.code}</p>
        {plant.location && (
          <p className='text-xs text-blue-600'>📍 {plant.location}</p>
        )}
      </div>
    </div>
  );
};
