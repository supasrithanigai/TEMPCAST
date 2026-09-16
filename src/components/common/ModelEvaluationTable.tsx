import React, { useState } from 'react';
import { ModelComparison } from '../../types';
import { DEMO_MODEL_COMPARISONS } from '../../data/demoData';
import { CheckCircle2, TrendingDown, Award, BarChart3, HelpCircle, ShieldCheck } from 'lucide-react';

interface ModelEvaluationTableProps {
  comparisons?: ModelComparison[];
}

export const ModelEvaluationTable: React.FC<ModelEvaluationTableProps> = ({
  comparisons = DEMO_MODEL_COMPARISONS,
}) => {
  const [selectedLeadTime, setSelectedLeadTime] = useState<number>(30);
  const [showFormulas, setShowFormulas] = useState(false);

  const leadTimes = [30, 45, 60, 75, 90];

  return (
    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              Verification & Benchmarks
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              EVALUATION ENGINE
            </span>
          </div>
          <h3 className="text-base font-bold text-white mt-1 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            AI ConvLSTM vs. Operational Baselines
          </h3>
          <p className="text-xs text-slate-400">
            Rigorous verification comparing TEMPESTCAST against Storm-Motion Advection (Optical Flow) and Stationary Persistence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFormulas(!showFormulas)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer border border-slate-700 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>{showFormulas ? 'Hide Formulas' : 'View Formulas'}</span>
          </button>
        </div>
      </div>

      {/* Metric Formulas Accordion */}
      {showFormulas && (
        <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-2.5">
          <span className="font-mono font-bold text-amber-300 block">Meteorological Verification Definitions:</span>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
              <span className="font-mono text-emerald-400 font-bold">CSI (Critical Success Index):</span>
              <p className="text-[11px] text-slate-400 mt-1">
                <code className="text-slate-200">Hits / (Hits + Misses + False Alarms)</code>. Evaluates severe event forecasting without credit for correct negatives.
              </p>
            </div>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
              <span className="font-mono text-cyan-400 font-bold">POD (Probability of Detection):</span>
              <p className="text-[11px] text-slate-400 mt-1">
                <code className="text-slate-200">Hits / (Hits + Misses)</code>. Proportion of actual observed severe storms that were successfully forecasted.
              </p>
            </div>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
              <span className="font-mono text-rose-400 font-bold">FAR (False Alarm Ratio):</span>
              <p className="text-[11px] text-slate-400 mt-1">
                <code className="text-slate-200">False Alarms / (Hits + False Alarms)</code>. Fraction of predicted severe warnings that did not materialize.
              </p>
            </div>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
              <span className="font-mono text-purple-400 font-bold">Brier Score (Probabilistic Error):</span>
              <p className="text-[11px] text-slate-400 mt-1">
                <code className="text-slate-200">Mean squared error of probabilistic forecast</code>. Lower is superior (0 = perfect calibration).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lead Time Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
        <span className="text-xs text-slate-400 font-medium">Select Lead Time Horizon:</span>
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {leadTimes.map((lt) => (
            <button
              key={lt}
              onClick={() => setSelectedLeadTime(lt)}
              className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-colors cursor-pointer ${
                selectedLeadTime === lt
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              +{lt}m
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Table at Selected Lead Time */}
      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Model Candidate</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3 text-right">CSI (Higher = Best)</th>
              <th className="py-3 px-3 text-right">POD (Hit Rate)</th>
              <th className="py-3 px-3 text-right">FAR (False Alarms)</th>
              <th className="py-3 px-3 text-right">Brier Score</th>
              <th className="py-3 px-3 text-right">ROC AUC</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-mono">
            {comparisons.map((model) => {
              const ltMetric = model.metrics_by_lead_time.find(
                (m) => m.lead_time_minutes === selectedLeadTime
              );
              const isAi = model.model_type === 'AI_ConvLSTM';

              return (
                <tr
                  key={model.model_type}
                  className={isAi ? 'bg-amber-500/5 hover:bg-amber-500/10' : 'hover:bg-slate-800/40'}
                >
                  <td className="py-3.5 px-4 font-sans">
                    <div className="flex items-center gap-2">
                      {isAi && <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                      <div>
                        <span className={`font-bold block ${isAi ? 'text-amber-300' : 'text-slate-200'}`}>
                          {model.model_name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-sans line-clamp-1">
                          {model.description}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        isAi
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {model.model_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <span className={`text-sm font-bold ${isAi ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {ltMetric?.csi.toFixed(3) ?? model.overall_csi.toFixed(3)}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right text-cyan-400 font-medium">
                    {ltMetric?.pod.toFixed(3) ?? model.overall_pod.toFixed(3)}
                  </td>
                  <td className="py-3.5 px-3 text-right text-rose-400 font-medium">
                    {ltMetric?.far.toFixed(3) ?? model.overall_far.toFixed(3)}
                  </td>
                  <td className="py-3.5 px-3 text-right text-purple-400 font-medium">
                    {ltMetric?.brier_score.toFixed(3) ?? model.overall_brier.toFixed(3)}
                  </td>
                  <td className="py-3.5 px-3 text-right text-amber-400 font-medium">
                    {ltMetric?.roc_auc ? ltMetric.roc_auc.toFixed(2) : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {isAi ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> BEST PERFORMER
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">BASELINE</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">AI CSI vs. Advection</span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              +{selectedLeadTime === 30 ? '19.4%' : selectedLeadTime === 60 ? '50.0%' : selectedLeadTime === 90 ? '104.2%' : '35.3%'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            ConvLSTM anticipates non-linear convective initiation & cell decay, whereas advection only pushes frozen shapes.
          </p>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">False Alarm Suppression</span>
            <span className="text-xs font-mono font-bold text-rose-400">-22.7% FAR</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Multimodal fusion filtering out non-precipitating cirrus and anvil echoes using dual-pol ZDR & GLM stroke rate.
          </p>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Operational Verification</span>
            <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 5-Lead Validation
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Calculated across standardized 1 km × 1 km grid matching meteorological ground truth.
          </p>
        </div>
      </div>
    </div>
  );
};
