import React, { useState, useEffect } from 'react';
import { PredictionHorizon, LocationItem, PredictionExplanation } from '../../types';
import { PredictionCard } from '../common/PredictionCard';
import { RiskChart } from '../common/RiskChart';
import { ModelPipeline } from '../common/ModelPipeline';
import { ModelEvaluationTable } from '../common/ModelEvaluationTable';
import { ExplainabilityPanel } from '../common/ExplainabilityPanel';
import { runCustomPrediction, fetchExplanation } from '../../services/api';
import {
  TrendingUp,
  Sliders,
  RefreshCw,
  BarChart2,
  Brain,
} from 'lucide-react';

interface PredictionsPageProps {
  location: LocationItem;
  predictions: PredictionHorizon[];
  onPredictionsUpdated: (preds: PredictionHorizon[]) => void;
}

export const PredictionsPage: React.FC<PredictionsPageProps> = ({
  location,
  predictions,
  onPredictionsUpdated,
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [sliderDbz, setSliderDbz] = useState(54);
  const [sliderCape, setSliderCape] = useState(2800);
  const [sliderHumidity, setSliderHumidity] = useState(78);
  const [explanation, setExplanation] = useState<PredictionExplanation | undefined>();

  useEffect(() => {
    fetchExplanation(location.id).then(setExplanation);
  }, [location.id]);

  const handleRunCustomSimulation = async () => {
    setIsSimulating(true);
    try {
      const updated = await runCustomPrediction({
        locationId: location.id,
        radarDbz: sliderDbz,
        cape: sliderCape,
        humidity: sliderHumidity,
      });
      onPredictionsUpdated(updated);
      const updatedExp = await fetchExplanation(location.id);
      setExplanation(updatedExp);
    } finally {
      setTimeout(() => setIsSimulating(false), 400);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Prototype Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
              AI Nowcasting Inference Engine
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              SIMULATION MODE
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Short-Term (30–90m) Convective Risk Projections
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Spatio-temporal rollout sequence generated via in-browser Convolutional LSTM recurring cells conditioned on dual-pol radar reflectivity, satellite brightness temperatures, and atmospheric instability.
          </p>
          <p className="text-[11px] text-amber-400/90 font-mono mt-1.5">
            Notice: All horizon predictions and risk scores are simulated demonstration data and are not official weather warnings.
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono">
          Sector: <span className="text-amber-400 font-bold">{location.name}</span>
        </div>
      </div>

      {/* ALL 5 PREDICTION HORIZONS: 30m, 45m, 60m, 75m, 90m */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            Prediction Horizons: 30m • 45m • 60m • 75m • 90m
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Updated via ConvLSTM Cell States ({predictions.length} Horizons)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {predictions.map((p) => (
            <PredictionCard key={p.horizon_minutes} prediction={p} />
          ))}
        </div>
      </div>

      {/* INTERACTIVE RISK, LIGHTNING & CONFIDENCE PROGRESSION CHARTS */}
      <div className="space-y-4">
        <RiskChart
          predictions={predictions}
          title="Consolidated Risk, Lightning & Confidence Probability Curves (30 to 90 min)"
          showLightning={true}
          showConfidence={true}
        />
      </div>

      {/* EXPLAINABLE AI ATTRIBUTION (SHAP VALUES) */}
      <ExplainabilityPanel locationId={location.id} explanation={explanation} />

      {/* INTERACTIVE ATMOSPHERIC SIMULATOR SLIDERS */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              Interactive Atmospheric Scenario Generator
            </h3>
            <p className="text-xs text-slate-400">
              Adjust simulated Doppler reflectivity and thermodynamic energy to re-evaluate nowcasting horizons.
            </p>
          </div>
          <button
            onClick={handleRunCustomSimulation}
            disabled={isSimulating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs cursor-pointer shadow-sm shadow-amber-500/20 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Evaluating Rollout...' : 'Re-Run Nowcast'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
          {/* Radar Reflectivity Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Radar Core Reflectivity</span>
              <span className="font-mono font-bold text-amber-400">{sliderDbz} dBZ</span>
            </div>
            <input
              type="range"
              min="20"
              max="75"
              step="1"
              value={sliderDbz}
              onChange={(e) => setSliderDbz(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>20 dBZ (Light)</span>
              <span>75 dBZ (Severe Hail)</span>
            </div>
          </div>

          {/* CAPE Energy Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">CAPE Instability Energy</span>
              <span className="font-mono font-bold text-rose-400">{sliderCape} J/kg</span>
            </div>
            <input
              type="range"
              min="500"
              max="4500"
              step="100"
              value={sliderCape}
              onChange={(e) => setSliderCape(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>500 J/kg (Stable)</span>
              <span>4500 J/kg (Extreme)</span>
            </div>
          </div>

          {/* Humidity Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Relative Humidity</span>
              <span className="font-mono font-bold text-cyan-400">{sliderHumidity}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="98"
              step="1"
              value={sliderHumidity}
              onChange={(e) => setSliderHumidity(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>40% (Dry Inflow)</span>
              <span>98% (Saturated)</span>
            </div>
          </div>
        </div>
      </div>

      {/* HOW THE PREDICTION WORKS PIPELINE COMPONENT */}
      <ModelPipeline
        interactive={true}
        onSimulateInference={handleRunCustomSimulation}
        isSimulating={isSimulating}
      />

      {/* PREDICTION VERIFICATION & ACCURACY BENCHMARK TABLE */}
      <ModelEvaluationTable />
    </div>
  );
};

