/**
 * TEMPESTCAST In-Browser Simulation Service
 * 
 * Provides simulated meteorological ingestion, CNN + ConvLSTM nowcasting,
 * TITAN storm tracking, SHAP explainability, and critical asset risk assessments.
 * Operates purely in-browser with zero external backend or FastAPI dependency.
 */

import {
  LocationItem,
  WeatherData,
  PredictionHorizon,
  StormEntity,
  AlertItem,
  DataSourceItem,
  LightningHotspot,
  VulnerableLocation,
  RiskZonePolygon,
  PredictionExplanation,
  ModelComparison,
  ReplayTimestep,
} from '../types';
import {
  DEMO_LOCATIONS,
  DEMO_WEATHER_BY_LOCATION,
  DEMO_PREDICTIONS_BY_LOCATION,
  DEMO_STORMS,
  DEMO_ALERTS,
  DEMO_DATA_SOURCES,
  DEMO_LIGHTNING_HOTSPOTS,
  DEMO_VULNERABLE_LOCATIONS,
  DEMO_RISK_ZONES,
  DEMO_EXPLANATIONS,
  DEMO_MODEL_COMPARISONS,
  DEMO_REPLAY_TIMESTEPS,
} from '../data/demoData';
import {
  prototypeStore,
  getSupabaseLocations,
  getSupabaseWeather,
  getSupabasePredictions,
  getSupabaseStorms,
  getSupabaseAlerts,
} from './supabaseClient';

export const IS_SIMULATION_MODE = true;

/**
 * Fetch monitored radar sectors / geographical locations
 */
export async function fetchLocations(): Promise<LocationItem[]> {
  try {
    const supabaseData = await getSupabaseLocations();
    if (supabaseData && supabaseData.length > 0) {
      return supabaseData;
    }
  } catch {
    // Graceful fallback to local simulation
  }
  return prototypeStore.getLocations();
}

/**
 * Fetch current simulated atmospheric conditions for a sector
 */
export async function fetchWeather(locationId: string): Promise<WeatherData> {
  try {
    const supabaseWeather = await getSupabaseWeather(locationId);
    if (supabaseWeather) {
      return supabaseWeather;
    }
  } catch {
    // Graceful fallback to local simulation
  }

  return prototypeStore.getWeather(locationId);
}

export const fetchCurrentWeather = fetchWeather;

/**
 * Fetch simulated 30-90 minute ConvLSTM nowcasting horizons
 */
export async function fetchPredictions(locationId: string): Promise<PredictionHorizon[]> {
  try {
    const supabasePreds = await getSupabasePredictions(locationId);
    if (supabasePreds && supabasePreds.length > 0) {
      return supabasePreds;
    }
  } catch {
    // Graceful fallback to local simulation
  }

  return prototypeStore.getPredictions(locationId);
}

/**
 * Fetch active convective storm cells with tracking vectors
 */
export async function fetchStorms(_locationId?: string): Promise<StormEntity[]> {
  try {
    const supabaseStorms = await getSupabaseStorms();
    if (supabaseStorms && supabaseStorms.length > 0) {
      return supabaseStorms;
    }
  } catch {
    // Graceful fallback to local simulation
  }

  return prototypeStore.getStorms();
}

/**
 * Fetch targeted warnings and CAP disaster advisories
 */
export async function fetchAlerts(_locationId?: string): Promise<AlertItem[]> {
  try {
    const supabaseAlerts = await getSupabaseAlerts();
    if (supabaseAlerts && supabaseAlerts.length > 0) {
      return supabaseAlerts;
    }
  } catch {
    // Graceful fallback to local simulation
  }

  return prototypeStore.getAlerts();
}

/**
 * Fetch data ingestion telemetry status
 */
export async function fetchDataSources(): Promise<DataSourceItem[]> {
  return [...DEMO_DATA_SOURCES];
}

/**
 * Fetch GLM & RF lightning flash hotspots
 */
export async function fetchLightningHotspots(_locationId?: string): Promise<LightningHotspot[]> {
  return [...DEMO_LIGHTNING_HOTSPOTS];
}

/**
 * Fetch critical infrastructure exposure list
 */
export async function fetchVulnerableLocations(_locationId?: string): Promise<VulnerableLocation[]> {
  return [...DEMO_VULNERABLE_LOCATIONS];
}

/**
 * Fetch GIS risk zone polygons for Leaflet rendering
 */
export async function fetchRiskZones(_locationId?: string): Promise<RiskZonePolygon[]> {
  return [...DEMO_RISK_ZONES];
}

/**
 * Fetch SHAP feature attribution explanation for convective prediction
 */
export async function fetchExplanation(
  predictionId: string,
  _horizon: number = 30
): Promise<PredictionExplanation> {
  if (DEMO_EXPLANATIONS[predictionId]) {
    return DEMO_EXPLANATIONS[predictionId];
  }
  return DEMO_EXPLANATIONS['loc-01'];
}

/**
 * Fetch AI ConvLSTM vs Operational Baselines verification benchmark metrics
 */
export async function fetchEvaluationMetrics(): Promise<ModelComparison[]> {
  return [...DEMO_MODEL_COMPARISONS];
}

/**
 * Fetch historical storm timesteps for interactive timeline verification
 */
export async function fetchReplayTimesteps(): Promise<ReplayTimestep[]> {
  return [...DEMO_REPLAY_TIMESTEPS];
}

/**
 * Fetch ranked critical infrastructure vulnerability analysis
 */
export async function fetchVulnerabilityRanking(): Promise<VulnerableLocation[]> {
  return [...DEMO_VULNERABLE_LOCATIONS];
}

export interface CustomPredictParams {
  locationId: string;
  radarDbz?: number;
  cape?: number;
  humidity?: number;
  windShear?: number;
}

/**
 * In-browser physics-guided ConvLSTM nowcast simulator
 * Dynamically computes 30, 45, 60, 75, and 90 minute probabilistic horizons
 */
export async function runCustomPrediction(
  params: CustomPredictParams
): Promise<PredictionHorizon[]> {
  // Simulating minor calculation latency for realistic UI feedback
  await new Promise((resolve) => setTimeout(resolve, 350));

  const baseRefl = params.radarDbz ?? 52;
  const baseCape = params.cape ?? 2450;
  const humidity = params.humidity ?? 78;
  const windShear = params.windShear ?? 24;

  // Spatio-temporal convective initiation index
  const factor = 
    (baseRefl / 65) * 0.45 + 
    (baseCape / 3500) * 0.35 + 
    (humidity / 100) * 0.10 + 
    Math.min(1.0, windShear / 35) * 0.10;

  const p30 = Math.min(97, Math.max(15, Math.round(factor * 96)));
  const p45 = Math.min(95, Math.max(14, Math.round(p30 * (factor > 0.62 ? 1.03 : 0.94))));
  const p60 = Math.min(92, Math.max(12, Math.round(p30 * (factor > 0.58 ? 1.05 : 0.88))));
  const p75 = Math.min(88, Math.max(10, Math.round(p60 * 0.88)));
  const p90 = Math.min(84, Math.max(8, Math.round(p60 * 0.74)));

  const getRisk = (p: number) => (p >= 70 ? 'HIGH' : p >= 40 ? 'MEDIUM' : 'LOW');
  const getSev = (p: number): 'Minor' | 'Moderate' | 'Severe' | 'Extreme' =>
    p >= 85 ? 'Extreme' : p >= 70 ? 'Severe' : p >= 45 ? 'Moderate' : 'Minor';

  return [
    {
      horizon_minutes: 30,
      thunderstorm_probability: p30,
      lightning_probability: Math.round(p30 * 0.92),
      confidence: 88,
      severity: getSev(p30),
      risk_level: getRisk(p30),
      estimated_peak_dbz: Math.round(baseRefl * 1.02),
      expected_strikes_per_min: +(p30 / 5.8).toFixed(1),
      primary_driver: 'Radar Core Surge & Boundary-Layer Updraft Convergence',
      lightning_jump_detected: p30 > 75,
    },
    {
      horizon_minutes: 45,
      thunderstorm_probability: p45,
      lightning_probability: Math.round(p45 * 0.89),
      confidence: 84,
      severity: getSev(p45),
      risk_level: getRisk(p45),
      estimated_peak_dbz: Math.round(baseRefl * 0.99),
      expected_strikes_per_min: +(p45 / 6.5).toFixed(1),
      primary_driver: 'Deep Convective Core Sustained by Low-Level Jet Moisture',
      lightning_jump_detected: p45 > 75,
    },
    {
      horizon_minutes: 60,
      thunderstorm_probability: p60,
      lightning_probability: Math.round(p60 * 0.85),
      confidence: 80,
      severity: getSev(p60),
      risk_level: getRisk(p60),
      estimated_peak_dbz: Math.round(baseRefl * 0.95),
      expected_strikes_per_min: +(p60 / 7.4).toFixed(1),
      primary_driver: 'Squall Line Gust Front Passage with Downdraft Outflow',
    },
    {
      horizon_minutes: 75,
      thunderstorm_probability: p75,
      lightning_probability: Math.round(p75 * 0.81),
      confidence: 76,
      severity: getSev(p75),
      risk_level: getRisk(p75),
      estimated_peak_dbz: Math.round(baseRefl * 0.91),
      expected_strikes_per_min: +(p75 / 8.8).toFixed(1),
      primary_driver: 'Transition to Trailing Stratiform Rain Shield',
    },
    {
      horizon_minutes: 90,
      thunderstorm_probability: p90,
      lightning_probability: Math.round(p90 * 0.78),
      confidence: 72,
      severity: getSev(p90),
      risk_level: getRisk(p90),
      estimated_peak_dbz: Math.round(baseRefl * 0.86),
      expected_strikes_per_min: +(p90 / 9.8).toFixed(1),
      primary_driver: 'Cold Pool Outflow Dominance & Convective Dissipation',
    },
  ];
}
