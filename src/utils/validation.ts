// Stub validation functions for takeoffService
export interface ValidationResult {
  isValid: boolean;
  errors: Array<{ field: string; message: string }>;
}

export function validateTakeoffCreate(data: any): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Nome é obrigatório' });
  }
  
  if (!data.project_id || typeof data.project_id !== 'string') {
    errors.push({ field: 'project_id', message: 'ID do projeto é obrigatório' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateTakeoffUpdate(data: any): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];
  
  // Validações opcionais para update
  if (data.name !== undefined && (typeof data.name !== 'string' || data.name.trim().length === 0)) {
    errors.push({ field: 'name', message: 'Nome deve ser uma string não vazia' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}


