import React, { useState } from 'react';
import { MapPin, Flame, Droplets, Activity, Zap, CheckCircle2 } from 'lucide-react';
import { useFieldStore } from '../../store/useFieldStore';
import { Well, WellPhase } from '../../types';

export const FieldMap2D: React.FC = () => {
  const { wells, selectedWellId, setSelectedWellId } = useFieldStore();
  const [phaseFilter, setPhaseFilter] = useState<WellPhase | 'All'>('All');

  const filteredWells = wells.filter(
    (w) => phaseFilter === 'All' || w.currentPhase === phaseFilter
  );

  return (
    <div className="bg-[#101622] border border-[#233149] rounded-xl overflow-hidden shadow-xl flex flex-col">
      {/* Header & Filter Controls */}
      <div className="p-3 bg-[#151d2d] border-b border-[#233149] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            Baghewala Field Reservoir & Well Spatial Map
          </h3>
          <span className="text-[10px] font-mono text-slate-400 bg-[#101622] px-2 py-0.5 rounded border border-[#233149]">
            Rajasthan Basin • 8 Simulated Wells
          </span>
        </div>

        {/* Phase Filter Buttons */}
        <div className="flex items-center gap-1 text-xs">
          {(['All', 'Injection', 'Soak', 'Production', 'Shut-in'] as const).map((phase) => (
            <button
              key={phase}
              onClick={() => setPhaseFilter(phase)}
              className={`px-2.5 py-1 rounded transition-colors text-[11px] font-medium ${
                phaseFilter === phase
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200 bg-[#101622]'
              }`}
            >
              {phase}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="relative w-full h-[400px] bg-[#0b0e14] bg-tech-dots overflow-hidden p-2 select-none flex items-center justify-center">
        <svg viewBox="0 0 800 400" className="w-full h-full drop-shadow-xl">
          <defs>
            {/* Plume gradients */}
            <radialGradient id="steamPlume" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#f97316" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="soakPlume" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#eab308" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#d4b483" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#d4b483" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Geological Fault line / Sandstone Boundary */}
          <path
            d="M 50 40 Q 250 120 400 90 T 750 160"
            fill="none"
            stroke="#334155"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />
          <text x="70" y="55" fill="#475569" fontSize="9" fontFamily="monospace">
            BAGHEWALA STRUCTURAL FAULT ZONE F-1
          </text>

          {/* Central Steam Generation & Gathering Facility */}
          <g transform="translate(400, 180)">
            <rect x="-35" y="-25" width="70" height="50" rx="4" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
            <text x="0" y="-8" fill="#f8fafc" fontSize="9" fontWeight="bold" textAnchor="middle">
              CENTRAL
            </text>
            <text x="0" y="5" fill="#f97316" fontSize="8" fontFamily="monospace" textAnchor="middle">
              STEAM PLANT
            </text>
            <text x="0" y="16" fill="#38bdf8" fontSize="7" fontFamily="monospace" textAnchor="middle">
              GATHERING
            </text>
          </g>

          {/* Surface Steam & Oil Pipelines connecting to Wells */}
          {wells.map((w) => {
            const wx = (w.coordinates.x / 100) * 800;
            const wy = (w.coordinates.y / 100) * 400;
            return (
              <g key={`pipe-${w.id}`}>
                <line
                  x1="400"
                  y1="180"
                  x2={wx}
                  y2={wy}
                  stroke={w.currentPhase === 'Injection' ? '#f97316' : '#475569'}
                  strokeWidth={w.currentPhase === 'Injection' ? '2' : '1'}
                  strokeDasharray={w.currentPhase === 'Injection' ? '4 2' : 'none'}
                  opacity="0.65"
                />
              </g>
            );
          })}

          {/* Well Nodes */}
          {filteredWells.map((w) => {
            const wx = (w.coordinates.x / 100) * 800;
            const wy = (w.coordinates.y / 100) * 400;
            const isSelected = w.id === selectedWellId;

            return (
              <g
                key={w.id}
                className="cursor-pointer transition-transform hover:scale-110"
                onClick={() => setSelectedWellId(w.id)}
              >
                {/* Thermal Heated Zone Footprint */}
                {w.currentPhase === 'Injection' && (
                  <circle cx={wx} cy={wy} r="45" fill="url(#steamPlume)" className="animate-pulse" />
                )}
                {w.currentPhase === 'Soak' && (
                  <circle cx={wx} cy={wy} r="40" fill="url(#soakPlume)" className="animate-pulse" />
                )}

                {/* Selection Ring */}
                {isSelected && (
                  <circle
                    cx={wx}
                    cy={wy}
                    r="22"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    className="animate-spin"
                    style={{ transformOrigin: `${wx}px ${wy}px`, animationDuration: '8s' }}
                  />
                )}

                {/* Outer Status Circle */}
                <circle
                  cx={wx}
                  cy={wy}
                  r="14"
                  fill="#151d2d"
                  stroke={
                    w.status === 'critical'
                      ? '#ef4444'
                      : w.status === 'warning'
                      ? '#f59e0b'
                      : w.status === 'caution'
                      ? '#eab308'
                      : w.status === 'optimal'
                      ? '#10b981'
                      : '#64748b'
                  }
                  strokeWidth="2.5"
                />

                {/* Inner Center Dot */}
                <circle
                  cx={wx}
                  cy={wy}
                  r="5"
                  fill={
                    w.currentPhase === 'Injection'
                      ? '#ef4444'
                      : w.currentPhase === 'Soak'
                      ? '#f59e0b'
                      : w.currentPhase === 'Production'
                      ? '#22c55e'
                      : '#64748b'
                  }
                />

                {/* Well Label Badge */}
                <rect
                  x={wx - 26}
                  y={wy + 18}
                  width="52"
                  height="16"
                  rx="3"
                  fill="#0f172a"
                  stroke={isSelected ? '#f59e0b' : '#334155'}
                  strokeWidth="1"
                  opacity="0.9"
                />
                <text
                  x={wx}
                  y={wy + 30}
                  fill={isSelected ? '#fde68a' : '#f8fafc'}
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {w.id}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-3 right-3 bg-[#151d2d]/90 backdrop-blur-md p-2.5 rounded-lg border border-[#233149] text-[11px] space-y-1">
          <div className="text-[10px] uppercase font-mono font-bold text-slate-400">
            CSS Phase Indicators
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-slate-300">Steam Injection</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-slate-300">Soak (Thermal Diffusion)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-slate-300">Active SRP Production</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <span className="text-slate-300">Shut-in / Workover</span>
          </div>
        </div>
      </div>
    </div>
  );
};
