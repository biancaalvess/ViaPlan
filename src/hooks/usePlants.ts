import { useState, useCallback } from 'react';
import { apiService } from '@/services/apiService';

export interface Plant {
  id: string;
  name: string;
  code: string;
  location?: string;
  file_path?: string;
  created_at?: string;
  updated_at?: string;
}

export const usePlants = () => {
  const [currentPlant, setCurrentPlant] = useState<Plant | null>(null);
  const [isLoadingPlant, setIsLoadingPlant] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlantFromId = useCallback(async (plantId: string): Promise<Plant | null> => {
    setIsLoadingPlant(true);
    setError(null);
    
    try {
      const plant = await apiService.get<Plant>(`/plants/${plantId}`);
      setCurrentPlant(plant);
      return plant;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load plant';
      setError(errorMessage);
      console.error('Error loading plant:', err);
      return null;
    } finally {
      setIsLoadingPlant(false);
    }
  }, []);

  const clearCurrentPlant = useCallback(() => {
    setCurrentPlant(null);
    setError(null);
  }, []);

  return {
    currentPlant,
    isLoadingPlant,
    error,
    loadPlantFromId,
    clearCurrentPlant,
  };
};

