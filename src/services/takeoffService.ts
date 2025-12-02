import { 
  Takeoff, 
  TakeoffMeasurement, 
  CreateTakeoffRequest, 
  UpdateTakeoffRequest, 
  TakeoffFilters, 
  PaginatedResponse, 
  TakeoffStats,
  TakeoffSummary,
  ApiResponse 
} from '../types/entities';
import { validateTakeoffCreate, validateTakeoffUpdate } from '../utils/validation';
import { API_CONFIG, getAuthHeaders } from '../config/api';

const API_BASE_URL = API_CONFIG.baseURL;

class TakeoffService {
  private getAuthHeaders() {
    return getAuthHeaders();
  }

  private mapTakeoffData(takeoff: any): Takeoff {
    return {
      id: String(takeoff.id),
      project_id: String(takeoff.project_id || takeoff.projectId),
      plant_id: takeoff.plant_id || takeoff.plantId,
      name: takeoff.name || '',
      description: takeoff.description || '',
      status: takeoff.status || 'draft',
      created_by: takeoff.created_by || takeoff.createdBy || '',
      assigned_to: takeoff.assigned_to || takeoff.assignedTo || [],
      created_at: takeoff.created_at || takeoff.createdAt || new Date().toISOString(),
      updated_at: takeoff.updated_at || takeoff.updatedAt || new Date().toISOString(),
      completed_at: takeoff.completed_at || takeoff.completedAt,
      approved_at: takeoff.approved_at || takeoff.approvedAt,
      approved_by: takeoff.approved_by || takeoff.approvedBy,
      total_amount: takeoff.total_amount || takeoff.totalAmount || 0,
      currency: takeoff.currency || 'USD',
      items: takeoff.items || [],
      notes: takeoff.notes || '',
      tags: takeoff.tags || [],
      version: takeoff.version || 1
    };
  }

  private mapMeasurementData(measurement: any): TakeoffMeasurement {
    return {
      id: String(measurement.id),
      takeoff_id: String(measurement.takeoff_id || measurement.takeoffId),
      type: measurement.type || measurement.tool_type || measurement.toolType || 'distance',
      label: measurement.label || measurement.description || `Measurement ${measurement.id}`,
      coordinates: measurement.coordinates || measurement.points || [],
      length: measurement.length,
      area: measurement.area,
      unit: measurement.unit || 'm',
      color: measurement.color || '#FF0000',
      notes: measurement.notes || '',
      createdAt: measurement.created_at || measurement.createdAt || new Date().toISOString(),
      updatedAt: measurement.updated_at || measurement.updatedAt || new Date().toISOString()
    };
  }

  private createEmptySummary(): TakeoffSummary {
    return {
      totalItems: 0,
      totalAmount: 0
    };
  }

  // ============================================================================
  // OPERAÇÕES CRUD
  // ============================================================================

  async createTakeoff(data: CreateTakeoffRequest): Promise<Takeoff> {
    try {
      // Validação client-side (opcional)
      try {
        const validation = validateTakeoffCreate(data);
        if (!validation.isValid) {
          throw new Error(`Erro de validação: ${validation.errors.map((e: { field: string; message: string }) => e.message).join(', ')}`);
        }
      } catch (validationError) {
        // Ignora erros de validação se a função não estiver disponível
        console.warn('Validação client-side ignorada:', validationError);
      }

      const response = await fetch(`${API_BASE_URL}/takeoffs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Não autorizado. Faça login novamente.');
        }
        if (response.status === 404) {
          throw new Error('Projeto não encontrado.');
        }
        throw new Error(`Erro ao criar takeoff: ${response.statusText}`);
      }

      const result: ApiResponse<Takeoff> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Resposta inválida do backend');
      }
      
      const takeoff = this.mapTakeoffData(result.data!);
      
      // Limpar cache de takeoffs
      this.clearTakeoffsCache();
      
      return takeoff;
    } catch (error) {
      console.error('Erro ao criar takeoff:', error);
      throw error;
    }
  }

  async getTakeoffById(id: string): Promise<Takeoff> {
    try {
      const response = await fetch(`${API_BASE_URL}/takeoffs/${id}`, {
        headers: this.getAuthHeaders(),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Não autorizado. Faça login novamente.');
        }
        if (response.status === 404) {
          throw new Error('Takeoff não encontrado.');
        }
        throw new Error(`Erro ao buscar takeoff: ${response.statusText}`);
      }

      const result: ApiResponse<Takeoff> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Resposta inválida do backend');
      }
      
      return this.mapTakeoffData(result.data!);
    } catch (error) {
      console.error('Erro ao buscar takeoff:', error);
      throw error;
    }
  }

  async getTakeoffs(filters?: TakeoffFilters): Promise<PaginatedResponse<Takeoff>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        if (filters.page) queryParams.append('page', filters.page.toString());
        if (filters.limit) queryParams.append('limit', filters.limit.toString());
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
        if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
        if (filters.status) {
          if (Array.isArray(filters.status)) {
            filters.status.forEach(status => queryParams.append('status', status));
          } else {
            queryParams.append('status', filters.status);
          }
        }
        if (filters.project_id) queryParams.append('project_id', filters.project_id);
        if (filters.plant_id) queryParams.append('plant_id', filters.plant_id);
        if (filters.created_by) queryParams.append('created_by', filters.created_by);
        if (filters.date_range) {
          if (filters.date_range.start) queryParams.append('start_date', filters.date_range.start);
          if (filters.date_range.end) queryParams.append('end_date', filters.date_range.end);
        }
      }

      const url = `${API_BASE_URL}/takeoffs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Não autorizado. Faça login novamente.');
        }
        throw new Error(`Erro ao buscar takeoffs: ${response.statusText}`);
      }

      const result: ApiResponse<PaginatedResponse<Takeoff>> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Resposta inválida do backend');
      }
      
      const takeoffs = result.data!.data.map((takeoff: any) => this.mapTakeoffData(takeoff));
      
      // Salvar no localStorage como cache
      this.saveTakeoffsToLocalStorage(takeoffs);
      
      return {
        ...result.data!,
        data: takeoffs
      };
    } catch (error) {
      console.error('Erro ao buscar takeoffs:', error);
      throw error;
    }
  }

  async updateTakeoff(id: string, data: UpdateTakeoffRequest): Promise<Takeoff> {
    try {
      // Validação client-side (opcional)
      try {
        const validation = validateTakeoffUpdate(data);
        if (!validation.isValid) {
          throw new Error(`Erro de validação: ${validation.errors.map((e: { field: string; message: string }) => e.message).join(', ')}`);
        }
      } catch (validationError) {
        // Ignora erros de validação se a função não estiver disponível
        console.warn('Validação client-side ignorada:', validationError);
      }

      const response = await fetch(`${API_BASE_URL}/takeoffs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Não autorizado. Faça login novamente.');
        }
        if (response.status === 404) {
          throw new Error('Takeoff não encontrado.');
        }
        throw new Error(`Erro ao atualizar takeoff: ${response.statusText}`);
      }

      const result: ApiResponse<Takeoff> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Resposta inválida do backend');
      }
      
      const takeoff = this.mapTakeoffData(result.data!);
      
      // Limpar cache de takeoffs
      this.clearTakeoffsCache();
      
      return takeoff;
    } catch (error) {
      console.error('Erro ao atualizar takeoff:', error);
      throw error;
    }
  }

  async deleteTakeoff(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/takeoffs/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Não autorizado. Faça login novamente.');
        }
        if (response.status === 404) {
          throw new Error('Takeoff não encontrado.');
        }
        throw new Error(`Erro ao excluir takeoff: ${response.statusText}`);
      }

      const result: ApiResponse<void> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Resposta inválida do backend');
      }
      
      // Limpar cache de takeoffs
      this.clearTakeoffsCache();
    } catch (error) {
      console.error('Erro ao excluir takeoff:', error);
      throw error;
    }
  }

  // ============================================================================
  // OPERAÇÕES ESPECÍFICAS
  // ============================================================================

  async approveTakeoff(id: string, approvedBy: string, notes?: string): Promise<Takeoff> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/takeoffs/${id}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify({ approved_by: approvedBy, notes }),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Não autorizado. Faça login novamente.');
        }
        if (response.status === 404) {
          throw new Error('Takeoff não encontrado.');
        }
        throw new Error(`Erro ao aprovar takeoff: ${response.statusText}`);
      }

      const result: ApiResponse<Takeoff> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Resposta inválida do backend');
      }
      
      const takeoff = this.mapTakeoffData(result.data!);
      
      // Limpar cache de takeoffs
      this.clearTakeoffsCache();
      
      return takeoff;
    } catch (error) {
      console.error('Erro ao aprovar takeoff:', error);
      throw error;
    }
  }

  async updateTakeoffStatus(id: string, status: Takeoff['status']): Promise<Takeoff> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/takeoffs/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify({ status }),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Não autorizado. Faça login novamente.');
        }
        if (response.status === 404) {
          throw new Error('Takeoff não encontrado.');
        }
        throw new Error(`Erro ao atualizar status do takeoff: ${response.statusText}`);
      }

      const result: ApiResponse<Takeoff> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Resposta inválida do backend');
      }
      
      const takeoff = this.mapTakeoffData(result.data!);
      
      // Limpar cache de takeoffs
      this.clearTakeoffsCache();
      
      return takeoff;
    } catch (error) {
      console.error('Erro ao atualizar status do takeoff:', error);
      throw error;
    }
  }

  // ============================================================================
  // GESTÃO DE MEDIÇÕES
  // ============================================================================

  async addMeasurement(takeoffId: string, measurement: Omit<TakeoffMeasurement, 'id' | 'created_at' | 'updated_at'>): Promise<TakeoffMeasurement> {
    try {
      const response = await fetch(`${API_BASE_URL}/takeoffs/${takeoffId}/measurements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify(measurement),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Não autorizado. Faça login novamente.');
        }
        if (response.status === 404) {
          throw new Error('Takeoff não encontrado.');
        }
        throw new Error(`Erro ao adicionar medição: ${response.statusText}`);
      }

      const result: ApiResponse<TakeoffMeasurement> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Resposta inválida do backend');
      }
      
      // Limpar cache de takeoffs
      this.clearTakeoffsCache();
      
      return this.mapMeasurementData(result.data!);
    } catch (error) {
      console.error('Erro ao adicionar medição:', error);
      throw error;
    }
  }

  async updateMeasurement(takeoffId: string, measurementId: string, data: Partial<TakeoffMeasurement>): Promise<TakeoffMeasurement> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/takeoffs/${takeoffId}/measurements/${measurementId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Não autorizado. Faça login novamente.');
        }
        if (response.status === 404) {
          throw new Error('Takeoff ou medição não encontrado.');
        }
        throw new Error(`Erro ao atualizar medição: ${response.statusText}`);
      }

      const result: ApiResponse<TakeoffMeasurement> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Resposta inválida do backend');
      }
      
      // Limpar cache de takeoffs
      this.clearTakeoffsCache();
      
      return this.mapMeasurementData(result.data!);
    } catch (error) {
      console.error('Erro ao atualizar medição:', error);
      throw error;
    }
  }

  async deleteMeasurement(takeoffId: string, measurementId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/takeoffs/${takeoffId}/measurements/${measurementId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Não autorizado. Faça login novamente.');
        }
        if (response.status === 404) {
          throw new Error('Takeoff ou medição não encontrado.');
        }
        throw new Error(`Erro ao excluir medição: ${response.statusText}`);
      }

      const result: ApiResponse<void> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Resposta inválida do backend');
      }
      
      // Limpar cache de takeoffs
      this.clearTakeoffsCache();
    } catch (error) {
      console.error('Erro ao excluir medição:', error);
      throw error;
    }
  }

  // ============================================================================
  // ESTATÍSTICAS E RELATÓRIOS
  // ============================================================================

  async getTakeoffStats(): Promise<TakeoffStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/takeoffs/stats`, {
        headers: this.getAuthHeaders(),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Não autorizado. Faça login novamente.');
        }
        throw new Error(`Erro ao buscar estatísticas: ${response.statusText}`);
      }

      const result: ApiResponse<TakeoffStats> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Resposta inválida do backend');
      }

      return result.data!;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  async getTakeoffsByProject(projectId: string): Promise<Takeoff[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/takeoffs/project/${projectId}`, {
        headers: this.getAuthHeaders(),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Não autorizado. Faça login novamente.');
        }
        throw new Error(`Erro ao buscar takeoffs por projeto: ${response.statusText}`);
      }

      const result: ApiResponse<Takeoff[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Resposta inválida do backend');
      }

      return result.data!.map((takeoff: any) => this.mapTakeoffData(takeoff));
    } catch (error) {
      console.error('Erro ao buscar takeoffs por projeto:', error);
      throw error;
    }
  }

  async getTakeoffsByStatus(status: Takeoff['status']): Promise<Takeoff[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/takeoffs/status/${status}`, {
        headers: this.getAuthHeaders(),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Não autorizado. Faça login novamente.');
        }
        throw new Error(`Erro ao buscar takeoffs por status: ${response.statusText}`);
      }

      const result: ApiResponse<Takeoff[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Resposta inválida do backend');
      }

      return result.data!.map((takeoff: any) => this.mapTakeoffData(takeoff));
    } catch (error) {
      console.error('Erro ao buscar takeoffs por status:', error);
      throw error;
    }
  }

  // ============================================================================
  // EXPORTAÇÃO E IMPORTAÇÃO
  // ============================================================================

  async exportTakeoff(id: string, format: 'pdf' | 'excel' | 'csv' = 'pdf'): Promise<Blob> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/takeoffs/${id}/export?format=${format}`, {
        headers: this.getAuthHeaders(),
        signal: AbortSignal.timeout(60000) // 1 minuto para exportação
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Não autorizado. Faça login novamente.');
        }
        if (response.status === 404) {
          throw new Error('Takeoff não encontrado.');
        }
        throw new Error(`Erro ao exportar takeoff: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Erro ao exportar takeoff:', error);
      throw error;
    }
  }

  async importMeasurements(takeoffId: string, file: File): Promise<TakeoffMeasurement[]> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/takeoffs/${takeoffId}/import`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders()
        },
        body: formData,
        signal: AbortSignal.timeout(60000) // 1 minuto para importação
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Não autorizado. Faça login novamente.');
        }
        if (response.status === 404) {
          throw new Error('Takeoff não encontrado.');
        }
        if (response.status === 400) {
          throw new Error('Arquivo inválido ou formato não suportado.');
        }
        throw new Error(`Erro ao importar medições: ${response.statusText}`);
      }

      const result: ApiResponse<TakeoffMeasurement[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Resposta inválida do backend');
      }
      
      // Limpar cache de takeoffs
      this.clearTakeoffsCache();
      
      return result.data!.map((measurement: any) => this.mapMeasurementData(measurement));
    } catch (error) {
      console.error('Erro ao importar medições:', error);
      throw error;
    }
  }

  // ============================================================================
  // CACHE E OTIMIZAÇÃO
  // ============================================================================

  private saveTakeoffsToLocalStorage(takeoffs: Takeoff[]) {
    try {
      localStorage.setItem('viaplan-takeoffs-cache', JSON.stringify({
        data: takeoffs,
        timestamp: Date.now(),
        ttl: 5 * 60 * 1000 // 5 minutos
      }));
    } catch (error) {
      console.warn('Erro ao salvar takeoffs no cache:', error);
    }
  }

  private getTakeoffsFromLocalStorage(): Takeoff[] | null {
    try {
      const cached = localStorage.getItem('viaplan-takeoffs-cache');
      if (!cached) return null;

      const { data, timestamp, ttl } = JSON.parse(cached);
      if (Date.now() - timestamp > ttl) {
        localStorage.removeItem('viaplan-takeoffs-cache');
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Erro ao ler takeoffs do cache:', error);
      return null;
    }
  }

  private clearTakeoffsCache() {
    try {
      localStorage.removeItem('viaplan-takeoffs-cache');
    } catch (error) {
      console.warn('Erro ao limpar cache de takeoffs:', error);
    }
  }

  async getTakeoffsWithCache(filters?: TakeoffFilters): Promise<PaginatedResponse<Takeoff>> {
    // Tentar usar cache para busca simples
    if (!filters || (Object.keys(filters).length === 0 || (filters.page === 1 && filters.limit === 50))) {
      const cached = this.getTakeoffsFromLocalStorage();
      if (cached) {
        return {
          data: cached,
          total: cached.length,
          page: 1,
          pageSize: cached.length,
          totalPages: 1
        };
      }
    }

    // Se não há cache ou filtros complexos, buscar da API
    const result = await this.getTakeoffs(filters);
    
    // Salvar no cache se for uma busca simples
    if (!filters || (Object.keys(filters).length === 0 || (filters.page === 1 && filters.limit === 50))) {
      this.saveTakeoffsToLocalStorage(result.data);
    }

    return result;
  }
}

// ============================================================================
// INSTÂNCIA EXPORTADA
// ============================================================================

export const takeoffService = new TakeoffService();
export default takeoffService; 