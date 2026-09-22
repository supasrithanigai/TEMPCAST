import React from 'react';
import { PredictionHorizon, LocationItem } from '../../types';
import { PredictionCard } from '../common/PredictionCard';
import { RiskChart } from '../common/RiskChart';
import { ModelPipeline } from '../common/ModelPipeline';
import { ModelEvaluationTable } from '../common/ModelEvaluationTable';
import {
  TrendingUp,
  Clock,
  Layers,
  FileQuestion,
  UploadCloud,
} from 'lucide-react';

interface PredictionsPageProps {
  location: LocationItem;
  predictions: PredictionHorizon[];
  onPredictionsUpdated?: (preds: PredictionHorizon[]) => void;
}

export const PredictionsPage: React.FC<PredictionsPageProps> = ({
  location,
  predictions,
}) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              AI Nowcasting Inference Engine
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              ORIGINAL DATASETS
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Short-Term (30–90m) Convective Risk Projections
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Spatio-temporal rollout sequence structured via Convolutional LSTM recurring cells conditioned on dual-pol radar reflectivity, satellite brightness temperatures, and atmospheric instability.
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono">
          Sector: <span className="text-amber-400 font-bold">{location.name}</span>
        </div>
      </div>

      {/* PREDICTION HORIZONS: 30m, 45m, 60m, 75m, 90m */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            Prediction Horizons (30m • 60m • 90m)
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {predictions.length > 0
              ? `Derived from original datasets (${predictions.length} Horizons)`
              : 'Awaiting Original Datasets'}
          </span>
        </div>

        {predictions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {predictions.map((p) => (
              <PredictionCard key={p.horizon_minutes} prediction={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-slate-800 text-amber-400 shrink-0">
                <FileQuestion className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-white">Awaiting Original Dataset</h4>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    No Inferred Horizons
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  This proposed algorithm does not invent nowcasting values. Once original meteorological tensor sequences are ingested, 30m, 60m, and 90m predictions will compute automatically.
                </p>
              </div>
            </div>
            <div className="text-xs text-slate-400 font-mono bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 shrink-0">
              Input: Doppler sweeps + Satellite IR
            </div>
          </div>
        )}
      </div>

      {/* RISK, LIGHTNING & CONFIDENCE PROGRESSION CHARTS */}
      <div className="space-y-4">
        <RiskChart
          predictions={predictions}
          title="Consolidated Risk, Lightning & Confidence Probability Curves (30 to 90 min)"
          showLightning={true}
          showConfidence={true}
        />
      </div>

      {/* HOW THE PREDICTION WORKS PIPELINE COMPONENT */}
      <ModelPipeline interactive={false} />

      {/* PREDICTION VERIFICATION & ACCURACY BENCHMARK TABLE */}
      <ModelEvaluationTable />
    </div>
  );
};
