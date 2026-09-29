import React, { useState } from 'react';
import {
  Flame,
  Droplets,
  Sliders,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Info,
  Save,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useFieldStore } from '../store/useFieldStore';
import { CssTimeline } from '../components/css/CssTimeline';
import { ModelBadge } from '../components/common/ModelBadge';
import { generateCssRecommendations, calculateThermalResponse } from '../services/simulationEngine';

export const CssOptimizerPage: React.FC = () => {
  const {
    wells,
    selectedWellId,
    updateCssParams,
    loadDemoScenario,
  } = useFieldStore();

  const well = wells.find((w) => w.id === selectedWellId) || wells[0];
  const css = well.cssParams;

  // Local state for interactive editing before committing
  const [steamVol, setSteamVol] = useState<number>(css.steamVolumeTonnes);
  const [injPressure, setInjPressure] = useState<number>(css.injectionPressureBar);
  const [injRate, setInjRate] = useState<number>(css.injectionRateTph);
  const [steamQuality, setSteamQuality] = useState<number>(css.steamQualityPct);
  const [soakHours, setSoakHours] = useState<number>(css.soakTimeHours);
  const [prodCutoff, setProdCutoff] = useState<number>(css.prodCutoffBopd);
  const [heatLoss, setHeatLoss] = useState<number>(css.heatLossFactorPct);

  // Recommendations generator
  const recData = generateCssRecommendations(well);

  const handleSimulate = () => {
    updateCssParams(well.id, {
      steamVolumeTonnes: steamVol,
      injectionPressureBar: injPressure,
      injectionRateTph: injRate,
      steamQualityPct: steamQuality,
      soakTimeHours: soakHours,
      prodCutoffBopd: prodCutoff,
      heatLossFactorPct: heatLoss,
    });
  };

  const handleApplyOptimal = () => {
    // Demo sequence: BGW-03 optimal setpoints
    setSteamVol(460);
    setInjPressure(41);
    setSoakHours(42);
    setProdCutoff(25);
    updateCssParams(well.id, {
      steamVolumeTonnes: 460,
      injectionPressureBar: 41,
      soakTimeHours: 42,
      prodCutoffBopd: 25,
      heatLossFactorPct: 15,
    });
  };

  const handleReset = () => {
    setSteamVol(css.steamVolumeTonnes);
    setInjPressure(css.injectionPressureBar);
    setInjRate(css.injectionRateTph);
    setSteamQuality(css.steamQualityPct);
    setSoakHours(css.soakTimeHours);
    setProdCutoff(css.prodCutoffBopd);
    setHeatLoss(css.heatLossFactorPct);
  };

  // Generate simulated CSS Cycle profile curves (0 to 120 hours)
  const cycleCurveData = [];
  for (let t = 0; t <= 96; t += 4) {
    let temp = well.reservoirTemp;
    let visc = well.viscosity;
    let pressure = well.reservoirPressure;
    let prod = 0;

    if (t <= 24) {
      // Injection phase: temp increases sharply
      temp = well.reservoirTemp + (t / 24) * 110;
      visc = Math.max(600, Math.round(18500 * Math.exp(-0.025 * (temp - 35))));
      pressure = well.reservoirPressure + (t / 24) * 8;
    } else if (t <= 24 + soakHours) {
      // Soak phase: conductive diffusion, temp begins gentle plateau
      const soakElapsed = t - 24;
      temp = Math.max(65, well.reservoirTemp + 110 - (soakElapsed / soakHours) * 45);
      visc = Math.max(900, Math.round(18500 * Math.exp(-0.022 * (temp - 35))));
      pressure = well.reservoirPressure + 8 - (soakElapsed / soakHours) * 6;
    } else {
      // Production phase: oil flowing, gradual thermal decay
      const prodElapsed = t - (24 + soakHours);
      temp = Math.max(45, 95 - prodElapsed * 0.7);
      visc = Math.min(9500, Math.round(18500 * Math.exp(-0.02 * (temp - 35))));
      prod = Math.max(0, Math.round((95 - prodElapsed * 1.2) * 10) / 10);
      pressure = Math.max(26, well.reservoirPressure - 4);
    }

    cycleCurveData.push({
      hour: `${t}h`,
      temperature: Math.round(temp),
      viscosity: Math.round(visc),
      pressure: Math.round(pressure * 10) / 10,
      oilRate: Math.round(prod),
    });
  }

  return (
    <div className="space-y-6">
      {/* Title & Context Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#233149] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Flame className="w-6 h-6 text-orange-500" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-mono tracking-tight">
              Cyclic Steam Stimulation Optimizer
            </h1>
            <ModelBadge type="Illustrative model output" />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Simulate and optimize injection enthalpy, soak diffusion, and production cut-off for {well.id}.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleApplyOptimal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600/30 to-orange-600/30 hover:from-amber-600/50 hover:to-orange-600/50 border border-amber-500/40 rounded-lg text-xs font-semibold text-amber-300 transition-all shadow-sm active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Optimize Parameters</span>
          </button>
          <button
            onClick={handleSimulate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md active:scale-95"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Simulate CSS Cycle</span>
          </button>
        </div>
      </div>

      {/* Process Lifecycle Stepper */}
      <CssTimeline well={well} />

      {/* Main Grid: Inputs vs Model Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Input Parameter Controls */}
        <div className="bg-[#101622] border border-[#233149] rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[#233149] pb-2">
            <h2 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>CSS Input Parameters</span>
            </h2>
            <button
              onClick={handleReset}
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Steam Volume Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Steam Volume:</span>
              <span className="text-amber-400 font-bold">{steamVol} tonnes</span>
            </div>
            <input
              type="range"
              min="200"
              max="650"
              step="10"
              value={steamVol}
              onChange={(e) => setSteamVol(Number(e.target.value))}
              className="w-full accent-amber-500 bg-[#151d2d] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>200 t</span>
              <span>Baseline: 420 t</span>
              <span>650 t</span>
            </div>
          </div>

          {/* Injection Pressure Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Injection Pressure:</span>
              <span className="text-slate-100 font-bold">{injPressure} bar</span>
            </div>
            <input
              type="range"
              min="25"
              max="55"
              step="1"
              value={injPressure}
              onChange={(e) => setInjPressure(Number(e.target.value))}
              className="w-full accent-amber-500 bg-[#151d2d] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>25 bar</span>
              <span>Fracture Limit: 50 bar</span>
              <span>55 bar</span>
            </div>
          </div>

          {/* Soak Time Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Soak Duration:</span>
              <span className="text-amber-300 font-bold">{soakHours} hours</span>
            </div>
            <input
              type="range"
              min="12"
              max="72"
              step="2"
              value={soakHours}
              onChange={(e) => setSoakHours(Number(e.target.value))}
              className="w-full accent-amber-500 bg-[#151d2d] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>12 hrs</span>
              <span>Recommended: 42 hrs</span>
              <span>72 hrs</span>
            </div>
          </div>

          {/* Steam Quality */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Steam Quality:</span>
              <span className="text-cyan-400 font-bold">{steamQuality}%</span>
            </div>
            <input
              type="range"
              min="65"
              max="90"
              step="1"
              value={steamQuality}
              onChange={(e) => setSteamQuality(Number(e.target.value))}
              className="w-full accent-cyan-500 bg-[#151d2d] cursor-pointer"
            />
          </div>

          {/* Production Cut-off */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Production Cut-off:</span>
              <span className="text-emerald-400 font-bold">{prodCutoff} BOPD</span>
            </div>
            <input
              type="range"
              min="10"
              max="40"
              step="1"
              value={prodCutoff}
              onChange={(e) => setProdCutoff(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-[#151d2d] cursor-pointer"
            />
          </div>

          {/* Heat Loss Factor */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Heat Loss Factor:</span>
              <span className="text-rose-400 font-bold">{heatLoss}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="35"
              step="1"
              value={heatLoss}
              onChange={(e) => setHeatLoss(Number(e.target.value))}
              className="w-full accent-rose-500 bg-[#151d2d] cursor-pointer"
            />
          </div>

          <button
            onClick={handleSimulate}
            className="w-full py-2 bg-[#151d2d] hover:bg-[#1c273c] border border-amber-500/40 text-amber-300 font-mono text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>Run Parameter Simulation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center / Right: Simulated Model Outputs & Cycle Profiles */}
        <div className="lg:col-span-2 space-y-4">
          {/* Key Output KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#101622] p-3 rounded-lg border border-[#233149]">
              <div className="text-[10px] text-slate-400">Predicted Temp Rise</div>
              <div className="text-xl font-bold font-mono text-red-400 mt-0.5">
                +{recData.predictedTempUplift}°C
              </div>
              <div className="text-[9px] text-slate-500">Heated matrix zone</div>
            </div>

            <div className="bg-[#101622] p-3 rounded-lg border border-[#233149]">
              <div className="text-[10px] text-slate-400">Viscosity Reduction</div>
              <div className="text-xl font-bold font-mono text-amber-300 mt-0.5">
                -{recData.predictedViscosityDrop.toLocaleString()} cP
              </div>
              <div className="text-[9px] text-slate-500">Mobility boost</div>
            </div>

            <div className="bg-[#101622] p-3 rounded-lg border border-[#233149]">
              <div className="text-[10px] text-slate-400">Cycle Effectiveness</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                {recData.cycleEffectiveness}%
              </div>
              <div className="text-[9px] text-slate-500">Confidence: {recData.confidenceScore}%</div>
            </div>

            <div className="bg-[#101622] p-3 rounded-lg border border-[#233149]">
              <div className="text-[10px] text-slate-400">Estimated SOR</div>
              <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">
                {recData.sorEstimate} t/t
              </div>
              <div className="text-[9px] text-slate-500">Steam-Oil Ratio</div>
            </div>
          </div>

          {/* Cycle Temperature & Viscosity Profile Curves */}
          <div className="bg-[#101622] border border-[#233149] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 font-mono">
                  Cycle Time Progression Profile (Injection → Soak → Production)
                </h3>
                <p className="text-xs text-slate-400">Simulated temperature and dynamic viscosity trajectory</p>
              </div>
              <span className="text-[11px] font-mono text-amber-400">0 - 96 Hours</span>
            </div>

            <div className="w-full h-64 bg-[#0b0e14] rounded-lg border border-[#1c273c] p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cycleCurveData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c273c" />
                  <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" stroke="#ef4444" tick={{ fontSize: 10 }} unit="°C" />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#eab308"
                    tick={{ fontSize: 10 }}
                    unit=" cP"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#151d2d',
                      borderColor: '#233149',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="temperature"
                    name="Reservoir Temp (°C)"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="viscosity"
                    name="Viscosity (cP)"
                    stroke="#eab308"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="oilRate"
                    name="Oil Lift Rate (BOPD)"
                    stroke="#22c55e"
                    strokeWidth={1.5}
                    strokeDasharray="4 2"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Parameter Table */}
      <div className="bg-[#101622] border border-[#233149] rounded-xl p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-100 font-mono">
              Model Parameter Optimization Recommendations
            </h3>
            <p className="text-xs text-slate-400">
              Comparative review of current vs recommended setpoints with technical justification.
            </p>
          </div>
          <span className="text-[11px] font-mono text-amber-300 bg-[#151d2d] px-2.5 py-1 rounded border border-amber-500/20">
            Next Stage: {recData.nextPhaseRecommendation}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#233149] text-slate-400 font-mono text-[11px] bg-[#151d2d]">
                <th className="py-2.5 px-3">Parameter</th>
                <th className="py-2.5 px-3 text-right">Current</th>
                <th className="py-2.5 px-3 text-right">Recommended</th>
                <th className="py-2.5 px-3">Engineering Reason</th>
                <th className="py-2.5 px-3">Expected Simulated Impact</th>
                <th className="py-2.5 px-3 text-right">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#233149]/60 font-mono">
              {recData.recommendations.map((rec) => (
                <tr key={rec.paramName} className="hover:bg-[#151d2d]/60">
                  <td className="py-2.5 px-3 font-semibold text-slate-200">{rec.paramName}</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">{rec.currentValue}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-amber-400">
                    {rec.recommendedValue}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 font-sans text-[11px]">{rec.reason}</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-sans text-[11px]">
                    {rec.expectedImpact}
                  </td>
                  <td className="py-2.5 px-3 text-right text-cyan-400">{rec.confidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-2.5 bg-amber-950/20 border border-amber-500/20 rounded-lg text-xs text-amber-300/80 font-mono flex items-center justify-between">
          <span>Synthetic optimization recommendation — requires reservoir and production engineering review.</span>
          <button
            onClick={handleApplyOptimal}
            className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded font-semibold transition-colors"
          >
            Apply to Active Model
          </button>
        </div>
      </div>
    </div>
  );
};
