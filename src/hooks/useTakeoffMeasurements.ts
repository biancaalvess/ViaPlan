import { useState, useCallback } from 'react';
import { Measurement } from '../types/takeoff'; 
import { toast } from 'sonner';

export function useTakeoffMeasurements(projectId: number) {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);

  const addMeasurement = useCallback((measurement: Measurement) => {
    setMeasurements(prev => [...prev, measurement]);
    // Aqui você adicionaria a chamada à API/Service se necessário
  }, []);

  const updateMeasurement = useCallback((id: string, data: Partial<Measurement>) => {
    setMeasurements(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
  }, []);

  const deleteMeasurement = useCallback((id: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
    toast.success('Medição removida');
  }, []);

  const clearMeasurements = useCallback(() => {
    if(confirm('Apagar tudo?')) setMeasurements([]);
  }, []);

  return {
    measurements,
    addMeasurement,
    updateMeasurement,
    deleteMeasurement,
    clearMeasurements
  };
}