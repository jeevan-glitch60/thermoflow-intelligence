import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Activity,
  Layers,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { useFieldStore } from '../store/useFieldStore';
import { ModelBadge } from '../components/common/ModelBadge';
import { runWhatIfScenario } from '../services/simulationEngine';
import { WhatIfScenarioInput } from '../types';

export const SimulationPage: React.FC = () => {
  const { wells, selectedWellId, setSelectedWellId } = useFieldStore();
  const baselineWell = wells.find((w) => w.id === selectedWellId) || wells[0];

  // Scenario template list
  const templates = [
    {
      id: 'demo_constraint',
      name: 'Reduced Steam + Higher Heat Loss (Demo)',
      desc: 'Simulate boiler capacity bottleneck (-25% steam, +8% heat loss factor)',
      params: {
        steamVolumeTonnes: 320,
        injectionPressureBar: 36,
        soakTimeHours: 24,
        heatLossFactorPct: 27,
        availableSteamCapacityPct: 65,
      },
    },
    {
      id: 'high_enthalpy',
      name: 'Aggressive Steam Slug (+20% Volume)',
      desc: 'Maximize thermal radius with 500t steam and extended 48h soak',
      params: {
        steamVolumeTonnes: 500,
        injectionPressureBar: 42,
        soakTimeHours: 48,
        availableSteamCapacityPct: 95,
      },
    },
    {
      id: 'srp_tuning',
      name: 'High SRP Drawdown (8.2 SPM)',
      desc: 'Accelerate liquid lift on warm crude with high beam speed',
      params: {
        spm: 8.2,
        strokeLengthInches: 144,
      },
    },
    {
      id: 'water_coning',
      name: 'High Water Cut Inflow (45% WC)',
      desc: 'Assess bottom-water cone development and lift separation load',
      params: {
        waterCut: 45,
      },
    },
    {
      id: 'cold_crude',
      name: 'Severe Viscosity Recoil (14,000 cP)',
      desc: 'Simulate early thermal cooling before cycle completion',
      params: {
        viscosity: 14000,
        reservoirTemp: 42,
      },
    },
  ];

  // Interactive scenario state
  const [selectedTemplate, setSelectedTemplate] = useState<string>('demo_constraint');
  const [scenarioInput, setScenarioInput] = useState<WhatIfScenarioInput>({
    wellId: baselineWell.id,
    steamVolumeTonnes: 320,
    injectionPressureBar: 36,
    injectionDurationHours: 18,
    soakTimeHours: 24,
    prodCutoffBopd: 22,
    strokeLengthInches: baselineWell.srpParams.strokeLengthInches,
    spm: baselineWell.srpParams.strokesPerMinute,
    reservoirTemp: baselineWell.reservoirTemp,
    reservoirPressure: baselineWell.reservoirPressure,
    viscosity: baselineWell.viscosity,
    waterCut: baselineWell.waterCut,
    energyCostIndex: 1.15,
    availableSteamCapacityPct: 65,
    waterAvailabilityPct: 85,
  });

  const handleApplyTemplate = (tplId: string) => {
    setSelectedTemplate(tplId);
    const tpl = templates.find((t) => t.id === tplId);
    if (!tpl) return;

    setScenarioInput((prev) => ({
      ...prev,
      ...tpl.params,
    }));
  };

  // Run What-If simulation
  const result = runWhatIfScenario(baselineWell, scenarioInput);

  return (
    <div className="space-y-6">
      {/* Title & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#233149] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-mono tracking-tight">
              Well-to-Surface What-If Simulator
            </h1>
            <ModelBadge type="Simulated scenario result" />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Simulate parameter perturbations, surface constraints, and thermal response trade-offs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Target Well:</span>
          <select
            value={baselineWell.id}
            onChange={(e) => setSelectedWellId(e.target.value)}
            className="bg-[#151d2d] border border-[#233149] text-amber-400 font-mono text-xs rounded px-2.5 py-1"
          >
            {wells.map((w) => (
              <option key={w.id} value={w.id}>
                {w.id} ({w.currentPhase})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mandatory Safety Notice */}
      <div className="bg-[#151d2d] border border-amber-500/30 p-2.5 rounded-lg flex items-center gap-2.5 text-xs text-amber-300 font-mono">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
        <span>SIMULATION MODE — ILLUSTRATIVE OUTPUT — REQUIRES ENGINEERING VALIDATION.</span>
      </div>

      {/* Scenario Templates Bar */}
      <div className="bg-[#101622] border border-[#233149] p-3 rounded-xl space-y-2">
        <div className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Predefined Operational Scenarios & Bottlenecks</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => handleApplyTemplate(tpl.id)}
              className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                selectedTemplate === tpl.id
                  ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm'
                  : 'bg-[#151d2d] border-[#233149] text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="font-semibold font-mono">{tpl.name}</div>
              <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">{tpl.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Inputs vs Output Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Input Sliders */}
        <div className="bg-[#101622] border border-[#233149] rounded-xl p-4 space-y-4">
          <div className="border-b border-[#233149] pb-2 text-sm font-bold font-mono text-slate-100 flex items-center justify-between">
            <span>Scenario Parameter Adjustments</span>
            <span className="text-xs text-amber-400 font-normal">{baselineWell.id}</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Steam Slug Volume:</span>
              <span className="text-amber-400 font-bold">{scenarioInput.steamVolumeTonnes} t</span>
            </div>
            <input
              type="range"
              min="150"
              max="600"
              step="10"
              value={scenarioInput.steamVolumeTonnes}
              onChange={(e) =>
                setScenarioInput({ ...scenarioInput, steamVolumeTonnes: Number(e.target.value) })
              }
              className="w-full accent-amber-500 bg-[#151d2d] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Baseline: {baselineWell.cssParams.steamVolumeTonnes} t</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Soak Period:</span>
              <span className="text-amber-300 font-bold">{scenarioInput.soakTimeHours} hrs</span>
            </div>
            <input
              type="range"
              min="12"
              max="72"
              step="2"
              value={scenarioInput.soakTimeHours}
              onChange={(e) =>
                setScenarioInput({ ...scenarioInput, soakTimeHours: Number(e.target.value) })
              }
              className="w-full accent-amber-500 bg-[#151d2d] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Baseline: {baselineWell.cssParams.soakTimeHours} hrs</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">SRP Pumping Speed:</span>
              <span className="text-cyan-400 font-bold">{scenarioInput.spm} SPM</span>
            </div>
            <input
              type="range"
              min="3.5"
              max="10.0"
              step="0.2"
              value={scenarioInput.spm}
              onChange={(e) =>
                setScenarioInput({ ...scenarioInput, spm: Number(e.target.value) })
              }
              className="w-full accent-cyan-500 bg-[#151d2d] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Baseline: {baselineWell.srpParams.strokesPerMinute} SPM</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Steam Plant Available Capacity:</span>
              <span className="text-orange-400 font-bold">
                {scenarioInput.availableSteamCapacityPct}%
              </span>
            </div>
            <input
              type="range"
              min="40"
              max="100"
              step="5"
              value={scenarioInput.availableSteamCapacityPct}
              onChange={(e) =>
                setScenarioInput({
                  ...scenarioInput,
                  availableSteamCapacityPct: Number(e.target.value),
                })
              }
              className="w-full accent-orange-500 bg-[#151d2d] cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Produced Water Cut:</span>
              <span className="text-cyan-300 font-bold">{scenarioInput.waterCut}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="65"
              step="1"
              value={scenarioInput.waterCut}
              onChange={(e) =>
                setScenarioInput({ ...scenarioInput, waterCut: Number(e.target.value) })
              }
              className="w-full accent-cyan-500 bg-[#151d2d] cursor-pointer"
            />
          </div>
        </div>

        {/* Comparison Table & Recommendation Output */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#101622] border border-[#233149] rounded-xl p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 font-mono">
                  Baseline vs Scenario Operational Impact Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Simulated delta across thermal, production, energy, and artificial lift efficiency.
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400">
                Confidence: {result.confidencePct}%
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#233149] text-slate-400 font-mono text-[11px] bg-[#151d2d]">
                    <th className="py-2.5 px-3">Metric</th>
                    <th className="py-2.5 px-3 text-right">Baseline</th>
                    <th className="py-2.5 px-3 text-right">Scenario</th>
                    <th className="py-2.5 px-3 text-right">Difference</th>
                    <th className="py-2.5 px-3">Model Interpretation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#233149]/60 font-mono">
                  {result.comparisonRows.map((row) => (
                    <tr key={row.metric} className="hover:bg-[#151d2d]/60">
                      <td className="py-2.5 px-3 font-semibold text-slate-200">{row.metric}</td>
                      <td className="py-2.5 px-3 text-right text-slate-400">{row.baseline}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-amber-400">
                        {row.scenario}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-bold ${
                          row.improved ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {row.diff}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 font-sans text-[11px]">
                        {row.interpretation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Scenario Recommendation & Assumptions */}
          <div className="bg-[#151d2d] border border-[#233149] rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Simulated Scenario Engineering Assessment</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {result.summaryRecommendation}
            </p>

            <div className="pt-2 border-t border-[#233149] space-y-1">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">
                Underlying Physical Assumptions:
              </span>
              <ul className="text-[11px] text-slate-400 space-y-0.5 list-disc pl-4 font-sans">
                {result.assumptions.map((asm, idx) => (
                  <li key={idx}>{asm}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
