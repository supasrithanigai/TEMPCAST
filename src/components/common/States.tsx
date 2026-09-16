import React from 'react';
import { AlertTriangle, RefreshCw, Inbox } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subtext?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Processing Atmospheric Telemetry...',
  subtext = 'Aligning Doppler radar sweeps & satellite imagery grids',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl bg-slate-900/40 border border-slate-800/80">
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-amber-400">
          <RefreshCw className="w-5 h-5 animate-pulse" />
        </div>
      </div>
      <h4 className="text-sm font-semibold tracking-wide text-slate-200 uppercase">{message}</h4>
      <p className="text-xs text-slate-400 mt-1 max-w-sm">{subtext}</p>
    </div>
  );
};

interface ErrorStateProps {
  title?: string;
  error?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Sensor Ingestion Interrupted',
  error = 'Unable to establish link with telemetry stream.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl bg-rose-950/20 border border-rose-900/40">
      <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 mb-3 border border-rose-500/20">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-semibold text-rose-300 uppercase tracking-wide">{title}</h4>
      <p className="text-xs text-rose-400/80 mt-1 max-w-md">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-1.5 text-xs font-medium rounded-lg bg-rose-900/40 text-rose-200 border border-rose-700/50 hover:bg-rose-800/50 transition-colors"
        >
          Retry Connection
        </button>
      )}
    </div>
  );
};

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Active Storm Cells Detected',
  message = 'Radar reflectivity across all sectors remains below convective threshold (<25 dBZ).',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl bg-slate-900/30 border border-slate-800/60">
      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
        <Inbox className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-semibold text-slate-300">{title}</h4>
      <p className="text-xs text-slate-400 mt-1 max-w-md">{message}</p>
    </div>
  );
};
