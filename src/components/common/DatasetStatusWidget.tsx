import React from 'react';
import {
  Database,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  Layers,
  Globe,
  MapPin,
  UploadCloud,
  ArrowRight,
  FileCheck,
  XCircle,
} from 'lucide-react';
import { DatasetStatusSummary } from '../../services/datasetService';

interface DatasetStatusWidgetProps {
  summary: DatasetStatusSummary;
  onNavigateDatasets: () => void;
  onSelectState?: (state: string) => void;
}

export const DatasetStatusWidget: React.FC<DatasetStatusWidgetProps> = ({
  summary,
  onNavigateDatasets,
  onSelectState,
}) => {
  const {
    status,
    title,
    totalFiles,
    datasetTypes,
    fileFormats,
    processingStatus,
    timeRange,
    geographicCoverage,
    detectedStates,
    selectedState,
    errorMessage,
  } = summary;

  return (
    <div
      id="dashboard-dataset-status-area"
      className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-sm relative overflow-hidden transition-all"
    >
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-amber-400">
              DATASET STATUS
            </span>
          </div>

          <div className="flex items-center gap-2.5 mt-1">
            {status === 'READY' && (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  {title}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  READY
                </span>
              </>
            )}

            {status === 'PROCESSING' && (
              <>
                <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  {title}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/15 border border-sky-500/30 text-sky-300 animate-pulse">
                  PROCESSING
                </span>
              </>
            )}

            {status === 'ERROR' && (
              <>
                <XCircle className="w-4 h-4 text-rose-400" />
                <h3 className="text-base sm:text-lg font-bold text-rose-300 tracking-tight flex items-center gap-2">
                  {title}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 border border-rose-500/30 text-rose-300">
                  ERROR
                </span>
              </>
            )}

            {status === 'NO_DATASET' && (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                <h3 className="text-base sm:text-lg font-bold text-slate-300 tracking-tight flex items-center gap-2">
                  {title}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 border border-slate-700 text-slate-400">
                  AWAITING UPLOAD
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={onNavigateDatasets}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-xs font-semibold text-amber-300 transition-colors cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{status === 'NO_DATASET' ? 'Upload Original Datasets' : 'Manage Datasets'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      {status === 'NO_DATASET' && (
        <div className="py-4 space-y-3">
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            No original dataset loaded. The dashboard does not use fake or simulated data. All telemetry, radar sweeps, storm tracking, and nowcast computations are awaiting original dataset uploads.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-500 block font-semibold">
                Total Files
              </span>
              <span className="text-sm font-bold text-slate-400 font-mono mt-0.5 block">0</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-500 block font-semibold">
                Status
              </span>
              <span className="text-sm font-bold text-slate-400 font-mono mt-0.5 block">
                NO DATASET
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-500 block font-semibold">
                Dataset Types
              </span>
              <span className="text-xs font-medium text-slate-500 mt-1 block">None Loaded</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-500 block font-semibold">
                State Coverage
              </span>
              <span className="text-xs font-medium text-slate-500 mt-1 block">
                Awaiting Dataset
              </span>
            </div>
          </div>
        </div>
      )}

      {status === 'PROCESSING' && (
        <div className="py-4 space-y-3">
          <div className="flex items-center gap-2 text-xs text-sky-300">
            <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
            <span>Validating and ingesting original dataset files...</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                Total Files
              </span>
              <span className="text-base font-bold text-white font-mono mt-0.5 block">
                {totalFiles}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                Status
              </span>
              <span className="text-sm font-bold text-sky-400 font-mono mt-0.5 block">
                {processingStatus}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                Formats Detected
              </span>
              <span className="text-xs font-bold text-slate-200 mt-1 block font-mono">
                {fileFormats.join(', ') || 'Scanning...'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                Types Detected
              </span>
              <span className="text-xs font-bold text-slate-200 mt-1 block truncate">
                {datasetTypes.join(' • ') || 'Detecting...'}
              </span>
            </div>
          </div>
        </div>
      )}

      {status === 'ERROR' && (
        <div className="py-4 space-y-3">
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-rose-200">Error Details:</span>
              <span className="font-mono text-[11px] text-rose-300">{errorMessage}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                Total Files
              </span>
              <span className="text-base font-bold text-white font-mono mt-0.5 block">
                {totalFiles}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                Processing Status
              </span>
              <span className="text-sm font-bold text-rose-400 font-mono mt-0.5 block">
                {processingStatus}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                Action Required
              </span>
              <span className="text-xs text-amber-300 mt-1 block">
                Check file formatting in Datasets
              </span>
            </div>
          </div>
        </div>
      )}

      {status === 'READY' && (
        <div className="py-4 space-y-4">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Total Files */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                Files
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-black text-white font-mono">{totalFiles}</span>
                <span className="text-[10px] text-emerald-400 font-mono">Original</span>
              </div>
            </div>

            {/* Processing Status */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                Status
              </span>
              <span className="text-base font-bold text-emerald-400 font-mono mt-0.5 block flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {processingStatus}
              </span>
            </div>

            {/* File Formats Detected */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                File Formats Detected
              </span>
              <span className="text-xs font-bold text-slate-200 font-mono mt-1 block">
                {fileFormats.join(' • ')}
              </span>
            </div>

            {/* Total Files readout */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                Total Files
              </span>
              <span className="text-base font-bold text-amber-300 font-mono mt-0.5 block">
                {totalFiles} file{totalFiles > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Types Detected Bar */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="font-semibold text-slate-300">Types:</span>
              <span className="text-slate-200 font-mono">
                {datasetTypes.length > 0 ? datasetTypes.join(' • ') : 'Original Telemetry'}
              </span>
            </div>
          </div>

          {/* Time Range & Geographic Coverage (Only displayed when actually present) */}
          {(timeRange || geographicCoverage) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {timeRange && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-mono font-semibold">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Data Time Range</span>
                  </div>
                  <div className="text-slate-200 font-mono text-xs font-semibold mt-1">
                    {timeRange}
                  </div>
                </div>
              )}

              {geographicCoverage && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-mono font-semibold">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Geographic Coverage</span>
                  </div>
                  <div className="text-slate-200 font-mono text-xs font-semibold mt-1">
                    {geographicCoverage}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STATE SELECTOR (BOUND TO UPLOADED ORIGINAL DATASETS)
          - If dataset contains only Tamil Nadu: show only Tamil Nadu
          - If dataset contains additional states: automatically show those states
          - Do not invent states or data
      ───────────────────────────────────────────────────────────── */}
      <div className="pt-3 mt-1 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="font-semibold text-slate-300">State / Geographic Domain:</span>
        </div>

        <div className="flex items-center gap-2">
          {detectedStates.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                Detected States ({detectedStates.length}):
              </span>
              <select
                id="dashboard-state-selector"
                value={selectedState || detectedStates[0]}
                onChange={(e) => onSelectState?.(e.target.value)}
                className="bg-slate-950 border border-amber-500/40 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                aria-label="Select state from uploaded original datasets"
              >
                {detectedStates.map((st) => (
                  <option key={st} value={st} className="bg-slate-900 text-slate-200">
                    {st}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <span className="text-xs font-mono text-slate-500 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg">
              No State (Awaiting Original Dataset)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
