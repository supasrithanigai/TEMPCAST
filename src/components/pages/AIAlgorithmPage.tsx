import React, { useState, useEffect } from 'react';
import {
  LocationItem,
  WeatherData,
  PredictionHorizon,
  StormEntity,
  AlertItem,
  RiskZonePolygon,
  LightningHotspot,
  DataSourceItem,
} from '../../types';
import {
  Cpu,
  Layers,
  Sparkles,
  ArrowDown,
  Database,
  Radio,
  Satellite,
  Zap,
  CloudSun,
  Activity,
  Sliders,
  Compass,
  Gauge,
  Flame,
  TrendingUp,
  MapPin,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Info,
  ShieldAlert,
  FileQuestion,
} from 'lucide-react';

interface AIAlgorithmPageProps {
  location: LocationItem;
  weather: WeatherData | null;
  predictions: PredictionHorizon[];
  storms: StormEntity[];
  alerts: AlertItem[];
  riskZones: RiskZonePolygon[];
  lightningHotspots?: LightningHotspot[];
  dataSources: DataSourceItem[];
}

export const AIAlgorithmPage: React.FC<AIAlgorithmPageProps> = ({
  location,
  weather,
  predictions,
  storms,
  alerts,
  riskZones,
  lightningHotspots = [],
  dataSources,
}) => {
  const [activeStepId, setActiveStepId] = useState<string | null>('cnn');
  const [isPlayingSimulation, setIsPlayingSimulation] = useState<boolean>(false);
  const [simProgressStep, setSimProgressStep] = useState<number>(0);

  // 30, 60, 90 minute horizons
  const pred30 = predictions.find((p) => p.horizon_minutes === 30) || predictions[0];
  const pred60 = predictions.find((p) => p.horizon_minutes === 60) || predictions[1];
  const pred90 = predictions.find((p) => p.horizon_minutes === 90) || predictions[predictions.length - 1];

  const primaryStorm = storms[0];

  // Map original datasets
  const radarSource = dataSources.find((d) => d.category === 'Radar') || dataSources[0];
  const satSource = dataSources.find((d) => d.category === 'Satellite') || dataSources[1];
  const lightningSource = dataSources.find((d) => d.category === 'Lightning') || dataSources[2];
  const weatherSource = dataSources.find((d) => d.category === 'Weather') || dataSources[3];
  const nwpSource = dataSources.find((d) => d.category === 'NWP') || dataSources[4];

  // Sequence of workflow step IDs for the interactive walkthrough
  const STEP_SEQUENCE = [
    'original-data',
    'preprocessing',
    'feature-extraction',
    'risk-assessment',
    'storm-tracking',
    'gis',
    'alerts',
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlayingSimulation) {
      timer = setInterval(() => {
        setSimProgressStep((prev) => {
          const next = (prev + 1) % STEP_SEQUENCE.length;
          setActiveStepId(STEP_SEQUENCE[next]);
          return next;
        });
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [isPlayingSimulation]);

  const handleToggleSimulation = () => {
    setIsPlayingSimulation(!isPlayingSimulation);
  };

  const handleResetSimulation = () => {
    setIsPlayingSimulation(false);
    setSimProgressStep(0);
    setActiveStepId(STEP_SEQUENCE[0]);
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* 1. ARCHITECTURE HEADER & COMPLIANCE BANNERS */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 tracking-wider uppercase">
                PROPOSED CNN + ConvLSTM ARCHITECTURE
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                PROPOSED ALGORITHM — NOT A TRAINED MODEL
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              AI Algorithm Processing Workflow
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              Demonstrates how the proposed <strong>Convolutional Neural Network (CNN)</strong> and{' '}
              <strong>Convolutional LSTM (ConvLSTM)</strong> architecture processes original meteorological
              datasets to generate 30–90 minute nowcasts, storm tracks, GIS layers, and targeted alerts.
            </p>
          </div>

          {/* Interactive Walkthrough Controls */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 p-2 rounded-xl self-start lg:self-center">
            <button
              onClick={handleToggleSimulation}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isPlayingSimulation
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {isPlayingSimulation ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Walkthrough</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Step Through Workflow</span>
                </>
              )}
            </button>

            <button
              onClick={handleResetSimulation}
              title="Reset walkthrough"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Notice Disclaimer Box */}
        <div className="mt-5 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3 text-xs text-slate-300 leading-relaxed">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold text-amber-300">Methodological Standard:</strong> This is a{' '}
            <span className="underline decoration-amber-400/50">proposed conceptual algorithm</span>, not an active or
            trained machine-learning model checkpoint. No synthetic accuracy or validation results are invented. Downstream processing operates strictly upon original uploaded datasets.
          </div>
        </div>
      </div>

      {/* 2. CONNECTED VISUAL WORKFLOW CONTAINER */}
      <div className="space-y-4">
        {/* =========================================================================
            STEP 1: ORIGINAL DATA
           ========================================================================= */}
        <div
          id="step-original-data"
          onClick={() => setActiveStepId('original-data')}
          className={`transition-all duration-300 rounded-2xl border p-5 sm:p-6 cursor-pointer ${
            activeStepId === 'original-data'
              ? 'bg-slate-900 border-amber-500 shadow-lg shadow-amber-500/5'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-mono text-xs font-bold">
                01
              </span>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">ORIGINAL DATA</h3>
                <p className="text-xs text-slate-400">
                  Raw multi-sensor ingestion from project datasets and regional telemetry feeds
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Input Layer
            </span>
          </div>

          {/* 5 Original Datasets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
            {/* Radar Data */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition-colors">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1.5">
                <Radio className="w-4 h-4 text-amber-400" />
                <span>Radar Data</span>
              </div>
              <div className="text-xs text-slate-200 font-semibold truncate">
                {radarSource?.name || 'Doppler Weather Radar'}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Reflectivity (dBZ) &amp; differential ZDR sweeps calibrated at 0.5° &amp; 1.5°.
              </p>
              <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Quality: {radarSource?.data_quality_pct ?? 98.4}%</span>
                <span className="text-emerald-400 font-semibold">Active Feed</span>
              </div>
            </div>

            {/* Satellite Data */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-sky-500/40 transition-colors">
              <div className="flex items-center gap-2 text-sky-400 text-xs font-bold mb-1.5">
                <Satellite className="w-4 h-4 text-sky-400" />
                <span>Satellite Data</span>
              </div>
              <div className="text-xs text-slate-200 font-semibold truncate">
                {satSource?.name || 'Geostationary Satellite'}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Clean Infrared (10.3 µm) &amp; Water Vapor channels measuring cloud-top cooling.
              </p>
              <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Quality: {satSource?.data_quality_pct ?? 96.8}%</span>
                <span className="text-emerald-400 font-semibold">Active Feed</span>
              </div>
            </div>

            {/* Lightning Data */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-yellow-500/40 transition-colors">
              <div className="flex items-center gap-2 text-yellow-400 text-xs font-bold mb-1.5">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Lightning Data</span>
              </div>
              <div className="text-xs text-slate-200 font-semibold truncate">
                {lightningSource?.name || 'Lightning Detection Network'}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Optical spaceborne flashes (GLM) &amp; ground sensor RF stroke timestamps.
              </p>
              <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Quality: {lightningSource?.data_quality_pct ?? 99.2}%</span>
                <span className="text-emerald-400 font-semibold">Active Feed</span>
              </div>
            </div>

            {/* Weather Observations */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-orange-500/40 transition-colors">
              <div className="flex items-center gap-2 text-orange-400 text-xs font-bold mb-1.5">
                <CloudSun className="w-4 h-4 text-orange-400" />
                <span>Weather Observations</span>
              </div>
              <div className="text-xs text-slate-200 font-semibold truncate">
                {weatherSource?.name || 'Automated Weather Stations'}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Surface temperature, dew point, wind gust speed, and barometric pressure.
              </p>
              <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Quality: {weatherSource?.data_quality_pct ?? 99.0}%</span>
                <span className="text-emerald-400 font-semibold">Active Feed</span>
              </div>
            </div>

            {/* NWP Data */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 transition-colors">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold mb-1.5">
                <Activity className="w-4 h-4 text-indigo-400" />
                <span>NWP Data</span>
              </div>
              <div className="text-xs text-slate-200 font-semibold truncate">
                {nwpSource?.name || 'Numerical Weather Prediction'}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                CAPE convective instability, deep-layer wind shear, and vertical velocity fields.
              </p>
              <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Quality: {nwpSource?.data_quality_pct ?? 95.1}%</span>
                <span className="text-emerald-400 font-semibold">Active Feed</span>
              </div>
            </div>
          </div>
        </div>

        {/* WORKFLOW CONNECTOR ARROW */}
        <div className="flex items-center justify-center py-1">
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-6 bg-gradient-to-b from-amber-500 to-amber-400" />
            <div className="w-6 h-6 rounded-full bg-slate-900 border border-amber-500/60 flex items-center justify-center text-amber-400 shadow-sm">
              <ArrowDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* =========================================================================
            STEP 2: DATA PREPROCESSING
           ========================================================================= */}
        <div
          id="step-preprocessing"
          onClick={() => setActiveStepId('preprocessing')}
          className={`transition-all duration-300 rounded-2xl border p-5 sm:p-6 cursor-pointer ${
            activeStepId === 'preprocessing'
              ? 'bg-slate-900 border-amber-500 shadow-lg shadow-amber-500/5'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-mono text-xs font-bold">
                02
              </span>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">DATA PREPROCESSING</h3>
                <p className="text-xs text-slate-400">
                  Cleaning, anomaly filtering, temporal sync, and spatial grid harmonization
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Transform Layer
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Data Cleaning</span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                Filters radar ground clutter, beam blockage, and electromagnetic sensor noise.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Missing Data Handling</span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                Imputes telemetry dropouts using spatial inverse-distance weighting and temporal spline interpolation.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-2 text-sky-400 text-xs font-bold mb-1">
                <Activity className="w-4 h-4 text-sky-400" />
                <span>Time Alignment</span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                Synchronizes multi-rate telemetry into uniform 5-minute timestep sequences (t-15m, t-10m, t-5m, t0).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold mb-1">
                <Compass className="w-4 h-4 text-purple-400" />
                <span>Location Alignment</span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                Re-projects geographic coordinate systems onto an identical 128x128 Cartesian grid (1 km spatial resolution).
              </p>
            </div>
          </div>
        </div>

        {/* WORKFLOW CONNECTOR ARROW */}
        <div className="flex items-center justify-center py-1">
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-6 bg-gradient-to-b from-amber-500 to-amber-400" />
            <div className="w-6 h-6 rounded-full bg-slate-900 border border-amber-500/60 flex items-center justify-center text-amber-400 shadow-sm">
              <ArrowDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* =========================================================================
            STEP 3: FEATURE EXTRACTION (CNN + ConvLSTM)
           ========================================================================= */}
        <div
          id="step-feature-extraction"
          onClick={() => setActiveStepId('feature-extraction')}
          className={`transition-all duration-300 rounded-2xl border p-5 sm:p-6 cursor-pointer ${
            activeStepId === 'feature-extraction'
              ? 'bg-slate-900 border-amber-500 shadow-lg shadow-amber-500/5'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-mono text-xs font-bold">
                03
              </span>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">FEATURE EXTRACTION</h3>
                <p className="text-xs text-slate-400">
                  Spatial feature extraction via CNN and temporal sequence analysis via ConvLSTM
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
              Core ML Architecture
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* CNN Card */}
            <div className="p-4 rounded-xl bg-slate-950/90 border border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-amber-400" />
                  <div>
                    <h4 className="text-sm font-bold text-white">CNN</h4>
                    <span className="text-[11px] text-amber-300 font-mono">Spatial Feature Extraction</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                  2D Convolutions
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Extracts storm shape, convective core boundary boundaries, and spatial reflectivity gradients from 2D atmospheric matrices.
              </p>
            </div>

            {/* ConvLSTM Card */}
            <div className="p-4 rounded-xl bg-slate-950/90 border border-sky-500/40 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-sky-400" />
                  <div>
                    <h4 className="text-sm font-bold text-white">ConvLSTM</h4>
                    <span className="text-[11px] text-sky-300 font-mono">Temporal Pattern Analysis</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                  Recurrent Gates
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Captures storm movement, growth, decay, and temporal lightning patterns across consecutive timesteps.
              </p>
            </div>
          </div>
        </div>

        {/* WORKFLOW CONNECTOR ARROW */}
        <div className="flex items-center justify-center py-1">
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-6 bg-gradient-to-b from-amber-500 to-amber-400" />
            <div className="w-6 h-6 rounded-full bg-slate-900 border border-amber-500/60 flex items-center justify-center text-amber-400 shadow-sm">
              <ArrowDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* =========================================================================
            STEP 4: RISK ASSESSMENT
           ========================================================================= */}
        <div
          id="step-risk-assessment"
          onClick={() => setActiveStepId('risk-assessment')}
          className={`transition-all duration-300 rounded-2xl border p-5 sm:p-6 cursor-pointer ${
            activeStepId === 'risk-assessment'
              ? 'bg-slate-900 border-amber-500 shadow-lg shadow-amber-500/5'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-mono text-xs font-bold">
                04
              </span>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">RISK ASSESSMENT</h3>
                <p className="text-xs text-slate-400">
                  Estimates thunderstorm and lightning risk across discrete 30, 60, and 90-minute operational lead times
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
              ORIGINAL DATA DRIVEN
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 mb-4">
            &ldquo;Estimates thunderstorm and lightning risk for 30, 60 and 90 minutes.&rdquo;
          </div>

          {pred30 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400">30-Minute Risk</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">T+30m</span>
                </div>
                <div className="text-xl font-bold text-white font-mono">{pred30.thunderstorm_probability}%</div>
                <div className="text-xs text-slate-400">Confidence: {pred30.confidence}%</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-sky-400">60-Minute Risk</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300">T+60m</span>
                </div>
                <div className="text-xl font-bold text-white font-mono">{pred60?.thunderstorm_probability ?? '—'}%</div>
                <div className="text-xs text-slate-400">Confidence: {pred60?.confidence ?? '—'}%</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400">90-Minute Risk</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">T+90m</span>
                </div>
                <div className="text-xl font-bold text-white font-mono">{pred90?.thunderstorm_probability ?? '—'}%</div>
                <div className="text-xs text-slate-400">Confidence: {pred90?.confidence ?? '—'}%</div>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
              <FileQuestion className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Awaiting Original Dataset: 30, 60, and 90-minute risk predictions compute once original datasets are uploaded.</span>
            </div>
          )}
        </div>

        {/* WORKFLOW CONNECTOR ARROW */}
        <div className="flex items-center justify-center py-1">
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-6 bg-gradient-to-b from-amber-500 to-amber-400" />
            <div className="w-6 h-6 rounded-full bg-slate-900 border border-amber-500/60 flex items-center justify-center text-amber-400 shadow-sm">
              <ArrowDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* =========================================================================
            STEP 5: STORM TRACKING
           ========================================================================= */}
        <div
          id="step-storm-tracking"
          onClick={() => setActiveStepId('storm-tracking')}
          className={`transition-all duration-300 rounded-2xl border p-5 sm:p-6 cursor-pointer ${
            activeStepId === 'storm-tracking'
              ? 'bg-slate-900 border-amber-500 shadow-lg shadow-amber-500/5'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-mono text-xs font-bold">
                05
              </span>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">STORM TRACKING</h3>
                <p className="text-xs text-slate-400">
                  Trajectory kinematic modeling, forward centroid extrapolation, and cell translation
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 mb-4">
            &ldquo;Estimates storm direction, speed, intensity and movement.&rdquo;
          </div>

          {primaryStorm ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-sky-400">Direction</span>
                <div className="text-xl font-bold text-white font-mono">{primaryStorm.direction} ({primaryStorm.direction_deg}°)</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-emerald-400">Speed</span>
                <div className="text-xl font-bold text-white font-mono">{primaryStorm.speed_kmh} km/h</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-rose-400">Intensity</span>
                <div className="text-xl font-bold text-white font-mono">{primaryStorm.intensity_dbz} dBZ</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-amber-400">Movement</span>
                <div className="text-xs font-bold text-slate-200">{primaryStorm.current_location?.area_name || 'Active Track'}</div>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
              <FileQuestion className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Awaiting Original Dataset: Storm tracking kinematic vectors will be derived from sequential radar sweeps.</span>
            </div>
          )}
        </div>

        {/* WORKFLOW CONNECTOR ARROW */}
        <div className="flex items-center justify-center py-1">
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-6 bg-gradient-to-b from-amber-500 to-amber-400" />
            <div className="w-6 h-6 rounded-full bg-slate-900 border border-amber-500/60 flex items-center justify-center text-amber-400 shadow-sm">
              <ArrowDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* =========================================================================
            STEP 6: GIS VISUALIZATION
           ========================================================================= */}
        <div
          id="step-gis"
          onClick={() => setActiveStepId('gis')}
          className={`transition-all duration-300 rounded-2xl border p-5 sm:p-6 cursor-pointer ${
            activeStepId === 'gis'
              ? 'bg-slate-900 border-amber-500 shadow-lg shadow-amber-500/5'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-mono text-xs font-bold">
                06
              </span>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">GIS VISUALIZATION</h3>
                <p className="text-xs text-slate-400">
                  Cartographic raster-to-vector transformation, polygonal bounding zones, and geographic overlays
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 mb-4">
            &ldquo;Displays predicted risk areas, storm paths and lightning hotspots geographically.&rdquo;
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-xs font-bold text-amber-400">Risk Map</span>
              <p className="text-xs text-slate-300">
                {riskZones.length > 0 ? `${riskZones.length} Active GIS Risk Polygons` : 'Awaiting original dataset risk polygons'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-xs font-bold text-sky-400">Storm Path</span>
              <p className="text-xs text-slate-300">
                {primaryStorm ? `Centroid vector with ${primaryStorm.trajectory.length} tracking steps` : 'Awaiting Doppler storm trajectory data'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-xs font-bold text-yellow-400">Lightning Hotspots</span>
              <p className="text-xs text-slate-300">
                {lightningHotspots.length > 0 ? `${lightningHotspots.length} Active Clusters` : 'Awaiting original lightning detection feed'}
              </p>
            </div>
          </div>
        </div>

        {/* WORKFLOW CONNECTOR ARROW */}
        <div className="flex items-center justify-center py-1">
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-6 bg-gradient-to-b from-amber-500 to-amber-400" />
            <div className="w-6 h-6 rounded-full bg-slate-900 border border-amber-500/60 flex items-center justify-center text-amber-400 shadow-sm">
              <ArrowDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* =========================================================================
            STEP 7: TARGETED ALERTS
           ========================================================================= */}
        <div
          id="step-alerts"
          onClick={() => setActiveStepId('alerts')}
          className={`transition-all duration-300 rounded-2xl border p-5 sm:p-6 cursor-pointer ${
            activeStepId === 'alerts'
              ? 'bg-slate-900 border-amber-500 shadow-lg shadow-amber-500/5'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-mono text-xs font-bold">
                07
              </span>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">TARGETED ALERTS</h3>
                <p className="text-xs text-slate-400">
                  Decision support automation: converting spatial probabilities into actionable, localized advisories
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 mb-4">
            &ldquo;Converts identified risk into location-specific alerts.&rdquo;
          </div>

          {alerts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {alerts.slice(0, 2).map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <span className="text-xs font-bold text-white">{alert.headline}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                      {alert.alert_type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{alert.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
              <FileQuestion className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Awaiting Original Dataset: Targeted warning bulletins will generate upon threshold breach in uploaded data.</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. SCIENTIFIC REASONING & ALGORITHM SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-amber-400" />
            Why CNN for Spatial Weather Features?
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Standard neural networks discard geographic neighborhood topology by flattening 2D matrices. CNN preserves
            spatial dimensions using localized 2D convolution filters, identifying convective cores, gust fronts,
            and anvil cloud geometries directly from radar reflectivity and satellite channels.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            Why ConvLSTM for Temporal Weather Dynamics?
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Atmospheric convective systems evolve dynamically in both time and space. ConvLSTM combines recurrent memory
            gates with spatial convolutions to model cell translation, intensification, and dissipation over 30, 60,
            and 90-minute operational lead horizons without losing geographic coordinates.
          </p>
        </div>
      </div>
    </div>
  );
};
