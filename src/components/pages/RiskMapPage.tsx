import React, { useState } from 'react';
import {
  LocationItem,
  StormEntity,
  AlertItem,
  RiskZonePolygon,
  LightningHotspot,
  VulnerableLocation,
} from '../../types';
import { LeafletMap } from '../map/LeafletMap';
import { MapLegend } from '../map/MapLegend';
import { VulnerabilityAssessmentTable } from '../common/VulnerabilityAssessmentTable';
import { MapPin, Info, Sparkles, Navigation, X } from 'lucide-react';

interface RiskMapPageProps {
  location: LocationItem;
  storms: StormEntity[];
  alerts: AlertItem[];
  riskZones: RiskZonePolygon[];
  lightningHotspots: LightningHotspot[];
  vulnerableLocations: VulnerableLocation[];
  selectedStorm: StormEntity | null;
  onSelectStorm: (storm: StormEntity | null) => void;
}

export const RiskMapPage: React.FC<RiskMapPageProps> = ({
  location,
  storms,
  alerts,
  riskZones,
  lightningHotspots,
  vulnerableLocations,
  selectedStorm,
  onSelectStorm,
}) => {
  const [layers, setLayers] = useState({
    riskZones: true,
    lightning: true,
    storms: true,
    alerts: true,
    vulnerable: true,
  });

  const handleToggleLayer = (key: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>GIS SPATIAL RISK VIEWER</span>
            <span>•</span>
            <span className="text-slate-400">Leaflet.js + OpenStreetMap</span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              SIMULATED SPATIAL DATA
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-0.5">
            Geographic Risk Zones &amp; Storm Vector Trajectory
          </h2>
          <p className="text-xs text-slate-400">
            Simulated overlay of convective risk polygons, lightning flash clusters, and critical infrastructure sites for demonstration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-amber-400" />
            <span>Center: {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E (Tamil Nadu)</span>
          </div>
        </div>
      </div>

      {/* Main Map Canvas Area with Overlay Floating Legend */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
        <LeafletMap
          center={[location.latitude, location.longitude]}
          zoom={11}
          heightClass="h-[620px]"
          minHeightPx={550}
          storms={storms}
          selectedStormId={selectedStorm?.id}
          onSelectStorm={onSelectStorm}
          alerts={alerts}
          riskZones={riskZones}
          lightningHotspots={lightningHotspots}
          vulnerableLocations={vulnerableLocations}
          layers={layers}
          onToggleLayer={handleToggleLayer}
          showLegend={false}
        />

        {/* Floating Interactive Layer Controls & Legend on Top Right */}
        <div className="absolute top-4 right-4 z-10 hidden sm:block">
          <MapLegend layers={layers} onToggleLayer={handleToggleLayer} />
        </div>

        {/* Selected Storm Floating Inspector (if clicked) */}
        {selectedStorm && (
          <div className="absolute bottom-6 left-4 z-10 max-w-sm w-full bg-slate-950/95 backdrop-blur-md border border-amber-500/60 rounded-xl p-4 text-xs shadow-2xl text-slate-200 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <span className="text-rose-400">🌪️</span> {selectedStorm.name}
              </span>
              <button
                onClick={() => onSelectStorm(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
                title="Close inspector"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 my-2.5">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Direction / Speed</span>
                <span className="font-bold text-white font-mono">
                  {selectedStorm.direction} @ {selectedStorm.speed_kmh} km/h
                </span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Core Reflectivity</span>
                <span className="font-bold text-rose-400 font-mono">
                  {selectedStorm.intensity_dbz} dBZ ({selectedStorm.intensity})
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-300 font-mono flex items-center justify-between pt-1 border-t border-slate-800">
              <span>Risk: <strong className="text-rose-400">{selectedStorm.risk_level}</strong></span>
              <span>Updated: {selectedStorm.last_updated}</span>
            </div>
          </div>
        )}
      </div>

      {/* Mobile-only Legend section under map */}
      <div className="sm:hidden">
        <MapLegend layers={layers} onToggleLayer={handleToggleLayer} />
      </div>

      {/* Explanatory Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="font-bold text-white flex items-center gap-1.5 mb-1 text-slate-200">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            Convective Risk Polygons
          </div>
          <p className="text-slate-400 leading-relaxed">
            Derived directly from the ConvLSTM output layer. High-risk zones represent greater than 70% probability of &gt;50 dBZ precipitation and violent cloud-to-ground flash rates within 60 minutes.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="font-bold text-white flex items-center gap-1.5 mb-1 text-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            Total Lightning Hotspots
          </div>
          <p className="text-slate-400 leading-relaxed">
            Combines Geostationary Lightning Mapper (GLM) optical pulses with ground radio-frequency arrival time difference networks for stroke peak currents up to 60 kA.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="font-bold text-white flex items-center gap-1.5 mb-1 text-slate-200">
            <Info className="w-3.5 h-3.5 text-sky-400" />
            Vulnerable Assets Protection
          </div>
          <p className="text-slate-400 leading-relaxed">
            Airports, electrical transmission substations, trauma centers, and farming tracts are flagged to trigger targeted early mitigation alerts before convective cells cross perimeters.
          </p>
        </div>
      </div>

      {/* DETAILED CRITICAL INFRASTRUCTURE VULNERABILITY ANALYSIS */}
      <VulnerabilityAssessmentTable locations={vulnerableLocations} />
    </div>
  );
};
