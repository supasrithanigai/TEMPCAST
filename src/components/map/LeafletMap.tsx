import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import {
  StormEntity,
  AlertItem,
  LightningHotspot,
  VulnerableLocation,
  RiskZonePolygon,
} from '../../types';
import { Layers, Eye, EyeOff } from 'lucide-react';

interface LeafletMapProps {
  center?: L.LatLngTuple;
  zoom?: number;
  heightClass?: string;
  minHeightPx?: number;
  storms?: StormEntity[];
  selectedStormId?: string | null;
  onSelectStorm?: (storm: StormEntity) => void;
  alerts?: AlertItem[];
  riskZones?: RiskZonePolygon[];
  lightningHotspots?: LightningHotspot[];
  vulnerableLocations?: VulnerableLocation[];
  layers?: {
    riskZones: boolean;
    lightning: boolean;
    storms: boolean;
    alerts: boolean;
    vulnerable: boolean;
  };
  onToggleLayer?: (key: 'riskZones' | 'lightning' | 'storms' | 'alerts' | 'vulnerable') => void;
  highlightStormId?: string | null;
  showLegend?: boolean;
}

// Default center: Safe demonstration location in Tamil Nadu, India (Chennai Metropolitan Area)
const TAMIL_NADU_CENTER: L.LatLngTuple = [13.0827, 80.2707];

export const LeafletMap: React.FC<LeafletMapProps> = ({
  center = TAMIL_NADU_CENTER,
  zoom = 11,
  heightClass = 'h-[500px]',
  minHeightPx = 500,
  storms = [],
  selectedStormId = null,
  onSelectStorm,
  alerts = [],
  riskZones = [],
  lightningHotspots = [],
  vulnerableLocations = [],
  layers: externalLayers,
  onToggleLayer: externalOnToggleLayer,
  showLegend = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Internal layer visibility state if not controlled externally
  const [internalLayers, setInternalLayers] = useState({
    riskZones: true,
    lightning: true,
    storms: true,
    alerts: true,
    vulnerable: true,
  });

  const activeLayers = externalLayers || internalLayers;

  const handleToggle = (key: 'riskZones' | 'lightning' | 'storms' | 'alerts' | 'vulnerable') => {
    if (externalOnToggleLayer) {
      externalOnToggleLayer(key);
    } else {
      setInternalLayers((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  // Dedicated Leaflet LayerGroups for each data category
  const layerGroupsRef = useRef<{
    riskZones: L.LayerGroup;
    lightning: L.LayerGroup;
    storms: L.LayerGroup;
    alerts: L.LayerGroup;
    vulnerable: L.LayerGroup;
  }>({
    riskZones: L.layerGroup(),
    lightning: L.layerGroup(),
    storms: L.layerGroup(),
    alerts: L.layerGroup(),
    vulnerable: L.layerGroup(),
  });

  // Invalidate size helper
  const invalidateSize = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
    }
  }, []);

  // 1. INITIALIZE LEAFLET MAP ON CONTAINER MOUNT
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    // Safety: ensure container doesn't already have an active Leaflet ID from strict mode or fast re-render
    if ((container as any)._leaflet_id) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      delete (container as any)._leaflet_id;
    }

    // Initialize Map with zoom control enabled
    const map = L.map(container, {
      center: center && center[0] ? center : TAMIL_NADU_CENTER,
      zoom,
      zoomControl: false, // We explicitly add it with custom positioning
      attributionControl: true,
    });

    // Requirement 10: Add Leaflet zoom controls
    L.control.zoom({ position: 'topleft' }).addTo(map);

    // Requirement 1: Leaflet.js with OpenStreetMap tiles
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors • TEMPESTCAST GIS',
    }).addTo(map);

    // Add layer groups to map
    layerGroupsRef.current.riskZones.addTo(map);
    layerGroupsRef.current.lightning.addTo(map);
    layerGroupsRef.current.storms.addTo(map);
    layerGroupsRef.current.alerts.addTo(map);
    layerGroupsRef.current.vulnerable.addTo(map);

    mapInstanceRef.current = map;

    // Requirement 4 & 5: Ensure map.invalidateSize() is triggered whenever the container becomes visible
    // Multiple staged timers to accommodate tab switching, transitions, and DOM layout stabilization
    const timers = [
      setTimeout(() => map.invalidateSize(), 50),
      setTimeout(() => map.invalidateSize(), 150),
      setTimeout(() => map.invalidateSize(), 350),
      setTimeout(() => map.invalidateSize(), 600),
      setTimeout(() => map.invalidateSize(), 1000),
    ];

    // ResizeObserver: catches tab changes, container flex changes, and viewport adjustments
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(container);
    }

    // IntersectionObserver: specifically catches when hidden tabs become visible in DOM
    let intersectionObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        });
      });
      intersectionObserver.observe(container);
    }

    // Document visibility change listener (e.g. browser tab or preview reactivation)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Window resize listener
    const handleWindowResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      timers.forEach(clearTimeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleWindowResize);
      if (resizeObserver) resizeObserver.disconnect();
      if (intersectionObserver) intersectionObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if ((container as any)._leaflet_id) {
        delete (container as any)._leaflet_id;
      }
    };
  }, []);

  // 2. PAN WHEN CENTER OR ZOOM CHANGES
  useEffect(() => {
    if (mapInstanceRef.current && center && center[0] !== undefined) {
      mapInstanceRef.current.panTo(center, { animate: true });
      mapInstanceRef.current.invalidateSize();
    }
  }, [center[0], center[1], zoom]);

  // 3. RENDER GIS LAYERS (Risk Zones, Lightning, Storms, Trajectories, Alerts, Vulnerable Sites)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const {
      riskZones: rzGroup,
      lightning: ltgGroup,
      storms: stmGroup,
      alerts: altGroup,
      vulnerable: vulGroup,
    } = layerGroupsRef.current;

    // ─── LAYER 1: RISK ZONES POLYGONS ───
    rzGroup.clearLayers();
    if (activeLayers.riskZones && riskZones.length > 0) {
      riskZones.forEach((zone) => {
        const color =
          zone.risk_level === 'HIGH'
            ? '#ef4444'
            : zone.risk_level === 'MEDIUM'
            ? '#f59e0b'
            : '#10b981';

        const polygon = L.polygon(zone.coordinates as L.LatLngTuple[], {
          color,
          weight: 2.5,
          opacity: 0.85,
          fillColor: color,
          fillOpacity: zone.risk_level === 'HIGH' ? 0.35 : zone.risk_level === 'MEDIUM' ? 0.25 : 0.18,
          dashArray: zone.risk_level === 'LOW' ? '5, 5' : undefined,
        });

        const popupHtml = `
          <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 200px; padding: 4px;">
            <div style="font-size: 10px; font-weight: 800; color: ${color}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px;">
              ${zone.risk_level} RISK ZONE
            </div>
            <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">
              ${zone.name}
            </div>
            <div style="font-size: 11px; color: #334155; line-height: 1.6; border-top: 1px solid #e2e8f0; padding-top: 6px;">
              <div><strong>Risk Probability:</strong> ${zone.probability}%</div>
              <div><strong>Severity:</strong> ${zone.severity}</div>
              <div><strong>Confidence:</strong> ${zone.confidence}%</div>
              <div><strong>Prediction Horizon:</strong> ${zone.prediction_horizon}</div>
            </div>
            <div style="font-size: 10px; color: #64748b; margin-top: 6px; font-family: monospace;">
              Model: CNN+ConvLSTM (Tamil Nadu Sector)
            </div>
          </div>
        `;
        polygon.bindPopup(popupHtml);
        rzGroup.addLayer(polygon);
      });
    }

    // ─── LAYER 2: LIGHTNING HOTSPOTS ───
    ltgGroup.clearLayers();
    if (activeLayers.lightning && lightningHotspots.length > 0) {
      lightningHotspots.forEach((lh) => {
        const radius = Math.max(6, Math.min(13, lh.strike_rate_per_min / 1.8));

        const circle = L.circleMarker([lh.lat, lh.lng], {
          radius,
          fillColor: '#facc15',
          color: '#ca8a04',
          weight: 2,
          opacity: 0.95,
          fillOpacity: 0.75,
        });

        const popupHtml = `
          <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 12px; min-width: 170px; padding: 4px;">
            <div style="font-weight: 800; color: #854d0e; display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
              ⚡ Lightning Hotspot (${lh.type === 'CG' ? 'Cloud-to-Ground' : 'Intra-Cloud'})
            </div>
            <div style="font-size: 11px; color: #334155; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 4px;">
              <div><strong>Discharge Rate:</strong> ${lh.strike_rate_per_min} strikes/min</div>
              <div><strong>Peak Current:</strong> ${lh.peak_current_ka} kA</div>
              <div><strong>Observed:</strong> ${lh.timestamp}</div>
            </div>
          </div>
        `;
        circle.bindPopup(popupHtml);
        ltgGroup.addLayer(circle);
      });
    }

    // ─── LAYER 3: STORMS & MOVEMENT PATHS ───
    stmGroup.clearLayers();
    if (activeLayers.storms && storms.length > 0) {
      storms.forEach((storm) => {
        const isSelected = selectedStormId === storm.id;

        // Requirement 12: Distinctive Storm Marker
        const stormIcon = L.divIcon({
          className: 'custom-storm-marker',
          html: `
            <div style="
              width: ${isSelected ? '38px' : '32px'};
              height: ${isSelected ? '38px' : '32px'};
              border-radius: 9999px;
              background: ${storm.risk_level === 'HIGH' ? '#dc2626' : '#d97706'};
              border: 3px solid #ffffff;
              box-shadow: 0 0 16px ${storm.risk_level === 'HIGH' ? 'rgba(239, 68, 68, 0.85)' : 'rgba(245, 158, 11, 0.75)'};
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 14px;
              cursor: pointer;
              transform: translate(-50%, -50%);
              transition: transform 0.2s ease;
            ">
              🌪️
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([storm.current_location.lat, storm.current_location.lng], {
          icon: stormIcon,
          zIndexOffset: isSelected ? 1000 : 500,
        });

        // Requirement 12: Clicking a storm marker should show:
        // - Storm ID
        // - Current location
        // - Direction
        // - Speed
        // - Intensity
        // - Risk level
        const popupContent = `
          <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 220px; padding: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 10px; font-weight: 800; background: ${
                storm.risk_level === 'HIGH' ? '#fee2e2' : '#fef3c7'
              }; color: ${
                storm.risk_level === 'HIGH' ? '#991b1b' : '#92400e'
              }; padding: 2px 6px; border-radius: 4px;">
                ${storm.risk_level} RISK
              </span>
              <span style="font-size: 11px; color: #475569; font-family: monospace; font-weight: bold;">
                ID: ${storm.storm_id}
              </span>
            </div>

            <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 3px;">
              ${storm.name}
            </div>

            <div style="font-size: 11px; color: #334155; line-height: 1.6; border-top: 1px solid #e2e8f0; padding-top: 6px;">
              <div><strong>Storm ID:</strong> ${storm.storm_id}</div>
              <div><strong>Current Location:</strong> ${storm.current_location.area_name} (${storm.current_location.lat.toFixed(4)}°N, ${storm.current_location.lng.toFixed(4)}°E)</div>
              <div><strong>Direction:</strong> ${storm.direction} (${storm.direction_deg}°)</div>
              <div><strong>Speed:</strong> ${storm.speed_kmh} km/h</div>
              <div><strong>Intensity:</strong> ${storm.intensity_dbz} dBZ (${storm.intensity})</div>
              <div><strong>Risk Level:</strong> <span style="font-weight: bold; color: ${
                storm.risk_level === 'HIGH' ? '#dc2626' : '#d97706'
              };">${storm.risk_level}</span></div>
            </div>

            <div style="font-size: 10px; color: #64748b; margin-top: 6px; border-top: 1px dashed #e2e8f0; padding-top: 4px; font-family: monospace;">
              Last Updated: ${storm.last_updated} (Simulation)
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          if (onSelectStorm) onSelectStorm(storm);
        });

        stmGroup.addLayer(marker);

        // Requirement 8: Storm movement paths (Past + ConvLSTM Predicted Trajectory)
        if (storm.trajectory && storm.trajectory.length > 0) {
          const pastPoints = storm.trajectory.filter((t) => t.type === 'past' || t.type === 'current');
          const predictedPoints = storm.trajectory.filter((t) => t.type === 'current' || t.type === 'predicted');

          // Past path (slate dashed line)
          if (pastPoints.length >= 2) {
            const pastPolyline = L.polyline(
              pastPoints.map((p) => [p.latitude, p.longitude] as [number, number]),
              {
                color: '#64748b',
                weight: isSelected ? 3.5 : 2.5,
                opacity: 0.75,
                dashArray: '5, 5',
              }
            );
            stmGroup.addLayer(pastPolyline);
          }

          // Predicted path (amber dashed line with timestep circles)
          if (predictedPoints.length >= 2) {
            const predPolyline = L.polyline(
              predictedPoints.map((p) => [p.latitude, p.longitude] as [number, number]),
              {
                color: '#f59e0b',
                weight: isSelected ? 4 : 3,
                opacity: 0.95,
                dashArray: '6, 5',
              }
            );
            stmGroup.addLayer(predPolyline);
          }

          // Trajectory waypoint dots
          storm.trajectory.forEach((pt) => {
            if (pt.type === 'current') return; // already indicated by main storm icon

            const isPredicted = pt.type === 'predicted';
            const dot = L.circleMarker([pt.latitude, pt.longitude], {
              radius: isPredicted ? 5 : 4,
              fillColor: isPredicted ? '#f59e0b' : '#64748b',
              color: '#ffffff',
              weight: 1.5,
              opacity: 0.95,
              fillOpacity: 0.85,
            });

            dot.bindTooltip(
              `<span style="font-family: monospace; font-size: 11px;">${pt.time_label}: ${pt.intensity_dbz} dBZ</span>`,
              { permanent: false, direction: 'top' }
            );

            stmGroup.addLayer(dot);
          });
        }
      });
    }

    // ─── LAYER 4: ACTIVE ALERTS ───
    altGroup.clearLayers();
    if (activeLayers.alerts && alerts.length > 0) {
      // Coordinates for Tamil Nadu district locations
      const locCoords: Record<string, [number, number]> = {
        'loc-01': [13.0827, 80.2707], // Chennai
        'loc-02': [12.8342, 79.7036], // Kanchipuram
        'loc-03': [12.9680, 79.9450], // Sriperumbudur
        'loc-04': [12.9165, 79.1325], // Vellore
        'loc-05': [12.6841, 79.9836], // Chengalpattu
      };

      alerts.forEach((alt) => {
        const coords = locCoords[alt.location_id] || [13.0827, 80.2707];

        const alertIcon = L.divIcon({
          className: 'custom-alert-icon',
          html: `
            <div style="
              background: #ef4444;
              color: white;
              width: 24px;
              height: 24px;
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 900;
              font-size: 13px;
              border: 2px solid white;
              box-shadow: 0 0 10px rgba(239, 68, 68, 0.7);
              cursor: pointer;
            ">!</div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker(coords, { icon: alertIcon });
        marker.bindPopup(`
          <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 12px; min-width: 190px; padding: 4px;">
            <div style="color: #dc2626; font-weight: 800; font-size: 13px; margin-bottom: 2px;">
              ${alt.headline}
            </div>
            <div style="color: #475569; font-size: 11px; margin-bottom: 6px;">
              ${alt.location}
            </div>
            <div style="font-size: 11px; color: #1e293b; border-top: 1px solid #e2e8f0; padding-top: 4px; line-height: 1.5;">
              <div>Risk Level: <strong>${alt.risk_level} (${alt.probability}%)</strong></div>
              <div>Alert Type: <strong>${alt.alert_type}</strong></div>
              <div>Valid: <strong>${alt.valid_until}</strong></div>
            </div>
          </div>
        `);
        altGroup.addLayer(marker);
      });
    }

    // ─── LAYER 5: VULNERABLE LOCATIONS ───
    vulGroup.clearLayers();
    if (activeLayers.vulnerable && vulnerableLocations.length > 0) {
      vulnerableLocations.forEach((vl) => {
        const vulIcon = L.divIcon({
          className: 'custom-vul-icon',
          html: `
            <div style="
              background: #0284c7;
              color: white;
              width: 22px;
              height: 22px;
              border-radius: 9999px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              border: 2px solid white;
              cursor: pointer;
              box-shadow: 0 0 8px rgba(2, 132, 199, 0.6);
            ">★</div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        const marker = L.marker([vl.lat, vl.lng], { icon: vulIcon });
        marker.bindPopup(`
          <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 12px; padding: 4px;">
            <div style="font-weight: 700; color: #0369a1; font-size: 13px;">${vl.name}</div>
            <div style="font-size: 11px; color: #334155; margin-top: 4px; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 4px;">
              <div>Type: <strong>${vl.type}</strong></div>
              <div>Vulnerability Score: <strong>${vl.vulnerability_score}/10</strong></div>
              <div>Current Threat: <strong style="color: ${
                vl.current_risk === 'HIGH' || vl.current_risk === 'CRITICAL' ? '#dc2626' : '#d97706'
              }">${vl.current_risk}</strong></div>
              <div>Advisory: <strong>${vl.evacuation_status}</strong></div>
            </div>
          </div>
        `);
        vulGroup.addLayer(marker);
      });
    }

    // Invalidate size once layers are updated
    invalidateSize();
  }, [
    storms,
    selectedStormId,
    alerts,
    riskZones,
    lightningHotspots,
    vulnerableLocations,
    activeLayers.riskZones,
    activeLayers.lightning,
    activeLayers.storms,
    activeLayers.alerts,
    activeLayers.vulnerable,
    invalidateSize,
  ]);

  return (
    <div
      className={`relative w-full ${heightClass} rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner`}
      style={{ minHeight: `${minHeightPx}px`, height: '100%', width: '100%' }}
    >
      {/* The Actual Leaflet Map Canvas */}
      <div
        ref={mapContainerRef}
        id="tempestcast-leaflet-map-canvas"
        className="w-full h-full z-0"
        style={{ minHeight: `${minHeightPx}px`, height: '100%', width: '100%' }}
      />

      {/* Requirement 9 & 11: Visible Map Legend & Layer Controls */}
      {showLegend && (
        <div className="absolute top-3 right-3 z-[1000] max-w-[240px] w-full bg-slate-950/92 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 shadow-2xl space-y-2.5 pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="flex items-center gap-1.5 font-bold text-white text-[12px]">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              GIS Risk Map
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded">
              Active
            </span>
          </div>

          {/* Requirement 9: Visible Map Legend (LOW RISK, MEDIUM RISK, HIGH RISK) */}
          <div className="space-y-1 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <div className="text-[10px] uppercase font-mono text-slate-400 font-bold mb-1">
              Risk Level Legend
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
                <span className="font-bold text-rose-300">HIGH RISK</span>
              </span>
              <span className="text-slate-400 font-mono text-[10px]">&gt;70% (50+ dBZ)</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
                <span className="font-bold text-amber-300">MEDIUM RISK</span>
              </span>
              <span className="text-slate-400 font-mono text-[10px]">40–70%</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                <span className="font-bold text-emerald-300">LOW RISK</span>
              </span>
              <span className="text-slate-400 font-mono text-[10px]">&lt;40%</span>
            </div>
          </div>

          {/* Requirement 11: Layer Controls (Risk Zones, Storms, Lightning, Alerts) */}
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-mono text-slate-400 font-bold mb-1">
              Layer Controls
            </div>

            <label className="flex items-center justify-between cursor-pointer p-1 rounded hover:bg-slate-900 transition-colors">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-500/60 border border-rose-400" />
                <span className="text-[11px]">Risk Zones</span>
              </span>
              <input
                type="checkbox"
                checked={activeLayers.riskZones}
                onChange={() => handleToggle('riskZones')}
                className="rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-1 rounded hover:bg-slate-900 transition-colors">
              <span className="flex items-center gap-1.5">
                <span className="text-[11px]">🌪️</span>
                <span className="text-[11px]">Storms</span>
              </span>
              <input
                type="checkbox"
                checked={activeLayers.storms}
                onChange={() => handleToggle('storms')}
                className="rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-1 rounded hover:bg-slate-900 transition-colors">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-yellow-400 flex items-center justify-center text-[9px] font-bold text-slate-950">
                  ⚡
                </span>
                <span className="text-[11px]">Lightning</span>
              </span>
              <input
                type="checkbox"
                checked={activeLayers.lightning}
                onChange={() => handleToggle('lightning')}
                className="rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-1 rounded hover:bg-slate-900 transition-colors">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-500 text-white flex items-center justify-center text-[8px] font-black">
                  !
                </span>
                <span className="text-[11px]">Alerts</span>
              </span>
              <input
                type="checkbox"
                checked={activeLayers.alerts}
                onChange={() => handleToggle('alerts')}
                className="rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
              />
            </label>
          </div>

          <div className="pt-1.5 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Center: Tamil Nadu, IN</span>
            <span className="text-amber-400/90">OSM Tiles</span>
          </div>
        </div>
      )}
    </div>
  );
};
