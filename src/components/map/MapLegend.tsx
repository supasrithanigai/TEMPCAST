import React from 'react';
import { Layers } from 'lucide-react';

interface MapLegendProps {
  layers: {
    riskZones: boolean;
    lightning: boolean;
    storms: boolean;
    alerts: boolean;
    vulnerable: boolean;
  };
  onToggleLayer: (layerKey: keyof MapLegendProps['layers']) => void;
}

export const MapLegend: React.FC<MapLegendProps> = ({ layers, onToggleLayer }) => {
  return (
    <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 text-xs text-slate-200 shadow-xl max-w-xs w-full space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-semibold text-slate-100">
        <span className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          Map Layers &amp; GIS Legend
        </span>
        <span className="text-[10px] font-mono text-amber-400/90 font-medium">Interactive</span>
      </div>

      {/* Layer Toggles requested in prompt: [✓] Risk Zones, [✓] Lightning, [✓] Storms, [✓] Alerts, [✓] Vulnerable Locations */}
      <div className="space-y-1.5">
        <div className="text-[10px] uppercase font-mono text-slate-400 font-bold">GIS Overlays</div>

        <label className="flex items-center justify-between cursor-pointer p-1 rounded hover:bg-slate-900 transition-colors">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-rose-500/60 border border-rose-400" />
            <span>Risk Zones</span>
          </span>
          <input
            type="checkbox"
            checked={layers.riskZones}
            onChange={() => onToggleLayer('riskZones')}
            className="rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer p-1 rounded hover:bg-slate-900 transition-colors">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-400 flex items-center justify-center text-[9px] font-bold text-slate-950">
              ⚡
            </span>
            <span>Lightning Hotspots</span>
          </span>
          <input
            type="checkbox"
            checked={layers.lightning}
            onChange={() => onToggleLayer('lightning')}
            className="rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer p-1 rounded hover:bg-slate-900 transition-colors">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 ring-2 ring-rose-400/50 animate-pulse" />
            <span>Active Storm Cells</span>
          </span>
          <input
            type="checkbox"
            checked={layers.storms}
            onChange={() => onToggleLayer('storms')}
            className="rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer p-1 rounded hover:bg-slate-900 transition-colors">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-amber-500 text-slate-950 flex items-center justify-center text-[8px] font-black">
              !
            </span>
            <span>Active Alerts</span>
          </span>
          <input
            type="checkbox"
            checked={layers.alerts}
            onChange={() => onToggleLayer('alerts')}
            className="rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer p-1 rounded hover:bg-slate-900 transition-colors">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-sky-500 text-slate-950 flex items-center justify-center text-[8px] font-bold">
              ★
            </span>
            <span>Vulnerable Sites</span>
          </span>
          <input
            type="checkbox"
            checked={layers.vulnerable}
            onChange={() => onToggleLayer('vulnerable')}
            className="rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
          />
        </label>
      </div>

      {/* Risk Level Colors */}
      <div className="pt-2 border-t border-slate-800 space-y-1">
        <div className="text-[10px] uppercase font-mono text-slate-400 font-bold">Nowcast Risk Scale</div>
        <div className="flex items-center justify-between text-[11px] pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
            <span className="font-semibold text-rose-300">HIGH</span>
          </span>
          <span className="text-slate-400 font-mono">&gt;70% Prob (50+ dBZ)</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
            <span className="font-semibold text-amber-300">MEDIUM</span>
          </span>
          <span className="text-slate-400 font-mono">40–70% (35–50 dBZ)</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span className="font-semibold text-emerald-300">LOW</span>
          </span>
          <span className="text-slate-400 font-mono">&lt;40% (&lt;35 dBZ)</span>
        </div>
      </div>
    </div>
  );
};
