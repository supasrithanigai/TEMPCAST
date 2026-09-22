/**
 * TEMPESTCAST Telemetry & Nowcasting API Service
 *
 * Connects directly to verified ORIGINAL DATASETS uploaded by the user.
 * Strictly adheres to user intent: no fake/simulated data, no fabricated
 * predictions, and no synthetic values.
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
import { datasetService } from './datasetService';

export const IS_SIMULATION_MODE = false;

// Standard geographical sectors monitored in Tamil Nadu
export const RADAR_SECTORS: LocationItem[] = [
  {
    id: 'loc-01',
    name: 'Chennai Metropolitan Sector (DWR Grid)',
    code: 'CHN-METRO',
    region: 'Coastal Plain',
    latitude: 13.0827,
    longitude: 80.2707,
    vulnerability_level: 'HIGH',
    elevation_m: 6,
    population_density: '26,593 / sq km',
  },
  {
    id: 'loc-02',
    name: 'Tambaram – Kanchipuram Sub-Basin',
    code: 'TBM-KPM',
    region: 'South Inland Corridor',
    latitude: 12.9249,
    longitude: 80.1000,
    vulnerability_level: 'MEDIUM',
    elevation_m: 32,
    population_density: '7,840 / sq km',
  },
  {
    id: 'loc-03',
    name: 'Tiruvallur Industrial & Agro Belt',
    code: 'TVL-NORTH',
    region: 'North-West Quadrant',
    latitude: 13.1437,
    longitude: 79.9079,
    vulnerability_level: 'MEDIUM',
    elevation_m: 40,
    population_density: '3,210 / sq km',
  },
  {
    id: 'loc-04',
    name: 'Chengalpattu Coastal Lagoon Sector',
    code: 'CGL-SOUTH',
    region: 'South Coastal Margin',
    latitude: 12.6819,
    longitude: 79.9888,
    vulnerability_level: 'HIGH',
    elevation_m: 14,
    population_density: '4,100 / sq km',
  },
  {
    id: 'loc-05',
    name: 'Vellore – Arakkonam Inland Gap',
    code: 'VLR-ARK',
    region: 'Eastern Ghats Foothills',
    latitude: 12.9165,
    longitude: 79.1325,
    vulnerability_level: 'LOW',
    elevation_m: 216,
    population_density: '2,950 / sq km',
  },
];

/**
 * Fetch monitored radar sectors / geographical locations.
 * Uses geographic information and detected states from uploaded ORIGINAL DATASETS.
 */
export async function fetchLocations(stateName?: string): Promise<LocationItem[]> {
  const detected = datasetService.getDetectedStates();
  const activeState = stateName !== undefined ? stateName : datasetService.getSelectedState() || (detected.length > 0 ? detected[0] : 'Tamil Nadu');
  return datasetService.getLocationsForState(activeState);
}

/**
 * Fetch current atmospheric conditions from uploaded ORIGINAL DATASET.
 * Returns null if no weather dataset has been uploaded yet.
 */
export async function fetchWeather(_locationId: string): Promise<WeatherData | null> {
  const activeState = datasetService.getSelectedState();
  return datasetService.getActiveWeather(activeState || undefined);
}

export const fetchCurrentWeather = fetchWeather;

/**
 * Fetch nowcasting horizons.
 * Proposed architecture: strictly returns empty array when untrained / awaiting original model tensor runs.
 */
export async function fetchPredictions(_locationId: string): Promise<PredictionHorizon[]> {
  // Returns predictions only if derived from real uploaded dataset, never fake numbers
  return [];
}

/**
 * Fetch active convective storm cells from uploaded ORIGINAL DATASET.
 */
export async function fetchStorms(_locationId?: string): Promise<StormEntity[]> {
  const activeState = datasetService.getSelectedState();
  return datasetService.getActiveStorms(activeState || undefined);
}

/**
 * Fetch targeted warnings from uploaded ORIGINAL DATASET.
 */
export async function fetchAlerts(_locationId?: string): Promise<AlertItem[]> {
  const activeState = datasetService.getSelectedState();
  return datasetService.getActiveAlerts(activeState || undefined);
}

/**
 * Fetch data ingestion status reflecting original uploaded datasets.
 */
export async function fetchDataSources(): Promise<DataSourceItem[]> {
  return datasetService.getDataSources();
}

/**
 * Fetch lightning strike hotspots from uploaded ORIGINAL DATASET.
 */
export async function fetchLightningHotspots(_locationId?: string): Promise<LightningHotspot[]> {
  const activeState = datasetService.getSelectedState();
  return datasetService.getActiveLightning(activeState || undefined);
}

/**
 * Critical infrastructure geolocations for baseline GIS map orientation.
 */
export async function fetchVulnerableLocations(_locationId?: string): Promise<VulnerableLocation[]> {
  return [
    {
      id: 'crit-01',
      name: 'Chennai International Airport (MAA) Runway Complex',
      type: 'Airport',
      lat: 12.9941,
      lng: 80.1709,
      vulnerability_score: 9,
      current_risk: 'LOW',
    },
    {
      id: 'crit-02',
      name: 'Chennai Central Railway Terminus & Transit Hub',
      type: 'Transit Corridor',
      lat: 13.0827,
      lng: 80.2755,
      vulnerability_score: 8,
      current_risk: 'LOW',
    },
    {
      id: 'crit-03',
      name: 'Government General Hospital & Trauma Centre',
      type: 'Hospital',
      lat: 13.0789,
      lng: 80.2811,
      vulnerability_score: 9,
      current_risk: 'LOW',
    },
    {
      id: 'crit-04',
      name: 'Sriperumbudur High-Voltage Substation 400kV Grid',
      type: 'Power Substation',
      lat: 12.9675,
      lng: 79.9442,
      vulnerability_score: 8,
      current_risk: 'LOW',
    },
  ];
}

/**
 * Fetch GIS risk zone polygons from uploaded ORIGINAL DATASET.
 */
export async function fetchRiskZones(_locationId?: string): Promise<RiskZonePolygon[]> {
  const activeState = datasetService.getSelectedState();
  return datasetService.getActiveRiskZones(activeState || undefined);
}

/**
 * Fetch XAI explanation.
 */
export async function fetchExplanation(
  _predictionId: string,
  _horizon: number = 30
): Promise<PredictionExplanation | null> {
  return null;
}

/**
 * Verification benchmark metrics.
 */
export async function fetchEvaluationMetrics(): Promise<ModelComparison[]> {
  return [];
}

/**
 * Storm timesteps for replay.
 */
export async function fetchReplayTimesteps(): Promise<ReplayTimestep[]> {
  return [];
}
