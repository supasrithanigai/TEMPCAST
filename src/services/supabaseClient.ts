/**
 * TEMPESTCAST Supabase Service Connector
 * 
 * Manages live connection to Supabase database (via VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY)
 * with automatic fallback to local meteorological state when unconfigured or tables are being setup.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LocationItem, WeatherData, PredictionHorizon, StormEntity, AlertItem, RiskLevel } from '../types';
import {
  DEMO_LOCATIONS,
  DEMO_WEATHER_BY_LOCATION,
  DEMO_PREDICTIONS_BY_LOCATION,
  DEMO_STORMS,
  DEMO_ALERTS,
} from '../data/demoData';

const DEFAULT_SUPABASE_URL = 'https://zmtywsnsxmocgqqyziki.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptdHl3c25zeG1vY2dxcXl6aWtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyOTA0MDgsImV4cCI6MjEwNDg2NjQwOH0.ZtPcjPR_QaFcl8ZAFBXCNobZYIUVtgtGRAj6tYB7b9o';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const activeSupabaseUrl = (rawUrl && !rawUrl.includes('your-project') && rawUrl.startsWith('http')) 
  ? rawUrl 
  : DEFAULT_SUPABASE_URL;

export const activeSupabaseKey = (rawKey && !rawKey.includes('your-anon-key') && rawKey.length > 20)
  ? rawKey
  : DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  activeSupabaseUrl &&
  activeSupabaseKey &&
  activeSupabaseUrl.startsWith('http')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(activeSupabaseUrl, activeSupabaseKey)
  : null;

// Local store fallback
class LocalPrototypeStore {
  private locations: LocationItem[] = [...DEMO_LOCATIONS];
  private weather: Record<string, WeatherData> = { ...DEMO_WEATHER_BY_LOCATION };
  private predictions: Record<string, PredictionHorizon[]> = { ...DEMO_PREDICTIONS_BY_LOCATION };
  private storms: StormEntity[] = [...DEMO_STORMS];
  private alerts: AlertItem[] = [...DEMO_ALERTS];

  async getLocations(): Promise<LocationItem[]> {
    return [...this.locations];
  }

  async getWeather(locationId: string): Promise<WeatherData> {
    const w = this.weather[locationId] || this.weather['loc-01'];
    return { ...w };
  }

  async getPredictions(locationId: string): Promise<PredictionHorizon[]> {
    const preds = this.predictions[locationId] || this.predictions['loc-01'];
    return [...preds];
  }

  async getStorms(): Promise<StormEntity[]> {
    return [...this.storms];
  }

  async getAlerts(): Promise<AlertItem[]> {
    return [...this.alerts];
  }

  async updateWeather(locationId: string, delta: Partial<WeatherData>): Promise<WeatherData> {
    if (this.weather[locationId]) {
      this.weather[locationId] = { ...this.weather[locationId], ...delta };
      return this.weather[locationId];
    }
    return this.weather['loc-01'];
  }
}

export const prototypeStore = new LocalPrototypeStore();

// Live Supabase query handlers with graceful fallback
export async function getSupabaseLocations(): Promise<LocationItem[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('locations').select('*');
    if (error || !data || data.length === 0) return null;
    return data.map((row) => ({
      id: String(row.id),
      name: String(row.name || 'Monitored Sector'),
      code: String(row.code || row.id),
      region: String(row.region || row.state || 'Convective Corridor'),
      latitude: Number(row.lat ?? row.latitude ?? 35.4676),
      longitude: Number(row.lng ?? row.longitude ?? -97.5164),
      vulnerability_level: (row.vulnerability_level || row.alert_level || 'MEDIUM') as RiskLevel,
      elevation_m: Number(row.elevation_m || 365),
      population_density: String(row.population_density || 'Moderate (Metro)'),
    }));
  } catch (err) {
    console.warn('Supabase query failed, using fallback:', err);
    return null;
  }
}

export async function getSupabaseWeather(locationId: string): Promise<WeatherData | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('weather_observations')
      .select('*')
      .eq('location_id', locationId)
      .order('recorded_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) return null;
    const row = data[0];
    return {
      id: String(row.id || `w-${locationId}`),
      location_id: String(row.location_id || locationId),
      location_name: String(row.location_name || 'Monitored Sector'),
      temperature_c: Number(row.temp_c ?? row.temperature_c ?? 26.5),
      humidity_percent: Number(row.humidity_pct ?? row.humidity_percent ?? 78),
      wind_speed_kmh: Number(row.wind_speed_kmh ?? 32),
      wind_direction: String(row.wind_direction || 'SW'),
      wind_direction_deg: Number(row.wind_direction_deg ?? 225),
      pressure_hpa: Number(row.pressure_hpa ?? 1008.4),
      rainfall_mm: Number(row.rainfall_mm ?? row.precipitation_mm ?? 14.2),
      dew_point_c: Number(row.dew_point_c ?? 22.4),
      cape_j_kg: Number(row.cape_j_kg ?? 2450),
      radar_reflectivity_dbz: Number(row.radar_reflectivity_dbz ?? row.dbz_intensity ?? 52),
      timestamp: String(row.recorded_at || row.timestamp || new Date().toISOString()),
    };
  } catch {
    return null;
  }
}

export async function getSupabasePredictions(locationId: string): Promise<PredictionHorizon[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('nowcast_predictions')
      .select('*')
      .eq('location_id', locationId)
      .order('horizon_minutes', { ascending: true });

    if (error || !data || data.length === 0) return null;
    return data.map((row) => {
      const mins = Number(row.horizon_minutes);
      const horizon_minutes: 30 | 60 | 90 = mins === 60 ? 60 : mins === 90 ? 90 : 30;
      return {
        horizon_minutes,
        thunderstorm_probability: Number(row.thunderstorm_probability ?? 75),
        lightning_probability: Number(row.lightning_probability ?? 70),
        confidence: Number(row.confidence ?? 85),
        severity: (row.severity || 'Moderate') as 'Minor' | 'Moderate' | 'Severe' | 'Extreme',
        risk_level: (row.risk_level || 'MEDIUM') as RiskLevel,
        estimated_peak_dbz: Number(row.estimated_peak_dbz || 48),
        expected_strikes_per_min: Number(row.expected_strikes_per_min || 3.5),
      };
    });
  } catch {
    return null;
  }
}

export async function getSupabaseStorms(): Promise<StormEntity[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('storm_entities').select('*');
    if (error || !data || data.length === 0) return null;
    return data.map((row) => {
      const lat = Number(row.current_lat ?? row.latitude ?? 35.4676);
      const lng = Number(row.current_lng ?? row.longitude ?? -97.5164);
      return {
        id: String(row.id),
        storm_id: String(row.storm_id || row.id),
        name: String(row.name || 'Convective Cell'),
        current_location: {
          lat,
          lng,
          area_name: String(row.area_name || row.name || 'Cell Centroid'),
        },
        direction: String(row.direction || 'ENE'),
        direction_deg: Number(row.direction_deg ?? row.heading_deg ?? 65),
        speed_kmh: Number(row.speed_kmh ?? 45),
        intensity: (row.intensity || 'Severe') as 'Developing' | 'Moderate' | 'Severe' | 'Supercell',
        intensity_dbz: Number(row.intensity_dbz ?? row.dbz_intensity ?? 54),
        risk_level: (row.risk_level || 'HIGH') as RiskLevel,
        last_updated: String(row.updated_at || new Date().toISOString()),
        trajectory: [
          ...(row.past_lat && row.past_lng ? [{
            latitude: Number(row.past_lat),
            longitude: Number(row.past_lng),
            timestamp: '-15 min',
            type: 'past' as const,
            intensity_dbz: Number(row.dbz_intensity || 45) - 6,
            time_label: '-15m',
          }] : []),
          {
            latitude: lat,
            longitude: lng,
            timestamp: 'Now',
            type: 'current' as const,
            intensity_dbz: Number(row.dbz_intensity || 54),
            time_label: 'Current',
          },
          ...(row.pred_lat && row.pred_lng ? [{
            latitude: Number(row.pred_lat),
            longitude: Number(row.pred_lng),
            timestamp: '+30 min',
            type: 'predicted' as const,
            intensity_dbz: Number(row.dbz_intensity || 54),
            time_label: '+30m',
          }] : []),
        ],
        lightning_strike_count_last_10m: Number(row.lightning_count ?? 42),
        top_height_km: Number(row.top_height_km ?? 14.2),
      };
    });
  } catch {
    return null;
  }
}

export async function getSupabaseAlerts(): Promise<AlertItem[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('active', true)
      .order('issued_at', { ascending: false });

    if (error || !data || data.length === 0) return null;
    return data.map((row) => ({
      id: String(row.id),
      alert_id: String(row.alert_id || row.id),
      location: String(row.location || row.location_name || 'Metropolitan Area'),
      location_id: String(row.location_id || 'loc-01'),
      alert_type: (row.alert_type || 'Severe Storm Risk'),
      risk_level: (row.risk_level || (row.severity === 'Extreme' ? 'HIGH' : row.severity === 'Severe' ? 'HIGH' : 'MEDIUM')) as RiskLevel,
      probability: Number(row.probability ?? 85),
      issued_at: String(row.issued_at || new Date().toISOString()),
      valid_until: String(row.expires_at || row.valid_until || new Date(Date.now() + 3600000).toISOString()),
      status: (row.status || (row.active ? 'ACTIVE' : 'EXPIRED')),
      headline: String(row.headline || row.title || 'Severe Convective Activity Warning'),
      description: String(row.description || 'Convective initiation detected.'),
      instructions: String(row.instructions || row.safety_guideline || 'Seek interior shelter immediately.'),
    }));
  } catch {
    return null;
  }
}

/**
 * Returns the ready-to-run PostgreSQL schema script for user's Supabase SQL Editor
 */
export function getSupabaseSchemaSql(): string {
  return `-- =========================================================
-- TEMPESTCAST DATABASE SCHEMA FOR SUPABASE (POSTGRESQL)
-- Run this in your Supabase Dashboard > SQL Editor > New Query
-- =========================================================

-- 1. LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS public.locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  region TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  vulnerability_level TEXT DEFAULT 'MEDIUM',
  elevation_m INTEGER DEFAULT 350,
  population_density TEXT DEFAULT 'Moderate'
);

-- 2. WEATHER OBSERVATIONS TABLE
CREATE TABLE IF NOT EXISTS public.weather_observations (
  id BIGSERIAL PRIMARY KEY,
  location_id TEXT REFERENCES public.locations(id) ON DELETE CASCADE,
  location_name TEXT,
  temp_c DOUBLE PRECISION NOT NULL,
  dew_point_c DOUBLE PRECISION NOT NULL,
  humidity_pct INTEGER NOT NULL,
  wind_speed_kmh DOUBLE PRECISION NOT NULL,
  wind_direction TEXT NOT NULL,
  wind_direction_deg INTEGER DEFAULT 220,
  pressure_hpa DOUBLE PRECISION NOT NULL,
  precipitation_mm DOUBLE PRECISION NOT NULL,
  cape_j_kg INTEGER NOT NULL,
  dbz_intensity INTEGER DEFAULT 45,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. NOWCAST PREDICTIONS TABLE (ConvLSTM / Model Output)
CREATE TABLE IF NOT EXISTS public.nowcast_predictions (
  id BIGSERIAL PRIMARY KEY,
  location_id TEXT REFERENCES public.locations(id) ON DELETE CASCADE,
  horizon_minutes INTEGER NOT NULL,
  thunderstorm_probability INTEGER NOT NULL,
  lightning_probability INTEGER NOT NULL,
  confidence INTEGER NOT NULL,
  severity TEXT NOT NULL,
  risk_level TEXT NOT NULL,
  estimated_peak_dbz DOUBLE PRECISION DEFAULT 48,
  expected_strikes_per_min DOUBLE PRECISION DEFAULT 3.5,
  predicted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STORM ENTITIES (Convective cell tracking vectors)
CREATE TABLE IF NOT EXISTS public.storm_entities (
  id TEXT PRIMARY KEY,
  storm_id TEXT NOT NULL,
  name TEXT NOT NULL,
  speed_kmh DOUBLE PRECISION NOT NULL,
  heading_deg INTEGER NOT NULL,
  direction TEXT DEFAULT 'ENE',
  severity TEXT NOT NULL,
  current_lat DOUBLE PRECISION NOT NULL,
  current_lng DOUBLE PRECISION NOT NULL,
  dbz_intensity INTEGER NOT NULL,
  past_lat DOUBLE PRECISION,
  past_lng DOUBLE PRECISION,
  pred_lat DOUBLE PRECISION,
  pred_lng DOUBLE PRECISION,
  lightning_count INTEGER DEFAULT 40,
  top_height_km DOUBLE PRECISION DEFAULT 14.0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DISASTER & CIVIL ALERTS
CREATE TABLE IF NOT EXISTS public.alerts (
  id TEXT PRIMARY KEY,
  alert_id TEXT NOT NULL,
  title TEXT NOT NULL,
  headline TEXT,
  severity TEXT NOT NULL,
  location_name TEXT NOT NULL,
  location_id TEXT REFERENCES public.locations(id) ON DELETE SET NULL,
  alert_type TEXT DEFAULT 'Severe Storm Risk',
  risk_level TEXT DEFAULT 'HIGH',
  probability INTEGER DEFAULT 85,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  description TEXT NOT NULL,
  safety_guideline TEXT NOT NULL,
  instructions TEXT,
  active BOOLEAN DEFAULT TRUE
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nowcast_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storm_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ POLICIES (for client-side access via anon key)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read locations') THEN
    CREATE POLICY "Allow public read locations" ON public.locations FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read weather') THEN
    CREATE POLICY "Allow public read weather" ON public.weather_observations FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read predictions') THEN
    CREATE POLICY "Allow public read predictions" ON public.nowcast_predictions FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read storms') THEN
    CREATE POLICY "Allow public read storms" ON public.storm_entities FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read alerts') THEN
    CREATE POLICY "Allow public read alerts" ON public.alerts FOR SELECT USING (true);
  END IF;
END $$;

-- INITIAL SEED DATA FOR QUICKSTART
INSERT INTO public.locations (id, name, code, region, lat, lng, vulnerability_level, elevation_m, population_density) VALUES
  ('loc-01', 'North Central Basin (Sector A-1)', 'NCB-01', 'Valley Convective Corridor', 35.4676, -97.5164, 'HIGH', 365, 'High (Metro)'),
  ('loc-02', 'Eastern Foothills & Ag District', 'EFA-02', 'Sub-Basin Agricultural Zone', 35.6528, -97.1089, 'MEDIUM', 412, 'Moderate (Rural)'),
  ('loc-03', 'Southwest Industrial Transport Hub', 'SWI-03', 'Interstate Junction Zone', 35.3289, -97.6892, 'HIGH', 380, 'High (Logistics)')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.alerts (id, alert_id, title, headline, severity, location_name, location_id, alert_type, risk_level, probability, issued_at, expires_at, description, safety_guideline, instructions, active) VALUES
  ('alt-01', 'ALT-8801', 'Severe Thunderstorm & Flash Lightning Warning', 'Rapid Convective Initiation along Dryline', 'Extreme', 'North Central Basin (Sector A-1)', 'loc-01', 'Severe Storm Risk', 'HIGH', 92, NOW(), NOW() + INTERVAL '3 hours', 'Radar reflectivity exceeds 58 dBZ with intense cloud-to-ground lightning discharge exceeding 15 strikes/min.', 'Seek shelter in an interior room immediately. Disconnect sensitive electronic apparatus.', 'Move indoors away from windows.', true)
ON CONFLICT (id) DO NOTHING;
`;
}
