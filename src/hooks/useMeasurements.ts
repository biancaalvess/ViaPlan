import { useState, useCallback } from 'react';

export interface TakeoffMeasurement {
  id: string;
  type:
    | 'select'
    | 'layout'
    | 'walls'
    | 'area'
    | 'openings'
    | 'slabs'
    | 'foundation'
    | 'structure'
    | 'finishes'
    | 'roofing'
    | 'note'
    | 'trench' // Mantido para compatibilidade
    | 'conduit' // Mantido para compatibilidade
    | 'vault' // Mantido para compatibilidade
    | 'yardage' // Mantido para compatibilidade
    | 'bore-shot' // Mantido para compatibilidade
    | 'bore-pit' // Mantido para compatibilidade
    | 'concrete' // Mantido para compatibilidade
    | 'asphalt' // Mantido para compatibilidade
    | 'hydro-excavation-trench' // Mantido para compatibilidade
    | 'hydro-excavation-hole' // Mantido para compatibilidade
    | 'hydro-excavation-pothole'; // Mantido para compatibilidade
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
  groupId?: string;
  pitSize?: string;
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

  // Funções para a ferramenta selecionar
  const moveMeasurement = useCallback((id: string, deltaX: number, deltaY: number) => {
    setMeasurements(prev =>
      prev.map(m => {
        if (m.id === id) {
          return {
            ...m,
            coordinates: m.coordinates.map(coord => ({
              x: coord.x + deltaX,
              y: coord.y + deltaY,
            })),
          };
        }
        return m;
      })
    );
  }, []);

  const moveMeasurements = useCallback((ids: string[], deltaX: number, deltaY: number) => {
    setMeasurements(prev =>
      prev.map(m => {
        if (ids.includes(m.id)) {
          return {
            ...m,
            coordinates: m.coordinates.map(coord => ({
              x: coord.x + deltaX,
              y: coord.y + deltaY,
            })),
          };
        }
        return m;
      })
    );
  }, []);

  const resizeMeasurement = useCallback((
    id: string,
    scaleX: number,
    scaleY: number,
    centerX: number,
    centerY: number
  ) => {
    setMeasurements(prev =>
      prev.map(m => {
        if (m.id === id) {
          return {
            ...m,
            coordinates: m.coordinates.map(coord => ({
              x: centerX + (coord.x - centerX) * scaleX,
              y: centerY + (coord.y - centerY) * scaleY,
            })),
          };
        }
        return m;
      })
    );
  }, []);

  const groupMeasurements = useCallback((ids: string[], groupId?: string) => {
    const newGroupId = groupId || `group-${Date.now()}`;
    setMeasurements(prev =>
      prev.map(m => {
        if (ids.includes(m.id)) {
          return {
            ...m,
            groupId: newGroupId,
          };
        }
        return m;
      })
    );
    return newGroupId;
  }, []);

  const ungroupMeasurements = useCallback((ids: string[]) => {
    setMeasurements(prev =>
      prev.map(m => {
        if (ids.includes(m.id)) {
          const { groupId, ...rest } = m;
          return rest;
        }
        return m;
      })
    );
  }, []);

  const filterMeasurements = useCallback((filters: {
    types?: TakeoffMeasurement['type'][];
    minLength?: number;
    maxLength?: number;
    minArea?: number;
    maxArea?: number;
    groupId?: string;
  }) => {
    return measurements.filter(m => {
      if (filters.types && !filters.types.includes(m.type)) return false;
      if (filters.minLength !== undefined && (m.length || 0) < filters.minLength) return false;
      if (filters.maxLength !== undefined && (m.length || 0) > filters.maxLength) return false;
      if (filters.minArea !== undefined && (m.area || 0) < filters.minArea) return false;
      if (filters.maxArea !== undefined && (m.area || 0) > filters.maxArea) return false;
      if (filters.groupId !== undefined && (m as any).groupId !== filters.groupId) return false;
      return true;
    });
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
    moveMeasurement,
    moveMeasurements,
    resizeMeasurement,
    groupMeasurements,
    ungroupMeasurements,
    filterMeasurements,
  };
};
