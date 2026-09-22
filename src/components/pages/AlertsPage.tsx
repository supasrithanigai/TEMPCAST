import React, { useState } from 'react';
import { AlertItem, RiskLevel } from '../../types';
import { AlertCard } from '../common/AlertCard';
import {
  Bell,
  ShieldAlert,
  Filter,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface AlertsPageProps {
  alerts: AlertItem[];
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ alerts }) => {
  const [filter, setFilter] = useState<'All' | 'Active' | 'High' | 'Medium' | 'Low'>('All');

  const filteredAlerts = alerts.filter((alt) => {
    if (filter === 'Active') return alt.status === 'ACTIVE' || alt.status === 'WARNING';
    if (filter === 'High') return alt.risk_level === 'HIGH';
    if (filter === 'Medium') return alt.risk_level === 'MEDIUM';
    if (filter === 'Low') return alt.risk_level === 'LOW';
    return true;
  });

  const activeCount = alerts.filter((a) => a.status === 'ACTIVE').length;
  const highCount = alerts.filter((a) => a.risk_level === 'HIGH').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-rose-400">
            <ShieldAlert className="w-4 h-4" />
            <span>DISASTER MANAGEMENT ADVISORIES &amp; NOWCAST BULLETINS</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Targeted Severe Weather &amp; Lightning Alerts
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Location-specific bulletins dispatched when 30–90 minute convective predictions exceed safety thresholds.
          </p>
        </div>

        {/* Prototype Alert Disclaimer Pill */}
        <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
          <span className="font-bold block text-[11px] uppercase tracking-wider text-amber-400">
            Original Datasets
          </span>
          <span className="text-[10px] text-slate-400">Targeted Advisory Engine</span>
        </div>
      </div>

      {/* Summary KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-xs text-slate-400 block">Total Alerts Logged</span>
          <span className="text-2xl font-bold font-mono text-white mt-1 block">
            {alerts.length}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-xs text-slate-400 block">Active Bulletins</span>
          <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">
            {activeCount}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-xs text-slate-400 block">High Risk Urgency</span>
          <span className="text-2xl font-bold font-mono text-rose-400 mt-1 block">
            {highCount}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-xs text-slate-400 block">Watch &amp; Standby</span>
          <span className="text-2xl font-bold font-mono text-sky-400 mt-1 block">
            {alerts.filter((a) => a.status === 'WATCH').length}
          </span>
        </div>
      </div>

      {/* Filter Tabs requested in prompt: All, Active, High, Medium, Low */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {(['All', 'Active', 'High', 'Medium', 'Low'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <span className="text-xs font-mono text-slate-500">
          Showing {filteredAlerts.length} of {alerts.length} bulletins
        </span>
      </div>

      {/* Alert Cards List or Empty State */}
      {filteredAlerts.length > 0 ? (
        <div className="space-y-3.5">
          {filteredAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-8 text-center space-y-2">
          <p className="text-sm font-bold text-white">No active alerts</p>
          <p className="text-xs text-slate-400">
            {alerts.length === 0
              ? 'Awaiting Original Dataset: Alert bulletins generate automatically when threshold conditions are exceeded in uploaded datasets.'
              : 'No alerts match the selected filter.'}
          </p>
        </div>
      )}

      {/* Strict Prototype Disclaimer Footer as required by user prompt */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-amber-300 uppercase tracking-wide">
            IMPORTANT METEOROLOGICAL NOTICE
          </h4>
          <p className="mt-1 text-slate-400 leading-relaxed">
            These are automated bulletins derived from uploaded dataset parameters for disaster management system evaluation. Always cross-reference with official National Meteorological Department warnings before taking emergency actions.
          </p>
        </div>
      </div>
    </div>
  );
};
