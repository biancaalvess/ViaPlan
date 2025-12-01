import { useState, useEffect } from 'react';


// Tipos temporários até resolver os conflitos de tipos
interface TrenchParameters {
  id: string;
  trench_id: number;
  width: number;
  depth: number;
  include_asphalt_removal: boolean;
  backfill_type: 'sand' | 'gravel' | 'native' | 'other';
  created_at: string;
  updated_at: string;
}

interface CreateTrenchParametersRequest {
  trench_id: number;
  width: number;
  depth: number;
  include_asphalt_removal: boolean;
  backfill_type: 'sand' | 'gravel' | 'native' | 'other';
}

interface UpdateTrenchParametersRequest {
  id: string;
  width?: number;
  depth?: number;
  include_asphalt_removal?: boolean;
  backfill_type?: 'sand' | 'gravel' | 'native' | 'other';
}

interface UseTrenchParametersOptions {
  projectId: number;
  plantId: number;
  trenchId?: number;
  autoLoad?: boolean;
}

interface UseTrenchParametersReturn {
  parameters: TrenchParameters | null;
  parametersList: TrenchParameters[];
  loading: boolean;
  error: string | null;
  saveParameters: (params: CreateTrenchParametersRequest) => Promise<void>;
  updateParameters: (params: UpdateTrenchParametersRequest) => Promise<void>;
  loadParameters: () => Promise<void>;
  clearError: () => void;
}

export function useTrenchParameters({
  projectId,
  plantId,
  trenchId,
  autoLoad = true,
}: UseTrenchParametersOptions): UseTrenchParametersReturn {
  const [parameters, setParameters] = useState<TrenchParameters | null>(null);
  const [parametersList, setParametersList] = useState<TrenchParameters[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadParameters = async () => {
    if (!projectId || !plantId) {
      setError('projectId e plantId são obrigatórios');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: Implementar carregamento real quando disponível
      console.log('Carregando parâmetros de trincheira');
      
      setParameters(null);
      setParametersList([]);
      
 
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar parâmetros'
      );
    } finally {
      setLoading(false);
    }
  };

  const saveParameters = async (params: CreateTrenchParametersRequest) => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Implementar salvamento real quando disponível
      console.log('Salvando parâmetros de trincheira:', params);
      
      // Recarregar a lista para manter sincronizada
      await loadParameters();
      

      // // Recarregar a lista para manter sincronizada
      // await loadParameters();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao salvar parâmetros'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateParameters = async (params: UpdateTrenchParametersRequest) => {
    if (!trenchId) {
      setError('trenchId é obrigatório para atualização');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: Implementar atualização real quando disponível
      console.log('Atualizando parâmetros de trincheira:', params);
      
      // Recarregar a lista para manter sincronizada
      await loadParameters();
      


      // // Recarregar a lista para manter sincronizada
      // await loadParameters();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao atualizar parâmetros'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Carregar parâmetros automaticamente quando as dependências mudarem
  useEffect(() => {
    if (autoLoad) {
      loadParameters();
    }
  }, [loadParameters, autoLoad]);

  return {
    parameters,
    parametersList,
    loading,
    error,
    saveParameters,
    updateParameters,
    loadParameters,
    clearError,
  };
}
