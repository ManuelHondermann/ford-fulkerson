/**
 * Modal de Exportación de Código en Python (Streamlit + NetworkX + Pandas + PyVis).
 */

import React, { useState } from 'react';
import {
  GraphNode,
  GraphEdge,
  SimulationResult,
} from '../types/fordFulkerson';
import { generatePythonScript } from '../utils/pythonExporter';
import { Code, Copy, Check, Download, X, Terminal } from 'lucide-react';

interface PythonExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: GraphNode[];
  edges: GraphEdge[];
  result: SimulationResult;
}

export const PythonExportModal: React.FC<PythonExportModalProps> = ({
  isOpen,
  onClose,
  nodes,
  edges,
  result,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const pythonScript = generatePythonScript(nodes, edges, result);

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPy = () => {
    const blob = new Blob([pythonScript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'app_ford_fulkerson.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Código Python Ejecutable (Streamlit + NetworkX)</h3>
              <p className="text-xs text-slate-400">
                Script completo con Pandas, PyVis y Streamlit components listo para ejecutar en local
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Indicaciones de ejecución */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-slate-300">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>
              Ejecutar con: <code className="bg-slate-800 px-2 py-0.5 rounded text-amber-300 font-mono">pip install streamlit networkx pandas pyvis</code> seguido de <code className="bg-slate-800 px-2 py-0.5 rounded text-emerald-300 font-mono">streamlit run app_ford_fulkerson.py</code>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center space-x-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
            </button>
            <button
              onClick={handleDownloadPy}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow transition flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar .py</span>
            </button>
          </div>
        </div>

        {/* Código fuente */}
        <div className="p-4 flex-1 overflow-auto bg-slate-950">
          <pre className="text-xs font-mono text-emerald-400/90 leading-relaxed whitespace-pre selection:bg-blue-600 selection:text-white">
            {pythonScript}
          </pre>
        </div>
      </div>
    </div>
  );
};
