/**
 * Panel Lateral de Configuración del Grafo.
 * Réplica idéntica y enriquecida de los controles de la imagen del usuario:
 * - Número de Nodos (n ∈ [4, 16]) con botones [- / +]
 * - Modo de Creación: Aleatorio vs Manual
 * - Botón "🎲 Generar Grafo Aleatorio"
 * - Presets didácticos
 * - Editor manual de aristas estilo Pandas DataFrame
 * - Manejo de múltiples orígenes y destinos ficticios
 */

import React, { useState } from 'react';
import {
  GraphNode,
  GraphEdge,
} from '../types/fordFulkerson';
import {
  Settings,
  Dices,
  Plus,
  Trash2,
  BookOpen,
  Sliders,
  Check,
  Network,
} from 'lucide-react';

interface SidebarProps {
  numNodes: number;
  creationMode: 'random' | 'manual';
  hasMultiSourceSink: boolean;
  selectedPreset: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNumNodesChange: (n: number) => void;
  onCreationModeChange: (mode: 'random' | 'manual') => void;
  onMultiSourceSinkToggle: (enabled: boolean) => void;
  onGenerateRandom: () => void;
  onSelectPreset: (presetKey: string) => void;
  onAddManualEdge: (source: string, target: string, capacity: number) => void;
  onRemoveManualEdge: (edgeId: string) => void;
  onSetSourceNode: (nodeId: string) => void;
  onSetSinkNode: (nodeId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  numNodes,
  creationMode,
  hasMultiSourceSink,
  selectedPreset,
  nodes,
  edges,
  onNumNodesChange,
  onCreationModeChange,
  onMultiSourceSinkToggle,
  onGenerateRandom,
  onSelectPreset,
  onAddManualEdge,
  onRemoveManualEdge,
  onSetSourceNode,
  onSetSinkNode,
}) => {
  // Estado local para agregar nueva arista manual
  const [newEdgeSource, setNewEdgeSource] = useState<string>(nodes[0]?.id || '');
  const [newEdgeTarget, setNewEdgeTarget] = useState<string>(nodes[nodes.length - 1]?.id || '');
  const [newEdgeCap, setNewEdgeCap] = useState<number>(15);

  const sourceNode = nodes.find((n) => n.isSource) || nodes[0];
  const sinkNode = nodes.find((n) => n.isSink) || nodes[nodes.length - 1];

  const handleAddEdge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEdgeSource || !newEdgeTarget || newEdgeSource === newEdgeTarget) return;
    onAddManualEdge(newEdgeSource, newEdgeTarget, Number(newEdgeCap));
  };

  return (
    <aside className="w-full lg:w-80 shrink-0 bg-slate-900 border-r border-slate-800 p-5 space-y-6 flex flex-col justify-between overflow-y-auto max-h-[calc(100vh-60px)]">
      <div className="space-y-6">
        {/* Encabezado: Configuración del Grafo */}
        <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800">
          <Settings className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-bold text-white tracking-tight">Configuración del Grafo</h2>
        </div>

        {/* Presets Rápidos Didácticos */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Casos de Estudio / Presets:</span>
          </label>
          <select
            value={selectedPreset}
            onChange={(e) => onSelectPreset(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition"
          >
            <option value="catedra-9">Caso Cátedra (9 Nodos - Vista Captura)</option>
            <option value="investigacion-operativa-7">Investigación de Operaciones (7 Nodos)</option>
            <option value="multi-source-sink">Múltiples Fuentes y Sumideros (S* y T*)</option>
            <option value="residual-backward-6">Red con Flujo en Retroceso / Cancelación (6 Nodos)</option>
            <option value="custom">Personalizado / Aleatorio</option>
          </select>
        </div>

        {/* Número de Nodos (n ∈ [4, 16]) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Número de Nodos (n ∈ [4, 16]):</span>
            <span className="font-mono text-blue-400 font-bold">{numNodes}</span>
          </label>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => onNumNodesChange(Math.max(4, numNodes - 1))}
              disabled={numNodes <= 4}
              className="w-10 h-9 flex items-center justify-center bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-slate-200 font-bold text-base border border-slate-700 transition"
            >
              -
            </button>
            <div className="flex-1 text-center py-1.5 bg-slate-950 border border-slate-800 rounded-lg font-mono font-bold text-white text-sm">
              {numNodes}
            </div>
            <button
              type="button"
              onClick={() => onNumNodesChange(Math.min(16, numNodes + 1))}
              disabled={numNodes >= 16}
              className="w-10 h-9 flex items-center justify-center bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-slate-200 font-bold text-base border border-slate-700 transition"
            >
              +
            </button>
          </div>
        </div>

        {/* Modo de Creación: Aleatorio vs Manual */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-300 block">Modo de Creación:</span>
          <div className="space-y-2">
            <label className="flex items-center space-x-3 p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700 transition">
              <input
                type="radio"
                name="creationMode"
                value="random"
                checked={creationMode === 'random'}
                onChange={() => onCreationModeChange('random')}
                className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-700 focus:ring-0"
              />
              <span className="text-xs font-medium text-slate-200">Aleatorio (DAG Conexo)</span>
            </label>

            <label className="flex items-center space-x-3 p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700 transition">
              <input
                type="radio"
                name="creationMode"
                value="manual"
                checked={creationMode === 'manual'}
                onChange={() => onCreationModeChange('manual')}
                className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-700 focus:ring-0"
              />
              <span className="text-xs font-medium text-slate-200">Manual (Editor de Aristas)</span>
            </label>
          </div>
        </div>

        {/* Toggle para Múltiples Fuentes / Sumideros */}
        <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-lg space-y-2">
          <label className="flex items-start space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasMultiSourceSink}
              onChange={(e) => onMultiSourceSinkToggle(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-blue-600 rounded bg-slate-900 border-slate-700 focus:ring-0"
            />
            <span className="text-xs text-slate-300 leading-tight">
              Origen Ficticio (S*) y Destino Ficticio (T*) con aristas ∞
            </span>
          </label>
        </div>

        {/* Botón Generar Grafo Aleatorio */}
        {creationMode === 'random' && (
          <button
            type="button"
            onClick={onGenerateRandom}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold rounded-lg shadow transition cursor-pointer active:scale-98"
          >
            <Dices className="w-4 h-4 text-amber-400" />
            <span>🎲 Generar Grafo Aleatorio</span>
          </button>
        )}

        {/* EDITOR MANUAL DE GRAFO (Modo Manual) */}
        {creationMode === 'manual' && (
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Definición de Fuente y Sumidero:</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[11px] text-emerald-400 font-semibold block mb-1">Fuente (S):</label>
                <select
                  value={sourceNode?.id || ''}
                  onChange={(e) => onSetSourceNode(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 text-xs"
                >
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-rose-400 font-semibold block mb-1">Sumidero (T):</label>
                <select
                  value={sinkNode?.id || ''}
                  onChange={(e) => onSetSinkNode(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 text-xs"
                >
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Formulario Añadir Arista */}
            <form onSubmit={handleAddEdge} className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2.5">
              <span className="text-[11px] font-bold text-slate-300 block">➕ Agregar Arista Dirigida:</span>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block">De:</label>
                  <select
                    value={newEdgeSource}
                    onChange={(e) => setNewEdgeSource(e.target.value)}
                    className="w-full px-1.5 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs"
                  >
                    {nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block">A:</label>
                  <select
                    value={newEdgeTarget}
                    onChange={(e) => setNewEdgeTarget(e.target.value)}
                    className="w-full px-1.5 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs"
                  >
                    {nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block">Cap:</label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={newEdgeCap}
                    onChange={(e) => setNewEdgeCap(Math.max(1, Number(e.target.value)))}
                    className="w-full px-1.5 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded transition flex items-center justify-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir a la Red</span>
              </button>
            </form>

            {/* Lista de Aristas Actuales */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px] text-slate-400 px-1 font-semibold">
                <span>Aristas ({edges.length})</span>
                <span>Capacidad</span>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                {edges.map((e) => {
                  const s = nodes.find((n) => n.id === e.source)?.label || e.source;
                  const t = nodes.find((n) => n.id === e.target)?.label || e.target;
                  return (
                    <div
                      key={e.id}
                      className="flex items-center justify-between px-2.5 py-1.5 bg-slate-950/70 border border-slate-800 rounded text-xs"
                    >
                      <span className="font-mono text-slate-300">
                        {s} → {t}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-blue-400 font-bold">
                          {e.capacity === 999999 ? '∞' : e.capacity}
                        </span>
                        {!e.isFictitious && (
                          <button
                            type="button"
                            onClick={() => onRemoveManualEdge(e.id)}
                            className="text-slate-500 hover:text-rose-400 transition"
                            title="Eliminar arista"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pie del Sidebar: Estado de la Red */}
      <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
        <div className="flex justify-between">
          <span>Total Nodos:</span>
          <span className="font-mono text-slate-200">{nodes.length}</span>
        </div>
        <div className="flex justify-between">
          <span>Total Aristas:</span>
          <span className="font-mono text-slate-200">{edges.length}</span>
        </div>
        <div className="flex justify-between">
          <span>Origen (Fuente):</span>
          <span className="text-emerald-400 font-semibold">{sourceNode?.label}</span>
        </div>
        <div className="flex justify-between">
          <span>Destino (Sumidero):</span>
          <span className="text-rose-400 font-semibold">{sinkNode?.label}</span>
        </div>
      </div>
    </aside>
  );
};
