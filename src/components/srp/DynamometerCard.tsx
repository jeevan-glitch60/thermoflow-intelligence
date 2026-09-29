import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { generateDynamometerCard } from '../../services/simulationEngine';
import { SrpParameters } from '../../types';
import { ModelBadge } from '../common/ModelBadge';

interface DynamometerCardProps {
  srpParams: SrpParameters;
}

export const DynamometerCard: React.FC<DynamometerCardProps> = ({ srpParams }) => {
  const [showBaseline, setShowBaseline] = useState<boolean>(true);
  const [showPumpCard, setShowPumpCard] = useState<boolean>(false);

  const { baselinePoints, currentPoints } = generateDynamometerCard(
    srpParams.strokeLengthInches,
    srpParams.surfaceRodLoadKn,
    srpParams.activeFault
  );

  // Merge datasets for Recharts
  const chartData = currentPoints.map((pt, idx) => ({
    position: pt.positionInches,
    currentSurface: pt.surfaceLoadKn,
    baselineSurface: baselinePoints[idx]?.surfaceLoadKn || pt.surfaceLoadKn,
    currentPump: pt.pumpLoadKn,
    baselinePump: baselinePoints[idx]?.pumpLoadKn || pt.pumpLoadKn,
  }));

  const isOverload = srpParams.activeFault === 'rod_overload';
  const isFluidPound = srpParams.activeFault === 'fluid_pound';
  const isGas = srpParams.activeFault === 'gas_interference';
  const isPumpOff = srpParams.activeFault === 'pump_off';

  return (
    <div className="bg-[#101622] border border-[#233149] rounded-xl p-4 flex flex-col justify-between">
      {/* Card Header & Fault Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-100">
              Dynamometer Card (Surface Load vs Position)
            </h3>
            <ModelBadge type="Illustrative model output" />
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Stroke: 0 to {srpParams.strokeLengthInches} in • Max Design Load: 85.0 kN
          </p>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-2 text-xs">
          <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer bg-[#151d2d] px-2.5 py-1 rounded border border-[#233149]">
            <input
              type="checkbox"
              checked={showBaseline}
              onChange={(e) => setShowBaseline(e.target.checked)}
              className="rounded bg-[#101622] border-[#233149] text-amber-500 focus:ring-0"
            />
            <span>Ideal Baseline</span>
          </label>
          <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer bg-[#151d2d] px-2.5 py-1 rounded border border-[#233149]">
            <input
              type="checkbox"
              checked={showPumpCard}
              onChange={(e) => setShowPumpCard(e.target.checked)}
              className="rounded bg-[#101622] border-[#233149] text-cyan-400 focus:ring-0"
            />
            <span>Downhole Pump</span>
          </label>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-64 bg-[#0b0e14] rounded-lg border border-[#1c273c] p-2 relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1c273c" />
            <XAxis
              dataKey="position"
              unit=" in"
              stroke="#64748b"
              tick={{ fontSize: 10, fill: '#64748b' }}
            />
            <YAxis
              unit=" kN"
              domain={[0, 90]}
              stroke="#64748b"
              tick={{ fontSize: 10, fill: '#64748b' }}
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
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />

            {/* Critical yield limit line at 75 kN */}
            <ReferenceLine
              y={75}
              stroke="#ef4444"
              strokeDasharray="4 4"
              label={{
                value: 'Yield Stress Threshold (75 kN)',
                fill: '#fca5a5',
                fontSize: 10,
                position: 'insideTopRight',
              }}
            />

            {/* Baseline Curve */}
            {showBaseline && (
              <Line
                type="monotone"
                dataKey="baselineSurface"
                name="Baseline Surface Card"
                stroke="#64748b"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={false}
              />
            )}

            {/* Current Active Curve */}
            <Line
              type="monotone"
              dataKey="currentSurface"
              name="Current Operating Card"
              stroke={isOverload ? '#ef4444' : '#f59e0b'}
              strokeWidth={isOverload ? 3 : 2}
              dot={false}
            />

            {/* Optional Downhole Pump Card */}
            {showPumpCard && (
              <Line
                type="monotone"
                dataKey="currentPump"
                name="Downhole Pump Card"
                stroke="#06b6d4"
                strokeWidth={1.5}
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Diagnostic Diagnosis Box */}
      <div className="mt-3 p-3 rounded-lg bg-[#151d2d] border border-[#233149] text-xs">
        <div className="flex items-center gap-1.5 font-semibold mb-1">
          {isOverload ? (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          ) : isFluidPound || isGas || isPumpOff ? (
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          )}
          <span
            className={
              isOverload
                ? 'text-rose-300'
                : isFluidPound || isGas || isPumpOff
                ? 'text-amber-300'
                : 'text-emerald-300'
            }
          >
            {isOverload
              ? 'CRITICAL HARMONIC OVERLOAD'
              : isFluidPound
              ? 'SEVERE FLUID POUND DETECTED'
              : isGas
              ? 'GAS INTERFERENCE IN PUMP BARREL'
              : isPumpOff
              ? 'PUMP-OFF / UNDERFILLED CONDITION'
              : 'NORMAL API RP 11L OPERATING ENVELOPE'}
          </span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          {isOverload
            ? 'Surface rod load spikes to 78.5 kN exceeding safety limits. Harmonic oscillation on upstroke indicates heavy viscous drag and potential rod fatigue failure.'
            : isFluidPound
            ? 'Abrupt drop in load on early downstroke indicates plunger slamming against fluid level in an underfilled pump barrel.'
            : isGas
            ? 'Rounded compression curve shows delayed traveling valve opening caused by compressible gas pockets in the heavy oil column.'
            : isPumpOff
            ? 'Volumetric fillage below 70% suggests inflow rate is lagging behind pump displacement capacity.'
            : 'Symmetric parallelogram shape confirms complete pump fillage (88%), minimal valve slip, and balanced rod stress within safe endurance limits.'}
        </p>
      </div>
    </div>
  );
};
