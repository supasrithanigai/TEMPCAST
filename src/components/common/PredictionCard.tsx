import React from 'react';
import { PredictionHorizon } from '../../types';
import { Clock, ShieldAlert, Zap, CloudLightning, Gauge } from 'lucide-react';

interface PredictionCardProps {
  prediction: PredictionHorizon;
  compact?: boolean;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  prediction,
  compact = false,
}) => {
  const {
    horizon_minutes,
    thunderstorm_probability,
    lightning_probability,
    confidence,
    severity,
    risk_level,
    estimated_peak_dbz,
    expected_strikes_per_min,
  } = prediction;

  const getRiskTheme = (level: string) => {
    switch (level) {
      case 'HIGH':
        return {
          border: 'border-rose-500/40 hover:border-rose-500/70',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          barColor: 'bg-rose-500',
          dotColor: 'bg-rose-500',
          glow: 'from-rose-500/10 to-transparent',
        };
      case 'MEDIUM':
        return {
          border: 'border-amber-500/40 hover:border-amber-500/70',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          barColor: 'bg-amber-500',
          dotColor: 'bg-amber-500',
          glow: 'from-amber-500/10 to-transparent',
        };
      case 'LOW':
      default:
        return {
          border: 'border-emerald-500/40 hover:border-emerald-500/70',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          barColor: 'bg-emerald-500',
          dotColor: 'bg-emerald-500',
          glow: 'from-emerald-500/10 to-transparent',
        };
    }
  };

  const theme = getRiskTheme(risk_level);

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-900/90 border ${theme.border} p-5 sm:p-6 transition-all shadow-md flex flex-col justify-between`}
    >
      <div
        className={`absolute -top-12 -right-12 w-28 h-28 rounded-full bg-gradient-to-br ${theme.glow} blur-xl pointer-events-none`}
      />

      <div>
        {/* Header: Horizon & Risk Badge */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-800/90 text-amber-400 border border-slate-700/60">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-white font-mono tracking-tight">
                  +{horizon_minutes}m Horizon
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">ConvLSTM Nowcast</span>
            </div>
          </div>

          {/* Risk Level Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${theme.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${theme.dotColor} animate-ping`} />
            {risk_level}
          </span>
        </div>

        {/* Main Metric Numbers: Clearly Separated Blocks for Thunderstorm & Lightning */}
        <div className="grid grid-cols-2 gap-3.5 my-4">
          {/* Thunderstorm Probability Block */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700/80 transition-colors">
            <div className="flex items-center gap-1.5 text-amber-300 text-xs font-semibold mb-1">
              <CloudLightning className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="truncate">Thunderstorm</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                {thunderstorm_probability}%
              </span>
              <span className="text-[10px] text-slate-400 font-mono">risk</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-800/90 mt-2.5 overflow-hidden">
              <div
                className={`h-full ${theme.barColor} transition-all duration-500`}
                style={{ width: `${thunderstorm_probability}%` }}
              />
            </div>
          </div>

          {/* Lightning Probability Block */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700/80 transition-colors">
            <div className="flex items-center gap-1.5 text-yellow-300 text-xs font-semibold mb-1">
              <Zap className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
              <span className="truncate">Lightning Risk</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                {lightning_probability}%
              </span>
              <span className="text-[10px] text-slate-400 font-mono">risk</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-800/90 mt-2.5 overflow-hidden">
              <div
                className="h-full bg-yellow-400 transition-all duration-500"
                style={{ width: `${lightning_probability}%` }}
              />
            </div>
          </div>
        </div>

        {/* Secondary Metrics: Confidence & Severity (Easy to identify) */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center justify-between py-0.5">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" /> Model Confidence:
            </span>
            <span className="font-mono font-bold text-emerald-400 text-xs sm:text-sm bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50">
              {confidence}%
            </span>
          </div>

          <div className="flex items-center justify-between py-0.5">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Severity Level:
            </span>
            <span className="font-semibold text-white font-mono text-xs">{severity}</span>
          </div>

          {!compact && (
            <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono text-slate-300">
              <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Peak Core:</span>
                <span className="text-amber-300 font-bold">{estimated_peak_dbz} dBZ</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Est. Strikes:</span>
                <span className="text-yellow-300 font-bold">{expected_strikes_per_min}/min</span>
              </div>
            </div>
          )}

          {prediction.lightning_jump_detected && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[11px] font-mono text-amber-300 font-semibold mt-2">
              <Zap className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 animate-pulse" />
              <span>Lightning Jump (+2.8σ surge)</span>
            </div>
          )}
        </div>
      </div>

      {/* Prototype disclaimer tag */}
      <div className="mt-4 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <span>CONV-LSTM ROLLOUT</span>
        <span className="text-amber-400/80 font-medium">Simulated AI Ingest</span>
      </div>
    </div>
  );
};
