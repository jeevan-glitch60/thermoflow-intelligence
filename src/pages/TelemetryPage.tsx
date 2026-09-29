import React, { useState } from 'react';
import {
  Radio,
  Download,
  Play,
  Pause,
  RotateCcw,
  Activity,
  Layers,
  Flame,
  Droplets,
  Gauge,
  Zap,
  CheckCircle2,
  Clock,
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
import { ModelBadge } from '../components/common/ModelBadge';

export const TelemetryPage: React.FC = () => {
  const {
    wells,
    selectedWellId,
    setSelectedWellId,
    isTelemetryPaused,
    setTelemetryPaused,
    telemetryIntervalMs,
    lastTelemetryTick,
    dataQualityScore,
    modelConfidenceScore,
    historicalTelemetry,
  } = useFieldStore();

  const [activeCategory, setActiveCategory] = useState<'all' | 'reservoir' | 'css' | 'wellbore' | 'srp' | 'surface'>('all');
  const [timeRange, setTimeRange] = useState<'1H' | '6H' | '24H' | '7D' | '30D'>('24H');

  const selectedWell = wells.find((w) => w.id === selectedWellId) || wells[0];
  const history = historicalTelemetry[selectedWell.id] || [];

  // Export current telemetry dataset as JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${selectedWell.id}_telemetry_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export as CSV
  const handleExportCsv = () => {
    if (!history.length) return;
    const headers = Object.keys(history[0]).join(',');
    const rows = history.map((pt) => Object.values(pt).join(',')).join('\n');
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(`${headers}\n${rows}`);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvContent);
    downloadAnchor.setAttribute('download', `${selectedWell.id}_telemetry_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Title & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#233149] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Radio className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-mono tracking-tight">
              Live Simulated Telemetry
            </h1>
            <ModelBadge type="Synthetic estimate" />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
            Data Source: <strong className="text-cyan-400">Simulated Field Telemetry (Baghewala Field, Rajasthan)</strong>
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTelemetryPaused(!isTelemetryPaused)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              isTelemetryPaused
                ? 'bg-rose-950/40 text-rose-300 border border-rose-500/40'
                : 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            {isTelemetryPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isTelemetryPaused ? 'Resume Stream' : 'Pause Stream'}</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#151d2d] hover:bg-[#1c273c] border border-[#233149] rounded-lg text-xs text-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#151d2d] hover:bg-[#1c273c] border border-[#233149] rounded-lg text-xs text-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Connectivity & Data Quality Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-[#101622] p-3 rounded-lg border border-[#233149]">
          <div className="text-[10px] text-slate-400">Update Interval</div>
          <div className="text-base font-bold font-mono text-cyan-400 mt-0.5">
            {telemetryIntervalMs / 1000}s Tick
          </div>
          <div className="text-[9px] text-slate-500">Deterministic loop</div>
        </div>

        <div className="bg-[#101622] p-3 rounded-lg border border-[#233149]">
          <div className="text-[10px] text-slate-400">Data Freshness</div>
          <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
            {isTelemetryPaused ? 'Paused' : '&lt; 1.0s Lag'}
          </div>
          <div className="text-[9px] text-slate-500">Last: {lastTelemetryTick.slice(11, 19)} UTC</div>
        </div>

        <div className="bg-[#101622] p-3 rounded-lg border border-[#233149]">
          <div className="text-[10px] text-slate-400">Packet Rate</div>
          <div className="text-base font-bold font-mono text-slate-200 mt-0.5">1.33 pkts/s</div>
          <div className="text-[9px] text-slate-500">Synthetic stream</div>
        </div>

        <div className="bg-[#101622] p-3 rounded-lg border border-[#233149]">
          <div className="text-[10px] text-slate-400">Missing Data Rate</div>
          <div className="text-base font-bold font-mono text-slate-200 mt-0.5">0.02%</div>
          <div className="text-[9px] text-slate-500">Nominal signal</div>
        </div>

        <div className="bg-[#101622] p-3 rounded-lg border border-[#233149]">
          <div className="text-[10px] text-slate-400">Data Quality Score</div>
          <div className="text-base font-bold font-mono text-purple-400 mt-0.5">
            {dataQualityScore}%
          </div>
          <div className="text-[9px] text-slate-500">Automated QA pass</div>
        </div>

        <div className="bg-[#101622] p-3 rounded-lg border border-[#233149]">
          <div className="text-[10px] text-slate-400">Model Confidence</div>
          <div className="text-base font-bold font-mono text-amber-400 mt-0.5">
            {modelConfidenceScore}%
          </div>
          <div className="text-[9px] text-slate-500">Physics convergence</div>
        </div>
      </div>

      {/* Filter and Time Range Selector */}
      <div className="bg-[#101622] border border-[#233149] p-3 rounded-xl flex flex-wrap items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1 text-xs">
          {(['all', 'reservoir', 'css', 'wellbore', 'srp', 'surface'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-md font-medium uppercase text-[11px] transition-colors ${
                activeCategory === cat
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200 bg-[#151d2d]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Time Span Filter */}
        <div className="flex items-center gap-1 text-xs bg-[#151d2d] p-1 rounded border border-[#233149] font-mono">
          {(['1H', '6H', '24H', '7D', '30D'] as const).map((span) => (
            <button
              key={span}
              onClick={() => setTimeRange(span)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
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

      {/* Main Multi-Metric Telemetry Chart */}
      <div className="bg-[#101622] border border-[#233149] rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 font-mono flex items-center gap-2">
              <span>Dynamic Telemetry Multi-Trace</span>
              <span className="text-amber-400">({selectedWell.id})</span>
            </h3>
            <p className="text-xs text-slate-400">
              Correlated production rate, water cut, motor current, and thermal response.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {history.length} Points Ingested
          </span>
        </div>

        <div className="w-full h-80 bg-[#0b0e14] rounded-lg border border-[#1c273c] p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c273c" />
              <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" tick={{ fontSize: 10 }} />
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
                dataKey="oilRate"
                name="Oil Rate (BOPD)"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="waterCut"
                name="Water Cut (%)"
                stroke="#06b6d4"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="reservoirTemp"
                name="Reservoir Temp (°C)"
                stroke="#ef4444"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="srpMotorCurrent"
                name="Motor Current (A)"
                stroke="#8b5cf6"
                strokeWidth={1.5}
                strokeDasharray="4 2"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subsystem Telemetry Data Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Reservoir Telemetry */}
        <div className="bg-[#101622] p-4 rounded-xl border border-[#233149] space-y-2 text-xs font-mono">
          <div className="font-semibold text-red-400 font-sans flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5" />
            <span>RESERVOIR METRICS</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#233149]">
            <span className="text-slate-400">Reservoir Pressure:</span>
            <span className="text-slate-100">{selectedWell.reservoirPressure} bar</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#233149]">
            <span className="text-slate-400">Reservoir Temperature:</span>
            <span className="text-slate-100">{selectedWell.reservoirTemp}°C</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#233149]">
            <span className="text-slate-400">Estimated Viscosity:</span>
            <span className="text-amber-300">{selectedWell.viscosity.toLocaleString()} cP</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Steam Response Score:</span>
            <span className="text-emerald-400">{selectedWell.steamResponseScore}%</span>
          </div>
        </div>

        {/* Wellbore & SRP Telemetry */}
        <div className="bg-[#101622] p-4 rounded-xl border border-[#233149] space-y-2 text-xs font-mono">
          <div className="font-semibold text-emerald-400 font-sans flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>WELLBORE & SRP LIFT</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#233149]">
            <span className="text-slate-400">Stroke Length:</span>
            <span className="text-slate-100">{selectedWell.srpParams.strokeLengthInches} in</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#233149]">
            <span className="text-slate-400">Pumping Speed:</span>
            <span className="text-slate-100">{selectedWell.srpParams.strokesPerMinute} SPM</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#233149]">
            <span className="text-slate-400">Surface Rod Load:</span>
            <span className="text-slate-100">{selectedWell.srpParams.surfaceRodLoadKn} kN</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Pump Fillage:</span>
            <span className="text-cyan-400">{selectedWell.srpParams.pumpFillagePct}%</span>
          </div>
        </div>

        {/* Surface Facilities Telemetry */}
        <div className="bg-[#101622] p-4 rounded-xl border border-[#233149] space-y-2 text-xs font-mono">
          <div className="font-semibold text-cyan-400 font-sans flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5" />
            <span>SURFACE PRODUCTION</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#233149]">
            <span className="text-slate-400">Net Oil Rate:</span>
            <span className="text-slate-100">{selectedWell.oilRate} BOPD</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#233149]">
            <span className="text-slate-400">Total Liquid Rate:</span>
            <span className="text-slate-100">{selectedWell.totalLiquidRate} BLPD</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#233149]">
            <span className="text-slate-400">Water Cut:</span>
            <span className="text-cyan-400">{selectedWell.waterCut}%</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Energy Intensity:</span>
            <span className="text-yellow-400">{selectedWell.energyIntensity} GJ/bbl</span>
          </div>
        </div>
      </div>
    </div>
  );
};
