export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AlertType = 
  | 'Thunderstorm Risk'
  | 'Lightning Risk'
  | 'Heavy Rain Risk'
  | 'Severe Storm Risk'
  | 'Flash Flood Risk';

export type AlertStatus = 'ACTIVE' | 'WATCH' | 'WARNING' | 'EXPIRED';

export type DataSourceStatus =
  | 'Available'
  | 'Processing'
  | 'Delayed'
  | 'ORIGINAL DATASET'
  | 'Awaiting Dataset'
  | 'Degraded';

export type QualityFlag = 'GOOD' | 'SUSPECT' | 'MISSING' | 'INVALID';

export type DataMode = 'REAL' | 'HISTORICAL' | 'ORIGINAL DATASET';

export type DatasetCategory =
  | 'Radar'
  | 'Satellite'
  | 'Lightning'
  | 'Weather Observations'
  | 'NWP'
  | 'GIS'
  | 'Other';

export type DatasetProcessingStatus = 'UPLOADED' | 'VALIDATING' | 'READY' | 'ERROR';

export interface UploadedDatasetFile {
  id: string;
  name: string;
  format: string; // ZIP, CSV, JSON, XLS, XLSX, TXT, NC, NETCDF, GRIB, GRIB2, GEOJSON
  sizeBytes: number;
  category: DatasetCategory;
  status: DatasetProcessingStatus;
  isOriginal: true;
  uploadedAt: string;
  errorMessage?: string;
  // Detected attributes:
  variablesDetected: string[];
  columnsDetected: string[];
  timestampsDetected: string[];
  hasCoordinates: boolean;
  latitudeRange?: [number, number];
  longitudeRange?: [number, number];
  missingValuesCount: number;
  totalRecordsCount: number;
  datasetType: string;
  rawTextPreview?: string;
  parsedSummary?: string;
  isZipped?: boolean;
  parentZipName?: string;
  rawFile?: File;
  detectedStates?: string[];
  state?: string;
}

export interface LocationItem {
  id: string;
  name: string;
  code: string;
  region: string;
  state?: string;
  latitude: number;
  longitude: number;
  vulnerability_level: RiskLevel;
  elevation_m: number;
  population_density: string;
}

export interface WeatherData {
  id: string;
  location_id: string;
  location_name: string;
  state?: string;
  temperature_c: number;
  humidity_percent: number;
  wind_speed_kmh: number;
  wind_direction: string;
  wind_direction_deg: number;
  pressure_hpa: number;
  rainfall_mm: number;
  dew_point_c: number;
  cape_j_kg: number; // Convective Available Potential Energy
  radar_reflectivity_dbz: number;
  timestamp: string;
  quality_flag?: QualityFlag;
}

export type ForecastHorizonMinute = 30 | 45 | 60 | 75 | 90;

export interface PredictionHorizon {
  horizon_minutes: ForecastHorizonMinute;
  thunderstorm_probability: number; // 0 - 100
  lightning_probability: number; // 0 - 100
  confidence: number; // 0 - 100
  severity: 'Minor' | 'Moderate' | 'Severe' | 'Extreme';
  risk_level: RiskLevel;
  estimated_peak_dbz: number;
  expected_strikes_per_min: number;
  // Explanatory highlights
  primary_driver?: string;
  cape_contribution_pct?: number;
  radar_trend_contribution_pct?: number;
  lightning_jump_detected?: boolean;
}

export interface StormTrackPoint {
  latitude: number;
  longitude: number;
  timestamp: string;
  type: 'past' | 'current' | 'predicted';
  intensity_dbz: number;
  time_label: string;
}

export interface StormEntity {
  id: string;
  storm_id: string;
  name: string;
  state?: string;
  current_location: {
    lat: number;
    lng: number;
    area_name: string;
  };
  direction: string;
  direction_deg: number;
  speed_kmh: number;
  intensity: 'Developing' | 'Moderate' | 'Severe' | 'Supercell';
  intensity_dbz: number;
  risk_level: RiskLevel;
  last_updated: string;
  trajectory: StormTrackPoint[];
  lightning_strike_count_last_10m: number;
  top_height_km: number;
  area_km2?: number;
  dx_dt_kmh?: number;
  dy_dt_kmh?: number;
}

export interface AlertItem {
  id: string;
  alert_id: string;
  location: string;
  location_id: string;
  alert_type: AlertType;
  risk_level: RiskLevel;
  probability: number;
  issued_at: string;
  valid_until: string;
  status: AlertStatus;
  headline: string;
  description: string;
  instructions: string;
  lead_time_min?: number;
  affected_assets?: string[];
}

export interface DataSourceItem {
  id: string;
  name: string;
  category: 'Radar' | 'Satellite' | 'Lightning' | 'Weather' | 'NWP';
  status: DataSourceStatus;
  last_updated: string;
  data_quality_pct: number;
  missing_data_pct: number;
  processing_status: string;
  latency_sec: number;
  spatial_resolution: string;
  temporal_resolution: string;
  sensor_network: string;
  quality_flag?: QualityFlag;
}

export interface LightningHotspot {
  id: string;
  lat: number;
  lng: number;
  state?: string;
  strike_rate_per_min: number;
  peak_current_ka: number;
  type: 'CG' | 'IC'; // Cloud-to-Ground or Intra-Cloud
  timestamp: string;
}

export interface VulnerableLocation {
  id: string;
  name: string;
  type: 'School' | 'Hospital' | 'Power Substation' | 'Farmland' | 'Airport' | 'Sports Arena' | 'High-Density Residential' | 'Transit Corridor';
  lat: number;
  lng: number;
  vulnerability_score: number; // 1-10
  current_risk: RiskLevel;
  exposure_weight?: number; // 0.1 to 1.0
  impact_score?: number; // 0 to 100: Met Risk x Exposure
  evacuation_status?: 'Nominal' | 'Shelter Advisory' | 'Evacuate Open Areas';
  population_at_risk?: number;
}

export interface RiskZonePolygon {
  id: string;
  name: string;
  state?: string;
  risk_level: RiskLevel;
  severity: string;
  probability: number;
  confidence: number;
  prediction_horizon: string;
  coordinates: [number, number][]; // [lat, lng] array
}

// Explainability / SHAP Feature Attribution
export interface ShapFeatureContribution {
  feature_name: string;
  display_name: string;
  category: 'Radar' | 'Satellite' | 'Lightning' | 'Surface' | 'NWP';
  value: number | string;
  shap_value: number; // Positive increases risk, negative decreases risk
  direction: 'increase' | 'decrease';
  unit: string;
  explanation: string;
}

export interface PredictionExplanation {
  prediction_id: string;
  horizon_minutes: ForecastHorizonMinute;
  base_probability: number;
  final_probability: number;
  dominant_factor: string;
  features: ShapFeatureContribution[];
  summary: string;
}

// Model Verification & Baseline Comparison
export interface VerificationLeadTimeMetric {
  lead_time_minutes: ForecastHorizonMinute;
  csi: number; // Critical Success Index (Threat Score)
  pod: number; // Probability of Detection (Recall)
  far: number; // False Alarm Rate
  f1_score: number;
  precision: number;
  brier_score: number; // Lower is better
  roc_auc: number;
}

export interface ModelComparison {
  model_name: string;
  model_type: 'AI_ConvLSTM' | 'Persistence_Baseline' | 'Storm_Motion_Advection';
  description: string;
  metrics_by_lead_time: VerificationLeadTimeMetric[];
  overall_csi: number;
  overall_pod: number;
  overall_far: number;
  overall_brier: number;
}

// Replay Scenario Timestep
export interface ReplayTimestep {
  step_index: number;
  time_label: string;
  relative_minutes: number;
  narrative: string;
  observations: {
    radar_dbz: number;
    lightning_strikes_10m: number;
    cape_j_kg: number;
    cloud_top_temp_c: number;
    temp_c: number;
    humidity_pct: number;
    wind_kmh: number;
  };
  nowcast: PredictionHorizon[];
  storm_centroid: [number, number];
  observed_ground_truth?: {
    thunderstorm_occurred: boolean;
    actual_dbz: number;
    actual_strikes: number;
    match_status: 'HIT' | 'CORRECT_NEGATIVE' | 'FALSE_ALARM' | 'MISS';
  };
}
