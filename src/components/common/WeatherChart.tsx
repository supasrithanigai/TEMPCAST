import React from 'react';

interface WeatherChartProps {
  currentDbz: number;
  currentCape: number;
}

export const WeatherChart: React.FC<WeatherChartProps> = ({
  currentDbz,
  currentCape,
}) => {
  // Simulated historical past 60 min to +30 min trend
  const history = [
    { time: '-60m', dbz: Math.max(15, currentDbz - 28), cape: currentCape - 600 },
    { time: '-45m', dbz: Math.max(20, currentDbz - 20), cape: currentCape - 350 },
    { time: '-30m', dbz: Math.max(25, currentDbz - 12), cape: currentCape - 180 },
    { time: '-15m', dbz: Math.max(30, currentDbz - 4), cape: currentCape - 50 },
    { time: 'Now', dbz: currentDbz, cape: currentCape },
    { time: '+15m', dbz: Math.min(65, currentDbz + 3), cape: currentCape - 100 },
    { time: '+30m', dbz: Math.min(68, currentDbz + 2), cape: currentCape - 280 },
  ];

  const maxDbz = 75;
  const maxCape = 4000;

  return (
    <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white">Atmospheric Convective Tendency</h3>
          <p className="text-xs text-slate-400">
            Radar reflectivity core (dBZ) &amp; CAPE thermodynamic potential trend
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            dBZ (Radar)
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            CAPE (J/kg)
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-2 text-center">
        {history.map((step) => {
          const dbzHeight = Math.round((step.dbz / maxDbz) * 100);
          const capeHeight = Math.round((step.cape / maxCape) * 100);
          const isNow = step.time === 'Now';

          return (
            <div
              key={step.time}
              className={`p-2 rounded-lg border transition-all ${
                isNow
                  ? 'bg-slate-800/80 border-amber-500/50 ring-1 ring-amber-500/20'
                  : 'bg-slate-950/40 border-slate-800/60'
              }`}
            >
              <div className="h-28 flex items-end justify-center gap-1.5 pt-2">
                {/* dBZ bar */}
                <div
                  className="w-3 rounded-t bg-gradient-to-t from-rose-700 to-rose-400 transition-all duration-500"
                  style={{ height: `${Math.min(100, Math.max(8, dbzHeight))}%` }}
                  title={`${step.dbz} dBZ`}
                />
                {/* CAPE bar */}
                <div
                  className="w-3 rounded-t bg-gradient-to-t from-amber-700 to-amber-400 transition-all duration-500"
                  style={{ height: `${Math.min(100, Math.max(8, capeHeight))}%` }}
                  title={`${step.cape} J/kg`}
                />
              </div>

              <div className="mt-2 text-[10px] font-mono font-bold text-slate-300">
                {step.time}
              </div>
              <div className="text-[9px] font-mono text-rose-300">{step.dbz} dBZ</div>
              <div className="text-[9px] font-mono text-amber-300">{step.cape} J</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
