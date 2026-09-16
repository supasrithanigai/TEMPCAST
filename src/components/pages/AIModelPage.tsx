import React, { useState } from 'react';
import { ModelPipeline } from '../common/ModelPipeline';
import {
  Cpu,
  Layers,
  Sparkles,
  GitBranch,
  Terminal,
  BookOpen,
  Code2,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Database,
} from 'lucide-react';

export const AIModelPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'inputs' | 'code' | 'disclaimer'>('architecture');

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Prototype Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
              Educational &amp; Technical Deep Dive
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              PROPOSED AI MODEL / PROTOTYPE
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            CNN + ConvLSTM Deep Learning Architecture
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Detailed explanation of how convolutional spatio-temporal neural networks capture cloud convective morphogenesis and 30–90 minute thunderstorm translation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
            Target Framework: <strong className="text-amber-400">PyTorch / TensorFlow</strong>
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab('architecture')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'architecture'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          1. Architecture &amp; Rationale
        </button>

        <button
          onClick={() => setActiveTab('inputs')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'inputs'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          2. Inputs &amp; Outputs
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'code'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          3. Model Integration Code
        </button>

        <button
          onClick={() => setActiveTab('disclaimer')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'disclaimer'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          4. Limitations &amp; Future Work
        </button>
      </div>

      {/* TAB 1: ARCHITECTURE & WHY CNN + CONVLSTM */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          {/* Why CNN + ConvLSTM? */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
                <Cpu className="w-5 h-5" />
                <span>Convolutional Neural Network (CNN)</span>
              </div>
              <h4 className="text-base font-bold text-white">Spatial Pattern Recognition</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Atmospheric radar reflectivity grids and geostationary satellite channels exhibit rich spatial hierarchies: convective cell cores, hook echoes, gust fronts, and cloud-top cooling clusters.
              </p>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
                <div className="font-semibold text-slate-200">Key Scientific Role:</div>
                <p>
                  Learns 2D spatial feature representations without destroying neighborhood coordinate relationships, filtering ground noise and isolating updraft centroids.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2.5 text-sky-400 font-bold text-sm">
                <Sparkles className="w-5 h-5" />
                <span>Convolutional LSTM (ConvLSTM)</span>
              </div>
              <h4 className="text-base font-bold text-white">Spatio-Temporal Dynamics &amp; Evolution</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Traditional Recurrent Neural Networks (RNN/LSTM) flatten 2D spatial maps into 1D vectors, which destroys crucial spatial coordinates. ConvLSTM replaces vector matrix multiplications with convolution operators inside recurrent cell gates.
              </p>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
                <div className="font-semibold text-slate-200">Key Scientific Role:</div>
                <p>
                  Remembers temporal weather pattern evolution across timestamps ($t-30$m, $t-20$m, $t-10$m, $t_0$) and estimates cell motion vectoring, growth, and decay at +30m, +60m, +90m.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Visual Pipeline */}
          <ModelPipeline interactive={false} />
        </div>
      )}

      {/* TAB 2: INPUTS & OUTPUTS */}
      {activeTab === 'inputs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-400" />
              Model Input Tensors (Multi-Modal Stack)
            </h3>
            <p className="text-xs text-slate-400">
              Input tensor shape: <code className="text-amber-300 font-mono">[Batch, Sequence=4, Height=128, Width=128, Channels=6]</code>
            </p>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <strong className="text-amber-400 font-mono block">Ch 1: Doppler Radar Reflectivity (dBZ)</strong>
                Composite column maximum reflectivity capturing precipitation cores.
              </li>
              <li className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <strong className="text-sky-400 font-mono block">Ch 2: Satellite Infrared Brightness Temp (Kelvin)</strong>
                GOES-16 Channel 13 Clean IR detecting convective cloud-top glaciation.
              </li>
              <li className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <strong className="text-yellow-400 font-mono block">Ch 3: Lightning Flash Density (flashes / km² / min)</strong>
                GLM optical stroke clusters indicating severe updraft electrification.
              </li>
              <li className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <strong className="text-emerald-400 font-mono block">Ch 4: Surface Dew Point Depression (°C)</strong>
                Thermodynamic low-level moisture availability fueling convective boundary layer.
              </li>
              <li className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <strong className="text-purple-400 font-mono block">Ch 5: Surface Wind Divergence / Convergence (s⁻¹)</strong>
                Frontal boundary collision and squall line gust front initiation.
              </li>
              <li className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <strong className="text-rose-400 font-mono block">Ch 6: NWP CAPE Parameter (J/kg)</strong>
                High-Resolution Rapid Refresh (HRRR) convective available potential energy.
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Model Output Projections (Multi-Head Classification &amp; Regression)
            </h3>
            <p className="text-xs text-slate-400">
              Produces probabilistic nowcast predictions across discrete lead-time horizons:
            </p>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <strong className="text-emerald-400 font-mono block">1. Thunderstorm Probability [0.0 - 1.0]</strong>
                Sigmoid probability that convective reflectivity will exceed 40 dBZ within local perimeter.
              </li>
              <li className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <strong className="text-yellow-400 font-mono block">2. Lightning Strike Probability [0.0 - 1.0]</strong>
                Probability of cloud-to-ground or intra-cloud electrical discharge activity.
              </li>
              <li className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <strong className="text-amber-400 font-mono block">3. Peak Reflectivity Regression (dBZ)</strong>
                Estimated maximum radar reflectivity core intensity at horizon timestamp.
              </li>
              <li className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <strong className="text-rose-400 font-mono block">4. Categorical Severity Level</strong>
                Discrete classification head: LOW, MEDIUM, HIGH (Minor, Moderate, Severe, Extreme).
              </li>
              <li className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <strong className="text-sky-400 font-mono block">5. Prediction Confidence Score (%)</strong>
                Calibrated Bayesian epistemic and aleatoric uncertainty measure.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 3: CODE INTEGRATION ARCHITECTURE */}
      {activeTab === 'code' && (
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                Production PyTorch Model Integration Scaffold
              </h3>
              <p className="text-xs text-slate-400">
                How students or researchers plug a real trained model checkpoint into the FastAPI backend
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              backend/ml_pipeline.py
            </span>
          </div>

          <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`# Sample PyTorch ConvLSTM Integration Scaffold
import torch
import torch.nn as nn

class ConvLSTMCell(nn.Module):
    def __init__(self, in_channels, hidden_channels, kernel_size=3):
        super().__init__()
        self.conv = nn.Conv2d(
            in_channels + hidden_channels, 
            4 * hidden_channels, 
            kernel_size, 
            padding=kernel_size // 2
        )
        self.hidden_channels = hidden_channels

    def forward(self, x, h, c):
        combined = torch.cat([x, h], dim=1)
        gates = self.conv(combined)
        cc_i, cc_f, cc_o, cc_g = torch.chunk(gates, 4, dim=1)
        i = torch.sigmoid(cc_i)
        f = torch.sigmoid(cc_f)
        o = torch.sigmoid(cc_o)
        g = torch.tanh(cc_g)
        c_next = f * c + i * g
        h_next = o * torch.tanh(c_next)
        return h_next, c_next

# In backend/ml_pipeline.py:
# def load_trained_model(weights_path: str):
#     model = TempestCastNet()
#     model.load_state_dict(torch.load(weights_path, map_location='cpu'))
#     model.eval()
#     return model`}
          </pre>

          <p className="text-xs text-slate-400">
            The FastAPI endpoint <code className="text-amber-400">/api/nowcast</code> in <code className="text-slate-300">backend/main.py</code> is architected to seamlessly route preprocessed tensors through this forward pass.
          </p>
        </div>
      )}

      {/* TAB 4: LIMITATIONS & FUTURE WORK */}
      {activeTab === 'disclaimer' && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-slate-900/80 border border-amber-500/40 text-xs text-slate-300 space-y-3">
            <h4 className="text-base font-bold text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Scientific Validation Notice &amp; Prototype Boundaries
            </h4>
            <p className="leading-relaxed">
              <strong>DO NOT</strong> falsely claim that this AI model is scientifically validated or operational. As a student research prototype:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-300 pl-2">
              <li>Numerical values in this prototype demo are simulated to demonstrate the GIS pipeline and response workflow.</li>
              <li>A real operational nowcasting system requires continuous multi-Doppler radar synchronization and calibration.</li>
              <li>Emergency dispatch and civil protection warnings must always be verified by national weather authorities (such as NOAA/NWS or IMD).</li>
            </ul>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-emerald-400" />
              Future Roadmap &amp; Student Research Steps
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-slate-300 pl-2">
              <li>
                <strong>Dataset Acquisition:</strong> Download archived NEXRAD Level II volumes and GOES-16 GLM NetCDF files from AWS Open Data.
              </li>
              <li>
                <strong>Training &amp; Loss Optimization:</strong> Train the ConvLSTM model using combined Binary Cross Entropy (BCE) and Critical Success Index (CSI) loss.
              </li>
              <li>
                <strong>Verification Metrics:</strong> Calculate verified Precision, Recall, Critical Success Index (CSI), and False Alarm Ratio (FAR).
              </li>
              <li>
                <strong>Model Deployment:</strong> Export trained checkpoints to ONNX / TorchScript for sub-second inference in the FastAPI backend.
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};
