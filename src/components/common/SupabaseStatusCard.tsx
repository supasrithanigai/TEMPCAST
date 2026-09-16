import React, { useState } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Code2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import {
  isSupabaseConfigured,
  supabase,
  getSupabaseSchemaSql,
  activeSupabaseUrl,
  activeSupabaseKey,
} from '../../services/supabaseClient';

export const SupabaseStatusCard: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'success' | 'warning' | 'error';
    message: string;
  }>({
    status: 'idle',
    message: '',
  });

  const schemaSql = getSupabaseSchemaSql();

  const handleCopySql = () => {
    navigator.clipboard.writeText(schemaSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTestConnection = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setTestResult({
        status: 'warning',
        message: 'Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      });
      return;
    }

    setTesting(true);
    try {
      const { data, error } = await supabase.from('locations').select('count', { count: 'exact', head: true });
      if (error) {
        if (error.code === '42P01') {
          // Table does not exist yet
          setTestResult({
            status: 'warning',
            message: 'Connected to Supabase project, but tables are not created yet. Run the SQL schema below in your Supabase SQL editor!',
          });
        } else {
          setTestResult({
            status: 'error',
            message: `Supabase connection returned error: ${error.message}`,
          });
        }
      } else {
        setTestResult({
          status: 'success',
          message: 'Successfully connected to Supabase! The database is live and responding.',
        });
      }
    } catch (err) {
      setTestResult({
        status: 'error',
        message: `Network or fetch failure: ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const tables = [
    { name: 'locations', role: 'GIS centroids, names, alert levels' },
    { name: 'weather_observations', role: 'Surface observations (Radar dBZ, CAPE, wind, humidity)' },
    { name: 'nowcast_predictions', role: '30, 60, 90-min AI/simulated horizons' },
    { name: 'storm_entities', role: 'Cell coordinates, track vectors, intensity' },
    { name: 'alerts', role: 'Civil safety alerts, severity, and bulletins' },
  ];

  return (
    <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${
            isSupabaseConfigured 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}>
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Supabase Cloud Database</h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                isSupabaseConfigured
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {isSupabaseConfigured ? 'Credentials Active' : 'Awaiting URL & Key'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              PostgreSQL storage for real-time telemetry, model horizons, and storm tracking vectors
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>Test Connection</span>
          </button>
          <button
            onClick={handleCopySql}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-xs font-medium text-amber-300 border border-amber-500/40 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'SQL Copied!' : 'Copy SQL Schema'}</span>
          </button>
        </div>
      </div>

      {/* Test feedback */}
      {testResult.status !== 'idle' && (
        <div className={`p-3 rounded-lg text-xs flex items-start gap-2.5 border ${
          testResult.status === 'success'
            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
            : testResult.status === 'warning'
            ? 'bg-amber-950/40 border-amber-800 text-amber-200'
            : 'bg-rose-950/40 border-rose-800 text-rose-200'
        }`}>
          {testResult.status === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          )}
          <span>{testResult.message}</span>
        </div>
      )}

      {/* Configuration Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1">
          <div className="text-slate-400 font-mono text-[11px]">VITE_SUPABASE_URL</div>
          <div className="font-mono text-emerald-300 truncate font-semibold">
            {activeSupabaseUrl}
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            Connected Supabase project endpoint
          </p>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1">
          <div className="text-slate-400 font-mono text-[11px]">VITE_SUPABASE_ANON_KEY</div>
          <div className="font-mono text-emerald-300 truncate">
            {`${activeSupabaseKey.slice(0, 18)}••••••••••••••••${activeSupabaseKey.slice(-6)}`}
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            Public Anon Key authenticated with Row Level Security (RLS)
          </p>
        </div>
      </div>

      {/* Target Tables */}
      <div>
        <div className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
          <span>Target Relational Tables ({tables.length})</span>
          <span className="text-[10px] text-slate-500 font-mono">Row-Level Security (RLS) Enabled</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {tables.map((t) => (
            <div key={t.name} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="font-mono font-bold text-amber-400 text-xs">{t.name}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{t.role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Collapsible SQL Schema Preview */}
      <div className="pt-1">
        <button
          onClick={() => setShowSql(!showSql)}
          className="w-full p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300 flex items-center justify-between transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-amber-400" />
            <span>PostgreSQL / Supabase Schema SQL Setup Script</span>
          </span>
          {showSql ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showSql && (
          <div className="mt-2 p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Paste into your Supabase Dashboard &rarr; SQL Editor</span>
              <button
                onClick={handleCopySql}
                className="text-amber-400 hover:text-amber-300 text-xs flex items-center gap-1 cursor-pointer font-mono"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono text-slate-300 max-h-60 overflow-y-auto bg-slate-900/90 p-3 rounded border border-slate-800 leading-relaxed select-all">
              {schemaSql}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
