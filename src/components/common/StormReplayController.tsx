import React, { useState } from 'react';
import { ReplayTimestep } from '../../types';
import { Play, Pause, RotateCcw, Clock, FileQuestion } from 'lucide-react';

interface StormReplayControllerProps {
  timesteps?: ReplayTimestep[];
  onStepChange?: (step: ReplayTimestep) => void;
}

export const StormReplayController: React.FC<StormReplayControllerProps> = ({
  timesteps = [],
  onStepChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!timesteps || timesteps.length === 0) {
    return (
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">
            Sequential Radar Sweep Replay &amp; Verification
          </h3>
        </div>
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
          <FileQuestion className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            Awaiting Original Dataset: Multi-timestep radar sweeps (t-30m to t+90m) will load here once radar volume sequence datasets are uploaded in the Datasets section.
          </span>
        </div>
      </div>
    );
  }

  const currentStep = timesteps[currentIndex] || timesteps[0];

  return (
    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
              Observation vs. Nowcast
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              ORIGINAL TIMESTEP SEQUENCE
            </span>
          </div>
          <h3 className="text-base font-bold text-white mt-1 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Sequential Radar Sweep Replay &amp; Verification
          </h3>
          <p className="text-xs text-slate-400">
            Step through original radar observation timesteps alongside predicted cell positions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentIndex(0);
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {timesteps.map((step, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentIndex(idx);
              onStepChange?.(step);
            }}
            className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
              idx === currentIndex
                ? 'bg-cyan-950/40 border-cyan-500 ring-1 ring-cyan-500/30'
                : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-xs font-mono font-bold text-white">{step.time_label}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{step.actual_intensity_dbz ?? '—'} dBZ</div>
          </button>
        ))}
      </div>
    </div>
  );
};
