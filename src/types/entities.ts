// Stub types for takeoffService
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
  items: any[];
  notes?: string;
  tags?: string[];
  version: number;
}

export interface TakeoffMeasurement {
  id: string;
  takeoff_id: string;
  type: string;
  label: string;
  coordinates: { x: number; y: number }[];
  length?: number;
  area?: number;
  unit: string;
  color: string;
  notes?: string;
  [key: string]: any;
}

export interface CreateTakeoffRequest {
  name: string;
  description?: string;
  project_id: string;
  plant_id?: string;
  [key: string]: any;
}

export interface UpdateTakeoffRequest {
  name?: string;
  description?: string;
  status?: string;
  [key: string]: any;
}

export interface TakeoffFilters {
  status?: string[];
  project_id?: string;
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TakeoffStats {
  total: number;
  byStatus: Record<string, number>;
  [key: string]: any;
}

export interface TakeoffSummary {
  totalItems: number;
  totalAmount: number;
  [key: string]: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

