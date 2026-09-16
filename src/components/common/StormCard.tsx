import React from 'react';
import { StormEntity, RiskLevel } from '../../types';
import { Radar, Compass, Activity, ArrowRight, Zap, ShieldAlert } from 'lucide-react';

interface StormCardProps {
  storm: StormEntity;
  isSelected?: boolean;
  onSelect?: () => void;
  compact?: boolean;
}

export const StormCard: React.FC<StormCardProps> = ({
  storm,
  isSelected = false,
  onSelect,
  compact = false,
}) => {
  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'HIGH':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'LOW':
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`rounded-xl border transition-all cursor-pointer p-4 ${
        isSelected
          ? 'bg-slate-900 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
      }`}
    >
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg border ${
              isSelected ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Radar className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white tracking-tight">{storm.name}</h4>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                {storm.storm_id}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{storm.current_location.area_name}</p>
          </div>
        </div>

        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${getRiskBadge(storm.risk_level)}`}>
          {storm.risk_level}
        </span>
      </div>

      {/* Primary Storm Attributes */}
      <div className="grid grid-cols-3 gap-2 mt-3 text-center">
        <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 block uppercase">Heading</span>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-mono font-bold text-white">{storm.direction}</span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono">{storm.direction_deg}° Azimuth</span>
        </div>

        <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 block uppercase">Velocity</span>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-xs font-mono font-bold text-white">{storm.speed_kmh}</span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono">km/h</span>
        </div>

        <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 block uppercase">Peak Core</span>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-xs font-mono font-bold text-white">{storm.intensity_dbz}</span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono">dBZ ({storm.intensity})</span>
        </div>
      </div>

      {/* Trajectory summary */}
      {!compact && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
            <span>Spatio-Temporal Sequence:</span>
            <span className="text-amber-400 font-mono">Past → Current → Predicted</span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-mono">
            {storm.trajectory.map((t, idx) => (
              <React.Fragment key={idx}>
                <span
                  className={`px-1.5 py-0.5 rounded whitespace-nowrap ${
                    t.type === 'past'
                      ? 'bg-slate-800/80 text-slate-400 border border-slate-700/60'
                      : t.type === 'current'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 font-bold'
                      : 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {t.time_label} ({t.intensity_dbz}dBZ)
                </span>
                {idx < storm.trajectory.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/50 text-[10px] text-slate-500">
            <span className="flex items-center gap-1 text-yellow-400">
              <Zap className="w-3 h-3" /> {storm.lightning_strike_count_last_10m} flashes / 10m
            </span>
            <span>Echo Top: {storm.top_height_km} km</span>
            <span>Updated: {storm.last_updated}</span>
          </div>
        </div>
      )}
    </div>
  );
};
