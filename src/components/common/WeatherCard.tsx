import React from 'react';
import { WeatherData } from '../../types';
import {
  Thermometer,
  Droplets,
  Wind,
  Compass,
  Gauge,
  CloudRain,
  Flame,
  Radio,
  FileQuestion,
} from 'lucide-react';

interface WeatherCardProps {
  weather: WeatherData | null;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather }) => {
  if (!weather) {
    return (
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 text-center space-y-3 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-slate-800/80 text-amber-400 flex items-center justify-center mx-auto">
          <FileQuestion className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-base font-bold text-white">
              Surface Atmospheric Telemetry
            </h3>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              Awaiting Original Dataset
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No weather observations currently ingested. Upload original station observation files (CSV, XLS, XLSX, or TXT) in the Datasets section to view verified atmospheric variables.
          </p>
        </div>
      </div>
    );
  }

  const items = [
    {
      id: 'temp',
      label: 'Temperature',
      value: `${weather.temperature_c}°C`,
      subvalue: `Dew Point: ${weather.dew_point_c}°C`,
      icon: Thermometer,
      color: 'text-orange-400',
    },
    {
      id: 'humidity',
      label: 'Humidity',
      value: `${weather.humidity_percent}%`,
      subvalue: weather.humidity_percent > 70 ? 'High Moisture Flux' : 'Moderate Moisture',
      icon: Droplets,
      color: 'text-cyan-400',
    },
    {
      id: 'wind',
      label: 'Wind Speed',
      value: `${weather.wind_speed_kmh} km/h`,
      subvalue: `Heading ${weather.wind_direction} (${weather.wind_direction_deg}°)`,
      icon: Wind,
      color: 'text-sky-400',
    },
    {
      id: 'pressure',
      label: 'Surface Pressure',
      value: `${weather.pressure_hpa} hPa`,
      subvalue: weather.pressure_hpa < 1008 ? 'Depression / Low' : 'Stable Gradient',
      icon: Gauge,
      color: 'text-indigo-400',
    },
    {
      id: 'rainfall',
      label: 'Precipitation',
      value: `${weather.rainfall_mm} mm`,
      subvalue: 'Past 1-hr Accumulation',
      icon: CloudRain,
      color: 'text-blue-400',
    },
    {
      id: 'cape',
      label: 'CAPE Energy',
      value: `${weather.cape_j_kg} J/kg`,
      subvalue: weather.cape_j_kg > 2500 ? 'Extreme Convective Instability' : 'Moderate Instability',
      icon: Flame,
      color: 'text-rose-400',
    },
    {
      id: 'radar',
      label: 'Radar Reflectivity',
      value: `${weather.radar_reflectivity_dbz} dBZ`,
      subvalue: 'Dual-Pol Composite Z Max',
      icon: Radio,
      color: 'text-amber-400',
    },
    {
      id: 'wind_dir',
      label: 'Wind Direction',
      value: weather.wind_direction,
      subvalue: `${weather.wind_direction_deg}° Azimuth`,
      icon: Compass,
      color: 'text-emerald-400',
    },
  ];

  return (
    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            Surface Atmospheric Telemetry
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
              ORIGINAL DATASET
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Station Source: <span className="text-slate-200 font-medium">{weather.location_name}</span>
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-slate-950/70 px-3 py-1 rounded-lg border border-slate-800 w-fit">
          Timestamp: {new Date(weather.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="rounded-lg bg-slate-950/70 border border-slate-800/80 p-3.5 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{item.label}</span>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white font-mono mt-1">
                {item.value}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 truncate">{item.subvalue}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
