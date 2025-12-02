import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

export interface TakeoffMeasurement {
  id: string;
  type:
    | 'trench'
    | 'conduit'
    | 'vault'
    | 'yardage'
    | 'note'
    | 'bore-shot'
    | 'bore-pit'
    | 'concrete'
    | 'asphalt'
    | 'hydro-excavation-trench'
    | 'hydro-excavation-hole'
    | 'hydro-excavation-pothole';
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
}

export const useMeasurements = () => {
  const [measurements, setMeasurements] = useState<TakeoffMeasurement[]>([]);

  const addMeasurement = useCallback((measurement: Omit<TakeoffMeasurement, 'id'>) => {
    const newMeasurement: TakeoffMeasurement = {
      ...measurement,
      id: Date.now().toString(),
    };
    setMeasurements(prev => [...prev, newMeasurement]);
  }, []);

  const deleteMeasurement = useCallback((id: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
  }, []);

  const updateMeasurement = useCallback((id: string, updates: Partial<TakeoffMeasurement>) => {
    setMeasurements(prev => 
      prev.map(m => m.id === id ? { ...m, ...updates } : m)
    );
  }, []);

  const clearMeasurements = useCallback(() => {
    setMeasurements([]);
  }, []);

  const getMeasurementsByType = useCallback((type: TakeoffMeasurement['type']) => {
    return measurements.filter(m => m.type === type);
  }, [measurements]);

  const getTotalLength = useCallback(() => {
    return measurements.reduce((total, m) => total + (m.length || 0), 0);
  }, [measurements]);

  const getTotalArea = useCallback(() => {
    return measurements.reduce((total, m) => total + (m.area || 0), 0);
  }, [measurements]);

  return {
    measurements,
    addMeasurement,
    deleteMeasurement,
    updateMeasurement,
    clearMeasurements,
    getMeasurementsByType,
    getTotalLength,
    getTotalArea,
  };
};
