import React from 'react';
import { DataSourceItem } from '../../types';
import { DataStatusCard } from '../common/DataStatusCard';
import { SupabaseStatusCard } from '../common/SupabaseStatusCard';
import {
  Database,
  ArrowDown,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Server,
} from 'lucide-react';

interface DataStatusPageProps {
  dataSources: DataSourceItem[];
}

export const DataStatusPage: React.FC<DataStatusPageProps> = ({ dataSources }) => {
  const avgQuality = Math.round(
    dataSources.reduce((acc, s) => acc + s.data_quality_pct, 0) / dataSources.length
  );
  const avgMissing = (
    dataSources.reduce((acc, s) => acc + s.missing_data_pct, 0) / dataSources.length
  ).toFixed(1);

  // Visual Pipeline Stages requested:
  // DATA SOURCES ↓ DATA CLEANING ↓ QUALITY CHECK ↓ TIME & LOCATION ALIGNMENT ↓ FEATURE EXTRACTION ↓ AI MODEL
  const pipelineStages = [
    {
      title: 'DATA SOURCES',
      detail: 'Multi-sensor ingestion of NEXRAD Radar, GOES Satellite, GLM Lightning, AWS In-situ, and NWP',
      status: 'Online (Demo Feeds)',
      icon: Database,
    },
    {
      title: 'DATA CLEANING',
      detail: 'Clutter filtering, speckle reduction, anomalous propagation (AP) removal, and outlier clipping',
      status: 'Active',
      icon: ShieldCheck,
    },
    {
      title: 'QUALITY CHECK',
      detail: 'Temporal continuity check, sensor boundary validation, and missing telemetry imputation',
      status: 'Passed (96.4%)',
      icon: CheckCircle2,
    },
    {
      title: 'TIME & LOCATION ALIGNMENT',
      detail: 'Spatial re-projection to 1km Cartesian grid & synchronized 5-minute time slice stacking',
      status: 'Synchronized',
      icon: Server,
    },
    {
      title: 'FEATURE EXTRACTION',
      detail: 'Reflectivity gradient tensors, updraft proxies, shear parameters, and multi-channel normalization',
      status: 'Normalized [0-1]',
      icon: Sparkles,
    },
    {
      title: 'AI MODEL',
      detail: 'Spatial pattern encoding with CNN + multi-horizon temporal rollout using ConvLSTM',
      status: 'Prototype Simulation',
      icon: Cpu,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>METEOROLOGICAL INGESTION &amp; PIPELINE TELEMETRY</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Data Source Health &amp; Preprocessing Pipeline
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time feed diagnostics across all five multi-modal atmospheric inputs and downstream processing stages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
            Composite Quality: <strong className="text-emerald-400">{avgQuality}%</strong>
          </span>
        </div>
      </div>

      {/* Original Dataset Ingestion Banner */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            <strong>Dataset Ingestion Pipeline:</strong> Telemetry streams and original uploaded datasets are validated against schema standards.
          </span>
        </div>
        <span className="hidden sm:inline font-mono text-[10px] text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded bg-emerald-500/10">
          ORIGINAL DATASETS
        </span>
      </div>

      {/* The 5 Atmospheric Data Sources Cards */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Database className="w-4 h-4 text-amber-400" />
          Primary Atmospheric Sensor Inputs (5 Sources)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dataSources.map((source) => (
            <DataStatusCard key={source.id} source={source} />
          ))}
        </div>
      </div>

      {/* Supabase Database Integration & Status */}
      <SupabaseStatusCard />

      {/* Visual Data Ingestion & Transformation Pipeline */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5">
        <div className="pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-sky-400" />
            End-to-End Data Transformation &amp; Verification Flow
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Sequential processing stages from raw multi-sensor telemetry to tensor-ready AI input arrays
          </p>
        </div>

        <div className="mt-5 space-y-2">
          {pipelineStages.map((stage, idx) => {
            const Icon = stage.icon;
            const isLast = idx === pipelineStages.length - 1;

            return (
              <div key={stage.title}>
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-amber-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white tracking-wider">
                          {stage.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">Stage 0{idx + 1}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{stage.detail}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded text-xs font-mono font-medium bg-slate-900 border border-slate-800 text-slate-300 self-start sm:self-auto whitespace-nowrap">
                    {stage.status}
                  </span>
                </div>

                {!isLast && (
                  <div className="flex justify-center py-1">
                    <ArrowDown className="w-4 h-4 text-slate-700" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
