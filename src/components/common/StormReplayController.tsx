import React, { useState, useEffect } from 'react';
import { ReplayTimestep } from '../../types';
import { DEMO_REPLAY_TIMESTEPS } from '../../data/demoData';
import { Play, Pause, RotateCcw, SkipBack, SkipForward, CheckCircle2, AlertTriangle, Eye, ShieldAlert } from 'lucide-react';

interface StormReplayControllerProps {
  timesteps?: ReplayTimestep[];
  onStepChange?: (step: ReplayTimestep) => void;
}

export const StormReplayController: React.FC<StormReplayControllerProps> = ({
  timesteps = DEMO_REPLAY_TIMESTEPS,
  onStepChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(2); // Start at T = 0 min (Now)
  const [isPlaying, setIsPlaying] = useState(false);

  const currentStep = timesteps[currentIndex] || timesteps[0];

  useEffect(() => {
    onStepChange?.(currentStep);
  }, [currentIndex, onStepChange]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= timesteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timesteps.length]);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'HIT':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'MISS':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'FALSE_ALARM':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'CORRECT_NEGATIVE':
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    }
  };

  return (
    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
              Historical Verification Replay
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              OBSERVED VS NOWCAST
            </span>
          </div>
          <h3 className="text-base font-bold text-white mt-1 flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            Convective Lifecycle Replay & Ground-Truth Verification
          </h3>
          <p className="text-xs text-slate-400">
            Step through radar sweeps, lightning surges, and nowcasts across storm initiation, peak severe phase, and decay.
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer transition-colors"
            title="Previous timestep"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play Timeline'}</span>
          </button>

          <button
            onClick={() => setCurrentIndex((prev) => Math.min(timesteps.length - 1, prev + 1))}
            disabled={currentIndex === timesteps.length - 1}
            className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer transition-colors"
            title="Next timestep"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentIndex(0);
            }}
            className="p-1.5 rounded text-slate-400 hover:text-white cursor-pointer transition-colors"
            title="Reset to start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stepper timeline buttons */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {timesteps.map((ts, idx) => (
          <button
            key={ts.step_index}
            onClick={() => {
              setIsPlaying(false);
              setCurrentIndex(idx);
            }}
            className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
              currentIndex === idx
                ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <span className="text-[10px] font-mono block text-slate-400">Step {idx + 1}</span>
            <span className="text-xs font-bold font-mono block mt-0.5">{ts.time_label}</span>
          </button>
        ))}
      </div>

      {/* Narrative & Observations for Current Step */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Narrative & Stage Description */}
        <div className="md:col-span-2 p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-amber-400 font-bold">
              TIMESTEP {currentStep.step_index + 1} OF {timesteps.length} • {currentStep.time_label}
            </span>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold border ${getStatusBadge(currentStep.observed_ground_truth?.match_status)}`}>
              VERIFICATION: {currentStep.observed_ground_truth?.match_status}
            </span>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            {currentStep.narrative}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 font-mono text-xs">
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Radar Core:</span>
              <span className="text-sm font-bold text-amber-400">{currentStep.observations.radar_dbz} dBZ</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Lightning (10m):</span>
              <span className="text-sm font-bold text-yellow-400">{currentStep.observations.lightning_strikes_10m} flashes</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">CAPE Sounding:</span>
              <span className="text-sm font-bold text-rose-400">{currentStep.observations.cape_j_kg} J/kg</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Cloud Top:</span>
              <span className="text-sm font-bold text-cyan-400">{currentStep.observations.cloud_top_temp_c}°C</span>
            </div>
          </div>
        </div>

        {/* Verification Match Outcome */}
        <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-3">
          <span className="text-xs font-mono font-bold text-slate-300 block">Ground Truth Comparison</span>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Actual Severe Event:</span>
              <span className={`font-bold ${currentStep.observed_ground_truth?.thunderstorm_occurred ? 'text-rose-400' : 'text-emerald-400'}`}>
                {currentStep.observed_ground_truth?.thunderstorm_occurred ? 'YES (Confirmed)' : 'NO'}
              </span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Model +30m Risk:</span>
              <span className="font-bold text-amber-400 font-mono">
                {currentStep.nowcast[0]?.thunderstorm_probability}% ({currentStep.nowcast[0]?.risk_level})
              </span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Peak Reflectivity:</span>
              <span className="font-mono text-slate-200">
                {currentStep.observed_ground_truth?.actual_dbz} dBZ
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>AI model correctly anticipated convective intensification 30 minutes prior.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
