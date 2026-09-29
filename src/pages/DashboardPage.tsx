import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Flame,
  Droplets,
  Activity,
  Zap,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useFieldStore } from '../store/useFieldStore';
import { ModelBadge } from '../components/common/ModelBadge';
import { TermTooltip } from '../components/common/ModelBadge';
import {
  StaggeredContainer,
  AnimatedCard,
  AnimatedNumber,
  PulsingAlertBadge,
} from '../components/common/AnimationWrapper';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    wells,
    selectedWellId,
    setSelectedWellId,
    alerts,
    auditLogs,
    historicalTelemetry,
    loadDemoScenario,
  } = useFieldStore();

  const selectedWell = wells.find((w) => w.id === selectedWellId) || wells[0];

  // Aggregated Field Metrics
  const totalWells = wells.length;
  const injectingWells = wells.filter((w) => w.currentPhase === 'Injection').length;
  const soakingWells = wells.filter((w) => w.currentPhase === 'Soak').length;
  const producingWells = wells.filter((w) => w.currentPhase === 'Production').length;
  const shutInWells = wells.filter((w) => w.currentPhase === 'Shut-in' || w.currentPhase === 'Maintenance').length;

  const totalOil = Math.round(wells.reduce((sum, w) => sum + w.oilRate, 0));
  const avgViscosity = Math.round(wells.reduce((sum, w) => sum + w.viscosity, 0) / wells.length);
  const avgSrpHealth = Math.round(wells.reduce((sum, w) => sum + w.srpHealthScore, 0) / wells.length);
  const avgEnergyIntensity = (
    wells.reduce((sum, w) => sum + w.energyIntensity, 0) / (producingWells || 1)
  ).toFixed(2);
  const criticalAlertsCount = alerts.filter((a) => a.severity === 'Critical' && a.status === 'Active').length;

  // Selected well historical telemetry for production trend chart
  const telemetryHistory = historicalTelemetry[selectedWell.id] || [];

  // Top 3 priority wells
  const priorityWells = [...wells].sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 3);

  // Highest energy intensity well
  const highestEnergyWell = [...wells].sort((a, b) => b.energyIntensity - a.energyIntensity)[0];

  return (
    <div className="space-y-6">
      {/* Page Title & Context Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#233149] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <LayoutDashboard className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-mono tracking-tight">
              Field Command Center
            </h1>
            <ModelBadge type="Illustrative model output" />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Unified CSS, SRP, reservoir thermal, production, energy, and maintenance intelligence for Baghewala Field.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/field-digital-twin')}
            className="btn-press flex items-center gap-1.5 px-3 py-1.5 bg-[#151d2d] hover:bg-[#1c273c] border border-[#233149] rounded-md text-xs font-medium text-slate-200 transition-colors shadow-sm"
          >
            <span>Open Digital Twin</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={loadDemoScenario}
            className="btn-press flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600/30 to-orange-600/30 hover:from-amber-600/50 hover:to-orange-600/50 border border-amber-500/40 rounded-md text-xs font-medium text-amber-300 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Demo Scenario</span>
          </button>
        </div>
      </div>

      {/* Top KPI Cards Row (8px Grid, Staggered Entry Animation, Count-Up Numbers) */}
      <StaggeredContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Primary KPI: Total Oil Rate */}
        <AnimatedCard
          hoverLift
          interactive
          className="bg-[#101622] border border-[#233149] border-l-4 border-l-amber-500 p-3.5 rounded-md space-y-1 shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium tracking-tight">Total Oil Rate</span>
            <Droplets className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-100">
            <AnimatedNumber value={totalOil} /> <span className="text-xs font-normal text-slate-400 font-sans">BOPD</span>
          </div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
            <TrendingUp className="w-3 h-3" />
            <span>+34 BOPD vs target</span>
          </div>
        </AnimatedCard>

        {/* Well States */}
        <AnimatedCard
          hoverLift
          interactive
          className="bg-[#101622] border border-[#233149] p-3.5 rounded-md space-y-1 shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium tracking-tight">Well States (8 Active)</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xs font-bold font-mono text-slate-200 flex items-center gap-1.5 pt-1">
            <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AnimatedNumber value={injectingWells} /> Inj
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AnimatedNumber value={soakingWells} /> Soak
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <AnimatedNumber value={producingWells} /> Prod
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            <AnimatedNumber value={shutInWells} /> well shut-in
          </div>
        </AnimatedCard>

        {/* Primary Physical Driver: Avg Fluid Viscosity */}
        <AnimatedCard
          hoverLift
          interactive
          className="bg-[#101622] border border-[#233149] p-3.5 rounded-md space-y-1 shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium tracking-tight">Avg Fluid Viscosity</span>
            <Activity className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-400">
            <AnimatedNumber value={avgViscosity} /> <span className="text-xs font-normal text-slate-400 font-sans">cP</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">Thermal baseline: 18.5k cP</div>
        </AnimatedCard>

        {/* Fleet SRP Health */}
        <AnimatedCard
          hoverLift
          interactive
          className="bg-[#101622] border border-[#233149] p-3.5 rounded-md space-y-1 shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium tracking-tight">Fleet SRP Health</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400">
            <AnimatedNumber value={avgSrpHealth} suffix="%" />
          </div>
          <div className="text-[10px] text-slate-400 font-mono">7 of 8 units in green band</div>
        </AnimatedCard>

        {/* Energy Intensity */}
        <AnimatedCard
          hoverLift
          interactive
          className="bg-[#101622] border border-[#233149] p-3.5 rounded-md space-y-1 shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium tracking-tight">Energy Intensity</span>
            <Zap className="w-4 h-4 text-amber-300" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-300">
            <AnimatedNumber value={parseFloat(avgEnergyIntensity)} decimals={2} />{' '}
            <span className="text-xs font-normal text-slate-400 font-sans">GJ/bbl</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">Steam boiler + drive lift</div>
        </AnimatedCard>

        {/* Active Alerts - Subtle breathing glow for critical */}
        <AnimatedCard
          hoverLift
          interactive
          onClick={() => navigate('/alerts')}
          className={`border p-3.5 rounded-md space-y-1 cursor-pointer transition-all shadow-sm ${
            criticalAlertsCount > 0
              ? 'bg-rose-500/10 border-rose-500/30 hover:border-rose-500/50 animate-alert-glow'
              : 'bg-[#101622] border-[#233149] hover:border-slate-500'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium tracking-tight">Active Alerts</span>
            <AlertTriangle
              className={`w-4 h-4 ${criticalAlertsCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`}
            />
          </div>
          <div
            className={`text-2xl font-extrabold font-mono ${
              criticalAlertsCount > 0 ? 'text-rose-400' : 'text-slate-300'
            }`}
          >
            <AnimatedNumber value={criticalAlertsCount} />{' '}
            <span className="text-xs font-normal text-slate-400 font-sans">Critical</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">Click to review incident log</div>
        </AnimatedCard>
      </StaggeredContainer>

      {/* Row 2: Production Trend & Priority Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel 1: Field / Selected Well Production Trend */}
        <AnimatedCard className="lg:col-span-2 bg-[#101622] border border-[#233149] rounded-md p-4 flex flex-col justify-between shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <span>Production & Thermal Telemetry Trend</span>
                <span className="text-xs font-mono font-normal text-amber-400">({selectedWell.id})</span>
              </h2>
              <p className="text-xs text-slate-400">
                Synchronized 24h trend: Oil production rate (BOPD), water cut (%), and reservoir downhole temperature (°C).
              </p>
            </div>
            <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
              <span>Operating Phase:</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold">
                {selectedWell.currentPhase}
              </span>
            </div>
          </div>

          <div className="w-full h-72 bg-[#0b0e14] rounded-md border border-[#1c273c] p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryHistory} margin={{ top: 10, right: 35, left: 10, bottom: 15 }}>
                <defs>
                  <linearGradient id="oilGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c273c" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                  label={{ value: 'Telemetry Timeline (Last 24 Hours)', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#64748b' }}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                  label={{ value: 'Rate (BOPD) / Cut (%)', angle: -90, position: 'insideLeft', offset: 0, fontSize: 10, fill: '#64748b' }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#ef4444"
                  tick={{ fontSize: 10 }}
                  label={{ value: 'Res Temp (°C)', angle: 90, position: 'insideRight', offset: 15, fontSize: 10, fill: '#ef4444' }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#151d2d] border border-[#233149] p-2.5 rounded-md shadow-lg text-xs font-mono space-y-1">
                          <div className="text-slate-400 border-b border-[#233149] pb-1 text-[11px]">
                            Time: <strong className="text-slate-200">{label}</strong>
                          </div>
                          {payload.map((entry: any) => (
                            <div key={entry.name} className="flex items-center justify-between gap-4 text-[11px]">
                              <span style={{ color: entry.color }}>{entry.name}:</span>
                              <span className="font-bold text-slate-100">
                                {entry.value} {entry.name.includes('Rate') ? 'BOPD' : entry.name.includes('Cut') ? '%' : '°C'}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  iconType="plainline"
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="oilRate"
                  name="Oil Rate (BOPD)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#oilGrad)"
                  isAnimationActive={true}
                  animationDuration={800}
                  animationEasing="ease-out"
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="waterCut"
                  name="Water Cut (%)"
                  stroke="#06b6d4"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#waterGrad)"
                  isAnimationActive={true}
                  animationDuration={800}
                  animationEasing="ease-out"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="reservoirTemp"
                  name="Reservoir Temp (°C)"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={800}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AnimatedCard>

        {/* Panel 4: Priority Recommendations (Subtle Tints, Industrial Hierarchy) */}
        <AnimatedCard className="bg-[#101622] border border-[#233149] rounded-md p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Top Optimization Priorities</span>
              </h2>
              <p className="text-xs text-slate-400">Ranked by thermal opportunity & mechanical urgency</p>
            </div>
            <button
              onClick={() => navigate('/prioritization')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center transition-colors btn-press"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <StaggeredContainer className="space-y-2.5">
            {priorityWells.map((pw, idx) => {
              const isSelected = pw.id === selectedWellId;
              const isCritical = pw.status === 'critical';
              const isWarning = pw.status === 'warning';

              // Subtle background tints rather than harsh blocks
              const tintClasses = isCritical
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : isWarning
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-sky-500/10 border-sky-500/30 text-sky-300';

              return (
                <AnimatedCard
                  key={pw.id}
                  hoverLift
                  interactive
                  onClick={() => setSelectedWellId(pw.id)}
                  className={`p-3 rounded-md border cursor-pointer transition-all ${tintClasses} ${
                    isSelected ? 'ring-1 ring-amber-400 border-amber-400 shadow-sm' : 'hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5 font-bold font-mono">
                      <span className="text-amber-400">#{idx + 1}</span>
                      <span className="text-slate-100">{pw.id}</span>
                      <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-black/20 text-slate-300 border border-white/10">
                        {pw.currentPhase}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-amber-400">
                      P-Score: {pw.priorityScore}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">{pw.priorityReason}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-white/10 font-mono">
                    <span>Viscosity: {pw.viscosity.toLocaleString()} cP</span>
                    <span className="text-cyan-400">{pw.oilRate} BOPD</span>
                  </div>
                </AnimatedCard>
              );
            })}
          </StaggeredContainer>

          <button
            onClick={() => navigate('/simulation')}
            className="btn-press mt-3 w-full py-2 text-xs text-center font-medium bg-[#151d2d] hover:bg-[#1c273c] border border-[#233149] rounded-md text-slate-200 transition-colors shadow-sm"
          >
            Run What-If Scenario Matrix
          </button>
        </AnimatedCard>
      </div>

      {/* Row 3: CSS Cycle Board for all 8 Wells */}
      <AnimatedCard className="bg-[#101622] border border-[#233149] rounded-md p-4 overflow-hidden shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>CSS Cycle & Artificial Lift Operations Board</span>
            </h2>
            <p className="text-xs text-slate-400">
              Synchronized well status across cyclic steam stimulation and sucker rod pump lift systems.
            </p>
          </div>
          <button
            onClick={() => navigate('/wells')}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center transition-colors"
          >
            <span>Detailed Portfolio</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#233149] text-slate-400 font-mono text-[11px]">
                <th className="py-2 px-3">Well ID</th>
                <th className="py-2 px-3">CSS Phase</th>
                <th className="py-2 px-3">Cycle</th>
                <th className="py-2 px-3 text-right">Oil (BOPD)</th>
                <th className="py-2 px-3 text-right">Water Cut</th>
                <th className="py-2 px-3 text-right">Viscosity (cP)</th>
                <th className="py-2 px-3 text-right">Res Temp</th>
                <th className="py-2 px-3 text-right">SRP Health</th>
                <th className="py-2 px-3 text-right">Priority</th>
                <th className="py-2 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#233149]/50 font-mono">
              {wells.map((w) => {
                const isSelected = w.id === selectedWellId;
                return (
                  <tr
                    key={w.id}
                    onClick={() => setSelectedWellId(w.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-amber-500/10 text-slate-100'
                        : 'hover:bg-[#151d2d] text-slate-300'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-amber-400 flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          w.status === 'critical'
                            ? 'bg-rose-500 animate-ping'
                            : w.status === 'warning'
                            ? 'bg-amber-400'
                            : w.status === 'caution'
                            ? 'bg-yellow-400'
                            : w.status === 'optimal'
                            ? 'bg-emerald-400'
                            : 'bg-slate-500'
                        }`}
                      />
                      <span>{w.id}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          w.currentPhase === 'Injection'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : w.currentPhase === 'Soak'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : w.currentPhase === 'Production'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {w.currentPhase}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">#{w.cycleNumber}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-100">
                      {w.oilRate}
                    </td>
                    <td className="py-2.5 px-3 text-right text-cyan-400">{w.waterCut}%</td>
                    <td className="py-2.5 px-3 text-right text-amber-300">
                      {w.viscosity.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-red-300">{w.reservoirTemp}°C</td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={
                          w.srpHealthScore < 70
                            ? 'text-rose-400 font-bold'
                            : w.srpHealthScore < 85
                            ? 'text-yellow-400'
                            : 'text-emerald-400'
                        }
                      >
                        {w.srpHealthScore}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-amber-400">
                      {w.priorityScore}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWellId(w.id);
                          navigate('/field-digital-twin');
                        }}
                        className="px-2 py-1 bg-[#1c273c] hover:bg-[#283854] text-slate-200 rounded text-[11px] font-sans transition-colors"
                      >
                        Twin View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </AnimatedCard>

      {/* Row 4: Energy Snapshot & Operations Activity Feed */}
      <StaggeredContainer className="grid grid-cols-1 lg:grid-cols-2 gap-6" staggerDelay={0.08}>
        {/* Panel 6: Energy and Steam Snapshot */}
        <AnimatedCard hoverLift className="bg-[#101622] border border-[#233149] rounded-md p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Energy & Steam Generation Snapshot</span>
              </h2>
              <p className="text-xs text-slate-400">Steam plant output vs downhole allocation</p>
            </div>
            <button
              onClick={() => navigate('/energy-steam')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center transition-colors"
            >
              <span>Manage Steam</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs mb-3">
            <div className="bg-[#151d2d] p-3 rounded-lg border border-[#233149] interactive-lift">
              <div className="text-slate-400 text-[11px]">Steam Generated</div>
              <div className="text-lg font-bold font-mono text-orange-400 mt-1">31.5 t/h</div>
              <div className="text-[10px] text-slate-500">Capacity: 40.0 t/h (78% util)</div>
            </div>
            <div className="bg-[#151d2d] p-3 rounded-lg border border-[#233149] interactive-lift">
              <div className="text-slate-400 text-[11px]">Daily Boiler Feedwater</div>
              <div className="text-lg font-bold font-mono text-cyan-400 mt-1">790 m³/day</div>
              <div className="text-[10px] text-slate-500">Demin plant online (94%)</div>
            </div>
            <div className="bg-[#151d2d] p-3 rounded-lg border border-[#233149] interactive-lift">
              <div className="text-slate-400 text-[11px]">Average Steam-Oil Ratio</div>
              <div className="text-lg font-bold font-mono text-amber-300 mt-1">3.4 t/t</div>
              <div className="text-[10px] text-slate-500">Target baseline: &lt;3.8</div>
            </div>
            <div className="bg-[#151d2d] p-3 rounded-lg border border-[#233149] interactive-lift">
              <div className="text-slate-400 text-[11px]">Highest Energy Intensity</div>
              <div className="text-lg font-bold font-mono text-rose-400 mt-1">
                {highestEnergyWell.id} ({highestEnergyWell.energyIntensity} GJ/bbl)
              </div>
              <div className="text-[10px] text-slate-500">Early injection cycle</div>
            </div>
          </div>
        </AnimatedCard>

        {/* Panel 7: Operations Activity Feed */}
        <AnimatedCard hoverLift className="bg-[#101622] border border-[#233149] rounded-md p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Operations Activity & Telemetry Feed</span>
              </h2>
              <p className="text-xs text-slate-400">Recent automated events and engineering actions</p>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Live UTC</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {auditLogs.slice(0, 6).map((log) => (
              <div
                key={log.id}
                className="bg-[#151d2d] hover:bg-[#192437] transition-colors p-2.5 rounded-lg border border-[#233149] text-xs flex items-start gap-2.5"
              >
                <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 font-mono text-[11px]">
                      {log.action} {log.wellId && <span className="text-amber-400">• {log.wellId}</span>}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {log.timestamp.slice(11, 19)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </AnimatedCard>
      </StaggeredContainer>
    </div>
  );
};
