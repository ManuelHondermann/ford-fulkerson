/**
 * Aplicación Principal: Simulador de Flujo Máximo y Corte Mínimo (Ford-Fulkerson).
 * Implementa el Método de Etiquetado, Red Residual, Verificación Teórica y Exportación en PDF.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  GraphNode,
  GraphEdge,
} from './types/fordFulkerson';
import {
  generateRandomFlowNetwork,
  getPresetGraph,
  simulateFordFulkerson,
  addFictitiousNodes,
} from './utils/fordFulkerson';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SimulationControls } from './components/SimulationControls';
import { GraphCanvas } from './components/GraphCanvas';
import { TheoryAndVerification } from './components/TheoryAndVerification';
import { PdfExportModal } from './components/PdfExportModal';
import { PythonExportModal } from './components/PythonExportModal';
import { HelpModal } from './components/HelpModal';

export default function App() {
  // Configuración del Grafo
  const [numNodes, setNumNodes] = useState<number>(9);
  const [creationMode, setCreationMode] = useState<'random' | 'manual'>('random');
  const [hasMultiSourceSink, setHasMultiSourceSink] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('catedra-9');

  // Inicializar con el preset de Cátedra de 9 nodos (similar a la captura de pantalla)
  const initialData = useMemo(() => getPresetGraph('catedra-9', 840, 480), []);
  const [nodes, setNodes] = useState<GraphNode[]>(initialData.nodes);
  const [edges, setEdges] = useState<GraphEdge[]>(initialData.edges);

  // Ejecución de la simulación de Ford-Fulkerson
  const simulationResult = useMemo(() => {
    return simulateFordFulkerson(nodes, edges);
  }, [nodes, edges]);

  // Paso actual de la simulación
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Modales
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isPythonModalOpen, setIsPythonModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Reiniciar o ajustar simulación
  const handleResetSimulation = useCallback(() => {
    setCurrentStepIndex(0);
  }, []);

  // Manejar cambio de preset
  const handleSelectPreset = (presetKey: string) => {
    setSelectedPreset(presetKey);
    if (presetKey === 'custom') {
      return;
    }
    const graph = getPresetGraph(presetKey, 840, 480);
    setNodes(graph.nodes);
    setEdges(graph.edges);
    setNumNodes(graph.nodes.length);
    setHasMultiSourceSink(presetKey === 'multi-source-sink');
    setCurrentStepIndex(0);
  };

  // Generar grafo aleatorio
  const handleGenerateRandom = useCallback(() => {
    setSelectedPreset('custom');
    const graph = generateRandomFlowNetwork(numNodes, hasMultiSourceSink, 840, 480);
    setNodes(graph.nodes);
    setEdges(graph.edges);
    setCurrentStepIndex(0);
  }, [numNodes, hasMultiSourceSink]);

  // Manejar cambio en número de nodos
  const handleNumNodesChange = (n: number) => {
    setNumNodes(n);
    if (creationMode === 'random') {
      const graph = generateRandomFlowNetwork(n, hasMultiSourceSink, 840, 480);
      setNodes(graph.nodes);
      setEdges(graph.edges);
      setCurrentStepIndex(0);
      setSelectedPreset('custom');
    }
  };

  // Toggle de origen/destino ficticio
  const handleMultiSourceSinkToggle = (enabled: boolean) => {
    setHasMultiSourceSink(enabled);
    if (enabled) {
      const graphWithFict = addFictitiousNodes(nodes, edges, 840, 480);
      setNodes(graphWithFict.nodes);
      setEdges(graphWithFict.edges);
      setCurrentStepIndex(0);
    } else {
      // Revertir a grafo estándar sin ficticios
      const cleanNodes = nodes
        .filter((n) => !n.isFictitious)
        .map((n, idx) => ({
          ...n,
          isSource: idx === 0,
          isSink: idx === nodes.length - 3,
        }));
      const cleanEdges = edges.filter((e) => !e.isFictitious);
      setNodes(cleanNodes);
      setEdges(cleanEdges);
      setCurrentStepIndex(0);
    }
  };

  // Actualizar posición de un nodo tras ser arrastrado en el lienzo
  const handleUpdateNodePos = useCallback((id: string, x: number, y: number) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
  }, []);

  // Agregar arista manual
  const handleAddManualEdge = (source: string, target: string, capacity: number) => {
    const newEdge: GraphEdge = {
      id: `e-manual-${Date.now().toString().slice(-4)}`,
      source,
      target,
      capacity,
      flow: 0,
    };
    setEdges((prev) => [...prev, newEdge]);
    setCurrentStepIndex(0);
  };

  // Eliminar arista manual
  const handleRemoveManualEdge = (edgeId: string) => {
    setEdges((prev) => prev.filter((e) => e.id !== edgeId));
    setCurrentStepIndex(0);
  };

  // Asignar fuente manual
  const handleSetSourceNode = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        isSource: n.id === nodeId,
        isSink: n.id === nodeId ? false : n.isSink,
      }))
    );
    setCurrentStepIndex(0);
  };

  // Asignar sumidero manual
  const handleSetSinkNode = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        isSink: n.id === nodeId,
        isSource: n.id === nodeId ? false : n.isSource,
      }))
    );
    setCurrentStepIndex(0);
  };

  const currentStep = simulationResult.steps[currentStepIndex] || simulationResult.steps[0] || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Barra Superior */}
      <Header
        onOpenPdfModal={() => setIsPdfModalOpen(true)}
        onOpenPythonModal={() => setIsPythonModalOpen(true)}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
        totalFlow={simulationResult.finalFlow}
      />

      {/* Contenedor Principal con Panel Lateral y Área de Simulación */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Panel Lateral de Configuración (Sidebar) */}
        <Sidebar
          numNodes={numNodes}
          creationMode={creationMode}
          hasMultiSourceSink={hasMultiSourceSink}
          selectedPreset={selectedPreset}
          nodes={nodes}
          edges={edges}
          onNumNodesChange={handleNumNodesChange}
          onCreationModeChange={setCreationMode}
          onMultiSourceSinkToggle={handleMultiSourceSinkToggle}
          onGenerateRandom={handleGenerateRandom}
          onSelectPreset={handleSelectPreset}
          onAddManualEdge={handleAddManualEdge}
          onRemoveManualEdge={handleRemoveManualEdge}
          onSetSourceNode={handleSetSourceNode}
          onSetSinkNode={handleSetSinkNode}
        />

        {/* Área Central de Simulación y Visualización */}
        <main className="flex-1 p-4 lg:p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Controles de Simulación (Paso a Paso, Métricas, Título) */}
          <SimulationControls
            currentStep={currentStep}
            currentStepIndex={currentStepIndex}
            totalSteps={simulationResult.steps.length}
            finalFlow={simulationResult.finalFlow}
            onStepChange={setCurrentStepIndex}
            onReset={handleResetSimulation}
            hasFictitiousNodes={hasMultiSourceSink || nodes.some((n) => n.isFictitious)}
          />

          {/* Lienzo Gráfico Interactivo de la Red (PyVis / NetworkX Style) */}
          <GraphCanvas
            nodes={nodes}
            edges={edges}
            currentStep={currentStep}
            minCut={simulationResult.minCut}
            onUpdateNodePos={handleUpdateNodePos}
            width={860}
            height={500}
          />

          {/* Verificación Matemática y Tablas de Análisis Estilo Pandas */}
          <TheoryAndVerification
            nodes={nodes}
            edges={edges}
            result={simulationResult}
          />
        </main>
      </div>

      {/* Modal de Exportación a PDF Detallado */}
      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        nodes={nodes}
        edges={edges}
        result={simulationResult}
      />

      {/* Modal de Exportación a Script de Python (Streamlit + NetworkX + Pandas + PyVis) */}
      <PythonExportModal
        isOpen={isPythonModalOpen}
        onClose={() => setIsPythonModalOpen(false)}
        nodes={nodes}
        edges={edges}
        result={simulationResult}
      />

      {/* Modal de Ayuda Teórica y Objetivos */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
}
