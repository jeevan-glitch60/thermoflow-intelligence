import React, { useState, useEffect } from 'react';
import { SrpParameters } from '../../types';

interface SrpSchematicProps {
  srpParams: SrpParameters;
}

export const SrpSchematic: React.FC<SrpSchematicProps> = ({ srpParams }) => {
  const [angle, setAngle] = useState<number>(0);

  // Animate the beam oscillation synced to SPM
  useEffect(() => {
    if (srpParams.strokesPerMinute <= 0) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    // Frequency in rad/sec: (SPM / 60) * 2 * PI
    const speed = (srpParams.strokesPerMinute / 60) * 2 * Math.PI;

    const loop = (currentTime: number) => {
      const deltaSec = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      setAngle((prev) => (prev + speed * deltaSec) % (2 * Math.PI));
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [srpParams.strokesPerMinute]);

  // Angular displacement of walking beam in degrees (+- 8 to 14 deg based on stroke length)
  const maxDeflectionDeg = (srpParams.strokeLengthInches / 144) * 11;
  const currentBeamDeg = Math.sin(angle) * maxDeflectionDeg;

  // Polished rod vertical position (-24px to +24px)
  const rodDisplacementPx = Math.sin(angle) * ((srpParams.strokeLengthInches / 144) * 24);

  // Traveling valve state (open during downstroke, closed during upstroke)
  const isUpstroke = Math.cos(angle) > 0;
  const travelingValveOpen = !isUpstroke;
  const standingValveOpen = isUpstroke;

  const isOverload = srpParams.activeFault === 'rod_overload';
  const isFluidPound = srpParams.activeFault === 'fluid_pound';

  return (
    <div className="bg-[#101622] border border-[#233149] rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden select-none">
      <div className="w-full flex items-center justify-between mb-2">
        <div className="text-xs font-mono text-slate-300 font-semibold">
          DYNAMIC SRP MECHANICAL MOTION
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-amber-400">{srpParams.strokesPerMinute} SPM</span>
          <span className="text-slate-500">•</span>
          <span className="text-cyan-400">{srpParams.strokeLengthInches} in Stroke</span>
          <span className="text-slate-500">•</span>
          <span className="text-emerald-400">{isUpstroke ? 'UPSTROKE' : 'DOWNSTROKE'}</span>
        </div>
      </div>

      <svg viewBox="0 0 540 380" className="w-full max-h-[380px] drop-shadow-xl">
        <defs>
          <linearGradient id="beamSteelGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4b483" />
            <stop offset="50%" stopColor="#9a7b4f" />
            <stop offset="100%" stopColor="#694f29" />
          </linearGradient>

          <linearGradient id="crankGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>

        {/* Foundation & Ground */}
        <line x1="20" y1="210" x2="520" y2="210" stroke="#334155" strokeWidth="2.5" />
        <rect x="20" y="210" width="500" height="170" fill="#0b0e14" opacity="0.6" />

        {/* Samson Post Support (Center Fulcrum Pivot at x=310, y=110) */}
        <polygon points="260,210 310,110 360,210" fill="#151d2d" stroke="#64748b" strokeWidth="2.5" />
        <circle cx="310" cy="110" r="6" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />

        {/* Crank and Counterweight at x=440, y=170 */}
        <g transform={`rotate(${((angle * 180) / Math.PI)}, 440, 170)`}>
          <circle cx="440" cy="170" r="32" fill="url(#crankGrad)" stroke="#64748b" strokeWidth="2" />
          {/* Counterweight segment */}
          <path
            d="M 415 170 A 25 25 0 0 0 465 170 Z"
            fill="#ea580c"
            opacity="0.85"
            stroke="#9a3412"
          />
          {/* Crank Pin at radius 22px */}
          <circle cx="440" cy="148" r="4.5" fill="#f8fafc" stroke="#334155" strokeWidth="1.5" />
        </g>

        {/* Pitman Arm connecting Crank Pin to Beam Tail */}
        {/* Beam Tail coordinates calculated via rotation */}
        <line
          x1="440"
          y1={170 - 22 * Math.cos(angle)}
          x2={310 + 130 * Math.cos((currentBeamDeg * Math.PI) / 180)}
          y2={110 + 130 * Math.sin((currentBeamDeg * Math.PI) / 180)}
          stroke="#94a3b8"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Walking Beam & Horsehead pivoting at (310, 110) */}
        <g transform={`rotate(${currentBeamDeg}, 310, 110)`}>
          {/* Beam body */}
          <polygon
            points="140,102 440,105 440,115 140,118"
            fill="url(#beamSteelGrad)"
            stroke="#d4b483"
            strokeWidth="1"
          />

          {/* Horsehead Curved Assembly at beam front */}
          <path
            d="M 140 102 C 105 106, 92 135, 102 165 C 108 175, 122 178, 130 178"
            fill="none"
            stroke="#d4b483"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M 140 102 L 130 178"
            stroke="#9a7b4f"
            strokeWidth="2"
          />
        </g>

        {/* Flexible Wireline Bridle from Horsehead to Polished Rod */}
        <line
          x1="98"
          y1={130 + rodDisplacementPx * 0.4}
          x2="98"
          y2={175 + rodDisplacementPx}
          stroke="#f8fafc"
          strokeWidth="2"
          strokeDasharray="2 1"
        />

        {/* Carrier Bar / Clamp */}
        <rect
          x="88"
          y={172 + rodDisplacementPx}
          width="20"
          height="6"
          rx="1"
          fill="#f59e0b"
          stroke="#78350f"
          strokeWidth="1"
        />

        {/* Surface Wellhead & Stuffing Box */}
        <rect x="88" y="195" width="20" height="25" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
        <rect x="82" y="215" width="32" height="15" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />

        {/* Surface Polished Rod passing through Stuffing Box */}
        <line
          x1="98"
          y1={175 + rodDisplacementPx}
          x2="98"
          y2={255 + rodDisplacementPx}
          stroke={isOverload ? '#ef4444' : '#cbd5e1'}
          strokeWidth={isOverload ? '3.5' : '2.5'}
        />

        {/* Subsurface Wellbore Cutaway Section */}
        {/* Casing & Tubing */}
        <rect x="84" y="230" width="28" height="145" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
        <rect x="91" y="230" width="14" height="140" fill="#1e293b" stroke="#64748b" strokeWidth="1" />

        {/* Fluid Column inside Tubing */}
        <rect x="92" y="250" width="12" height="120" fill="#78350f" opacity="0.6" />

        {/* Continuous Sucker Rod String downhole */}
        <line
          x1="98"
          y1={230}
          x2="98"
          y2={325 + rodDisplacementPx}
          stroke={isOverload ? '#ef4444' : '#cbd5e1'}
          strokeWidth={isOverload ? '3' : '2'}
        />

        {/* Downhole Pump Barrel at y=320 to 365 */}
        <rect x="90" y="325" width="16" height="42" fill="#334155" stroke="#f59e0b" strokeWidth="1.5" rx="1" />

        {/* Plunger reciprocating inside barrel */}
        <g transform={`translate(0, ${rodDisplacementPx})`}>
          <rect x="92" y="332" width="12" height="18" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
          {/* Traveling Valve */}
          <circle
            cx="98"
            cy="338"
            r="2.5"
            fill={travelingValveOpen ? '#22c55e' : '#ef4444'}
            stroke="#ffffff"
            strokeWidth="0.5"
          />
        </g>

        {/* Standing Valve at bottom of barrel (stationary) */}
        <circle
          cx="98"
          cy="362"
          r="2.5"
          fill={standingValveOpen ? '#22c55e' : '#ef4444'}
          stroke="#ffffff"
          strokeWidth="0.5"
        />

        {/* Pump Intake Perforations */}
        <line x1="88" y1="368" x2="94" y2="368" stroke="#38bdf8" strokeWidth="2" />
        <line x1="102" y1="368" x2="108" y2="368" stroke="#38bdf8" strokeWidth="2" />

        {/* Text Labels for valves */}
        <text x="120" y="340" fill="#94a3b8" fontSize="8" fontFamily="monospace">
          Traveling Valve: {travelingValveOpen ? 'OPEN (Down)' : 'CLOSED (Up)'}
        </text>
        <text x="120" y="364" fill="#94a3b8" fontSize="8" fontFamily="monospace">
          Standing Valve: {standingValveOpen ? 'OPEN (Lift)' : 'CLOSED (Seat)'}
        </text>

        {/* Fault Warning Banner on schematic if active */}
        {isOverload && (
          <g>
            <rect x="18" y="18" width="220" height="28" rx="4" fill="#881337" stroke="#f43f5e" strokeWidth="1.5" />
            <text x="28" y="36" fill="#fecdd3" fontSize="10" fontFamily="monospace" fontWeight="bold">
              ⚠ ROD OVERLOAD (78.5 kN)
            </text>
          </g>
        )}
        {isFluidPound && (
          <g>
            <rect x="18" y="18" width="210" height="28" rx="4" fill="#713f12" stroke="#eab308" strokeWidth="1.5" />
            <text x="28" y="36" fill="#fef08a" fontSize="10" fontFamily="monospace" fontWeight="bold">
              ⚠ FLUID POUND DETECTED
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
