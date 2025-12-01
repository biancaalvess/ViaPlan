import { useState, useEffect, useCallback } from 'react';
import { TakeoffService, type TakeoffSummary } from '../services/takeoffService';
import { toast } from 'sonner';

interface UseTakeoffMeasurementsProps {
  projectId: number;
}

interface UseTakeoffMeasurementsReturn {
  measurements: Measurement[];
  summary: TakeoffSummary | null;
  loading: boolean;
  saving: boolean;
  loadMeasurements: () => Promise<void>;
  saveMeasurement: (measurement: Measurement) => Promise<void>;
  deleteMeasurement: (id: string) => Promise<void>;
  clearAllMeasurements: () => Promise<void>;
  exportMeasurements: () => Promise<void>;
  exportCSV: () => Promise<void>;
}

export function useTakeoffMeasurements({ projectId }: UseTakeoffMeasurementsProps): UseTakeoffMeasurementsReturn {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [summary, setSummary] = useState<TakeoffSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Carregar medições do backend
  const loadMeasurements = useCallback(async () => {
    try {
      setLoading(true);
      const backendMeasurements = await TakeoffService.getMeasurements(projectId);
      const frontendMeasurements = backendMeasurements.map(TakeoffService.convertMeasurementToFrontend);
      setMeasurements(frontendMeasurements);
      
      // Carregar resumo
      const summaryData = await TakeoffService.getMeasurementsSummary(projectId);
      setSummary(summaryData);
    } catch (error) {
      console.error('Erro ao carregar medições:', error);
      toast.error('Erro ao carregar medições do servidor');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Salvar medição no backend
  const saveMeasurement = useCallback(async (measurement: Measurement) => {
    try {
      setSaving(true);
      const backendMeasurement = TakeoffService.convertMeasurementToBackend(measurement, projectId);
      const savedMeasurement = await TakeoffService.createMeasurement(backendMeasurement);
      const frontendMeasurement = TakeoffService.convertMeasurementToFrontend(savedMeasurement);
      
      setMeasurements(prev => [...prev, frontendMeasurement]);
      
      // Atualizar resumo
      const summaryData = await TakeoffService.getMeasurementsSummary(projectId);
      setSummary(summaryData);
      
      toast.success('Medição salva com sucesso');
    } catch (error) {
      console.error('Erro ao salvar medição:', error);
      toast.error('Erro ao salvar medição');
    } finally {
      setSaving(false);
    }
  }, [projectId]);

  // Deletar medição
  const deleteMeasurement = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await TakeoffService.deleteMeasurement(id);
      setMeasurements(prev => prev.filter(m => m.id !== id));
      
      // Atualizar resumo
      const summaryData = await TakeoffService.getMeasurementsSummary(projectId);
      setSummary(summaryData);
      
      toast.success('Medição removida com sucesso');
    } catch (error) {
      console.error('Erro ao deletar medição:', error);
      toast.error('Erro ao deletar medição');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Limpar todas as medições
  const clearAllMeasurements = useCallback(async () => {
    if (!window.confirm('Tem certeza que deseja limpar todas as medições? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setLoading(true);
      await TakeoffService.clearProjectMeasurements(projectId);
      setMeasurements([]);
      setSummary(null);
      toast.success('Todas as medições foram removidas');
    } catch (error) {
      console.error('Erro ao limpar medições:', error);
      toast.error('Erro ao limpar medições');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Exportar medições como JSON
  const exportMeasurements = useCallback(async () => {
    try {
      setLoading(true);
      const exportData = await TakeoffService.exportMeasurements(projectId);
      TakeoffService.downloadMeasurementsAsJSON(exportData);
      toast.success('Medições exportadas com sucesso');
    } catch (error) {
      console.error('Erro ao exportar medições:', error);
      toast.error('Erro ao exportar medições');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Exportar medições como CSV
  const exportCSV = useCallback(async () => {
    try {
      setLoading(true);
      const exportData = await TakeoffService.exportMeasurements(projectId);
      TakeoffService.downloadMeasurementsAsCSV(exportData);
      toast.success('Medições exportadas em CSV');
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      toast.error('Erro ao exportar CSV');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Carregar medições ao montar o componente
  useEffect(() => {
    loadMeasurements();
  }, [loadMeasurements]);

  return {
    measurements,
    summary,
    loading,
    saving,
    loadMeasurements,
    saveMeasurement,
    deleteMeasurement,
    clearAllMeasurements,
    exportMeasurements,
    exportCSV,
  };
} 