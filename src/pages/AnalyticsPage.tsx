import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Droplets,
  Flame,
  Activity,
  Layers,
  Calendar,
  Filter,
  ArrowRight,
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
  AreaChart,
  Area,
} from 'recharts';
import { useFieldStore } from '../store/useFieldStore';
import { ModelBadge } from '../components/common/ModelBadge';

export const AnalyticsPage: React.FC = () => {
  const { wells, selectedWellId, setSelectedWellId } = useFieldStore();
  const [timeRange, setTimeRange] = useState<'24H' | '7D' | '30D' | '90D'>('7D');
  const [compareWellId, setCompareWellId] = useState<string>('BGW-01');

  const selectedWell = wells.find((w) => w.id === selectedWellId) || wells[0];
  const compareWell = wells.find((w) => w.id === compareWellId) || wells[1];

  // Well comparison bar data
  const productionComparisonData = wells.map((w) => ({
    name: w.id,
    oilRate: w.oilRate,
    waterRate: Math.max(0, w.totalLiquidRate - w.oilRate),
    viscosity: Math.round(w.viscosity / 100), // scaled down for readability
    health: w.srpHealthScore,
  }));

  // Historical cycle progression comparison data
  const cycleTrendData = [
    { cycle: 'Cycle 1', BGW01: 65, BGW02: 82, BGW03: 45, BGW05: 90 },
    { cycle: 'Cycle 2', BGW01: 78, BGW02: 95, BGW03: 68, BGW05: 110 },
    { cycle: 'Cycle 3', BGW01: 88, BGW02: 104, BGW03: 82, BGW05: 125 },
    { cycle: 'Cycle 4', BGW01: 94, BGW02: 114, BGW03: 16, BGW05: 128 },
    { cycle: 'Cycle 5 (Proj)', BGW01: 102, BGW02: 118, BGW03: 112, BGW05: 134 },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#233149] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-mono tracking-tight">
              Production & Field Analytics
            </h1>
            <ModelBadge type="Illustrative model output" />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Cross-well correlation, cyclic steam response decline curves, and recovery economics.
          </p>
        </div>

        {/* Time Span Filter Buttons */}
        <div className="flex items-center gap-1 text-xs bg-[#101622] p-1 rounded-lg border border-[#233149] font-mono">
          {(['24H', '7D', '30D', '90D'] as const).map((span) => (
            <button
              key={span}
              onClick={() => setTimeRange(span)}
              className={`px-3 py-1 rounded font-semibold transition-colors ${
                timeRange === span
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {span}
            </button>
          ))}
        </div>
      </div>

      {/* Row 1: Field Production Breakdown & Cycle Trend Curves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Stacked Bar Chart */}
        <div className="bg-[#101622] border border-[#233149] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 font-mono">
                Field Fluid Production Breakdown (BOPD / BLPD)
              </h3>
              <p className="text-xs text-slate-400">Net oil vs produced formation water across 8 wells</p>
            </div>
            <span className="text-xs font-mono text-amber-400">8 Wells</span>
          </div>

          <div className="w-full h-72 bg-[#0b0e14] rounded-lg border border-[#1c273c] p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productionComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c273c" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
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
                <Bar dataKey="oilRate" name="Net Oil (BOPD)" fill="#f59e0b" stackId="a" />
                <Bar dataKey="waterRate" name="Produced Water (BWPD)" fill="#06b6d4" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CSS Cycle-over-Cycle Uplift Trend */}
        <div className="bg-[#101622] border border-[#233149] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 font-mono">
                Cyclic Oil Recovery Trajectory Across CSS Cycles
              </h3>
              <p className="text-xs text-slate-400">Peak post-soak recovery rates (Cycle 1 through Cycle 5)</p>
            </div>
            <span className="text-xs font-mono text-emerald-400">Recovery Trend</span>
          </div>

          <div className="w-full h-72 bg-[#0b0e14] rounded-lg border border-[#1c273c] p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cycleTrendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c273c" />
                <XAxis dataKey="cycle" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} unit=" BOPD" />
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
                <Line type="monotone" dataKey="BGW01" name="BGW-01" stroke="#f97316" strokeWidth={2} />
                <Line type="monotone" dataKey="BGW02" name="BGW-02" stroke="#22c55e" strokeWidth={2} />
                <Line type="monotone" dataKey="BGW03" name="BGW-03 (Active)" stroke="#f59e0b" strokeWidth={3} />
                <Line type="monotone" dataKey="BGW05" name="BGW-05" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Side-by-Side Well Comparison Engine */}
      <div className="bg-[#101622] border border-[#233149] rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#233149] pb-3">
          <div>
            <h3 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Comparative Well-to-Well Diagnostic Benchmarking</span>
            </h3>
            <p className="text-xs text-slate-400">
              Direct comparison of reservoir heating, fluid viscosity, and lifting performance.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <select
              value={selectedWell.id}
              onChange={(e) => setSelectedWellId(e.target.value)}
              className="bg-[#151d2d] border border-[#233149] text-amber-400 rounded px-2.5 py-1"
            >
              {wells.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.id} ({w.name})
                </option>
              ))}
            </select>
            <span className="text-slate-500">vs</span>
            <select
              value={compareWell.id}
              onChange={(e) => setCompareWellId(e.target.value)}
              className="bg-[#151d2d] border border-[#233149] text-cyan-400 rounded px-2.5 py-1"
            >
              {wells.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.id} ({w.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-[#151d2d] p-3 rounded-lg border border-[#233149]">
            <div className="text-slate-400 text-[10px]">Net Oil Lift</div>
            <div className="text-sm font-bold text-amber-400 mt-1">{selectedWell.id}: {selectedWell.oilRate} BOPD</div>
            <div className="text-sm font-bold text-cyan-400 mt-0.5">{compareWell.id}: {compareWell.oilRate} BOPD</div>
          </div>

          <div className="bg-[#151d2d] p-3 rounded-lg border border-[#233149]">
            <div className="text-slate-400 text-[10px]">Crude Viscosity</div>
            <div className="text-sm font-bold text-amber-400 mt-1">{selectedWell.id}: {selectedWell.viscosity.toLocaleString()} cP</div>
            <div className="text-sm font-bold text-cyan-400 mt-0.5">{compareWell.id}: {compareWell.viscosity.toLocaleString()} cP</div>
          </div>

          <div className="bg-[#151d2d] p-3 rounded-lg border border-[#233149]">
            <div className="text-slate-400 text-[10px]">Water Cut</div>
            <div className="text-sm font-bold text-amber-400 mt-1">{selectedWell.id}: {selectedWell.waterCut}%</div>
            <div className="text-sm font-bold text-cyan-400 mt-0.5">{compareWell.id}: {compareWell.waterCut}%</div>
          </div>

          <div className="bg-[#151d2d] p-3 rounded-lg border border-[#233149]">
            <div className="text-slate-400 text-[10px]">SRP Health Score</div>
            <div className="text-sm font-bold text-amber-400 mt-1">{selectedWell.id}: {selectedWell.srpHealthScore}%</div>
            <div className="text-sm font-bold text-cyan-400 mt-0.5">{compareWell.id}: {compareWell.srpHealthScore}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};
