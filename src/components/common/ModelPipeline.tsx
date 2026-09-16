import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  ArrowDown,
  Cpu,
  RefreshCw,
  Eye,
  CheckCircle,
} from 'lucide-react';

interface ModelPipelineProps {
  interactive?: boolean;
  onSimulateInference?: () => void;
  isSimulating?: boolean;
}

export const ModelPipeline: React.FC<ModelPipelineProps> = ({
  interactive = true,
  onSimulateInference,
  isSimulating = false,
}) => {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps = [
    {
      id: 'step-inputs',
      number: '01',
      title: 'Multi-Source Atmospheric Data Ingestion',
      category: 'Data Integration',
      sources: ['Radar (dBZ/ZDR)', 'Satellite (IR/WV)', 'Lightning (GLM)', 'AWS Weather Stations', 'NWP (HRRR/WRF)'],
      description:
        'Combines Doppler reflectivity volumes, geostationary cloud-top brightness temps, ground lightning strike clusters, surface met observations, and convective NWP fields.',
      tensors: 'Raw Sensor Telemetry Arrays',
    },
    {
      id: 'step-cleaning',
      number: '02',
      title: 'Data Cleaning & Quality Checking',
      category: 'Preprocessing',
      description:
        'Removes radar ground clutter, anomalous propagation (AP), beam blockage artifacts, and sensor dropouts using median filtering and range-height normalization.',
      tensors: 'Despeckled & Validated Sweeps',
    },
    {
      id: 'step-alignment',
      number: '03',
      title: 'Time & Location Spatio-Temporal Alignment',
      category: 'Interpolation',
      description:
        'Resamples multi-modal observations onto a unified 128 x 128 Cartesian grid (1 km spatial resolution, 5-minute temporal timestamp interval).',
      tensors: 'Tensor Shape: [Batch, Sequence=4, 128, 128, 6 Channels]',
    },
    {
      id: 'step-fe',
      number: '04',
      title: 'Feature Extraction & Gradient Normalization',
      category: 'Feature Engineering',
      description:
        'Computes spatial gradients (reflectivity cores, updraft velocity proxies, divergence fields) and normalizes atmospheric dynamic parameters into zero-mean tensors.',
      tensors: 'Tensor Normalization: 0.0 - 1.0',
    },
    {
      id: 'step-cnn',
      number: '05',
      title: 'CNN (Convolutional Neural Network)',
      category: 'Spatial Pattern Learning',
      highlight: true,
      description:
        'Learns spatial weather patterns such as storm structure, convective core shape, meso-cyclonic rotation signatures, and boundary locations from 2D grids.',
      tensors: 'Conv2D + BatchNorm + LeakyReLU Feature Maps [B, 4, 64, 64, 64]',
    },
    {
      id: 'step-convlstm',
      number: '06',
      title: 'ConvLSTM (Convolutional Long Short-Term Memory)',
      category: 'Temporal Evolution & Dynamics',
      highlight: true,
      description:
        'Learns how those spatial patterns change over time (t-30m, t-20m, t-10m, t0) and estimates future storm movement, cell development, and dissipation.',
      tensors: 'Recurrent State Rollout for +30m, +60m, +90m Horizons',
    },
    {
      id: 'step-prediction',
      number: '07',
      title: 'Risk Prediction & Multi-Head Classification',
      category: 'Inference',
      description:
        'Projects continuous probability distributions for thunderstorm occurrence, lightning strike density, and severity classification (Minor, Moderate, Severe, Extreme).',
      tensors: 'Output Probabilities (0-100%) + Calibrated Confidence Score',
    },
    {
      id: 'step-output',
      number: '08',
      title: '30–90 Minute Nowcast & Targeted Alerts',
      category: 'Decision Support',
      description:
        'Synthesizes location-specific risk alerts, GIS map polygon layers, and warning bulletins for disaster management authorities and vulnerable infrastructure.',
      tensors: 'GeoJSON Polygons & Early Warnings',
    },
  ];

  return (
    <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 sm:p-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              Proposed AI/ML Nowcasting Pipeline
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              PROPOSED AI MODEL / PROTOTYPE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end data ingestion, spatial CNN encoding, ConvLSTM temporal rollout, and GIS nowcast dispatch.
          </p>
        </div>

        {interactive && onSimulateInference && (
          <button
            onClick={onSimulateInference}
            disabled={isSimulating}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer shadow-sm shadow-amber-500/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Simulating Rollout...' : 'Simulate Pipeline Run'}</span>
          </button>
        )}
      </div>

      {/* Core Explanation Cards for CNN and ConvLSTM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
        <div className="p-4 rounded-xl bg-slate-950/70 border border-amber-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Cpu className="w-4 h-4" /> CNN (Convolutional Neural Network)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-semibold">
              Spatial Learning
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>Role:</strong> Learns <strong>spatial weather patterns</strong> such as storm structure, convective core location, echo tops, and cloud-to-ground lightning contours from multi-source 2D grids.
          </p>
          <div className="mt-2 text-[11px] font-mono text-slate-500">
            Key property: Preserves localized neighborhood relationships across multi-spectral channels.
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/70 border border-sky-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> ConvLSTM (Convolutional LSTM)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 font-semibold">
              Temporal Dynamics
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>Role:</strong> Learns <strong>how weather patterns change over time</strong> across preceding time steps ($t-30$m to $t_0$) and estimates future storm movement, intensification, and lightning cluster evolution ($t+30$m to $t+90$m).
          </p>
          <div className="mt-2 text-[11px] font-mono text-slate-500">
            Key property: Convolutional matrix gates retain spatial features inside recurrent memory states.
          </div>
        </div>
      </div>

      {/* Sequential Pipeline Stages */}
      <div className="space-y-2 mt-4">
        {steps.map((step, idx) => {
          const isSelected = activeStep === idx;
          const isHighlight = step.highlight;

          return (
            <div key={step.id}>
              <div
                onClick={() => setActiveStep(isSelected ? null : idx)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isHighlight
                    ? isSelected
                      ? 'bg-amber-950/20 border-amber-500 shadow-sm'
                      : 'bg-slate-950/60 border-amber-500/30 hover:border-amber-500/60'
                    : isSelected
                    ? 'bg-slate-950 border-slate-700'
                    : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-xs font-mono font-bold text-amber-400">
                      {step.number}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white tracking-tight">{step.title}</h4>
                        {isHighlight && (
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Core AI
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">{step.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="hidden sm:inline text-[11px] font-mono text-slate-500">
                      {step.tensors}
                    </span>
                    <button
                      className="text-slate-400 hover:text-white p-1"
                      aria-label="Toggle pipeline step details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-300 space-y-2">
                    <p className="leading-relaxed">{step.description}</p>
                    {step.sources && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {step.sources.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300"
                          >
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[10px] font-mono text-amber-400/90 pt-1">
                      <span>Internal Format: {step.tensors}</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Architecture Defined
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Connecting arrow */}
              {idx < steps.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="w-3.5 h-3.5 text-slate-700" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Student Prototype Disclaimer Box */}
      <div className="mt-5 p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 text-xs text-amber-300/90 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Scientific Notice:</strong> This is a disaster management student prototype. The CNN + ConvLSTM architecture is defined and structured for future training on historical NEXRAD Doppler volumes and GOES/GLM satellite datasets. Current predictions utilize simulated telemetry feeds.
        </p>
      </div>
    </div>
  );
};
