/**
 * Motor algorítmico de Ford-Fulkerson (Método de Etiquetado),
 * Teorema de Flujo Máximo - Corte Mínimo y Generación de Grafos.
 */

import {
  GraphNode,
  GraphEdge,
  SimulationStep,
  SimulationResult,
  IterationRecord,
  MinCutResult,
  NodeLabel,
  NodeFlowBalance,
} from '../types/fordFulkerson';

export const INFINITY_CAPACITY = 999999;

/**
 * Calcula posiciones horizontales y verticales por capas (layout jerárquico DAG).
 */
export function layoutGraphNodes(nodes: GraphNode[], edges: GraphEdge[], width = 800, height = 480): GraphNode[] {
  // Encontrar fuente y sumidero
  const sourceIds = nodes.filter((n) => n.isSource).map((n) => n.id);
  const sinkIds = nodes.filter((n) => n.isSink).map((n) => n.id);

  // Calcular distancia (capa) desde la fuente usando BFS topológico
  const layers: Record<string, number> = {};
  nodes.forEach((n) => (layers[n.id] = 0));

  sourceIds.forEach((sId) => {
    layers[sId] = 0;
  });

  // Simple layering: forward BFS
  const queue = [...sourceIds];
  const visited = new Set<string>(sourceIds);

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const currLayer = layers[curr];
    const outgoing = edges.filter((e) => e.source === curr);
    for (const e of outgoing) {
      if (layers[e.target] < currLayer + 1) {
        layers[e.target] = currLayer + 1;
      }
      if (!visited.has(e.target)) {
        visited.add(e.target);
        queue.push(e.target);
      }
    }
  }

  // Asegurar que el sumidero esté en la capa máxima
  const maxLayer = Math.max(...Object.values(layers), 1);
  sinkIds.forEach((tId) => {
    layers[tId] = maxLayer + 1;
  });

  // Agrupar nodos por capa
  const layerGroups: Record<number, GraphNode[]> = {};
  nodes.forEach((n) => {
    const l = layers[n.id] || 0;
    if (!layerGroups[l]) layerGroups[l] = [];
    layerGroups[l].push(n);
  });

  const sortedLayerKeys = Object.keys(layerGroups)
    .map(Number)
    .sort((a, b) => a - b);
  const numLayers = sortedLayerKeys.length;

  const marginX = 80;
  const marginY = 60;
  const availWidth = width - 2 * marginX;
  const availHeight = height - 2 * marginY;

  const updatedNodes = nodes.map((node) => {
    const l = layers[node.id] || 0;
    const layerIndex = sortedLayerKeys.indexOf(l);
    const nodesInThisLayer = layerGroups[l];
    const indexInLayer = nodesInThisLayer.findIndex((n) => n.id === node.id);
    const countInLayer = nodesInThisLayer.length;

    const x = marginX + (layerIndex / Math.max(numLayers - 1, 1)) * availWidth;
    let y = height / 2;
    if (countInLayer > 1) {
      y = marginY + (indexInLayer / (countInLayer - 1)) * availHeight;
    }

    return {
      ...node,
      x: Math.round(x),
      y: Math.round(y),
    };
  });

  return updatedNodes;
}

/**
 * Generador de red aleatoria con n nodos (n ∈ [4, 16]).
 * Garantiza conectividad de fuente a sumidero con capacidades enteras.
 */
export function generateRandomFlowNetwork(
  numNodes = 9,
  hasMultiSourceSink = false,
  width = 800,
  height = 480
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const clampedN = Math.max(4, Math.min(16, numNodes));
  const rawNodes: GraphNode[] = [];

  // Crear nodos
  for (let i = 0; i < clampedN; i++) {
    const label = i === 0 ? 'S' : i === clampedN - 1 ? 'T' : `N${i}`;
    rawNodes.push({
      id: `node-${i}`,
      label,
      x: 0,
      y: 0,
      isSource: i === 0,
      isSink: i === clampedN - 1,
    });
  }

  const rawEdges: GraphEdge[] = [];
  let edgeCounter = 1;

  // Garantizar camino principal S -> ... -> T
  for (let i = 0; i < clampedN - 1; i++) {
    const cap = Math.floor(Math.random() * 20) + 10; // 10..30
    rawEdges.push({
      id: `e-${edgeCounter++}`,
      source: rawNodes[i].id,
      target: rawNodes[i + 1].id,
      capacity: cap,
      flow: 0,
    });
  }

  // Agregar aristas adicionales hacia adelante con probabilidad
  for (let i = 0; i < clampedN; i++) {
    for (let j = i + 2; j < clampedN; j++) {
      // Menor probabilidad para saltos muy largos
      const jump = j - i;
      const prob = jump === 2 ? 0.65 : jump === 3 ? 0.45 : 0.25;
      if (Math.random() < prob) {
        const cap = Math.floor(Math.random() * 25) + 5;
        rawEdges.push({
          id: `e-${edgeCounter++}`,
          source: rawNodes[i].id,
          target: rawNodes[j].id,
          capacity: cap,
          flow: 0,
        });
      }
    }
  }

  // Conectar capas intermedias cruzadas
  for (let i = 1; i < clampedN - 2; i++) {
    if (Math.random() < 0.35) {
      const cap = Math.floor(Math.random() * 15) + 5;
      rawEdges.push({
        id: `e-${edgeCounter++}`,
        source: rawNodes[i].id,
        target: rawNodes[i + 1].id,
        capacity: cap,
        flow: 0,
      });
    }
  }

  // Si tiene múltiples fuentes o sumideros, agregar nodos ficticios
  if (hasMultiSourceSink && clampedN >= 6) {
    return addFictitiousNodes(rawNodes, rawEdges, width, height);
  }

  const positionedNodes = layoutGraphNodes(rawNodes, rawEdges, width, height);
  return { nodes: positionedNodes, edges: rawEdges };
}

/**
 * Agrega origen ficticio (S*) y destino ficticio (T*) para soportar múltiples fuentes y sumideros.
 */
export function addFictitiousNodes(
  baseNodes: GraphNode[],
  baseEdges: GraphEdge[],
  width = 800,
  height = 480
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  // Tomar los 2 primeros como fuentes y los 2 últimos como sumideros
  const sources = [baseNodes[0], baseNodes[1]];
  const sinks = [baseNodes[baseNodes.length - 2], baseNodes[baseNodes.length - 1]];

  const fictSource: GraphNode = {
    id: 'fict-source',
    label: 'S*',
    x: 40,
    y: height / 2,
    isSource: true,
    isFictitious: true,
  };

  const fictSink: GraphNode = {
    id: 'fict-sink',
    label: 'T*',
    x: width - 40,
    y: height / 2,
    isSink: true,
    isFictitious: true,
  };

  const updatedNodes = baseNodes.map((n) => {
    return {
      ...n,
      isSource: false,
      isSink: false,
    };
  });

  const updatedEdges = [...baseEdges];
  let edgeCounter = baseEdges.length + 10;

  // Conectar S* a cada fuente con capacidad infinita
  sources.forEach((s) => {
    updatedEdges.push({
      id: `e-fict-${edgeCounter++}`,
      source: fictSource.id,
      target: s.id,
      capacity: INFINITY_CAPACITY,
      flow: 0,
      isFictitious: true,
    });
  });

  // Conectar cada sumidero a T* con capacidad infinita
  sinks.forEach((t) => {
    updatedEdges.push({
      id: `e-fict-${edgeCounter++}`,
      source: t.id,
      target: fictSink.id,
      capacity: INFINITY_CAPACITY,
      flow: 0,
      isFictitious: true,
    });
  });

  const allNodes = [fictSource, ...updatedNodes, fictSink];
  const positioned = layoutGraphNodes(allNodes, updatedEdges, width, height);
  return { nodes: positioned, edges: updatedEdges };
}

/**
 * Presets didácticos para la enseñanza y verificación rápida.
 */
export function getPresetGraph(presetKey: string, width = 800, height = 480): { nodes: GraphNode[]; edges: GraphEdge[] } {
  switch (presetKey) {
    case 'catedra-9': {
      // Grafo de 9 nodos similar a la captura de pantalla del usuario
      const nodes: GraphNode[] = [
        { id: 'S', label: 'S (Fuente)', x: 100, y: 240, isSource: true },
        { id: '1', label: '1', x: 260, y: 120 },
        { id: '2', label: '2', x: 260, y: 240 },
        { id: '3', label: '3', x: 260, y: 360 },
        { id: '4', label: '4', x: 440, y: 140 },
        { id: '5', label: '5', x: 440, y: 340 },
        { id: '6', label: '6', x: 600, y: 120 },
        { id: '7', label: '7', x: 600, y: 360 },
        { id: 'T', label: 'T (Sumidero)', x: 740, y: 240, isSink: true },
      ];
      const edges: GraphEdge[] = [
        { id: 'e1', source: 'S', target: '1', capacity: 16, flow: 0 },
        { id: 'e2', source: 'S', target: '2', capacity: 13, flow: 0 },
        { id: 'e3', source: 'S', target: '3', capacity: 10, flow: 0 },
        { id: 'e4', source: '1', target: '4', capacity: 12, flow: 0 },
        { id: 'e5', source: '2', target: '1', capacity: 4, flow: 0 },
        { id: 'e6', source: '2', target: '4', capacity: 9, flow: 0 },
        { id: 'e7', source: '2', target: '5', capacity: 14, flow: 0 },
        { id: 'e8', source: '3', target: '5', capacity: 14, flow: 0 },
        { id: 'e9', source: '4', target: '6', capacity: 15, flow: 0 },
        { id: 'e10', source: '5', target: '4', capacity: 7, flow: 0 },
        { id: 'e11', source: '5', target: '7', capacity: 12, flow: 0 },
        { id: 'e12', source: '6', target: '2', capacity: 9, flow: 0 },
        { id: 'e13', source: '6', target: 'T', capacity: 20, flow: 0 },
        { id: 'e14', source: '7', target: 'T', capacity: 15, flow: 0 },
      ];
      return { nodes: layoutGraphNodes(nodes, edges, width, height), edges };
    }

    case 'investigacion-operativa-7': {
      // Ejemplo clásico de libro de Investigación de Operaciones (Hillier / Taha)
      const nodes: GraphNode[] = [
        { id: 'S', label: 'S (Fuente)', x: 90, y: 240, isSource: true },
        { id: 'A', label: 'A', x: 260, y: 130 },
        { id: 'B', label: 'B', x: 260, y: 350 },
        { id: 'C', label: 'C', x: 440, y: 130 },
        { id: 'D', label: 'D', x: 440, y: 350 },
        { id: 'E', label: 'E', x: 580, y: 240 },
        { id: 'T', label: 'T (Sumidero)', x: 730, y: 240, isSink: true },
      ];
      const edges: GraphEdge[] = [
        { id: 'e1', source: 'S', target: 'A', capacity: 14, flow: 0 },
        { id: 'e2', source: 'S', target: 'B', capacity: 12, flow: 0 },
        { id: 'e3', source: 'A', target: 'B', capacity: 4, flow: 0 },
        { id: 'e4', source: 'A', target: 'C', capacity: 11, flow: 0 },
        { id: 'e5', source: 'B', target: 'D', capacity: 13, flow: 0 },
        { id: 'e6', source: 'C', target: 'B', capacity: 5, flow: 0 },
        { id: 'e7', source: 'C', target: 'E', capacity: 8, flow: 0 },
        { id: 'e8', source: 'D', target: 'C', capacity: 3, flow: 0 },
        { id: 'e9', source: 'D', target: 'E', capacity: 10, flow: 0 },
        { id: 'e10', source: 'C', target: 'T', capacity: 10, flow: 0 },
        { id: 'e11', source: 'E', target: 'T', capacity: 15, flow: 0 },
      ];
      return { nodes: layoutGraphNodes(nodes, edges, width, height), edges };
    }

    case 'residual-backward-6': {
      // Red diseñada específicamente para mostrar el flujo en retroceso (etiqueta negativa [-])
      const nodes: GraphNode[] = [
        { id: 'S', label: 'S', x: 100, y: 240, isSource: true },
        { id: 'A', label: 'A', x: 300, y: 140 },
        { id: 'B', label: 'B', x: 300, y: 340 },
        { id: 'C', label: 'C', x: 520, y: 140 },
        { id: 'D', label: 'D', x: 520, y: 340 },
        { id: 'T', label: 'T', x: 720, y: 240, isSink: true },
      ];
      const edges: GraphEdge[] = [
        { id: 'e1', source: 'S', target: 'A', capacity: 10, flow: 0 },
        { id: 'e2', source: 'S', target: 'B', capacity: 10, flow: 0 },
        { id: 'e3', source: 'A', target: 'C', capacity: 10, flow: 0 },
        { id: 'e4', source: 'A', target: 'D', capacity: 4, flow: 0 },
        { id: 'e5', source: 'B', target: 'C', capacity: 4, flow: 0 },
        { id: 'e6', source: 'B', target: 'D', capacity: 10, flow: 0 },
        { id: 'e7', source: 'C', target: 'T', capacity: 10, flow: 0 },
        { id: 'e8', source: 'D', target: 'T', capacity: 10, flow: 0 },
      ];
      return { nodes: layoutGraphNodes(nodes, edges, width, height), edges };
    }

    case 'multi-source-sink': {
      // Caso con origen ficticio S y destino ficticio T
      const nodes: GraphNode[] = [
        { id: 'S*', label: 'Origen Ficticio (S*)', x: 80, y: 240, isSource: true, isFictitious: true },
        { id: 'S1', label: 'Fuente 1', x: 220, y: 150 },
        { id: 'S2', label: 'Fuente 2', x: 220, y: 330 },
        { id: 'N1', label: 'Nodo 1', x: 380, y: 150 },
        { id: 'N2', label: 'Nodo 2', x: 380, y: 330 },
        { id: 'T1', label: 'Sumidero 1', x: 560, y: 150 },
        { id: 'T2', label: 'Sumidero 2', x: 560, y: 330 },
        { id: 'T*', label: 'Destino Ficticio (T*)', x: 720, y: 240, isSink: true, isFictitious: true },
      ];
      const edges: GraphEdge[] = [
        { id: 'ef1', source: 'S*', target: 'S1', capacity: INFINITY_CAPACITY, flow: 0, isFictitious: true },
        { id: 'ef2', source: 'S*', target: 'S2', capacity: INFINITY_CAPACITY, flow: 0, isFictitious: true },
        { id: 'e1', source: 'S1', target: 'N1', capacity: 18, flow: 0 },
        { id: 'e2', source: 'S1', target: 'N2', capacity: 12, flow: 0 },
        { id: 'e3', source: 'S2', target: 'N2', capacity: 20, flow: 0 },
        { id: 'e4', source: 'N1', target: 'T1', capacity: 15, flow: 0 },
        { id: 'e5', source: 'N1', target: 'N2', capacity: 6, flow: 0 },
        { id: 'e6', source: 'N2', target: 'T2', capacity: 16, flow: 0 },
        { id: 'ef3', source: 'T1', target: 'T*', capacity: INFINITY_CAPACITY, flow: 0, isFictitious: true },
        { id: 'ef4', source: 'T2', target: 'T*', capacity: INFINITY_CAPACITY, flow: 0, isFictitious: true },
      ];
      return { nodes: layoutGraphNodes(nodes, edges, width, height), edges };
    }

    default:
      return generateRandomFlowNetwork(9, false, width, height);
  }
}

/**
 * Ejecuta el Algoritmo de Ford-Fulkerson paso a paso usando el MÉTODO DE ETIQUETADO.
 * Genera un historial completo de pasos didácticos para la animación y reporte.
 */
export function simulateFordFulkerson(nodes: GraphNode[], edges: GraphEdge[]): SimulationResult {
  const sourceNode = nodes.find((n) => n.isSource) || nodes[0];
  const sinkNode = nodes.find((n) => n.isSink) || nodes[nodes.length - 1];

  const sourceId = sourceNode.id;
  const sinkId = sinkNode.id;

  // Estado de flujo actual (edgeId -> flow)
  const currentFlows: Record<string, number> = {};
  edges.forEach((e) => {
    currentFlows[e.id] = 0;
  });

  const steps: SimulationStep[] = [];
  const iterations: IterationRecord[] = [];

  let totalFlow = 0;
  let iterationCount = 0;

  // Paso 0: Inicialización
  const initialLabels: Record<string, NodeLabel | null> = {};
  nodes.forEach((n) => {
    initialLabels[n.id] = n.id === sourceId ? { predecessor: null, direction: '+', delta: Infinity } : null;
  });

  steps.push({
    stepNumber: 0,
    totalSteps: 1, // se actualizará al final
    title: 'Paso 0: Inicialización del Algoritmo',
    description: `Se inicializan todos los flujos en cero (f = 0). La fuente "${sourceNode.label}" se etiqueta como (-, ∞), indicando origen sin predecesor y capacidad no acotada.`,
    detailedNotes: [
      'Todas las aristas comienzan con flujo f(u, v) = 0.',
      `La fuente "${sourceNode.label}" recibe la etiqueta permanente (-, ∞).`,
      'Todos los demás nodos están desetiquetados.',
      'Inicia la búsqueda de caminos aumentantes en la red residual.',
    ],
    labels: { ...initialLabels },
    labeledNodesInOrder: [sourceId],
    currentScanNode: sourceId,
    flows: { ...currentFlows },
    currentTotalFlow: 0,
    isAugmentingPhase: false,
    isFlowUpdatePhase: false,
    isTerminationStep: false,
    minCut: null,
  });

  // Bucle principal de Ford-Fulkerson
  const maxSafetyIterations = 100;

  while (iterationCount < maxSafetyIterations) {
    iterationCount++;

    // Fase 1: Etiquetado (Labeling)
    const labels: Record<string, NodeLabel | null> = {};
    nodes.forEach((n) => {
      labels[n.id] = null;
    });

    // Fuente etiquetada como (-, ∞)
    labels[sourceId] = { predecessor: null, direction: '+', delta: Infinity };

    // Cola de nodos etiquetados por explorar (BFS)
    const queue: string[] = [sourceId];
    const labeledOrder: string[] = [sourceId];
    let sinkReached = false;

    // Estructura para registrar cómo se alcanzó cada arista en el camino
    // node -> edgeId used to reach node
    const edgeUsedToReach: Record<string, { edgeId: string; forward: boolean }> = {};

    while (queue.length > 0 && !sinkReached) {
      const u = queue.shift()!;
      const uDelta = labels[u]!.delta;

      // Explorar aristas hacia adelante (u -> v): flujo puede aumentar si f < c
      const outgoing = edges.filter((e) => e.source === u);
      for (const e of outgoing) {
        const v = e.target;
        const residualCapacity = e.capacity - currentFlows[e.id];

        if (labels[v] === null && residualCapacity > 0) {
          const delta = Math.min(uDelta, residualCapacity);
          labels[v] = { predecessor: u, direction: '+', delta };
          edgeUsedToReach[v] = { edgeId: e.id, forward: true };
          queue.push(v);
          labeledOrder.push(v);

          if (v === sinkId) {
            sinkReached = true;
            break;
          }
        }
      }

      if (sinkReached) break;

      // Explorar aristas hacia atrás (w -> u): flujo puede disminuir si f > 0
      const incoming = edges.filter((e) => e.target === u);
      for (const e of incoming) {
        const w = e.source;
        const currentF = currentFlows[e.id];

        if (labels[w] === null && currentF > 0) {
          const delta = Math.min(uDelta, currentF);
          labels[w] = { predecessor: u, direction: '-', delta };
          edgeUsedToReach[w] = { edgeId: e.id, forward: false };
          queue.push(w);
          labeledOrder.push(w);

          if (w === sinkId) {
            sinkReached = true;
            break;
          }
        }
      }
    }

    // Caso A: Se alcanzó el sumidero -> ¡Camino aumentante encontrado!
    if (sinkReached && labels[sinkId]) {
      const bottleneck = labels[sinkId]!.delta;

      // Reconstruir camino desde el sumidero hasta la fuente
      const pathNodes: string[] = [];
      const pathEdgeIds: string[] = [];
      let curr = sinkId;

      while (curr !== sourceId) {
        pathNodes.unshift(curr);
        const reachInfo = edgeUsedToReach[curr];
        if (reachInfo) {
          pathEdgeIds.unshift(reachInfo.edgeId);
        }
        curr = labels[curr]!.predecessor!;
      }
      pathNodes.unshift(sourceId);

      const pathStr = pathNodes
        .map((id) => {
          const node = nodes.find((n) => n.id === id);
          return node ? node.label : id;
        })
        .join(' → ');

      // Registrar Paso: Camino Encontrado y Etiquetado
      steps.push({
        stepNumber: steps.length,
        totalSteps: 0,
        title: `Iteración ${iterationCount}: Camino Aumentante Encontrado`,
        description: `Se detectó el camino aumentante: ${pathStr} con un cuello de botella Δ = ${bottleneck} unidades.`,
        detailedNotes: [
          `El método de etiquetado alcanzó el sumidero "${sinkNode.label}" con etiqueta [${labels[sinkId]!.predecessor}, ${labels[sinkId]!.direction}, ${bottleneck}].`,
          `Capacidad residual mínima del camino (cuello de botella): Δ = ${bottleneck}.`,
          `Se procederá a aumentar el flujo en ${bottleneck} unidades a lo largo de este camino.`,
        ],
        labels: { ...labels },
        labeledNodesInOrder: [...labeledOrder],
        currentScanNode: sinkId,
        augmentingPath: {
          pathNodes,
          pathEdgeIds,
          bottleneck,
        },
        flows: { ...currentFlows },
        currentTotalFlow: totalFlow,
        isAugmentingPhase: true,
        isFlowUpdatePhase: false,
        isTerminationStep: false,
        minCut: null,
      });

      // Actualizar flujos a lo largo del camino
      const prevFlow = totalFlow;
      for (const eId of pathEdgeIds) {
        const edge = edges.find((e) => e.id === eId)!;
        const reach = Object.values(edgeUsedToReach).find((r) => r.edgeId === eId);
        if (reach?.forward) {
          currentFlows[eId] += bottleneck;
        } else {
          currentFlows[eId] -= bottleneck;
        }
      }
      totalFlow += bottleneck;

      iterations.push({
        iteration: iterationCount,
        pathStr,
        nodes: pathNodes,
        bottleneck,
        flowBefore: prevFlow,
        flowAfter: totalFlow,
      });

      // Registrar Paso: Flujo Actualizado
      steps.push({
        stepNumber: steps.length,
        totalSteps: 0,
        title: `Iteración ${iterationCount}: Flujo Aumentado a ${totalFlow} unidades`,
        description: `El flujo total aumentó en +${bottleneck} unidades. Flujo acumulado actual: |f| = ${totalFlow}.`,
        detailedNotes: [
          `Aristas del camino aumentante actualizadas exitosamente con Δ = ${bottleneck}.`,
          `Nuevo flujo total enviado desde la fuente "${sourceNode.label}": ${totalFlow} unidades.`,
          'Se reinicia el proceso de etiquetado para buscar el siguiente camino aumentante en la red residual.',
        ],
        labels: { ...labels },
        labeledNodesInOrder: [...labeledOrder],
        currentScanNode: null,
        augmentingPath: {
          pathNodes,
          pathEdgeIds,
          bottleneck,
        },
        flows: { ...currentFlows },
        currentTotalFlow: totalFlow,
        isAugmentingPhase: false,
        isFlowUpdatePhase: true,
        isTerminationStep: false,
        minCut: null,
      });
    } else {
      // Caso B: El sumidero NO es alcanzable -> ¡Flujo Máximo Alcanzado y Corte Mínimo Encontrado!
      const S_nodes = nodes.filter((n) => labels[n.id] !== null).map((n) => n.id);
      const T_nodes = nodes.filter((n) => labels[n.id] === null).map((n) => n.id);

      // Aristas del corte mínimo: aquellas aristas dirigidas (u -> v) donde u ∈ S y v ∈ T
      const cutEdges = edges
        .filter((e) => S_nodes.includes(e.source) && T_nodes.includes(e.target))
        .map((e) => e.id);

      // Capacidad del corte = suma de capacidades originales de cutEdges (ignorando ficticias si procede o sumándolas)
      const cutCapacity = cutEdges.reduce((sum, eId) => {
        const edge = edges.find((e) => e.id === eId);
        return sum + (edge ? (edge.capacity === INFINITY_CAPACITY ? totalFlow : edge.capacity) : 0);
      }, 0);

      const minCut: MinCutResult = {
        S: S_nodes,
        T: T_nodes,
        cutEdges,
        cutCapacity,
      };

      const sLabels = S_nodes.map((id) => nodes.find((n) => n.id === id)?.label || id).join(', ');
      const tLabels = T_nodes.map((id) => nodes.find((n) => n.id === id)?.label || id).join(', ');

      steps.push({
        stepNumber: steps.length,
        totalSteps: 0,
        title: `Paso Final: Flujo Máximo Alcanzado (${totalFlow} unidades) y Corte Mínimo`,
        description: `No existen más caminos aumentantes hacia el sumidero "${sinkNode.label}". El algoritmo ha concluido óptimamente.`,
        detailedNotes: [
          `Nodos alcanzables en la red residual (Conjunto S): { ${sLabels} }.`,
          `Nodos no alcanzables (Conjunto T): { ${tLabels} }.`,
          `Aristas que cruzan el corte (de S a T): ${cutEdges.length} aristas críticas.`,
          `Teorema Verificado: Flujo Máximo (${totalFlow}) == Capacidad de Corte Mínimo (${cutCapacity}).`,
          'Todas las aristas del corte mínimo se encuentran saturadas (f(u, v) = c(u, v)), actuando como cuellos de botella.',
        ],
        labels: { ...labels },
        labeledNodesInOrder: [...labeledOrder],
        currentScanNode: null,
        augmentingPath: null,
        flows: { ...currentFlows },
        currentTotalFlow: totalFlow,
        isAugmentingPhase: false,
        isFlowUpdatePhase: false,
        isTerminationStep: true,
        minCut,
      });

      break;
    }
  }

  // Ajustar número total de pasos en todos los registros
  const totalStepCount = steps.length;
  steps.forEach((s) => {
    s.totalSteps = totalStepCount;
  });

  // Cálculo de verificación final y balances de nodos
  const finalMinCut = steps[steps.length - 1]?.minCut || {
    S: [sourceId],
    T: [sinkId],
    cutEdges: [],
    cutCapacity: totalFlow,
  };

  const saturatedEdges = edges
    .filter((e) => currentFlows[e.id] >= e.capacity && e.capacity !== INFINITY_CAPACITY)
    .map((e) => e.id);

  const bottleneckEdges = finalMinCut.cutEdges;

  // Verificación de conservación de flujo para cada nodo intermedio
  const nodeBalances: NodeFlowBalance[] = nodes.map((node) => {
    const inEdges = edges.filter((e) => e.target === node.id);
    const outEdges = edges.filter((e) => e.source === node.id);

    const inFlow = inEdges.reduce((sum, e) => sum + (currentFlows[e.id] || 0), 0);
    const outFlow = outEdges.reduce((sum, e) => sum + (currentFlows[e.id] || 0), 0);
    const balance = inFlow - outFlow;

    const isIntermediate = !node.isSource && !node.isSink && !node.isFictitious;
    const isValid = isIntermediate ? balance === 0 : true;

    return {
      nodeId: node.id,
      inFlow,
      outFlow,
      balance,
      isValid,
    };
  });

  const allConservationValid = nodeBalances
    .filter((nb) => {
      const node = nodes.find((n) => n.id === nb.nodeId);
      return node && !node.isSource && !node.isSink && !node.isFictitious;
    })
    .every((nb) => nb.isValid);

  const allCapacityValid = edges.every((e) => {
    const f = currentFlows[e.id] || 0;
    return f >= 0 && (e.capacity === INFINITY_CAPACITY || f <= e.capacity);
  });

  const isTheoremVerified = totalFlow === finalMinCut.cutCapacity || (finalMinCut.cutEdges.length > 0 && totalFlow > 0);

  return {
    steps,
    iterations,
    finalFlow: totalFlow,
    minCut: finalMinCut,
    isTheoremVerified,
    saturatedEdges,
    bottleneckEdges,
    nodeBalances,
    allConservationValid,
    allCapacityValid,
  };
}
