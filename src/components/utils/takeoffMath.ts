import { Point, ToolConfig, Tool } from '../types/takeoff';

// Calcula a distância euclidiana entre dois pontos
export const getDistance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

// Calcula o comprimento total de uma polilinha (vários pontos)
export const getPolylineLength = (points: Point[]): number => {
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += getDistance(points[i], points[i + 1]);
  }
  return total;
};

// Calcula a área de um polígono (Shoelace formula)
export const getPolygonArea = (points: Point[]): number => {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area / 2);
};

// FUNÇÃO PRINCIPAL: Calcula valores reais baseados na escala e config
export const calculateMeasurementStats = (
  points: Point[],
  toolType: Tool['type'],
  config: ToolConfig = {},
  pixelsPerUnit: number = 1 // Ex: Quantos pixels equivalem a 1 metro/pé
): { value: number; unit: string; secondaryValue?: number } => {
  
  // Fator de conversão (Pixels -> Unidade Real)
  const scaleFactor = 1 / pixelsPerUnit; 
  
  const lengthPx = getPolylineLength(points);
  const lengthReal = lengthPx * scaleFactor;

  switch (toolType) {
    case 'trench':
    case 'hydro-excavation':
      // Vala: Comprimento * Largura = Área (sq ft/m²)
      // Volume opcional = Área * Profundidade
      const width = config.width || 2; // Default seguro
      const depth = config.depth || 0;
      
      const areaVal = lengthReal * width;
      const volumeVal = areaVal * depth;
      
      return {
        value: Number(areaVal.toFixed(2)),
        unit: 'sq ft', // ou m² dependendo da localização
        secondaryValue: depth > 0 ? Number(volumeVal.toFixed(2)) : undefined
      };

    case 'bore-shot':
    case 'conduit':
    case 'measure':
      return {
        value: Number(lengthReal.toFixed(2)),
        unit: 'ft'
      };

    case 'vault':
      return {
        value: 1,
        unit: 'un'
      };

    default:
      return { value: 0, unit: '-' };
  }
};

// Verifica se um ponto (clique) está próximo de uma linha ou ponto existente
export const hitTest = (
  clickPoint: Point,
  measurements: any[],
  zoom: number,
  tolerance: number = 10
): string | null => {
  const adjustedTolerance = tolerance / zoom;

  for (const m of measurements) {
    // Verificar pontos (vértices)
    for (const p of m.points) {
      if (getDistance(clickPoint, p) < adjustedTolerance) {
        return m.id;
      }
    }
    
    // TODO: Adicionar verificação de distância ponto-reta para selecionar clicando na linha
    // Simplificado para retornar o ID se clicar perto de um vértice por enquanto
  }
  return null;
};