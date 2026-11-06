/**
 * Modal de Configuración y Exportación de Reporte Detallado en PDF.
 */

import React, { useState } from 'react';
import {
  GraphNode,
  GraphEdge,
  SimulationResult,
} from '../types/fordFulkerson';
import { generatePdfReport, PdfReportOptions } from '../utils/pdfGenerator';
import { FileText, Download, X, Check, Eye } from 'lucide-react';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: GraphNode[];
  edges: GraphEdge[];
  result: SimulationResult;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  nodes,
  edges,
  result,
}) => {
  const [authorName, setAuthorName] = useState('Equipo de Optimización');
  const [institution, setInstitution] = useState('Facultad de Ingeniería');
  const [courseName, setCourseName] = useState('Investigación de Operaciones / Teoría de Grafos');
  const [problemTitle, setProblemTitle] = useState('Resolución de Flujo Máximo y Corte Mínimo (Ford-Fulkerson)');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const options: PdfReportOptions = {
          authorName,
          institution,
          courseName,
          problemTitle,
        };
        const doc = generatePdfReport(nodes, edges, result, options);
        doc.save(`Reporte_Ford_Fulkerson_FlujoMaximo_${Date.now()}.pdf`);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
      } catch (err) {
        console.error('Error al generar PDF:', err);
      } finally {
        setIsGenerating(false);
      }
    }, 250);
  };

  const handlePreview = () => {
    try {
      const options: PdfReportOptions = {
        authorName,
        institution,
        courseName,
        problemTitle,
      };
      const doc = generatePdfReport(nodes, edges, result, options);
      const blob = doc.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch (err) {
      console.error('Error previsualizando PDF:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Generar Reporte Técnico en PDF</h3>
              <p className="text-xs text-slate-400">Documento formal con verificación teórica y tablas completas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario de Metadatos del Reporte */}
        <div className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Título del Reporte / Proyecto:</label>
            <input
              type="text"
              value={problemTitle}
              onChange={(e) => setProblemTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Autor(es) / Estudiante:</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Institución / Universidad:</label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Asignatura / Curso:</label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Resumen del Contenido que incluirá el PDF */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
            <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider">
              Contenido Incluido en el Reporte:
            </span>
            <ul className="text-slate-400 space-y-1 text-[11px]">
              <li className="flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Resumen Ejecutivo con Flujo Máximo ({result.finalFlow} u.) y Corte Mínimo ({result.minCut.cutCapacity} u.)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Demostración del Teorema de Ford-Fulkerson y análisis de Partición (S, T)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tabla de {result.iterations.length} iteraciones con caminos aumentantes y cuellos de botella Δ</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Matriz completa de las {edges.length} aristas con estado de saturación</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Comprobación de conservación de flujo para los {nodes.length} nodos</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-slate-950 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handlePreview}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5"
          >
            <Eye className="w-4 h-4" />
            <span>Previsualizar</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating}
            className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold rounded-lg shadow transition flex items-center space-x-1.5 active:scale-95 cursor-pointer"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>¡Descargado!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-white" />
                <span>{isGenerating ? 'Generando...' : 'Descargar PDF Detallado'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
