/**
 * Tipos de datos para el simulador del Algoritmo de Ford-Fulkerson
 * y Teorema de Flujo Máximo - Corte Mínimo.
 */

export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  isSource?: boolean;
  isSink?: boolean;
  isFictitious?: boolean; // Para origen ficticio (S) o destino ficticio (T)
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  capacity: number;
  flow: number;
  isFictitious?: boolean;
}

export interface NodeLabel {
  predecessor: string | null; // Nodo que etiquetó a este nodo
  direction: '+' | '-';      // '+' para arista hacia adelante, '-' para arista hacia atrás
  delta: number;             // Flujo disponible máximo que puede llegar a este nodo
}

export interface AugmentingPath {
  pathNodes: string[];
  pathEdgeIds: string[];
  bottleneck: number;
}

export interface ResidualEdge {
  from: string;
  to: string;
  capacity: number; // capacidad residual
  type: 'forward' | 'backward';
  originalEdgeId: string;
}

export interface MinCutResult {
  S: string[];          // Nodos alcanzables desde la fuente en la red residual final
  T: string[];          // Nodos no alcanzables (incluye el sumidero)
  cutEdges: string[];   // IDs de aristas originales que van de S hacia T
  cutCapacity: number;  // Suma de capacidades de cutEdges
}

export interface SimulationStep {
  stepNumber: number;
  totalSteps: number;
  title: string;
  description: string;
  detailedNotes: string[];
  labels: Record<string, NodeLabel | null>;
  labeledNodesInOrder: string[];
  currentScanNode?: string | null;
  augmentingPath?: AugmentingPath | null;
  flows: Record<string, number>; // edgeId -> flow
  currentTotalFlow: number;
  isAugmentingPhase: boolean;
  isFlowUpdatePhase: boolean;
  isTerminationStep: boolean;
  minCut?: MinCutResult | null;
}

export interface IterationRecord {
  iteration: number;
  pathStr: string;
  nodes: string[];
  bottleneck: number;
  flowBefore: number;
  flowAfter: number;
}

export interface NodeFlowBalance {
  nodeId: string;
  inFlow: number;
  outFlow: number;
  balance: number; // inFlow - outFlow (debe ser 0 para nodos intermedios)
  isValid: boolean;
}

export interface SimulationResult {
  steps: SimulationStep[];
  iterations: IterationRecord[];
  finalFlow: number;
  minCut: MinCutResult;
  isTheoremVerified: boolean;
  saturatedEdges: string[];
  bottleneckEdges: string[];
  nodeBalances: NodeFlowBalance[];
  allConservationValid: boolean;
  allCapacityValid: boolean;
}
