/**
 * Modal Educativo de Fundamentos Teóricos y Objetivos del Proyecto.
 */

import React from 'react';
import { X, BookOpen, CheckCircle, ArrowRight } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Fundamentos Teóricos y Objetivos</h3>
              <p className="text-xs text-slate-400">Algoritmo de Ford-Fulkerson y Teorema de Flujo Máximo - Corte Mínimo</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed">
          {/* Objetivos del Proyecto */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
            <h4 className="font-bold text-blue-400 text-sm">🎯 Objetivos del Proyecto</h4>
            <p className="text-slate-200 font-semibold">
              Objetivo General: Desarrollar una aplicación computacional que permita resolver el problema del flujo máximo y corte mínimo mediante el algoritmo de Ford-Fulkerson, visualizando los resultados y verificando su relación matemática.
            </p>
            <ul className="space-y-1 text-slate-400 pt-1">
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>Comprender los fundamentos teóricos: grafos dirigidos, capacidades, fuente, sumidero y red residual.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>Implementar el algoritmo de Ford-Fulkerson mediante el método de etiquetado estándar.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>Construir y visualizar grafos identificando cuellos de botella y aristas saturadas.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>Determinar el corte mínimo y verificar matemáticamente que su capacidad iguala al flujo máximo obtenido.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>Exportar un reporte técnico detallado en archivo PDF.</span>
              </li>
            </ul>
          </div>

          {/* Definiciones Principales */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">📚 Conceptos Clave</h4>

            <div className="space-y-1">
              <span className="font-bold text-emerald-400">1. Red de Flujo G = (V, E, c, s, t):</span>
              <p className="text-slate-400">
                Grafo dirigido donde cada arista (u, v) tiene una capacidad c(u, v) &ge; 0. Se define una fuente 's' que genera flujo y un sumidero 't' que lo recibe.
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-emerald-400">2. Restricciones Fundamentales:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
                <li><strong className="text-slate-300">Restricción de Capacidad:</strong> 0 &le; f(u, v) &le; c(u, v) para toda arista.</li>
                <li><strong className="text-slate-300">Conservación de Flujo:</strong> Para todo nodo intermedio, la suma de flujos entrantes debe ser exactamente igual a la suma de flujos salientes.</li>
              </ul>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-emerald-400">3. Método de Etiquetado de Ford-Fulkerson:</span>
              <p className="text-slate-400">
                Se etiqueta cada nodo con [predecesor, signo, delta]. Un signo '+' indica que se incrementa el flujo en la arista original; un signo '-' indica que se reduce flujo en una arista que iba en sentido contrario (cancelación de flujo).
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-emerald-400">4. Teorema de Flujo Máximo - Corte Mínimo:</span>
              <p className="text-slate-400">
                En cualquier red, el valor máximo de flujo desde 's' hasta 't' es exactamente igual a la capacidad mínima sobre todos los cortes posibles (S, T) que separan 's' de 't'. Las aristas que cruzan este corte son las restricciones operativas primarias (cuellos de botella).
              </p>
            </div>
          </div>
        </div>

        {/* Pie */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
