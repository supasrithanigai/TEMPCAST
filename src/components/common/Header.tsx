import React from 'react';
import { CloudLightning, MapPin, Activity, ShieldAlert, Sparkles, Info, Menu } from 'lucide-react';
import { LocationItem } from '../../types';

interface HeaderProps {
  locations: LocationItem[];
  selectedLocationId: string;
  onSelectLocation: (id: string) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  activeAlertsCount?: number;
  alertCount?: number;
  onToggleSidebar?: () => void;
  onNavigateAlerts?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  locations,
  selectedLocationId,
  onSelectLocation,
  onRefresh,
  isRefreshing = false,
  activeAlertsCount,
  alertCount,
  onToggleSidebar,
  onNavigateAlerts,
}) => {
  const alertsTotal = alertCount ?? activeAlertsCount ?? 0;

  return (
    <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="px-4 lg:px-6 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/40 text-amber-400 shadow-sm shadow-amber-500/10 flex-shrink-0">
            <CloudLightning className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-slate-950 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-slate-950" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                TEMPESTCAST
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold tracking-wider animate-pulse flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> SIMULATION MODE
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              AI-Powered Thunderstorm &amp; Lightning Nowcasting (30–90 Min Horizon)
            </p>
          </div>
        </div>

        {/* Action Controls & Location Selector */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Active Alerts Badge */}
          {alertsTotal > 0 && (
            <button
              onClick={onNavigateAlerts}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium hover:bg-rose-500/20 transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
              <span>{alertsTotal} Warning{alertsTotal > 1 ? 's' : ''}</span>
            </button>
          )}

          {/* System Status: Simulation active */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-slate-400">Mode:</span>
            <span className="font-mono text-amber-400 font-medium">In-Browser Sim</span>
          </div>

          {/* Location Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
            <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <select
              value={selectedLocationId}
              onChange={(e) => onSelectLocation(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer pr-1 font-medium"
              aria-label="Select Monitored Radar Sector"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id} className="bg-slate-900 text-slate-200">
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Re-simulate / Refresh button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors disabled:opacity-50 cursor-pointer"
            title="Update simulation telemetry & run nowcast rollout"
          >
            <Activity className={`w-3.5 h-3.5 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="inline">{isRefreshing ? 'Simulating...' : 'Simulate'}</span>
          </button>
        </div>
      </div>

      {/* Prominent Simulation Mode Disclaimer Notice */}
      <div className="bg-amber-950/30 border-t border-amber-900/40 px-4 lg:px-6 py-1 flex items-center justify-between text-[11px] text-amber-200/90 font-mono">
        <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
          <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>
            <strong>SIMULATION / DEMO MODE:</strong> Predictions and radar feeds are simulated for demonstration. They are not official weather warnings.
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-slate-400 text-[10px]">
          <span>CNN + ConvLSTM Nowcasting Engine</span>
        </div>
      </div>
    </header>
  );
};
