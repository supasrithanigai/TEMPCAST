import React, { useState } from 'react';
import { BarChart3, HelpCircle, AlertCircle } from 'lucide-react';

export const ModelEvaluationTable: React.FC = () => {
  const [showFormulas, setShowFormulas] = useState(false);

  return (
    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              Verification Framework
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              PROPOSED ALGORITHM
            </span>
          </div>
          <h3 className="text-base font-bold text-white mt-1 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            Verification Protocol &amp; Statistical Benchmark Standard
          </h3>
          <p className="text-xs text-slate-400">
            Formal meteorological verification framework designated for evaluating the proposed CNN + ConvLSTM model against optical flow and Eulerian persistence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFormulas(!showFormulas)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer border border-slate-700 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>{showFormulas ? 'Hide Metric Formulas' : 'View Metric Formulas'}</span>
          </button>
        </div>
      </div>

      {/* Awaiting benchmark notice */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-300">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-white">
            Awaiting Model Training &amp; Validation Dataset Run
          </p>
          <p className="text-slate-400 leading-relaxed">
            As per project standards, this is a <strong>proposed algorithm</strong>, not a pre-trained ML model. No synthetic accuracy or validation results are invented. Real skill scores (CSI, HSS, POD, FAR) will be computed once original radar/satellite datasets are passed through the training pipeline.
          </p>
        </div>
      </div>

      {/* Metric Formulas Reference Grid */}
      <div className="space-y-2.5">
        <span className="font-mono font-bold text-amber-300 text-xs block">
          Standard Meteorological Nowcast Metrics:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="font-mono text-emerald-400 font-bold text-xs">CSI (Critical Success Index):</span>
            <p className="text-[11px] text-slate-400 mt-1">
              <code className="text-slate-200 font-mono">Hits / (Hits + Misses + False Alarms)</code>. Evaluates severe event forecasting without credit for correct negatives.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="font-mono text-cyan-400 font-bold text-xs">HSS (Heidke Skill Score):</span>
            <p className="text-[11px] text-slate-400 mt-1">
              Measures prediction accuracy relative to random chance. Range: -∞ to 1.0 (1.0 = perfect forecast).
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="font-mono text-sky-400 font-bold text-xs">POD (Probability of Detection):</span>
            <p className="text-[11px] text-slate-400 mt-1">
              <code className="text-slate-200 font-mono">Hits / (Hits + Misses)</code>. The fraction of observed severe convective events that were correctly nowcasted.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="font-mono text-rose-400 font-bold text-xs">FAR (False Alarm Ratio):</span>
            <p className="text-[11px] text-slate-400 mt-1">
              <code className="text-slate-200 font-mono">False Alarms / (Hits + False Alarms)</code>. Fraction of predicted severe events that failed to materialize.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
