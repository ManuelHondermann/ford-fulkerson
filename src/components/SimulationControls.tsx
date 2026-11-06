/**
 * Barra de Controles de Simulación y Navegación Paso a Paso del Algoritmo de Ford-Fulkerson.
 * Réplica exacta y mejorada de la interfaz del usuario con controles de reproducción automática.
 */

import React, { useEffect, useState } from 'react';
import {
  SimulationStep,
} from '../types/fordFulkerson';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Rocket,
  Flame,
  CheckCircle2,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SimulationControlsProps {
  currentStep: SimulationStep | null;
  currentStepIndex: number;
  totalSteps: number;
  finalFlow: number;
  onStepChange: (index: number) => void;
  onReset: () => void;
  hasFictitiousNodes?: boolean;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  currentStep,
  currentStepIndex,
  totalSteps,
  finalFlow,
  onStepChange,
  onReset,
  hasFictitiousNodes = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1500); // ms por paso

  // Reproducción automática
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      if (currentStepIndex < totalSteps - 1) {
        timer = setTimeout(() => {
          onStepChange(currentStepIndex + 1);
        }, playSpeed);
      } else {
        setIsPlaying(false);
        // Lanzar confeti al terminar
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentStepIndex, totalSteps, playSpeed, onStepChange]);

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      onStepChange(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      onStepChange(currentStepIndex - 1);
    }
  };

  const handleFirst = () => {
    setIsPlaying(false);
    onStepChange(0);
  };

  const handleLast = () => {
    setIsPlaying(false);
    onStepChange(totalSteps - 1);
  };

  const currentFlow = currentStep?.currentTotalFlow ?? 0;
  const flowPercentage = finalFlow > 0 ? Math.min(100, Math.round((currentFlow / finalFlow) * 100)) : 0;

  return (
    <div className="space-y-4">
      {/* Banner Informativo de Origen / Destino Ficticio si está activo */}
      {hasFictitiousNodes && (
        <div className="flex items-center space-x-3 px-4 py-3 bg-blue-950/60 border border-blue-800/80 rounded-xl text-blue-200 text-xs shadow-sm">
          <Info className="w-4 h-4 text-blue-400 shrink-0" />
          <span>
            <strong>Múltiples Fuentes / Sumideros:</strong> Se ha incorporado un <strong>Origen Ficticio (S*)</strong> y/o{' '}
            <strong>Destino Ficticio (T*)</strong> con aristas de capacidad ∞ para consolidar el flujo neto de la red.
          </span>
        </div>
      )}

      {/* Tarjeta Principal de Simulación */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        {/* Título de la Sección */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-base">
              2
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Simulación del Algoritmo de Ford-Fulkerson</h2>
              <p className="text-xs text-slate-400">Método de Etiquetado y Búsqueda de Caminos Aumentantes</p>
            </div>
          </div>

          {/* Botón Ejecutar / Reiniciar Simulación */}
          <button
            onClick={onReset}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition-all duration-200 cursor-pointer active:scale-95"
          >
            <Rocket className="w-4 h-4" />
            <span>Ejecutar / Reiniciar Simulación</span>
          </button>
        </div>

        {/* Botones de Control de Paso (⏮️ Inicio, ◀️ Anterior, ▶️ Auto, Siguiente ▶️, ⏭️ Final) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleFirst}
              disabled={currentStepIndex === 0}
              className="flex items-center space-x-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
              title="Ir al inicio (Paso 0)"
            >
              <SkipBack className="w-3.5 h-3.5" />
              <span>Inicio</span>
            </button>

            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="flex items-center space-x-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
              title="Paso anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>

            {/* Botón Auto-Reproducir */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border transition ${
                isPlaying
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/30'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isPlaying ? 'Pausar' : 'Auto'}</span>
            </button>

            <button
              onClick={handleNext}
              disabled={currentStepIndex >= totalSteps - 1}
              className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white text-xs font-medium rounded-lg border border-blue-500 transition shadow-sm"
              title="Siguiente paso"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleLast}
              disabled={currentStepIndex >= totalSteps - 1}
              className="flex items-center space-x-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
              title="Ir al paso final óptimo"
            >
              <span>Final</span>
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Selector de velocidad */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <span>Velocidad:</span>
            {[
              { label: '0.5x', ms: 2500 },
              { label: '1x', ms: 1500 },
              { label: '2x', ms: 800 },
            ].map((spd) => (
              <button
                key={spd.label}
                onClick={() => setPlaySpeed(spd.ms)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                  playSpeed === spd.ms
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {spd.label}
              </button>
            ))}
          </div>
        </div>

        {/* Barra de Progreso Deslizable de Pasos */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>
              Paso <strong className="text-white">{currentStepIndex}</strong> de <strong className="text-white">{Math.max(0, totalSteps - 1)}</strong>
            </span>
            <span className="text-emerald-400 font-semibold">{flowPercentage}% del flujo máximo</span>
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(0, totalSteps - 1)}
            value={currentStepIndex}
            onChange={(e) => {
              setIsPlaying(false);
              onStepChange(Number(e.target.value));
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Descripción del Paso Actual */}
        <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-lg space-y-1.5">
          <div className="flex items-center space-x-2">
            {currentStep?.isTerminationStep ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : currentStep?.isAugmentingPhase ? (
              <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
            )}
            <span className="text-xs font-bold text-slate-200">
              {currentStep ? currentStep.title : 'Inicializando...'}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed pl-6">
            {currentStep ? currentStep.description : ''}
          </p>

          {/* Notas Detalladas de la iteración */}
          {currentStep && currentStep.detailedNotes.length > 0 && (
            <ul className="text-[11px] text-slate-400 space-y-0.5 pt-1 pl-6 list-disc list-inside">
              {currentStep.detailedNotes.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Tarjeta de Métrica: Flujo Total Actual |f| */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-xl">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
              Flujo Total Actual |f|
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
                {currentFlow}
              </span>
              <span className="text-sm font-medium text-slate-400">unidades</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-medium text-slate-400 block">Capacidad Corte Mínimo</span>
            <div className="flex items-baseline justify-end space-x-1.5 mt-1 font-mono">
              <span className="text-xl font-bold text-indigo-400">{finalFlow}</span>
              <span className="text-xs text-slate-400">unidades</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
