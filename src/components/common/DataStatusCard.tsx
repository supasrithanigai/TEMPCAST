import React from 'react';
import { DataSourceItem, DataSourceStatus } from '../../types';
import { Radio, Satellite, Zap, Thermometer, Globe, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface DataStatusCardProps {
  source: DataSourceItem;
}

export const DataStatusCard: React.FC<DataStatusCardProps> = ({ source }) => {
  const getStatusBadge = (status: DataSourceStatus) => {
    switch (status) {
      case 'Available':
      case 'ORIGINAL DATASET':
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
          icon: CheckCircle2,
          dot: 'bg-emerald-400',
        };
      case 'Processing':
        return {
          bg: 'bg-sky-500/15 border-sky-500/40 text-sky-300',
          icon: Clock,
          dot: 'bg-sky-400',
        };
      case 'Delayed':
      case 'Degraded':
        return {
          bg: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
          icon: AlertTriangle,
          dot: 'bg-rose-400',
        };
      case 'Awaiting Dataset':
      default:
        return {
          bg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
          icon: Clock,
          dot: 'bg-amber-400',
        };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Radar':
        return <Radio className="w-5 h-5 text-amber-400" />;
      case 'Satellite':
        return <Satellite className="w-5 h-5 text-sky-400" />;
      case 'Lightning':
        return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'Weather':
        return <Thermometer className="w-5 h-5 text-emerald-400" />;
      case 'NWP':
      default:
        return <Globe className="w-5 h-5 text-purple-400" />;
    }
  };

  const badge = getStatusBadge(source.status);

  return (
    <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 hover:border-slate-700 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
            {getCategoryIcon(source.category)}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight">{source.name}</h4>
            <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>{source.sensor_network}</span>
              <span>•</span>
              <span className="font-mono">Lat: {source.latency_sec}s</span>
            </div>
          </div>
        </div>

        {/* Status Pill */}
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold border ${badge.bg}`}
        >
          <span className={`w-2 h-2 rounded-full ${badge.dot} animate-pulse`} />
          {source.status}
        </span>
      </div>

      {/* Numerical Metrics: Quality, Missing Data, Last Updated */}
      <div className="grid grid-cols-3 gap-2.5 my-3 text-center">
        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">
            Data Quality
          </span>
          <span className="text-base font-bold font-mono text-emerald-400">
            {source.data_quality_pct}%
          </span>
          <div className="w-full h-1 rounded-full bg-slate-800 mt-1.5 overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full"
              style={{ width: `${source.data_quality_pct}%` }}
            />
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">
            Missing Data
          </span>
          <span className="text-base font-bold font-mono text-amber-400">
            {source.missing_data_pct}%
          </span>
          <div className="w-full h-1 rounded-full bg-slate-800 mt-1.5 overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full"
              style={{ width: `${source.missing_data_pct * 10}%` }}
            />
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">
            Last Telemetry
          </span>
          <span className="text-xs font-bold font-mono text-slate-200 block mt-1 truncate">
            {source.last_updated}
          </span>
          <span className="text-[9px] text-slate-500 font-mono">Sync Interval: {source.temporal_resolution}</span>
        </div>
      </div>

      {/* Processing Status Description */}
      <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 text-xs">
        <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold mb-1">
          Processing Pipeline Stage:
        </div>
        <p className="text-slate-300 font-normal leading-relaxed">{source.processing_status}</p>
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2 pt-2 border-t border-slate-800/60">
          <span>Spatial Grid: {source.spatial_resolution}</span>
          <span>Feed: Prototype Ingest</span>
        </div>
      </div>
    </div>
  );
};
