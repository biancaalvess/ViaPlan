import { ReactNode } from 'react';

export type MeasurementType = 'area' | 'distance' | 'count' | 'volume';

export interface Point {
  x: number;
  y: number;
}

export interface ToolConfig {
  width?: number;       // Para valas (ft/m)
  depth?: number;       // Para valas (ft/m)
  diameter?: number;    // Para tubulações
  color?: string;
  layer?: string;
  pricePerUnit?: number;
}

export interface Tool {
  icon: ReactNode;
  description: ReactNode;
  id: string;
  type: 'select' | 'trench' | 'bore-shot' | 'vault' | 'hydro-excavation' | 'conduit' | 'measure' | 'yardage' | 'bore-pit' | 'concrete' | 'asphalt' | 'notes';
  name: string;
  config?: ToolConfig;
}

export interface Measurement {
  id: string;
  type: MeasurementType;
  toolType: Tool['type'];
  label: string;
  points: Point[];
  
  // Valores Calculados
  value: number;        // Valor principal (comprimento total ou área total)
  secondaryValue?: number; // Ex: Volume para valas
  unit: string;
  
  // Metadados
  config?: ToolConfig;
  color: string;
  selected?: boolean;
}