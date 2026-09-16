import React from 'react';
import {
  CloudLightning,
  Shield,
  Layers,
  Sparkles,
  BookOpen,
  Code2,
  Database,
  Radio,
  Satellite,
  Zap,
  Globe,
  Award,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const techStack = [
    { name: 'React (TypeScript)', role: 'Frontend Framework & State Management' },
    { name: 'Tailwind CSS', role: 'Emergency Operations Center Dark Design System' },
    { name: 'Leaflet.js + OpenStreetMap', role: 'GIS Mapping & Dynamic Trajectory Vectors' },
    { name: 'Python FastAPI', role: 'High-Performance Asynchronous Inference Backend' },
    { name: 'Supabase / PostgreSQL', role: 'Relational & Spatial Database with GIS Extensions' },
    { name: 'CNN + ConvLSTM', role: 'Proposed Spatio-Temporal Deep Learning Architecture' },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Hero Card */}
      <div className="rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8">
        <div className="flex items-center gap-2.5 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
          <CloudLightning className="w-4 h-4 text-amber-400" />
          <span>Disaster Management Research Prototype</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2 tracking-tight">
          TEMPESTCAST
        </h1>
        <p className="text-base sm:text-lg text-amber-300 font-medium mt-1">
          AI-Powered Thunderstorm &amp; Lightning Nowcasting (30–90 Minute Horizons)
        </p>
        <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed max-w-3xl">
          Severe convective thunderstorms and lightning strikes are among the deadliest and costliest natural hazards worldwide, causing sudden flash floods, aviation delays, power grid disruptions, and fatalities. TEMPESTCAST bridges the gap between conventional radar extrapolation and numerical weather prediction through spatio-temporal deep learning.
        </p>

        {/* Official Academic Disclaimer Box as mandated */}
        <div className="mt-5 p-4 rounded-xl bg-slate-950/80 border border-amber-500/40 text-xs text-amber-200/95 leading-relaxed">
          <strong>Academic Notice:</strong> "TEMPESTCAST is an academic prototype exploring AI applications in disaster management and short-term severe weather forecasting. It is not scientifically validated for operational emergency dispatch."
        </div>
      </div>

      {/* Why Short-Term Nowcasting is Critical */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Shield className="w-4 h-4" />
            <span>The 30–90 Minute Lead-Time Gap</span>
          </div>
          <h3 className="text-base font-bold text-white">Why Nowcasting Matters</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Numerical Weather Prediction (NWP) models require hours to assimilate observations and solve differential equations, making them unable to resolve rapid thunderstorm initiation occurring on 15–45 minute timescales.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Conversely, standard radar extrapolation assumes storm cells maintain constant speed and intensity without developing or dying. Deep learning with ConvLSTM captures non-linear convective initiation, rapid intensification, and dissipation.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>The Role of AI &amp; Deep Learning</span>
          </div>
          <h3 className="text-base font-bold text-white">Spatial &amp; Temporal Intelligence</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>CNN (Convolutional Neural Network):</strong> Learns spatial weather patterns such as storm structure, convective core shape, echo tops, and meso-cyclonic signatures across 2D radar and satellite grids.
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>ConvLSTM (Convolutional LSTM):</strong> Learns how spatial weather patterns evolve over time and predicts storm translation, lightning flash likelihood, and dissipation over 30, 60, and 90 minute horizons.
          </p>
        </div>
      </div>

      {/* Atmospheric Data Sources Combined */}
      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          The Five Multi-Modal Atmospheric Data Sources
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <Radio className="w-4 h-4 text-amber-400 mb-1" />
            <div className="font-bold text-white">1. Radar Data</div>
            <p className="text-slate-400 text-[11px]">
              Doppler reflectivity &amp; dual-polarization precipitation cores.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <Satellite className="w-4 h-4 text-sky-400 mb-1" />
            <div className="font-bold text-white">2. Satellite Data</div>
            <p className="text-slate-400 text-[11px]">
              Geostationary Clean IR cloud-top brightness temperatures.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <Zap className="w-4 h-4 text-yellow-400 mb-1" />
            <div className="font-bold text-white">3. Lightning Data</div>
            <p className="text-slate-400 text-[11px]">
              GLM optical events and ground RF stroke flash clusters.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <CloudLightning className="w-4 h-4 text-emerald-400 mb-1" />
            <div className="font-bold text-white">4. Weather Stations</div>
            <p className="text-slate-400 text-[11px]">
              Automated surface temperature, dew point, and wind sensors.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <Globe className="w-4 h-4 text-purple-400 mb-1" />
            <div className="font-bold text-white">5. NWP Data</div>
            <p className="text-slate-400 text-[11px]">
              Convective Available Potential Energy (CAPE) background fields.
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack Breakdown requested in prompt */}
      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Code2 className="w-4 h-4 text-emerald-400" />
          Technical Stack &amp; Architecture
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="text-xs font-bold text-amber-300 font-mono">{tech.name}</div>
              <div className="text-[11px] text-slate-400 mt-1">{tech.role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Project Team & Contact Notice */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Disaster Management &amp; Meteorological Informatics Engineering Prototype</span>
        </div>
        <span className="font-mono text-slate-500">v1.0.0-prototype</span>
      </div>
    </div>
  );
};
