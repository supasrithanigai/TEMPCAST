import React, { useState } from 'react';
import { PredictionExplanation } from '../../types';
import { DEMO_EXPLANATIONS } from '../../data/demoData';
import { Sparkles, Brain, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

interface ExplainabilityPanelProps {
  locationId?: string;
  explanation?: PredictionExplanation;
}

export const ExplainabilityPanel: React.FC<ExplainabilityPanelProps> = ({
  locationId = 'loc-01',
  explanation = DEMO_EXPLANATIONS[locationId] || DEMO_EXPLANATIONS['loc-01'],
}) => {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'Radar':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Lightning':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      case 'Satellite':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'NWP':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Surface':
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    }
  };

  return (
    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-purple-400 font-bold uppercase tracking-wider">
              XAI Feature Attribution
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
              SHAP INTERPRETABILITY
            </span>
          </div>
          <h3 className="text-base font-bold text-white mt-1 flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            Explainable AI: Why did the model predict this risk?
          </h3>
          <p className="text-xs text-slate-400">
            Feature contributions indicating atmospheric forces shifting probability from background climatology ({explanation.base_probability}%) to final nowcast ({explanation.final_probability}%).
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
          Dominant: <span className="text-amber-400 font-bold">{explanation.dominant_factor}</span>
        </div>
      </div>

      {/* Summary Narrative */}
      <div className="p-3.5 rounded-lg bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {explanation.summary}
        </p>
      </div>

      {/* Feature Attribution List / Waterfall */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono pb-1 border-b border-slate-800/60">
          <span>Atmospheric Feature</span>
          <span>Observed Value</span>
          <span>SHAP Impact (+Δ%)</span>
        </div>

        {explanation.features.map((feat) => {
          const isSelected = selectedFeature === feat.feature_name;
          const isPositive = feat.direction === 'increase';

          return (
            <div
              key={feat.feature_name}
              onClick={() => setSelectedFeature(isSelected ? null : feat.feature_name)}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-800/80 border-purple-500/60 shadow-sm'
                  : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/40 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono border ${getCategoryBadge(feat.category)}`}>
                    {feat.category}
                  </span>
                  <span className="text-xs font-semibold text-white">
                    {feat.display_name}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-slate-300 font-bold">{feat.value}</span>

                  <div className="flex items-center gap-1 min-w-[75px] justify-end">
                    {isPositive ? (
                      <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span className={`font-bold ${isPositive ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {isPositive ? `+${feat.shap_value.toFixed(1)}%` : `-${feat.shap_value.toFixed(1)}%`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar of Relative Feature Weight */}
              <div className="w-full h-1.5 rounded-full bg-slate-800 mt-2.5 overflow-hidden flex">
                <div
                  className={`h-full ${isPositive ? 'bg-rose-500' : 'bg-emerald-500'} transition-all`}
                  style={{ width: `${Math.min(100, feat.shap_value * 3)}%` }}
                />
              </div>

              {/* Expanded physical meteorological explanation */}
              {isSelected && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-700/60 text-xs text-slate-300 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed text-[11px] text-slate-300">
                    <strong className="text-white">Meteorological Basis: </strong>
                    {feat.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
        <span>Click any feature above to expand meteorological physical attribution</span>
        <span className="font-mono text-purple-400">Additive TreeSHAP / DeepSHAP Output</span>
      </div>
    </div>
  );
};
