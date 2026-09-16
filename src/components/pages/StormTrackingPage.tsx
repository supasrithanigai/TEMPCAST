import React, { useState } from 'react';
import { StormEntity, ReplayTimestep } from '../../types';
import { StormCard } from '../common/StormCard';
import { LeafletMap } from '../map/LeafletMap';
import { StormReplayController } from '../common/StormReplayController';
import {
  Radar,
  Activity,
  ArrowRight,
  Zap,
  Clock,
  MapPin,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';

interface StormTrackingPageProps {
  storms: StormEntity[];
  selectedStorm: StormEntity | null;
  onSelectStorm: (storm: StormEntity) => void;
}

export const StormTrackingPage: React.FC<StormTrackingPageProps> = ({
  storms,
  selectedStorm,
  onSelectStorm,
}) => {
  const currentStorm = selectedStorm || storms[0];
  const [activeReplayStep, setActiveReplayStep] = useState<ReplayTimestep | null>(null);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>RADAR CENTROID TRACKING &amp; TRAJECTORY NOWCAST</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Active Storm Cell Motion &amp; Extrapolation
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Tracks individual convective echo cells via TITAN centroid algorithms coupled with ConvLSTM non-linear trajectory forecasting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
            Active Trackers: <strong className="text-amber-400">{storms.length} Cells</strong>
          </span>
        </div>
      </div>

      {/* Main Layout: Left Storm List, Right Map & Selected Storm Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Storms List (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Radar className="w-4 h-4 text-amber-400" />
              Active Convective Storms ({storms.length})
            </h3>
            <span className="text-[11px] text-slate-400">Select to inspect path</span>
          </div>

          <div className="space-y-3">
            {storms.map((s) => (
              <StormCard
                key={s.id}
                storm={s}
                isSelected={currentStorm?.id === s.id}
                onSelect={() => onSelectStorm(s)}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Interactive Map & Path Details (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Map showing Selected Storm's Path */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                Selected Path: <strong className="text-amber-300">{currentStorm.name}</strong>
              </span>
              <span className="font-mono text-slate-400">
                Vector: {currentStorm.direction} @ {currentStorm.speed_kmh} km/h
              </span>
            </div>

            <LeafletMap
              center={[currentStorm.current_location.lat, currentStorm.current_location.lng]}
              zoom={10}
              heightClass="h-[380px]"
              storms={storms}
              selectedStormId={currentStorm.id}
              onSelectStorm={onSelectStorm}
              layers={{
                riskZones: false,
                lightning: true,
                storms: true,
                alerts: false,
                vulnerable: true,
              }}
            />
          </div>

          {/* Selected Storm Detailed Spatio-Temporal Sequence: Past → Current → Predicted */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Trajectory Sequence: Past → Current → Predicted
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400">
                Extrapolated by ConvLSTM
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {currentStorm.trajectory.map((pt, idx) => {
                const isCurrent = pt.type === 'current';
                const isPast = pt.type === 'past';
                const isPred = pt.type === 'predicted';

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                      isCurrent
                        ? 'bg-rose-950/40 border-rose-500/60 text-white shadow-sm'
                        : isPred
                        ? 'bg-amber-950/20 border-amber-500/30 text-slate-200'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isCurrent
                            ? 'bg-rose-500 animate-pulse ring-2 ring-rose-400/50'
                            : isPred
                            ? 'bg-amber-400'
                            : 'bg-slate-600'
                        }`}
                      />
                      <span className="font-mono font-bold">{pt.time_label}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ({pt.latitude.toFixed(3)}°N, {pt.longitude.toFixed(3)}°W)
                      </span>
                    </div>

                    <div className="flex items-center gap-3 font-mono">
                      <span
                        className={`font-bold ${
                          pt.intensity_dbz >= 55
                            ? 'text-rose-400'
                            : pt.intensity_dbz >= 45
                            ? 'text-amber-400'
                            : 'text-slate-300'
                        }`}
                      >
                        {pt.intensity_dbz} dBZ
                      </span>
                      <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                        {pt.type}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Storm Intensity Progression Chart */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                Storm Intensity Profile (dBZ Through Time)
              </h4>
              <span className="text-[10px] font-mono text-slate-500">
                Cell: {currentStorm.storm_id}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-6 gap-2 text-center">
              {currentStorm.trajectory.map((pt) => {
                const heightPct = Math.round((pt.intensity_dbz / 70) * 100);
                const isCurrent = pt.type === 'current';

                return (
                  <div
                    key={pt.timestamp}
                    className={`p-2 rounded-lg border ${
                      isCurrent
                        ? 'bg-rose-950/30 border-rose-500/50 ring-1 ring-rose-500/20'
                        : 'bg-slate-950/40 border-slate-800'
                    }`}
                  >
                    <div className="h-24 flex items-end justify-center">
                      <div
                        className={`w-4 rounded-t transition-all duration-500 ${
                          pt.type === 'predicted'
                            ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                            : isCurrent
                            ? 'bg-gradient-to-t from-rose-700 to-rose-400'
                            : 'bg-gradient-to-t from-slate-700 to-slate-500'
                        }`}
                        style={{ height: `${Math.max(10, heightPct)}%` }}
                      />
                    </div>
                    <div className="text-[10px] font-mono font-bold mt-2 text-white truncate">
                      {pt.timestamp}
                    </div>
                    <div className="text-[10px] font-mono text-amber-300">
                      {pt.intensity_dbz} dBZ
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* HISTORICAL TIMESTEP REPLAY & OBSERVATION COMPARISON */}
      <StormReplayController onStepChange={setActiveReplayStep} />
    </div>
  );
};
