export interface Measurement {
  id: string;
  type: 'distance' | 'area' | 'volume' | 'count';
  value: number;
  unit: string;
  points: Point[];
  label?: string;
  color: string;
  createdAt: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface TakeoffMeasurement {
  id: string;
  type: 'distance' | 'area' | 'volume' | 'count' | 'trench' | 'bore-shot' | 'vault' | 'hydro-excavation-trench' | 'hydro-excavation-pothole' | 'conduit';
  value: number;
  unit: string;
  label: string;
  color: string;
  points: Point[];
  createdAt: string;
  updatedAt: string;
  
  // Propriedades opcionais para diferentes tipos
  notes?: string;
  length?: number;
  area?: number;
  pitSize?: { width: number; length: number; depth: number };
  
  // Vault properties
  vaultDimensions?: { width: number; length: number; depth: number };
  vaultTrafficRated?: boolean;
  vaultSpoilVolumeCY?: number;
  vaultAsphaltRemovalCY?: number;
  vaultConcreteRemovalCY?: number;
  vaultAsphaltRestorationCY?: number;
  vaultConcreteRestorationCY?: number;
  vaultBackfillCY?: number;
  vaultBackfillType?: string;
  
  // Trench properties
  trenchWidth?: number;
  trenchDepth?: number;
  spoilVolumeCY?: number;
  backfill?: {
    material: string;
    volumeCY: number;
  };
  
  // Conduit properties
  conduits?: Array<{
    size: string;
    material: string;
    length: number;
  }>;
  
  // Bore shot properties
  holeSize?: { diameter: number; depth: number };
  
  // Hydro excavation properties
  hydroPotholingData?: {
    volume: number;
    material: string;
    depth: number;
  };
}

export interface Tool {
  id: string;
  name: string;
  type: 'select' | 'trench' | 'bore-shot' | 'vault' | 'hydro-excavation' | 'conduit' | 'bore-pit' | 'concrete' | 'asphalt' | 'yardage' | 'notes';
  config: any;
  isActive: boolean;
} 
