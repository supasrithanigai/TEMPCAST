import React from 'react';
import { AlertItem, RiskLevel } from '../../types';
import { AlertTriangle, Clock, MapPin, ShieldCheck, Zap, CloudRain, Wind } from 'lucide-react';

interface AlertCardProps {
  alert: AlertItem;
  compact?: boolean;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, compact = false }) => {
  const getRiskStyle = (level: RiskLevel) => {
    switch (level) {
      case 'HIGH':
        return {
          border: 'border-rose-500/50',
          bg: 'bg-rose-950/20 hover:bg-rose-950/30',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          accent: 'text-rose-400',
        };
      case 'MEDIUM':
        return {
          border: 'border-amber-500/50',
          bg: 'bg-amber-950/20 hover:bg-amber-950/30',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          accent: 'text-amber-400',
        };
      case 'LOW':
      default:
        return {
          border: 'border-emerald-500/40',
          bg: 'bg-emerald-950/10 hover:bg-emerald-950/20',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          accent: 'text-emerald-400',
        };
    }
  };

  const style = getRiskStyle(alert.risk_level);

  const getAlertIcon = () => {
    switch (alert.alert_type) {
      case 'Lightning Risk':
        return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'Heavy Rain Risk':
        return <CloudRain className="w-4 h-4 text-blue-400" />;
      case 'Severe Storm Risk':
        return <Wind className="w-4 h-4 text-purple-400" />;
      case 'Thunderstorm Risk':
      default:
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <div
      className={`rounded-xl border ${style.border} ${style.bg} p-4 transition-all shadow-sm`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-700">
            {getAlertIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white tracking-tight">{alert.headline}</h4>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                {alert.alert_id}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>{alert.location}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono border ${style.badge}`}>
            {alert.risk_level} ({alert.probability}%)
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-900 text-slate-300 border border-slate-800">
            {alert.status}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-300 mt-2.5 leading-relaxed font-normal">
        {alert.description}
      </p>

      {/* Instructions & Timing */}
      {!compact && (
        <div className="mt-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/70 text-xs space-y-2">
          <div className="text-slate-300 font-medium">
            <span className="text-amber-400 font-semibold uppercase tracking-wider text-[10px] mr-1.5">
              Disaster Management Protocol:
            </span>
            {alert.instructions}
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" /> Issued: {alert.issued_at}
            </span>
            <span className="flex items-center gap-1 text-slate-300 font-mono">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Valid: {alert.valid_until}
            </span>
          </div>
        </div>
      )}

      {/* Prototype alert warning */}
      <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <span>PROTOTYPE NOWCAST ALERT</span>
        <span className="text-rose-400/80">DO NOT USE FOR REAL EMERGENCY DISPATCH</span>
      </div>
    </div>
  );
};
