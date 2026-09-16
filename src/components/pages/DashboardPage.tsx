import React, { useState } from 'react';
import {
  WeatherData,
  PredictionHorizon,
  StormEntity,
  AlertItem,
  RiskZonePolygon,
  LocationItem,
  DataSourceItem,
} from '../../types';
import { RiskCard } from '../common/RiskCard';
import { PredictionCard } from '../common/PredictionCard';
import { WeatherCard } from '../common/WeatherCard';
import { RiskChart } from '../common/RiskChart';
import { AlertCard } from '../common/AlertCard';
import { StormCard } from '../common/StormCard';
import { LeafletMap } from '../map/LeafletMap';
import {
  Thermometer,
  CloudLightning,
  Zap,
  CheckCircle2,
  Bell,
  Radar,
  MapPin,
  ArrowRight,
  Info,
  Clock,
  Shield,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PageId } from '../common/Sidebar';

interface DashboardPageProps {
  location: LocationItem;
  weather: WeatherData;
  predictions: PredictionHorizon[];
  storms: StormEntity[];
  alerts: AlertItem[];
  riskZones: RiskZonePolygon[];
  dataSources: DataSourceItem[];
  onNavigate: (page: PageId) => void;
  onSelectStorm: (storm: StormEntity) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  location,
  weather,
  predictions,
  storms,
  alerts,
  riskZones,
  dataSources,
  onNavigate,
  onSelectStorm,
}) => {
  const [showAllHorizons, setShowAllHorizons] = useState(false);

  // Core nowcast horizons (30m, 60m, 90m)
  const p30 = predictions.find((p) => p.horizon_minutes === 30) || predictions[0];
  const p60 = predictions.find((p) => p.horizon_minutes === 60) || predictions[1];
  const p90 = predictions.find((p) => p.horizon_minutes === 90) || predictions[2];
  const primaryHorizons = [p30, p60, p90].filter(Boolean);

  // Intermediate horizons (45m, 75m, etc.) for progressive disclosure
  const intermediateHorizons = predictions.filter(
    (p) => p.horizon_minutes !== 30 && p.horizon_minutes !== 60 && p.horizon_minutes !== 90
  );

  // Calculate overall data source health
  const avgDataQuality = Math.round(
    dataSources.reduce((acc, s) => acc + s.data_quality_pct, 0) / (dataSources.length || 1)
  );

  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE' || a.status === 'WARNING');

  return (
    <div className="space-y-8 sm:space-y-10 pb-16">
      {/* ─────────────────────────────────────────────────────────────
          SECTOR OVERVIEW BRIEFING
      ───────────────────────────────────────────────────────────── */}
      <section className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-semibold">SECTOR BRIEFING</span>
              <span>•</span>
              <span className="text-slate-300 font-bold">{location.code}</span>
              <span>•</span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                SIMULATION MODE
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {location.name}
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Real-time atmospheric nowcasting console monitoring deep convection, lightning flash probability, and squall evolution using in-browser CNN + ConvLSTM spatio-temporal predictions.
            </p>

            <div className="pt-1 flex items-center gap-2 text-[11px] text-amber-400/90 font-mono">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Simulated demonstration data — not for official emergency dissemination.</span>
            </div>
          </div>

          {/* Quick status summary widget */}
          <div className="flex items-center gap-4 bg-slate-950/90 border border-slate-800 rounded-xl p-4 text-xs shadow-inner shrink-0">
            <div className="pr-4 border-r border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-500 block font-semibold">
                Current Status
              </span>
              <span className="font-bold text-rose-400 flex items-center gap-1.5 mt-0.5 text-sm">
                <CloudLightning className="w-4 h-4" /> Convective Inflow
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block font-semibold">
                30–60m Outlook
              </span>
              <span className="font-bold text-amber-300 font-mono text-sm mt-0.5 block">
                Peak {p30?.estimated_peak_dbz ?? 55} dBZ Core
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          PRIORITY 1: CURRENT RISK ASSESSMENT
      ───────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
          <div>
            <div className="text-[11px] font-bold font-mono uppercase tracking-wider text-amber-400">
              Priority 1 • Real-Time Hazard Level
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
              Current Risk Assessment
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            T+0 Baseline &amp; Immediate Outlook
          </span>
        </div>

        {/* 3-Column Clean Balanced Grid for Current Risk */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {/* 1. Thunderstorm Risk Card */}
          <RiskCard
            title="Thunderstorm Risk"
            riskLevel={p30.risk_level}
            probability={p30.thunderstorm_probability}
            subtext="Nowcast Horizon: +30 min lead time"
            type="thunderstorm"
          />

          {/* 2. Lightning Risk Card */}
          <RiskCard
            title="Lightning Risk"
            riskLevel={p30.lightning_probability > 70 ? 'HIGH' : p30.lightning_probability > 40 ? 'MEDIUM' : 'LOW'}
            probability={p30.lightning_probability}
            subtext={`Expected: ~${p30.expected_strikes_per_min} strikes/min within sector`}
            type="lightning"
          />

          {/* 3. Key Environmental Metrics & Instability */}
          <div className="relative overflow-hidden rounded-xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Ambient Environment
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                  Surface Sync
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                    <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                    <span>Temperature</span>
                  </div>
                  <div className="text-xl font-black font-mono text-white mt-1">
                    {weather.temperature_c}°C
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Dew Point: {weather.dew_point_c}°C</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Data Quality</span>
                  </div>
                  <div className="text-xl font-black font-mono text-emerald-400 mt-1">
                    {avgDataQuality}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">5/5 Sensor Feeds</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Instability (CAPE):</span>
              <span className="font-mono text-rose-300 font-bold">{weather.cape_j_kg} J/kg</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          PRIORITY 2: 30 / 60 / 90-MINUTE PREDICTIONS
      ───────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-800/80">
          <div>
            <div className="text-[11px] font-bold font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Priority 2 • ConvLSTM Rollout
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
              30 / 60 / 90-Minute Predictions
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Separated AI nowcasting horizons predicting convective echo cell intensity and lightning jump triggers
            </p>
          </div>

          <div className="flex items-center gap-3">
            {intermediateHorizons.length > 0 && (
              <button
                onClick={() => setShowAllHorizons(!showAllHorizons)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{showAllHorizons ? 'Show 30/60/90m Only' : 'Show All Horizons (+45m, +75m)'}</span>
                {showAllHorizons ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}

            <button
              onClick={() => onNavigate('predictions')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer whitespace-nowrap"
            >
              Full Forecast <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Primary 30, 60, 90 minute prediction cards with generous breathing room */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {primaryHorizons.map((pred) => (
            <PredictionCard key={pred.horizon_minutes} prediction={pred} />
          ))}
        </div>

        {/* Progressive disclosure for intermediate horizons */}
        {showAllHorizons && intermediateHorizons.length > 0 && (
          <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="text-xs font-mono text-slate-400 uppercase mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              <span>Intermediate Spatio-Temporal Timesteps</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {intermediateHorizons.map((pred) => (
                <PredictionCard key={pred.horizon_minutes} prediction={pred} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          PRIORITY 3: GIS RISK MAP
      ───────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-800/80">
          <div>
            <div className="text-[11px] font-bold font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Priority 3 • Spatial Cartography
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
              GIS Risk Map &amp; Storm Geometry
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive Leaflet GIS map with OpenStreetMap tiles centered on Tamil Nadu sector showing simulated convective echo cells and polygons
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2.5 py-1 rounded-md hidden sm:inline">
              Center: {location.latitude.toFixed(2)}°N, {location.longitude.toFixed(2)}°E
            </span>
            <button
              onClick={() => onNavigate('risk-map')}
              className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-xs font-bold text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Full-Screen GIS Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Full-width, high-visibility GIS Map with generous height */}
        <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl">
          <LeafletMap
            center={[location.latitude, location.longitude]}
            zoom={10}
            heightClass="h-[460px] sm:h-[480px]"
            minHeightPx={460}
            storms={storms}
            alerts={alerts}
            riskZones={riskZones}
            onSelectStorm={(s) => {
              onSelectStorm(s);
              onNavigate('storm-tracking');
            }}
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 px-1 gap-1">
          <span>Click any storm centroid marker or risk polygon to inspect forward vector telemetry and dBZ intensity.</span>
          <span className="font-mono text-amber-400/90 text-[11px]">Leaflet.js • OSM Layer Active</span>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          PRIORITY 4: ACTIVE ALERTS & CONVECTIVE STORMS
      ───────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
          <div>
            <div className="text-[11px] font-bold font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" /> Priority 4 • Operational Situational Awareness
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
              Active Alerts &amp; Tracked Storm Cells
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            {activeAlerts.length} Active Advisories • {storms.length} Radar Centroids
          </span>
        </div>

        {/* Clean 2-Column Responsive Grid with plenty of room */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Alerts Panel */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Bell className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white">
                  Active Alerts &amp; Advisories ({activeAlerts.length})
                </h4>
              </div>
              <button
                onClick={() => onNavigate('alerts')}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
              >
                View All Alerts &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {activeAlerts.slice(0, 2).map((alert) => (
                <AlertCard key={alert.id} alert={alert} compact={true} />
              ))}
              {activeAlerts.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800">
                  No active emergency alerts in sector.
                </div>
              )}
            </div>
          </div>

          {/* Tracked Convective Storm Cells Panel */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Radar className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white">
                  Tracked Convective Storm Cells ({storms.length})
                </h4>
              </div>
              <button
                onClick={() => onNavigate('storm-tracking')}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
              >
                Track Storms &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {storms.slice(0, 2).map((storm) => (
                <StormCard
                  key={storm.id}
                  storm={storm}
                  compact={true}
                  onSelect={() => {
                    onSelectStorm(storm);
                    onNavigate('storm-tracking');
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          PRIORITY 5: CURRENT WEATHER & 90-MINUTE RISK PROGRESSION
      ───────────────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
          <div>
            <div className="text-[11px] font-bold font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5" /> Priority 5 • Telemetry &amp; Progression
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
              Current Weather &amp; 90-Minute Progression
            </h3>
          </div>
        </div>

        {/* Weather Observations Component */}
        <WeatherCard weather={weather} />

        {/* Risk Progression Chart */}
        <RiskChart predictions={predictions} />
      </section>

      {/* ─────────────────────────────────────────────────────────────
          PRIORITY 6: ADDITIONAL DATA / STATUS & OPERATIONAL ASSURANCE
      ───────────────────────────────────────────────────────────── */}
      <section className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 sm:p-6 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-800 text-amber-400 shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <div className="text-slate-200 font-bold text-sm">
              Operational Ingestion &amp; Quality Index ({avgDataQuality}% Nominal)
            </div>
            <p className="mt-0.5 text-slate-400 text-xs">
              Continuous assimilation of Doppler radar velocity, INSAT-3D infrared cloud brightness temperatures, and ground lightning detection network strikes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('data-status')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            Inspect Data Feeds
          </button>
        </div>
      </section>
    </div>
  );
};
