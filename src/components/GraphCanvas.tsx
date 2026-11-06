/**
 * Componente de lienzo interactivo para la Red de Flujo, Red Residual y Corte Mínimo.
 * Soporta arrastre de nodos, zoom, selección, vista residual y resaltado de caminos aumentantes.
 */

import React, { useState, useRef, useMemo } from 'react';
import {
  GraphNode,
  GraphEdge,
  SimulationStep,
  MinCutResult,
} from '../types/fordFulkerson';
import { ZoomIn, ZoomOut, RotateCcw, Eye, Layers, Scissors, Info } from 'lucide-react';

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  currentStep: SimulationStep | null;
  minCut: MinCutResult | null;
  onUpdateNodePos: (id: string, x: number, y: number) => void;
  width?: number;
  height?: number;
}

export type ViewMode = 'flow' | 'residual' | 'mincut';

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  nodes,
  edges,
  currentStep,
  minCut,
  onUpdateNodePos,
  width = 860,
  height = 500,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('flow');
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Mapeo rápido de nodos por ID
  const nodeMap = useMemo(() => {
    const map = new Map<string, GraphNode>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  // Aristas en el camino aumentante actual
  const currentPathEdges = useMemo(() => {
    return new Set(currentStep?.augmentingPath?.pathEdgeIds || []);
  }, [currentStep]);

  // Nodos en el camino aumentante actual
  const currentPathNodes = useMemo(() => {
    return new Set(currentStep?.augmentingPath?.pathNodes || []);
  }, [currentStep]);

  // Aristas del corte mínimo
  const cutEdgeSet = useMemo(() => {
    return new Set(minCut?.cutEdges || []);
  }, [minCut]);

  // Partición S y T
  const sSet = useMemo(() => new Set(minCut?.S || []), [minCut]);
  const tSet = useMemo(() => new Set(minCut?.T || []), [minCut]);

  // Manejo de arrastre de nodo y paneo de canvas
  const handleMouseDown = (e: React.MouseEvent, nodeId?: string) => {
    if (nodeId) {
      e.stopPropagation();
      setDraggingNodeId(nodeId);
      setSelectedNodeId(nodeId);
    } else {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const rawX = (e.clientX - rect.left - pan.x) / zoom;
      const rawY = (e.clientY - rect.top - pan.y) / zoom;
      const clampedX = Math.max(30, Math.min(width - 30, rawX));
      const clampedY = Math.max(30, Math.min(height - 30, rawY));
      onUpdateNodePos(draggingNodeId, clampedX, clampedY);
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
    setIsPanning(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Cálculo de curvatura para aristas antiparalelas (u -> v y v -> u)
  const getEdgePath = (source: GraphNode, target: GraphNode, hasReverse: boolean) => {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const dist = Math.hypot(dx, dy);
    if (dist === 0) return '';

    // Offset para el radio del nodo (r = 24)
    const r = 24;
    const startX = source.x + (dx / dist) * r;
    const startY = source.y + (dy / dist) * r;
    const endX = target.x - (dx / dist) * (r + 4);
    const endY = target.y - (dy / dist) * (r + 4);

    if (hasReverse) {
      // Curvar ligeramente hacia la derecha
      const normX = -dy / dist;
      const normY = dx / dist;
      const curve = 28;
      const midX = (startX + endX) / 2 + normX * curve;
      const midY = (startY + endY) / 2 + normY * curve;
      return {
        d: `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`,
        midX,
        midY,
      };
    }

    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    return {
      d: `M ${startX} ${startY} L ${endX} ${endY}`,
      midX,
      midY,
    };
  };

  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg select-none">
      {/* Barra de herramientas superior del lienzo */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-sm z-10">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Vista del Grafo:</span>
          <button
            onClick={() => setViewMode('flow')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
              viewMode === 'flow'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Red de Flujo</span>
          </button>

          <button
            onClick={() => setViewMode('residual')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
              viewMode === 'residual'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Red Residual (G<sub>f</sub>)</span>
          </button>

          <button
            onClick={() => setViewMode('mincut')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
              viewMode === 'mincut'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Corte Mínimo (S, T)</span>
          </button>
        </div>

        {/* Controles de Zoom */}
        <div className="flex items-center space-x-1 bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.15, 2.2))}
            title="Acercar (+)"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-slate-400 px-1.5">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.15, 0.4))}
            title="Alejar (-)"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetView}
            title="Centrar y Reiniciar Vista"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas interactivo */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-[500px] cursor-grab active:cursor-grabbing bg-slate-950"
        onMouseDown={(e) => handleMouseDown(e)}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <defs>
          {/* Patrón de cuadrícula de fondo */}
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="0.7" />
          </pattern>

          {/* Flechas para aristas dirigidas */}
          <marker id="arrow-default" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#64748b" />
          </marker>
          <marker id="arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#38bdf8" />
          </marker>
          <marker id="arrow-path" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#fbbf24" />
          </marker>
          <marker id="arrow-saturated" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#f43f5e" />
          </marker>
          <marker id="arrow-cut" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#f43f5e" />
          </marker>
          <marker id="arrow-residual-fwd" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#10b981" />
          </marker>
          <marker id="arrow-residual-back" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#a855f7" />
          </marker>

          {/* Filtro de resplandor (glow) */}
          <filter id="glow-path" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid)" />

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Zona del Corte Mínimo (Sombreado para Conjunto S y Conjunto T) */}
          {viewMode === 'mincut' && (
            <g className="min-cut-background-regions">
              {/* Región S (alrededor de los nodos en S) */}
              {Array.from(sSet).map((sId) => {
                const node = nodeMap.get(sId);
                if (!node) return null;
                return (
                  <circle
                    key={`bg-s-${sId}`}
                    cx={node.x}
                    cy={node.y}
                    r="54"
                    fill="#10b981"
                    fillOpacity="0.08"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Región T (alrededor de los nodos en T) */}
              {Array.from(tSet).map((tId) => {
                const node = nodeMap.get(tId);
                if (!node) return null;
                return (
                  <circle
                    key={`bg-t-${tId}`}
                    cx={node.x}
                    cy={node.y}
                    r="54"
                    fill="#f43f5e"
                    fillOpacity="0.08"
                    stroke="#f43f5e"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                );
              })}
            </g>
          )}

          {/* ARISTAS (Modo Flujo y Modo Corte Mínimo) */}
          {viewMode !== 'residual' && (
            <g className="edges-layer">
              {edges.map((edge) => {
                const source = nodeMap.get(edge.source);
                const target = nodeMap.get(edge.target);
                if (!source || !target) return null;

                const hasReverse = edges.some((e) => e.source === edge.target && e.target === edge.source);
                const pathData = getEdgePath(source, target, hasReverse);
                if (!pathData) return null;

                const flow = currentStep?.flows[edge.id] ?? edge.flow ?? 0;
                const capacity = edge.capacity;
                const isSaturated = capacity !== 999999 && flow >= capacity;
                const isInAugPath = currentPathEdges.has(edge.id);
                const isInMinCut = cutEdgeSet.has(edge.id);

                // Estilo de arista
                let strokeColor = '#475569'; // gris neutro
                let strokeWidth = 2;
                let marker = 'url(#arrow-default)';

                if (isInAugPath) {
                  strokeColor = '#fbbf24'; // Dorado brillante para camino aumentante
                  strokeWidth = 4;
                  marker = 'url(#arrow-path)';
                } else if (viewMode === 'mincut' && isInMinCut) {
                  strokeColor = '#f43f5e'; // Rosa/rojo para aristas de corte
                  strokeWidth = 3.5;
                  marker = 'url(#arrow-cut)';
                } else if (isSaturated) {
                  strokeColor = '#f43f5e'; // Rojo saturado
                  strokeWidth = 2.8;
                  marker = 'url(#arrow-saturated)';
                } else if (flow > 0) {
                  strokeColor = '#38bdf8'; // Celeste con flujo activo
                  strokeWidth = 2.4;
                  marker = 'url(#arrow-active)';
                }

                return (
                  <g key={edge.id} className="transition-all duration-300">
                    {/* Arista base */}
                    <path
                      d={pathData.d}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={isInAugPath ? '6 3' : edge.isFictitious ? '4 3' : undefined}
                      markerEnd={marker}
                      filter={isInAugPath ? 'url(#glow-path)' : undefined}
                      className={isInAugPath ? 'animate-pulse' : ''}
                    />

                    {/* Resaltado de corte mínimo */}
                    {viewMode === 'mincut' && isInMinCut && (
                      <path
                        d={pathData.d}
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth={7}
                        strokeOpacity="0.25"
                      />
                    )}

                    {/* Etiqueta de Flujo / Capacidad */}
                    <g transform={`translate(${pathData.midX}, ${pathData.midY})`}>
                      <rect
                        x="-26"
                        y="-11"
                        width="52"
                        height="20"
                        rx="4"
                        fill="#090d16"
                        stroke={isInAugPath ? '#fbbf24' : isSaturated ? '#f43f5e' : isInMinCut ? '#f43f5e' : '#334155'}
                        strokeWidth="1.2"
                      />
                      <text
                        x="0"
                        y="3.5"
                        textAnchor="middle"
                        className="text-[10px] font-mono font-semibold"
                        fill={isSaturated ? '#fb7185' : isInAugPath ? '#fef08a' : '#cbd5e1'}
                      >
                        {capacity === 999999 ? `${flow}/∞` : `${flow}/${capacity}`}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          )}

          {/* ARISTAS EN MODO RESIDUAL (G_f) */}
          {viewMode === 'residual' && (
            <g className="residual-edges-layer">
              {edges.map((edge) => {
                const source = nodeMap.get(edge.source);
                const target = nodeMap.get(edge.target);
                if (!source || !target) return null;

                const flow = currentStep?.flows[edge.id] ?? edge.flow ?? 0;
                const capacity = edge.capacity;
                const residualForward = capacity === 999999 ? 999999 : capacity - flow;
                const residualBackward = flow;

                const hasReverse = edges.some((e) => e.source === edge.target && e.target === edge.source);

                return (
                  <React.Fragment key={`res-${edge.id}`}>
                    {/* Arista residual hacia adelante (u -> v) si c - f > 0 */}
                    {residualForward > 0 && (() => {
                      const fwdPath = getEdgePath(source, target, true);
                      if (!fwdPath) return null;
                      return (
                        <g key={`fwd-${edge.id}`}>
                          <path
                            d={fwdPath.d}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth={2.4}
                            markerEnd="url(#arrow-residual-fwd)"
                          />
                          <g transform={`translate(${fwdPath.midX}, ${fwdPath.midY})`}>
                            <rect x="-22" y="-10" width="44" height="18" rx="3" fill="#064e3b" stroke="#10b981" strokeWidth="1" />
                            <text x="0" y="3" textAnchor="middle" className="text-[10px] font-mono font-bold" fill="#6ee7b7">
                              +{residualForward === 999999 ? '∞' : residualForward}
                            </text>
                          </g>
                        </g>
                      );
                    })()}

                    {/* Arista residual hacia atrás (v -> u) si f > 0 */}
                    {residualBackward > 0 && (() => {
                      const backPath = getEdgePath(target, source, true);
                      if (!backPath) return null;
                      return (
                        <g key={`back-${edge.id}`}>
                          <path
                            d={backPath.d}
                            fill="none"
                            stroke="#c084fc"
                            strokeWidth={2.2}
                            strokeDasharray="4 3"
                            markerEnd="url(#arrow-residual-back)"
                          />
                          <g transform={`translate(${backPath.midX}, ${backPath.midY})`}>
                            <rect x="-20" y="-10" width="40" height="18" rx="3" fill="#3b0764" stroke="#c084fc" strokeWidth="1" />
                            <text x="0" y="3" textAnchor="middle" className="text-[10px] font-mono font-bold" fill="#e9d5ff">
                              -{residualBackward}
                            </text>
                          </g>
                        </g>
                      );
                    })()}
                  </React.Fragment>
                );
              })}
            </g>
          )}

          {/* NODOS */}
          <g className="nodes-layer">
            {nodes.map((node) => {
              const isSource = node.isSource;
              const isSink = node.isSink;
              const isFictitious = node.isFictitious;
              const isInPath = currentPathNodes.has(node.id);
              const isSelected = selectedNodeId === node.id;
              const inCutS = sSet.has(node.id);
              const inCutT = tSet.has(node.id);

              const labelData = currentStep?.labels ? currentStep.labels[node.id] : null;
              const isLabeled = labelData !== null && labelData !== undefined;

              // Color del nodo según rol
              let nodeColor = '#1e293b'; // slate oscuro
              let strokeColor = '#475569';
              let badgeText = '';

              if (isSource) {
                nodeColor = '#15803d'; // Verde esmeralda intenso
                strokeColor = '#22c55e';
                badgeText = 'FUENTE (S)';
              } else if (isSink) {
                nodeColor = '#b91c1c'; // Rojo carmesí intenso
                strokeColor = '#ef4444';
                badgeText = 'SUMIDERO (T)';
              } else if (isFictitious) {
                nodeColor = '#6b21a8'; // Púrpura ficticio
                strokeColor = '#c084fc';
                badgeText = 'FICTICIO';
              } else if (viewMode === 'mincut') {
                if (inCutS) {
                  nodeColor = '#065f46';
                  strokeColor = '#34d399';
                } else if (inCutT) {
                  nodeColor = '#7f1d1d';
                  strokeColor = '#f87171';
                }
              } else if (isInPath) {
                nodeColor = '#854d0e'; // Ámbar camino
                strokeColor = '#fbbf24';
              } else if (isLabeled) {
                nodeColor = '#1e3a8a'; // Azul etiquetado
                strokeColor = '#60a5fa';
              }

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseDown={(e) => handleMouseDown(e, node.id)}
                  className="cursor-move group"
                >
                  {/* Resplandor si está en el camino aumentante */}
                  {isInPath && (
                    <circle r="30" fill="none" stroke="#fbbf24" strokeWidth="2.5" opacity="0.6" className="animate-ping" />
                  )}

                  {/* Aro exterior de selección o pertenencia */}
                  <circle
                    r="24"
                    fill={nodeColor}
                    stroke={isSelected ? '#38bdf8' : strokeColor}
                    strokeWidth={isSelected ? 3.5 : 2.5}
                    strokeDasharray={isFictitious ? '4 3' : undefined}
                    className="transition-colors duration-200 shadow-md"
                  />

                  {/* Identificador / Nombre del Nodo */}
                  <text
                    x="0"
                    y="5"
                    textAnchor="middle"
                    className="text-sm font-bold font-sans pointer-events-none"
                    fill="#f8fafc"
                  >
                    {node.label}
                  </text>

                  {/* Badge de Fuente / Sumidero arriba del nodo */}
                  {(isSource || isSink || isFictitious) && (
                    <g transform="translate(0, -32)">
                      <rect
                        x="-36"
                        y="-10"
                        width="72"
                        height="18"
                        rx="4"
                        fill="#090d16"
                        stroke={strokeColor}
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="2.5"
                        textAnchor="middle"
                        className="text-[9px] font-bold tracking-tight"
                        fill={isSource ? '#86efac' : isSink ? '#fca5a5' : '#e9d5ff'}
                      >
                        {badgeText}
                      </text>
                    </g>
                  )}

                  {/* ETIQUETA DE FORD-FULKERSON [predecesor, +/-, delta] debajo del nodo */}
                  {isLabeled && (
                    <g transform="translate(0, 34)">
                      <rect
                        x="-38"
                        y="-9"
                        width="76"
                        height="18"
                        rx="4"
                        fill="#020617"
                        stroke="#60a5fa"
                        strokeWidth="1.2"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        className="text-[10px] font-mono font-bold"
                        fill="#93c5fd"
                      >
                        {labelData.predecessor === null
                          ? '(-, ∞)'
                          : `[${nodeMap.get(labelData.predecessor)?.label || labelData.predecessor}, ${labelData.direction}, ${labelData.delta === Infinity ? '∞' : labelData.delta}]`}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {/* Leyenda interactiva en la parte inferior */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-950/90 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 border border-emerald-400"></span>
            <span>Fuente (S)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-600 border border-rose-400"></span>
            <span>Sumidero (T)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-4 h-1 bg-amber-400 rounded"></span>
            <span>Camino Aumentante</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-4 h-1 bg-rose-500 rounded"></span>
            <span>Arista Saturada / Corte</span>
          </div>
          {viewMode === 'residual' && (
            <>
              <div className="flex items-center space-x-1.5">
                <span className="w-4 h-1 bg-emerald-500 rounded"></span>
                <span>Hacia adelante (+Δ)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-4 h-1 bg-purple-400 border-dashed rounded"></span>
                <span>Hacia atrás (-Δ)</span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center space-x-1 text-slate-500">
          <Info className="w-3.5 h-3.5" />
          <span>Arrastra los nodos para reorganizar el diseño visual.</span>
        </div>
      </div>
    </div>
  );
};
