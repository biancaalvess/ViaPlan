import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Tipos
export interface TakeoffItem {
  id: string;
  takeoff_id: string;
  plant_id: string;
  item_name: string;
  item_code: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Takeoff {
  id: string;
  name: string;
  description?: string;
  project_id: string;
  plant_id?: string;
  status: 'draft' | 'in_progress' | 'completed' | 'approved' | 'cancelled';
  created_by: string;
  assigned_to?: string[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
  approved_at?: string;
  approved_by?: string;
  total_amount: number;
  currency: string;
  items: TakeoffItem[];
  notes?: string;
  tags?: string[];
  version: number;
}

export interface TakeoffFilters {
  status?: string[];
  project_id?: string;
  plant_id?: string;
  created_by?: string;
  assigned_to?: string[];
  created_at_from?: string;
  created_at_to?: string;
  tags?: string[];
}

export interface TakeoffState {
  takeoffs: Takeoff[];
  currentTakeoff: Takeoff | null;
  filteredTakeoffs: Takeoff[];
  loading: boolean;
  error: string | null;
  filters: TakeoffFilters;
  searchTerm: string;
  sortBy: keyof Takeoff;
  sortOrder: 'asc' | 'desc';
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  selectedTakeoffs: string[];
  editingItem: TakeoffItem | null;
}

export interface TakeoffActions {
  // Ações de takeoffs
  setTakeoffs: (takeoffs: Takeoff[]) => void;
  addTakeoff: (takeoff: Takeoff) => void;
  updateTakeoff: (id: string, updates: Partial<Takeoff>) => void;
  removeTakeoff: (id: string) => void;
  
  // Ações de takeoff atual
  setCurrentTakeoff: (takeoff: Takeoff | null) => void;
  updateCurrentTakeoff: (updates: Partial<Takeoff>) => void;
  
  // Ações de itens
  addItem: (takeoffId: string, item: TakeoffItem) => void;
  updateItem: (takeoffId: string, itemId: string, updates: Partial<TakeoffItem>) => void;
  removeItem: (takeoffId: string, itemId: string) => void;
  
  // Ações de filtros e busca
  setFilters: (filters: Partial<TakeoffFilters>) => void;
  clearFilters: () => void;
  setSearchTerm: (term: string) => void;
  clearSearch: () => void;
  
  // Ações de ordenação
  setSortBy: (field: keyof Takeoff) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  toggleSortOrder: () => void;
  
  // Ações de paginação
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setTotal: (total: number) => void;
  
  // Ações de estado
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Ações de seleção
  selectTakeoff: (id: string) => void;
  deselectTakeoff: (id: string) => void;
  selectAllTakeoffs: () => void;
  deselectAllTakeoffs: () => void;
  toggleTakeoffSelection: (id: string) => void;
  
  // Ações de edição
  setEditingItem: (item: TakeoffItem | null) => void;
  
  // Ações de filtragem
  applyFilters: () => void;
  getTakeoffById: (id: string) => Takeoff | undefined;
  getTakeoffsByProject: (projectId: string) => Takeoff[];
  getTakeoffsByStatus: (status: string) => Takeoff[];
  getTakeoffsByPlant: (plantId: string) => Takeoff[];
  
  // Ações de cálculos
  calculateTotal: (takeoffId: string) => number;
  recalculateAllTotals: () => void;
  
  // Ações de reset
  reset: () => void;
}

// Estado inicial
const initialState: TakeoffState = {
  takeoffs: [],
  currentTakeoff: null,
  filteredTakeoffs: [],
  loading: false,
  error: null,
  filters: {},
  searchTerm: '',
  sortBy: 'created_at',
  sortOrder: 'desc',
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
  selectedTakeoffs: [],
  editingItem: null,
};

// Store de takeoff
export const useTakeoffStore = create<TakeoffState & TakeoffActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Definir takeoffs
      setTakeoffs: (takeoffs: Takeoff[]) => {
        set({ takeoffs, filteredTakeoffs: takeoffs });
      },

      // Adicionar takeoff
      addTakeoff: (takeoff: Takeoff) => {
        const { takeoffs } = get();
        const newTakeoffs = [takeoff, ...takeoffs];
        set({ takeoffs: newTakeoffs });
        get().applyFilters();
      },

      // Atualizar takeoff
      updateTakeoff: (id: string, updates: Partial<Takeoff>) => {
        const { takeoffs, currentTakeoff } = get();
        const updatedTakeoffs = takeoffs.map(takeoff =>
          takeoff.id === id ? { ...takeoff, ...updates } : takeoff
        );
        
        set({ takeoffs: updatedTakeoffs });
        
        // Atualizar takeoff atual se necessário
        if (currentTakeoff?.id === id) {
          set({
            currentTakeoff: { ...currentTakeoff, ...updates },
          });
        }
        
        get().applyFilters();
      },

      // Remover takeoff
      removeTakeoff: (id: string) => {
        const { takeoffs, currentTakeoff, selectedTakeoffs } = get();
        const filteredTakeoffs = takeoffs.filter(takeoff => takeoff.id !== id);
        const filteredSelected = selectedTakeoffs.filter(takeoffId => takeoffId !== id);
        
        set({ 
          takeoffs: filteredTakeoffs,
          selectedTakeoffs: filteredSelected,
        });
        
        // Limpar takeoff atual se necessário
        if (currentTakeoff?.id === id) {
          set({ currentTakeoff: null });
        }
        
        get().applyFilters();
      },

      // Definir takeoff atual
      setCurrentTakeoff: (takeoff: Takeoff | null) => {
        set({ currentTakeoff: takeoff });
      },

      // Atualizar takeoff atual
      updateCurrentTakeoff: (updates: Partial<Takeoff>) => {
        const { currentTakeoff } = get();
        if (currentTakeoff) {
          set({
            currentTakeoff: { ...currentTakeoff, ...updates },
          });
        }
      },

      // Adicionar item
      addItem: (takeoffId: string, item: TakeoffItem) => {
        const { takeoffs, currentTakeoff } = get();
        const updatedTakeoffs = takeoffs.map(takeoff =>
          takeoff.id === takeoffId
            ? { ...takeoff, items: [...takeoff.items, item] }
            : takeoff
        );
        
        set({ takeoffs: updatedTakeoffs });
        
        // Atualizar takeoff atual se necessário
        if (currentTakeoff?.id === takeoffId) {
          set({
            currentTakeoff: { ...currentTakeoff, items: [...currentTakeoff.items, item] },
          });
        }
        
        get().recalculateAllTotals();
        get().applyFilters();
      },

      // Atualizar item
      updateItem: (takeoffId: string, itemId: string, updates: Partial<TakeoffItem>) => {
        const { takeoffs, currentTakeoff } = get();
        const updatedTakeoffs = takeoffs.map(takeoff =>
          takeoff.id === takeoffId
            ? {
                ...takeoff,
                items: takeoff.items.map(item =>
                  item.id === itemId ? { ...item, ...updates } : item
                ),
              }
            : takeoff
        );
        
        set({ takeoffs: updatedTakeoffs });
        
        // Atualizar takeoff atual se necessário
        if (currentTakeoff?.id === takeoffId) {
          set({
            currentTakeoff: {
              ...currentTakeoff,
              items: currentTakeoff.items.map(item =>
                item.id === itemId ? { ...item, ...updates } : item
              ),
            },
          });
        }
        
        get().recalculateAllTotals();
        get().applyFilters();
      },

      // Remover item
      removeItem: (takeoffId: string, itemId: string) => {
        const { takeoffs, currentTakeoff } = get();
        const updatedTakeoffs = takeoffs.map(takeoff =>
          takeoff.id === takeoffId
            ? {
                ...takeoff,
                items: takeoff.items.filter(item => item.id !== itemId),
              }
            : takeoff
        );
        
        set({ takeoffs: updatedTakeoffs });
        
        // Atualizar takeoff atual se necessário
        if (currentTakeoff?.id === takeoffId) {
          set({
            currentTakeoff: {
              ...currentTakeoff,
              items: currentTakeoff.items.filter(item => item.id !== itemId),
            },
          });
        }
        
        get().recalculateAllTotals();
        get().applyFilters();
      },

      // Definir filtros
      setFilters: (filters: Partial<TakeoffFilters>) => {
        const currentFilters = get().filters;
        set({ filters: { ...currentFilters, ...filters } });
        get().applyFilters();
      },

      // Limpar filtros
      clearFilters: () => {
        set({ filters: {}, searchTerm: '' });
        get().applyFilters();
      },

      // Definir termo de busca
      setSearchTerm: (term: string) => {
        set({ searchTerm: term });
        get().applyFilters();
      },

      // Limpar busca
      clearSearch: () => {
        set({ searchTerm: '' });
        get().applyFilters();
      },

      // Definir campo de ordenação
      setSortBy: (field: keyof Takeoff) => {
        set({ sortBy: field });
        get().applyFilters();
      },

      // Definir ordem de ordenação
      setSortOrder: (order: 'asc' | 'desc') => {
        set({ sortOrder: order });
        get().applyFilters();
      },

      // Alternar ordem de ordenação
      toggleSortOrder: () => {
        const { sortOrder } = get();
        set({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' });
        get().applyFilters();
      },

      // Definir página
      setPage: (page: number) => {
        set({ pagination: { ...get().pagination, page } });
      },

      // Definir limite
      setLimit: (limit: number) => {
        set({ pagination: { ...get().pagination, limit, page: 1 } });
        get().applyFilters();
      },

      // Definir total
      setTotal: (total: number) => {
        set({ pagination: { ...get().pagination, total } });
      },

      // Definir loading
      setLoading: (loading: boolean) => {
        set({ loading });
      },

      // Definir erro
      setError: (error: string | null) => {
        set({ error });
      },

      // Limpar erro
      clearError: () => {
        set({ error: null });
      },

      // Selecionar takeoff
      selectTakeoff: (id: string) => {
        const { selectedTakeoffs } = get();
        if (!selectedTakeoffs.includes(id)) {
          set({ selectedTakeoffs: [...selectedTakeoffs, id] });
        }
      },

      // Deselecionar takeoff
      deselectTakeoff: (id: string) => {
        const { selectedTakeoffs } = get();
        set({
          selectedTakeoffs: selectedTakeoffs.filter(takeoffId => takeoffId !== id),
        });
      },

      // Selecionar todos os takeoffs
      selectAllTakeoffs: () => {
        const { filteredTakeoffs } = get();
        const allIds = filteredTakeoffs.map(takeoff => takeoff.id);
        set({ selectedTakeoffs: allIds });
      },

      // Deselecionar todos os takeoffs
      deselectAllTakeoffs: () => {
        set({ selectedTakeoffs: [] });
      },

      // Alternar seleção de takeoff
      toggleTakeoffSelection: (id: string) => {
        const { selectedTakeoffs } = get();
        if (selectedTakeoffs.includes(id)) {
          get().deselectTakeoff(id);
        } else {
          get().selectTakeoff(id);
        }
      },

      // Definir item em edição
      setEditingItem: (item: TakeoffItem | null) => {
        set({ editingItem: item });
      },

      // Aplicar filtros
      applyFilters: () => {
        const { takeoffs, filters, searchTerm, sortBy, sortOrder } = get();
        
        let filtered = [...takeoffs];

        // Aplicar filtros
        if (filters.status?.length) {
          filtered = filtered.filter(takeoff => 
            filters.status!.includes(takeoff.status)
          );
        }

        if (filters.project_id) {
          filtered = filtered.filter(takeoff => 
            takeoff.project_id === filters.project_id
          );
        }

        if (filters.plant_id) {
          filtered = filtered.filter(takeoff => 
            takeoff.plant_id === filters.plant_id
          );
        }

        if (filters.created_by) {
          filtered = filtered.filter(takeoff => 
            takeoff.created_by === filters.created_by
          );
        }

        if (filters.assigned_to?.length) {
          filtered = filtered.filter(takeoff =>
            takeoff.assigned_to?.some(userId => filters.assigned_to!.includes(userId))
          );
        }

        if (filters.created_at_from) {
          filtered = filtered.filter(takeoff =>
            takeoff.created_at >= filters.created_at_from!
          );
        }

        if (filters.created_at_to) {
          filtered = filtered.filter(takeoff =>
            takeoff.created_at <= filters.created_at_to!
          );
        }

        if (filters.tags?.length) {
          filtered = filtered.filter(takeoff =>
            takeoff.tags?.some(tag => filters.tags!.includes(tag))
          );
        }

        // Aplicar busca
        if (searchTerm) {
          filtered = filtered.filter(takeoff =>
            takeoff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            takeoff.description?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        // Aplicar ordenação
        filtered.sort((a, b) => {
          const aValue = a[sortBy];
          const bValue = b[sortBy];
          
          if (aValue === undefined || bValue === undefined) return 0;
          if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        });

        set({ filteredTakeoffs: filtered });
      },

      // Obter takeoff por ID
      getTakeoffById: (id: string) => {
        const { takeoffs } = get();
        return takeoffs.find(takeoff => takeoff.id === id);
      },

      // Obter takeoffs por projeto
      getTakeoffsByProject: (projectId: string) => {
        const { takeoffs } = get();
        return takeoffs.filter(takeoff => takeoff.project_id === projectId);
      },

      // Obter takeoffs por status
      getTakeoffsByStatus: (status: string) => {
        const { takeoffs } = get();
        return takeoffs.filter(takeoff => takeoff.status === status);
      },

      // Obter takeoffs por planta
      getTakeoffsByPlant: (plantId: string) => {
        const { takeoffs } = get();
        return takeoffs.filter(takeoff => takeoff.plant_id === plantId);
      },

      // Calcular total de um takeoff
      calculateTotal: (takeoffId: string) => {
        const takeoff = get().getTakeoffById(takeoffId);
        if (!takeoff) return 0;
        
        return takeoff.items.reduce((total, item) => total + item.total_price, 0);
      },

      // Recalcular todos os totais
      recalculateAllTotals: () => {
        const { takeoffs } = get();
        const updatedTakeoffs = takeoffs.map(takeoff => ({
          ...takeoff,
          total_amount: takeoff.items.reduce((total, item) => total + item.total_price, 0),
        }));
        
        set({ takeoffs: updatedTakeoffs });
      },

      // Reset do store
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'takeoff-store',
    }
  )
);
