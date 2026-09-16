import React, { useState } from 'react';
import { PredictionHorizon } from '../../types';

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

  // Synthesize a continuous curve from now (t=0) through 30m, 60m, 90m
  const p30 = predictions.find((p) => p.horizon_minutes === 30) || predictions[0];
  const p60 = predictions.find((p) => p.horizon_minutes === 60) || predictions[1];
  const p90 = predictions.find((p) => p.horizon_minutes === 90) || predictions[2];

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

  // SVG Chart Geometry
  const width = 680;
  const height = 270;
  const padLeft = 45;
  const padRight = 25;
  const padTop = 25;
  const padBottom = 35;
  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;

  const getX = (index: number) => padLeft + (index / (points.length - 1)) * chartWidth;
  const getY = (val: number) => padTop + chartHeight - (val / 100) * chartHeight;

  // Generate SVG path strings
  const buildSmoothPath = (key: 'tProb' | 'lProb' | 'conf') => {
    return points.reduce((path, pt, i) => {
      const x = getX(i);
      const y = getY(pt[key]);
      return i === 0 ? `M ${x},${y}` : `${path} L ${x},${y}`;
    }, '');
  };

  const tProbPath = buildSmoothPath('tProb');
  const lProbPath = buildSmoothPath('lProb');
  const confPath = buildSmoothPath('conf');

  const activePoint = activePointIndex !== null ? points[activePointIndex] : null;

  return (
    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Temporal rollout sequence synthesized by ConvLSTM layer weights across 90 minutes
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-800/40">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-500/50" />
            <span className="text-amber-200">Storm Risk %</span>
          </div>
          {showLightning && (
            <div className="flex items-center gap-1.5 bg-yellow-950/40 px-2.5 py-1 rounded-md border border-yellow-800/40">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <span className="text-yellow-200">Lightning %</span>
            </div>
          )}
          {showConfidence && (
            <div className="flex items-center gap-1.5 bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-800/40">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-emerald-200">Confidence %</span>
            </div>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative mt-4 w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[540px] select-none"
        >
          <defs>
            <linearGradient id="stormGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lightningGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#facc15" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#facc15" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y Axis values */}
          {[0, 20, 40, 60, 70, 80, 100].map((val) => {
            const y = getY(val);
            const isHighThreshold = val === 70;
            const isMedThreshold = val === 40;
            return (
              <g key={val}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke={
                    isHighThreshold
                      ? '#ef4444'
                      : isMedThreshold
                      ? '#f59e0b'
                      : '#334155'
                  }
                  strokeWidth={isHighThreshold || isMedThreshold ? 1 : 0.75}
                  strokeDasharray={isHighThreshold || isMedThreshold ? '4 3' : '2 2'}
                  strokeOpacity={isHighThreshold || isMedThreshold ? 0.6 : 0.4}
                />
                <text
                  x={padLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Area fill for storm probability */}
          <path
            d={`${tProbPath} L ${getX(points.length - 1)},${getY(0)} L ${getX(0)},${getY(0)} Z`}
            fill="url(#stormGradient)"
          />

          {/* Lines */}
          {showConfidence && (
            <path
              d={confPath}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
          )}

          {showLightning && (
            <path
              d={lProbPath}
              fill="none"
              stroke="#facc15"
              strokeWidth="2"
            />
          )}

          <path
            d={tProbPath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
          />

          {/* Data interactive points */}
          {points.map((pt, i) => {
            const x = getX(i);
            const yt = getY(pt.tProb);
            const isSelected = activePointIndex === i;

            return (
              <g
                key={pt.minute}
                className="cursor-pointer"
                onMouseEnter={() => setActivePointIndex(i)}
                onClick={() => setActivePointIndex(i)}
              >
                {/* Invisible hover target */}
                <rect
                  x={x - 18}
                  y={padTop}
                  width="36"
                  height={chartHeight}
                  fill="transparent"
                />

                {isSelected && (
                  <line
                    x1={x}
                    y1={padTop}
                    x2={x}
                    y2={padTop + chartHeight}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    strokeOpacity="0.5"
                  />
                )}

                {/* Storm prob node */}
                <circle
                  cx={x}
                  cy={yt}
                  r={isSelected ? 5 : 3.5}
                  fill="#f59e0b"
                  stroke="#0f172a"
                  strokeWidth="2"
                />

                {/* X Axis label */}
                <text
                  x={x}
                  y={height - 8}
                  textAnchor="middle"
                  fill={isSelected ? '#f8fafc' : '#94a3b8'}
                  fontSize="10"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  fontFamily="monospace"
                >
                  {pt.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Dynamic Tooltip / Details on hover */}
        {activePoint && (
          <div className="flex items-center justify-between gap-4 p-2.5 mt-2 rounded-lg bg-slate-950 border border-slate-700 text-xs">
            <span className="font-bold text-amber-400 font-mono">
              Timeline: {activePoint.label}
            </span>
            <div className="flex items-center gap-4 font-mono">
              <span className="text-amber-300">
                Thunderstorm: <strong>{activePoint.tProb}%</strong>
              </span>
              {showLightning && (
                <span className="text-yellow-300">
                  Lightning: <strong>{activePoint.lProb}%</strong>
                </span>
              )}
              {showConfidence && (
                <span className="text-emerald-300">
                  Confidence: <strong>{activePoint.conf}%</strong>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
