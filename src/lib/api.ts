import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/apiService';

export interface Project {
  id: number;
  name: string;
  clientName: string;
  proposalNumber: string;
  status: 'completed' | 'active' | 'planning' | 'onHold';
  priority: 'high' | 'medium' | 'low';
  estimator: string;
  budget?: number;
  estimatedValue?: number;
  startDate?: string;
  endDate?: string;
  isArchived: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  planning: number;
  onHold: number;
  totalBudget: number;
  totalEstimatedValue: number;
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.get<Project[]>('/projects');
      setProjects(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
      // Se for erro de conexão, não definir erro (API não está rodando)
      if (err instanceof Error && (errorMessage.includes('rede') || errorMessage.includes('network') || errorMessage.includes('CONNECTION_REFUSED'))) {
        setError(null);
        setProjects([]);
      } else {
        setError(errorMessage);
        console.error('Error fetching projects:', err);
        setProjects([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const deleteProject = useCallback(async (projectId: number) => {
    try {
      await apiService.delete(`/projects/${projectId}`);
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
      throw new Error(errorMessage);
    }
  }, []);

  const archiveProject = useCallback(async (projectId: number, isArchived: boolean) => {
    try {
      await apiService.put(`/projects/${projectId}/archive`, { isArchived });
      setProjects(prev =>
        prev.map(p => (p.id === projectId ? { ...p, isArchived } : p))
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to archive project';
      throw new Error(errorMessage);
    }
  }, []);

  return {
    projects,
    loading,
    error,
    deleteProject,
    archiveProject,
    refetch: fetchProjects,
  };
};

export const useProjectStats = () => {
  const [stats, setStats] = useState<ProjectStats>({
    total: 0,
    active: 0,
    completed: 0,
    planning: 0,
    onHold: 0,
    totalBudget: 0,
    totalEstimatedValue: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.get<ProjectStats>('/projects/stats');
      setStats(data || {
        total: 0,
        active: 0,
        completed: 0,
        planning: 0,
        onHold: 0,
        totalBudget: 0,
        totalEstimatedValue: 0,
      });
    } catch (err) {
      // Não logar erro se for erro de conexão (API não está rodando)
      if (err instanceof Error && !err.message.includes('rede') && !err.message.includes('network') && !err.message.includes('CONNECTION_REFUSED')) {
        console.error('Error fetching project stats:', err);
      }
      // Fallback para stats vazios quando a API não está disponível
      setStats({
        total: 0,
        active: 0,
        completed: 0,
        planning: 0,
        onHold: 0,
        totalBudget: 0,
        totalEstimatedValue: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    refetch: fetchStats,
  };
};

