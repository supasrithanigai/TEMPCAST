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
} from 'lucide-react';

interface WeatherCardProps {
  weather: WeatherData;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather }) => {
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
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-semibold border border-slate-700">
              Live Feed
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Station Observatory: <span className="text-slate-200 font-medium">{weather.location_name}</span>
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-slate-950/70 px-3 py-1 rounded-lg border border-slate-800 w-fit">
          Sync: {new Date(weather.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div
              key={it.id}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">{it.label}</span>
                <Icon className={`w-4 h-4 ${it.color}`} />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                  {it.value}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 truncate font-medium">{it.subvalue}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
