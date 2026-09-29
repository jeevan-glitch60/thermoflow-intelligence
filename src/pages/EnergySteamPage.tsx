import React, { useState } from 'react';
import {
  Zap,
  Flame,
  Droplets,
  Gauge,
  Sliders,
  Sparkles,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useFieldStore } from '../store/useFieldStore';
import { ModelBadge } from '../components/common/ModelBadge';

export const EnergySteamPage: React.FC = () => {
  const { wells } = useFieldStore();

  // Steam allocation module state
  const [totalSteamAvail, setTotalSteamAvail] = useState<number>(45);
  const [waterConstraint, setWaterConstraint] = useState<number>(90);
  const [energyCostIndex, setEnergyCostIndex] = useState<number>(1.1);

  // Well-wise steam & energy data
  const wellEnergyData = wells.map((w) => {
    const steamUse = w.currentPhase === 'Injection' ? w.cssParams.injectionRateTph : 0;
    const energyGj = Math.round(steamUse * 2.75 * 24 + w.srpParams.motorPowerKw * 24 * 0.0036);
    const waterM3 = Math.round(steamUse * 1.05 * 24);

    return {
      wellId: w.id,
      phase: w.currentPhase,
      steamRateTph: steamUse,
      energyGj,
      waterM3,
      energyPerBbl: w.energyIntensity,
      oilRate: w.oilRate,
    };
  });

  const totalSteamDemand = wells
    .filter((w) => w.currentPhase === 'Injection')
    .reduce((sum, w) => sum + w.cssParams.injectionRateTph, 0);

  const totalDailyWater = wellEnergyData.reduce((sum, d) => sum + d.waterM3, 0);
  const totalDailyEnergy = wellEnergyData.reduce((sum, d) => sum + d.energyGj, 0);

  // Steam allocation candidates ranked by thermal uplift potential
  const allocationRecommendations = [
    {
      wellId: 'BGW-03',
      recommendedTph: 18.5,
      reason: 'Soak completed; preheating adjacent fracture matrix will accelerate production by +28 BOPD.',
      sorImpact: '2.9 t/t (Optimized)',
      confidence: 91,
    },
    {
      wellId: 'BGW-01',
      recommendedTph: 15.0,
      reason: 'Continue cycle 3 injection; lower injection rate to improve heat conformance and reduce 24% heat loss.',
      sorImpact: '3.6 t/t (Reduced loss)',
      confidence: 86,
    },
    {
      wellId: 'BGW-07',
      recommendedTph: 11.5,
      reason: 'Maintain baseline thermal chamber expansion on cycle 1.',
      sorImpact: '3.9 t/t',
      confidence: 84,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#233149] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Zap className="w-6 h-6 text-yellow-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-mono tracking-tight">
              Steam, Water & Energy Management
            </h1>
            <ModelBadge type="Illustrative model output" />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Surface boiler fuel optimization, feedwater consumption, and well-wise steam allocation algorithms.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <span>Steam Utilization:</span>
          <span className="font-bold text-orange-400">
            {Math.round((totalSteamDemand / totalSteamAvail) * 100)}%
          </span>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-[#101622] p-3 rounded-lg border border-[#233149]">
          <div className="text-[10px] text-slate-400">Steam Demand</div>
          <div className="text-xl font-bold font-mono text-orange-400 mt-0.5">
            {totalSteamDemand.toFixed(1)} t/h
          </div>
          <div className="text-[9px] text-slate-500">2 active injectors</div>
        </div>

        <div className="bg-[#101622] p-3 rounded-lg border border-[#233149]">
          <div className="text-[10px] text-slate-400">Available Capacity</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
            {totalSteamAvail.toFixed(1)} t/h
          </div>
          <div className="text-[9px] text-slate-500">
            {(totalSteamAvail - totalSteamDemand).toFixed(1)} t/h reserve
          </div>
        </div>

        <div className="bg-[#101622] p-3 rounded-lg border border-[#233149]">
          <div className="text-[10px] text-slate-400">Daily Feedwater</div>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">
            {totalDailyWater.toLocaleString()} m³/d
          </div>
          <div className="text-[9px] text-slate-500">RO treatment plant</div>
        </div>

        <div className="bg-[#101622] p-3 rounded-lg border border-[#233149]">
          <div className="text-[10px] text-slate-400">Total Energy Burn</div>
          <div className="text-xl font-bold font-mono text-yellow-300 mt-0.5">
            {totalDailyEnergy.toLocaleString()} GJ/d
          </div>
          <div className="text-[9px] text-slate-500">Boiler gas + drive power</div>
        </div>

        <div className="bg-[#101622] p-3 rounded-lg border border-[#233149]">
          <div className="text-[10px] text-slate-400">Avg Steam-Oil Ratio</div>
          <div className="text-xl font-bold font-mono text-amber-300 mt-0.5">3.4 t/t</div>
          <div className="text-[9px] text-slate-500">Target: &lt;3.8 t/t</div>
        </div>

        <div className="bg-[#101622] p-3 rounded-lg border border-[#233149]">
          <div className="text-[10px] text-slate-400">Avg Energy Intensity</div>
          <div className="text-xl font-bold font-mono text-slate-200 mt-0.5">1.42 GJ/bbl</div>
          <div className="text-[9px] text-slate-500">Synthetic field baseline</div>
        </div>
      </div>

      {/* Row 2: Charts (Steam Allocation vs Energy Consumption per Well) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Steam Allocation by Well */}
        <div className="bg-[#101622] border border-[#233149] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 font-mono">
                Steam Injection Allocation by Well (t/h)
              </h3>
              <p className="text-xs text-slate-400">Active distribution from Central Steam Plant</p>
            </div>
            <span className="text-xs font-mono text-orange-400">Total: {totalSteamDemand} t/h</span>
          </div>

          <div className="w-full h-64 bg-[#0b0e14] rounded-lg border border-[#1c273c] p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wellEnergyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c273c" />
                <XAxis dataKey="wellId" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
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
                <Bar dataKey="steamRateTph" name="Steam Injection Rate (t/h)" fill="#ea580c" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Energy Intensity by Well */}
        <div className="bg-[#101622] border border-[#233149] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 font-mono">
                Energy Intensity by Well (GJ / bbl Oil)
              </h3>
              <p className="text-xs text-slate-400">Specific thermal and mechanical lifting cost</p>
            </div>
            <span className="text-xs font-mono text-yellow-400">Threshold: &lt;2.0 GJ/bbl</span>
          </div>

          <div className="w-full h-64 bg-[#0b0e14] rounded-lg border border-[#1c273c] p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wellEnergyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c273c" />
                <XAxis dataKey="wellId" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
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
                <Bar dataKey="energyPerBbl" name="Energy Intensity (GJ/bbl)" fill="#eab308" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Steam Allocation Recommendation Module */}
      <div className="bg-[#101622] border border-[#233149] rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#233149] pb-3">
          <div>
            <h3 className="text-base font-bold font-mono text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Intelligent Steam Allocation Optimizer</span>
            </h3>
            <p className="text-xs text-slate-400">
              Optimal redistribution of boiler enthalpy based on reservoir heating capacity and lift health.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-[#151d2d] px-2.5 py-1 rounded border border-[#233149]">
            Optimization Model: Multivariable Enthalpy Dispatch
          </span>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Total Steam Boiler Supply:</span>
              <span className="text-orange-400 font-bold">{totalSteamAvail} t/h</span>
            </div>
            <input
              type="range"
              min="30"
              max="60"
              step="1"
              value={totalSteamAvail}
              onChange={(e) => setTotalSteamAvail(Number(e.target.value))}
              className="w-full accent-orange-500 bg-[#151d2d] cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Water Treatment Availability:</span>
              <span className="text-cyan-400 font-bold">{waterConstraint}%</span>
            </div>
            <input
              type="range"
              min="60"
              max="100"
              step="5"
              value={waterConstraint}
              onChange={(e) => setWaterConstraint(Number(e.target.value))}
              className="w-full accent-cyan-500 bg-[#151d2d] cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Energy Cost Index:</span>
              <span className="text-yellow-400 font-bold">{energyCostIndex}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.8"
              step="0.05"
              value={energyCostIndex}
              onChange={(e) => setEnergyCostIndex(Number(e.target.value))}
              className="w-full accent-yellow-500 bg-[#151d2d] cursor-pointer"
            />
          </div>
        </div>

        {/* Ranked Allocation Output Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#233149] text-slate-400 font-mono text-[11px] bg-[#151d2d]">
                <th className="py-2.5 px-3">Candidate Well</th>
                <th className="py-2.5 px-3 text-right">Recommended Steam Slug</th>
                <th className="py-2.5 px-3">Technical Reasoning</th>
                <th className="py-2.5 px-3 text-right">Target SOR</th>
                <th className="py-2.5 px-3 text-right">Model Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#233149]/60 font-mono">
              {allocationRecommendations.map((rec) => (
                <tr key={rec.wellId} className="hover:bg-[#151d2d]/60">
                  <td className="py-2.5 px-3 font-bold text-amber-400">{rec.wellId}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-orange-400">
                    {rec.recommendedTph} t/h
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 font-sans text-[11px]">{rec.reason}</td>
                  <td className="py-2.5 px-3 text-right text-cyan-400">{rec.sorImpact}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-400">{rec.confidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
