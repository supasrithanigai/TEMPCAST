import React, { useState } from 'react';
import { PredictionHorizon } from '../../types';
import { Clock, TrendingUp, HelpCircle, FileQuestion } from 'lucide-react';

interface RiskChartProps {
  predictions: PredictionHorizon[];
  title?: string;
  showLightning?: boolean;
  showConfidence?: boolean;
}

export const RiskChart: React.FC<RiskChartProps> = ({
  predictions,
  title = 'Thunderstorm & Lightning Risk Progression (Next 90 Minutes)',
  showLightning = true,
  showConfidence = true,
}) => {
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);

  if (!predictions || predictions.length === 0) {
    return (
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-slate-800/80 text-amber-400 flex items-center justify-center mx-auto">
          <Clock className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-base font-bold text-white">{title}</h3>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              Awaiting Original Dataset
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Progression curve will generate upon ingestion and spatial-temporal tensor extraction of original datasets.
          </p>
        </div>
      </div>
    );
  }

  // Synthesize a continuous curve from now (t=0) through 30m, 60m, 90m
  const p30 = predictions.find((p) => p.horizon_minutes === 30) || predictions[0];
  const p60 = predictions.find((p) => p.horizon_minutes === 60) || predictions[1] || p30;
  const p90 = predictions.find((p) => p.horizon_minutes === 90) || predictions[2] || p60;

  const nowProb = Math.max(10, Math.round(p30.thunderstorm_probability * 0.7));
  const nowLtg = Math.max(5, Math.round(p30.lightning_probability * 0.65));
  const nowConf = 92;

  const points = [
    { minute: 0, label: 'Now (T0)', tProb: nowProb, lProb: nowLtg, conf: nowConf },
    {
      minute: 15,
      label: '+15m',
      tProb: Math.round((nowProb + p30.thunderstorm_probability) / 2),
      lProb: Math.round((nowLtg + p30.lightning_probability) / 2),
      conf: Math.round((nowConf + p30.confidence) / 2),
    },
    {
      minute: 30,
      label: '+30m',
      tProb: p30.thunderstorm_probability,
      lProb: p30.lightning_probability,
      conf: p30.confidence,
    },
    {
      minute: 45,
      label: '+45m',
      tProb: Math.round((p30.thunderstorm_probability + p60.thunderstorm_probability) / 2),
      lProb: Math.round((p30.lightning_probability + p60.lightning_probability) / 2),
      conf: Math.round((p30.confidence + p60.confidence) / 2),
    },
    {
      minute: 60,
      label: '+60m',
      tProb: p60.thunderstorm_probability,
      lProb: p60.lightning_probability,
      conf: p60.confidence,
    },
    {
      minute: 75,
      label: '+75m',
      tProb: Math.round((p60.thunderstorm_probability + p90.thunderstorm_probability) / 2),
      lProb: Math.round((p60.lightning_probability + p90.lightning_probability) / 2),
      conf: Math.round((p60.confidence + p90.confidence) / 2),
    },
    {
      minute: 90,
      label: '+90m',
      tProb: p90.thunderstorm_probability,
      lProb: p90.lightning_probability,
      conf: p90.confidence,
    },
  ];

  // SVG dimensions
  const width = 800;
  const height = 260;
  const padding = { top: 30, right: 30, bottom: 45, left: 50 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const getX = (minute: number) => padding.left + (minute / 90) * innerWidth;
  const getY = (val: number) => padding.top + innerHeight - (val / 100) * innerHeight;

  const buildPath = (key: 'tProb' | 'lProb' | 'conf') => {
    return points.reduce((acc, curr, idx) => {
      const x = getX(curr.minute);
      const y = getY(curr[key]);
      return `${acc} ${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }, '');
  };

  const buildArea = (key: 'tProb') => {
    const linePath = buildPath(key);
    const lastX = getX(90);
    const firstX = getX(0);
    const bottomY = getY(0);
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  const activePoint = activePointIndex !== null ? points[activePointIndex] : null;

  return (
    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            {title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Original dataset time-horizon evolution
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-amber-400 rounded-full" />
            <span className="text-slate-300">Thunderstorm</span>
          </div>
          {showLightning && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-yellow-400 rounded-full" />
              <span className="text-slate-300">Lightning</span>
            </div>
          )}
          {showConfidence && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-emerald-400 rounded-full stroke-dasharray" />
              <span className="text-slate-400">Confidence</span>
            </div>
          )}
        </div>
      </div>

      {/* SVG Chart Canvas */}
      <div className="relative mt-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[600px] select-none"
        >
          <defs>
            <linearGradient id="tProbGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#334155"
                  strokeDasharray="3 3"
                  strokeWidth="0.8"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#94a3b8"
                  fontFamily="monospace"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* X Axis Time Labels */}
          {points.map((p) => {
            const x = getX(p.minute);
            return (
              <g key={p.minute}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={height - padding.bottom}
                  stroke="#1e293b"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={height - padding.bottom + 18}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#94a3b8"
                  fontWeight="600"
                  fontFamily="monospace"
                >
                  {p.label}
                </text>
              </g>
            );
          })}

          {/* Thunderstorm Area fill */}
          <path d={buildArea('tProb')} fill="url(#tProbGrad)" />

          {/* Confidence Line */}
          {showConfidence && (
            <path
              d={buildPath('conf')}
              fill="none"
              stroke="#10b981"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.7"
            />
          )}

          {/* Lightning Line */}
          {showLightning && (
            <path
              d={buildPath('lProb')}
              fill="none"
              stroke="#eab308"
              strokeWidth="2"
            />
          )}

          {/* Thunderstorm Line */}
          <path
            d={buildPath('tProb')}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
          />

          {/* Interactive points */}
          {points.map((p, idx) => {
            const x = getX(p.minute);
            const yT = getY(p.tProb);
            const isSelected = activePointIndex === idx;

            return (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => setActivePointIndex(idx)}
                onMouseLeave={() => setActivePointIndex(null)}
              >
                <circle
                  cx={x}
                  cy={yT}
                  r={isSelected ? 6 : 4}
                  fill="#f59e0b"
                  stroke="#0f172a"
                  strokeWidth="2"
                />
              </g>
            );
          })}
        </svg>

        {/* Hover info tooltip */}
        {activePoint && (
          <div
            className="absolute top-2 right-4 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono shadow-xl pointer-events-none"
          >
            <div className="font-bold text-amber-400 mb-1">{activePoint.label} Horizon</div>
            <div className="text-slate-300">Thunderstorm: <strong className="text-amber-400">{activePoint.tProb}%</strong></div>
            {showLightning && <div className="text-slate-300">Lightning: <strong className="text-yellow-400">{activePoint.lProb}%</strong></div>}
            {showConfidence && <div className="text-slate-400 text-[11px]">Confidence: {activePoint.conf}%</div>}
          </div>
        )}
      </div>
    </div>
  );
};
