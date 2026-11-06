/**
 * Barra Superior de Navegación y Acciones Globales.
 */

import React from 'react';
import { Network, FileText, Code, BookOpen, Share2 } from 'lucide-react';

interface HeaderProps {
  onOpenPdfModal: () => void;
  onOpenPythonModal: () => void;
  onOpenHelpModal: () => void;
  totalFlow: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPdfModal,
  onOpenPythonModal,
  onOpenHelpModal,
  totalFlow,
}) => {
  return (
    <header className="h-14 bg-slate-950/95 border-b border-slate-800 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
      {/* Logotipo y Título */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Network className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-sm lg:text-base font-extrabold text-white tracking-tight">
              Flujo Máximo & Corte Mínimo
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">
              Ford-Fulkerson
            </span>
          </div>
          <p className="hidden md:block text-[11px] text-slate-400">
            Método de Etiquetado, Red Residual y Verificación Teórica
          </p>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex items-center space-x-2">
        {/* Botón Código Python */}
        <button
          onClick={onOpenPythonModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
          title="Ver y descargar código Python equivalente (Streamlit + NetworkX)"
        >
          <Code className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Código Python</span>
        </button>

        {/* Botón Ayuda / Teoría */}
        <button
          onClick={onOpenHelpModal}
          className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium rounded-lg transition flex items-center space-x-1"
          title="Ver fundamentos teóricos"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Guía Teórica</span>
        </button>

        {/* BOTÓN PRINCIPAL: EXPORTAR REPORTE PDF */}
        <button
          onClick={onOpenPdfModal}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold rounded-lg shadow-md shadow-rose-900/30 transition cursor-pointer active:scale-95"
        >
          <FileText className="w-4 h-4 text-white" />
          <span>Exportar PDF</span>
        </button>
      </div>
    </header>
  );
};
