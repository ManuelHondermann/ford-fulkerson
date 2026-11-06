/**
 * Componente de Verificación Matemática y Tablas de Análisis.
 * Demuestra formalmente el Teorema de Flujo Máximo - Corte Mínimo,
 * la Ley de Conservación de Flujo y presenta las tablas estilo Pandas.
 */

import React, { useState } from 'react';
import {
  GraphNode,
  GraphEdge,
  SimulationResult,
} from '../types/fordFulkerson';
import {
  CheckCircle,
  AlertCircle,
  Table as TableIcon,
  Activity,
  Layers,
  HelpCircle,
  Search,
} from 'lucide-react';

interface TheoryAndVerificationProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  result: SimulationResult;
}

export const TheoryAndVerification: React.FC<TheoryAndVerificationProps> = ({
  nodes,
  edges,
  result,
}) => {
  const [activeTab, setActiveTab] = useState<'iterations' | 'edges' | 'conservation' | 'theory'>('iterations');
  const [edgeFilter, setEdgeFilter] = useState('');

  const sourceNode = nodes.find((n) => n.isSource) || nodes[0];
  const sinkNode = nodes.find((n) => n.isSink) || nodes[nodes.length - 1];

  const filteredEdges = edges.filter((e) => {
    const s = nodes.find((n) => n.id === e.source)?.label || e.source;
    const t = nodes.find((n) => n.id === e.target)?.label || e.target;
    const str = `${e.id} ${s} ${t}`.toLowerCase();
    return str.includes(edgeFilter.toLowerCase());
  });

  const lastStepFlows = result.steps[result.steps.length - 1]?.flows || {};

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-6">
      {/* TARJETA DE VERIFICACIÓN DEL TEOREMA MAX-FLOW MIN-CUT */}
      <div className="p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30">
              <Activity className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Teorema Fundamental de Flujo Máximo y Corte Mínimo (Ford-Fulkerson, 1956)
              </h3>
              <p className="text-xs text-slate-400">
                El valor del flujo máximo que puede circular desde la fuente hasta el sumidero es idéntico a la capacidad del corte mínimo.
              </p>
            </div>
          </div>

          <div
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 ${
              result.isTheoremVerified
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}
          >
            {result.isTheoremVerified ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>TEOREMA VERIFICADO</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>DISCREPANCIA</span>
              </>
            )}
          </div>
        </div>

        {/* Ecuación y Demostración Numérica */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
            <span className="text-slate-400 font-medium block mb-1">Flujo Máximo |f|</span>
            <div className="text-xl font-bold font-mono text-emerald-400">
              {result.finalFlow} <span className="text-xs font-normal text-slate-400">unidades</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Enviado desde fuente ({sourceNode.label})
            </span>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
            <span className="text-slate-400 font-medium block mb-1">Capacidad Corte c(S, T)</span>
            <div className="text-xl font-bold font-mono text-indigo-400">
              {result.minCut.cutCapacity} <span className="text-xs font-normal text-slate-400">unidades</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Suma de capacidades que cruzan de S a T
            </span>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
            <span className="text-slate-400 font-medium block mb-1">Cuellos de Botella (Corte)</span>
            <div className="text-xl font-bold font-mono text-rose-400">
              {result.minCut.cutEdges.length} <span className="text-xs font-normal text-slate-400">aristas</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Todas saturadas al 100% de capacidad
            </span>
          </div>
        </div>

        {/* Explicación de la Partición S / T */}
        <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-lg text-xs space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-emerald-400 font-bold">Conjunto S (Nodos alcanzables):</span>
            <span className="font-mono text-slate-200">
              {'{ '}
              {result.minCut.S.map((id) => nodes.find((n) => n.id === id)?.label || id).join(', ')}
              {' }'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-rose-400 font-bold">Conjunto T (Nodos no alcanzables):</span>
            <span className="font-mono text-slate-200">
              {'{ '}
              {result.minCut.T.map((id) => nodes.find((n) => n.id === id)?.label || id).join(', ')}
              {' }'}
            </span>
          </div>
        </div>
      </div>

      {/* PESTAÑAS DE TABLAS DE ANÁLISIS */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('iterations')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'iterations'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Caminos Aumentantes ({result.iterations.length})
            </button>
            <button
              onClick={() => setActiveTab('edges')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'edges'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Tabla de Aristas ({edges.length})
            </button>
            <button
              onClick={() => setActiveTab('conservation')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'conservation'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Conservación de Flujo ({nodes.length})
            </button>
            <button
              onClick={() => setActiveTab('theory')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'theory'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Método de Etiquetado (Teoría)
            </button>
          </div>
        </div>

        {/* TAB 1: ITERACIONES Y CAMINOS AUMENTANTES */}
        {activeTab === 'iterations' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Secuencia ordenada de caminos aumentantes descubiertos por el algoritmo de Ford-Fulkerson y aumento acumulado de flujo:
            </p>
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-3 py-2.5">Iteración</th>
                    <th className="px-3 py-2.5">Camino Aumentante</th>
                    <th className="px-3 py-2.5 text-center">Cuello de Botella (Δ)</th>
                    <th className="px-3 py-2.5 text-right">Flujo Antes</th>
                    <th className="px-3 py-2.5 text-right">Flujo Después</th>
                    <th className="px-3 py-2.5 text-center">Incremento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {result.iterations.length > 0 ? (
                    result.iterations.map((it) => (
                      <tr key={it.iteration} className="hover:bg-slate-800/40 transition">
                        <td className="px-3 py-2 font-bold text-slate-300">Iteración {it.iteration}</td>
                        <td className="px-3 py-2 text-indigo-300 font-medium font-sans">{it.pathStr}</td>
                        <td className="px-3 py-2 text-center text-amber-400 font-bold">Δ = {it.bottleneck}</td>
                        <td className="px-3 py-2 text-right text-slate-400">{it.flowBefore}</td>
                        <td className="px-3 py-2 text-right text-emerald-400 font-bold">{it.flowAfter}</td>
                        <td className="px-3 py-2 text-center text-emerald-300">+{it.bottleneck}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-slate-400 font-sans">
                        No se detectaron caminos aumentantes en la red inicial.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: TABLA DE ARISTAS ESTILO PANDAS */}
        {activeTab === 'edges' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-400">
                Estructura de aristas, capacidades, flujo final y clasificación de cuellos de botella:
              </p>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="Filtrar nodo o arista..."
                  value={edgeFilter}
                  onChange={(e) => setEdgeFilter(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 w-48"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-800 max-h-72 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Tramo (u → v)</th>
                    <th className="px-3 py-2 text-right">Capacidad (c)</th>
                    <th className="px-3 py-2 text-right">Flujo (f)</th>
                    <th className="px-3 py-2 text-right">Residual (c - f)</th>
                    <th className="px-3 py-2 text-center">Uso (%)</th>
                    <th className="px-3 py-2 text-center">¿Saturada?</th>
                    <th className="px-3 py-2 text-center">Corte Mínimo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredEdges.map((e) => {
                    const u = nodes.find((n) => n.id === e.source)?.label || e.source;
                    const v = nodes.find((n) => n.id === e.target)?.label || e.target;
                    const flow = lastStepFlows[e.id] ?? 0;
                    const cap = e.capacity;
                    const residual = cap === 999999 ? '∞' : cap - flow;
                    const percent = cap === 999999 ? 100 : Math.round((flow / cap) * 100);
                    const isSaturated = cap !== 999999 && flow >= cap;
                    const isInCut = result.minCut.cutEdges.includes(e.id);

                    return (
                      <tr key={e.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-3 py-2 text-slate-500 font-sans">{e.id}</td>
                        <td className="px-3 py-2 font-medium text-slate-200">
                          {u} → {v}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-400">
                          {cap === 999999 ? '∞' : cap}
                        </td>
                        <td className="px-3 py-2 text-right text-blue-400 font-bold">{flow}</td>
                        <td className="px-3 py-2 text-right text-slate-300">{residual}</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`text-[11px] font-bold ${percent === 100 ? 'text-rose-400' : 'text-slate-400'}`}>
                            {percent}%
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          {isSaturated ? (
                            <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded text-[10px] font-bold">
                              SÍ (100%)
                            </span>
                          ) : (
                            <span className="text-slate-500">NO</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {isInCut ? (
                            <span className="px-2 py-0.5 bg-rose-600/30 text-rose-200 border border-rose-500/50 rounded text-[10px] font-bold">
                              ★ CRÍTICA
                            </span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CONSERVACIÓN DE FLUJO */}
        {activeTab === 'conservation' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Verificación de la Ley de Kirchhoff (Flujo Entrante = Flujo Saliente para todo nodo intermedio v):
            </p>
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-3 py-2.5">Nodo</th>
                    <th className="px-3 py-2.5">Rol</th>
                    <th className="px-3 py-2.5 text-right">Flujo Entrante (Σ in)</th>
                    <th className="px-3 py-2.5 text-right">Flujo Saliente (Σ out)</th>
                    <th className="px-3 py-2.5 text-right">Diferencia (In - Out)</th>
                    <th className="px-3 py-2.5 text-center">Estado de Conservación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {result.nodeBalances.map((nb) => {
                    const node = nodes.find((n) => n.id === nb.nodeId);
                    let role = 'Nodo Intermedio';
                    let roleColor = 'text-slate-400';
                    if (node?.isSource) {
                      role = 'Fuente (S)';
                      roleColor = 'text-emerald-400 font-bold';
                    } else if (node?.isSink) {
                      role = 'Sumidero (T)';
                      roleColor = 'text-rose-400 font-bold';
                    } else if (node?.isFictitious) {
                      role = 'Nodo Ficticio';
                      roleColor = 'text-purple-400';
                    }

                    return (
                      <tr key={nb.nodeId} className="hover:bg-slate-800/40 transition">
                        <td className="px-3 py-2 font-bold text-slate-200 font-sans">{node?.label || nb.nodeId}</td>
                        <td className={`px-3 py-2 font-sans text-xs ${roleColor}`}>{role}</td>
                        <td className="px-3 py-2 text-right text-slate-300">{nb.inFlow}</td>
                        <td className="px-3 py-2 text-right text-slate-300">{nb.outFlow}</td>
                        <td className="px-3 py-2 text-right font-bold text-slate-400">{nb.balance}</td>
                        <td className="px-3 py-2 text-center font-sans">
                          {nb.isValid ? (
                            <span className="inline-flex items-center space-x-1 text-emerald-400 font-semibold">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>CUMPLE</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-rose-400 font-semibold">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>ERROR</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: TEORÍA Y MÉTODO DE ETIQUETADO */}
        {activeTab === 'theory' && (
          <div className="space-y-4 p-4 bg-slate-950/60 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <h4 className="font-bold text-white text-sm">
              Fundamento del Método de Etiquetado de Ford y Fulkerson
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="font-bold text-blue-400 block">1. Formato de la Etiqueta:</span>
                <p>
                  Cada nodo etiquetado recibe una terna:{' '}
                  <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300 font-mono">[pred(v), ±, Δ(v)]</code>
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
                  <li>
                    <strong className="text-slate-300">pred(v):</strong> Nodo predecesor desde el cual se transmitió el flujo.
                  </li>
                  <li>
                    <strong className="text-slate-300">+ (Hacia adelante):</strong> Arista original (u, v) con capacidad residual disponible: <code className="text-slate-200">c(u, v) - f(u, v) &gt; 0</code>.
                  </li>
                  <li>
                    <strong className="text-slate-300">- (Hacia atrás):</strong> Arista opuesta (v, u) con flujo positivo cancelable: <code className="text-slate-200">f(v, u) &gt; 0</code>.
                  </li>
                  <li>
                    <strong className="text-slate-300">Δ(v):</strong> Flujo máximo aumentante que puede alcanzar el nodo v desde la fuente.
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-emerald-400 block">2. Criterio de Terminación y Corte Mínimo:</span>
                <p>
                  Cuando ningún nodo no etiquetado puede ser alcanzado y el sumidero <code className="text-slate-200">T</code> permanece sin etiqueta, el algoritmo concluye.
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
                  <li>
                    <strong className="text-slate-300">Conjunto S:</strong> Todos los nodos que poseen etiqueta (alcanzables en la red residual desde la fuente).
                  </li>
                  <li>
                    <strong className="text-slate-300">Conjunto T:</strong> Todos los nodos que permanecen sin etiqueta (<code className="text-slate-200">V \ S</code>).
                  </li>
                  <li>
                    <strong className="text-slate-300">Corte Mínimo:</strong> Conjunto de aristas dirigidas <code className="text-slate-200">(u, v)</code> con <code className="text-slate-200">u ∈ S</code> y <code className="text-slate-200">v ∈ T</code>.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
