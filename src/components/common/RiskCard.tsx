import React from 'react';
import { RiskLevel } from '../../types';
import { CloudLightning, Zap, Shield, CheckCircle2 } from 'lucide-react';

interface RiskCardProps {
  title: string;
  riskLevel: RiskLevel;
  probability?: number;
  subtext?: string;
  type: 'thunderstorm' | 'lightning' | 'quality' | 'generic';
}

export const RiskCard: React.FC<RiskCardProps> = ({
  title,
  riskLevel,
  probability,
  subtext,
  type,
}) => {
  const getBadgeStyle = (level: RiskLevel) => {
    switch (level) {
      case 'HIGH':
        return {
          bg: 'bg-rose-500/15 border-rose-500/40 text-rose-400',
          indicator: 'bg-rose-500',
          glow: 'from-rose-500/10 to-transparent',
          label: 'HIGH RISK',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
          indicator: 'bg-amber-500',
          glow: 'from-amber-500/10 to-transparent',
          label: 'MEDIUM RISK',
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
          indicator: 'bg-emerald-500',
          glow: 'from-emerald-500/10 to-transparent',
          label: 'LOW RISK',
        };
    }
  };

  const style = getBadgeStyle(riskLevel);

  const getIcon = () => {
    switch (type) {
      case 'thunderstorm':
        return <CloudLightning className="w-5 h-5 text-amber-400" />;
      case 'lightning':
        return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'quality':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      default:
        return <Shield className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 transition-all hover:border-slate-700 shadow-sm flex flex-col justify-between">
      {/* Subtle top gradient glow */}
      <div className={`absolute -top-12 -right-12 w-28 h-28 rounded-full bg-gradient-to-br ${style.glow} blur-xl pointer-events-none`} />

      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700/70 shadow-sm">
              {getIcon()}
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-400 tracking-wider uppercase">{title}</h3>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
                  {probability !== undefined ? `${probability}%` : riskLevel}
                </span>
                {probability !== undefined && (
                  <span className="text-xs text-slate-400 font-medium">probability</span>
                )}
              </div>
            </div>
          </div>

          {/* Risk Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider font-mono border shadow-sm ${style.bg}`}
          >
            <span className={`w-2 h-2 rounded-full ${style.indicator} animate-pulse`} />
            {style.label}
          </span>
        </div>
      </div>

      {/* Visual meter bar */}
      <div className="mt-5 pt-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-medium">Threat Level</span>
          <span className="font-mono text-slate-200 font-semibold">
            {riskLevel === 'HIGH' ? 'Elevated Monitoring' : riskLevel === 'MEDIUM' ? 'Watch Threshold' : 'Nominal Baseline'}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden flex gap-1 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              riskLevel === 'LOW' || riskLevel === 'MEDIUM' || riskLevel === 'HIGH'
                ? 'bg-emerald-500 w-1/3'
                : 'bg-slate-700 w-1/3'
            }`}
          />
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              riskLevel === 'MEDIUM' || riskLevel === 'HIGH'
                ? 'bg-amber-500 w-1/3'
                : 'bg-slate-800 w-1/3'
            }`}
          />
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              riskLevel === 'HIGH' ? 'bg-rose-500 w-1/3 animate-pulse' : 'bg-slate-800 w-1/3'
            }`}
          />
        </div>
        {subtext && <p className="text-xs text-slate-400 mt-2.5 font-medium leading-relaxed">{subtext}</p>}
      </div>
    </div>
  );
};
