import React, { useState } from 'react';
import {
  Flame,
  Activity,
  Layers,
  Thermometer,
  Gauge,
  Droplets,
  Eye,
  Maximize2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Well, TwinComponent } from '../../types';
import { ComponentInspectorModal } from './ComponentInspectorModal';

interface WellboreCutawayProps {
  well: Well;
}

type ViewMode = 'all' | 'thermal' | 'viscosity' | 'pressure' | 'mechanical';

export const WellboreCutaway: React.FC<WellboreCutawayProps> = ({ well }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showFlows, setShowFlows] = useState<boolean>(true);
  const [selectedComponent, setSelectedComponent] = useState<TwinComponent | null>(null);

  const isInjecting = well.currentPhase === 'Injection';
  const isSoaking = well.currentPhase === 'Soak';
  const isProducing = well.currentPhase === 'Production';

  // Dynamic calculations based on well state
  const steamChamberWidth = Math.min(220, Math.max(90, (well.cssParams.steamVolumeTonnes / 500) * 180));
  const chamberColor =
    well.reservoirTemp > 120
      ? 'rgba(239, 68, 68, 0.45)'
      : well.reservoirTemp > 75
      ? 'rgba(249, 115, 22, 0.4)'
      : 'rgba(234, 179, 8, 0.35)';

  // Build interactive components list for clicking
  const getComponentData = (id: string): TwinComponent => {
    switch (id) {
      case 'steam-generator':
        return {
          id: 'ST-GEN-01',
          name: 'Industrial Steam Generator OTSG-01',
          layer: 'surface',
          status: isInjecting ? 'normal' : 'caution',
          healthPct: 94,
          telemetry: {
            'Steam Output Rate': `${well.cssParams.injectionRateTph} t/h`,
            'Operating Pressure': `${well.cssParams.injectionPressureBar} bar`,
            'Steam Quality': `${well.cssParams.steamQualityPct}%`,
            'Thermal Efficiency': `${well.cssParams.steamGenEfficiencyPct}%`,
          },
          activeRisk: 'Scale buildup in economizer coil tubes; feedwater salinity nominal.',
          dependencies: ['Water Demineralization Unit', 'Fuel Gas Skid', 'Boiler Feed Pump'],
          suggestedAction: 'Verify steam enthalpy delivery and monitor injection pressure stability.',
        };
      case 'steam-manifold':
        return {
          id: 'INJ-MAN-02',
          name: 'High-Pressure Steam Injection Manifold',
          layer: 'surface',
          status: well.cssParams.heatLossFactorPct > 20 ? 'caution' : 'normal',
          healthPct: 88,
          telemetry: {
            'Manifold Pressure': `${well.cssParams.injectionPressureBar} bar`,
            'Line Temperature': `${isInjecting ? '265°C' : '45°C'}`,
            'Estimated Heat Loss': `${well.cssParams.heatLossFactorPct}%`,
          },
          activeRisk: 'Thermal expansion stress on flange couplings during cycling.',
          dependencies: ['Wellhead Tree', 'Master Steam Isolation Valve'],
          suggestedAction: 'Perform thermographic scan of insulation jacketing.',
        };
      case 'wellhead':
        return {
          id: 'WHD-TREE',
          name: 'Heavy Oil Dual-String Wellhead Tree',
          layer: 'surface',
          status: 'normal',
          healthPct: 96,
          telemetry: {
            'Tubing Head Pressure': `${well.srpParams.tubingPressureBar} bar`,
            'Casing Pressure': '4.2 bar',
            'Stuffing Box Temp': '48°C',
          },
          activeRisk: 'Polished rod packing wear during high ambient desert temperatures.',
          dependencies: ['Production Tubing', 'Steam Flowline'],
          suggestedAction: 'Verify lubricator packing pressure and grease seal.',
        };
      case 'srp-surface-unit':
        return {
          id: 'SRP-UNIT-456',
          name: 'Mark II Beam Pumping Surface Unit',
          layer: 'surface',
          status: well.srpParams.activeFault ? 'critical' : 'normal',
          healthPct: well.srpHealthScore,
          telemetry: {
            'Stroke Length': `${well.srpParams.strokeLengthInches} in`,
            'Pumping Speed': `${well.srpParams.strokesPerMinute} SPM`,
            'Motor Current': `${well.srpParams.motorCurrentAmp} A`,
            'Surface Rod Load': `${well.srpParams.surfaceRodLoadKn} kN`,
            Vibration: `${well.srpParams.vibrationMmS} mm/s`,
          },
          activeRisk: well.srpParams.activeFault
            ? `Critical mechanical fault: ${well.srpParams.activeFault.toUpperCase()}`
            : 'Normal cyclic fatigue accumulation.',
          dependencies: ['Electric Drive Motor', 'Gearbox', 'Horsehead Bridle'],
          suggestedAction: well.srpParams.activeFault
            ? 'Adjust SPM immediately and inspect polished rod clamp alignment.'
            : 'Maintain routine lubrication schedule for pitman bearings.',
        };
      case 'srp-rod-string':
        return {
          id: 'ROD-STR-78',
          name: 'Tapered Sucker Rod String (Grade D)',
          layer: 'wellbore',
          status: well.srpParams.surfaceRodLoadKn > 65 ? 'critical' : 'normal',
          healthPct: well.srpParams.surfaceRodLoadKn > 65 ? 65 : 92,
          telemetry: {
            'Peak Polished Rod Load': `${well.srpParams.surfaceRodLoadKn} kN`,
            'Rod Stress Level': `${Math.round((well.srpParams.surfaceRodLoadKn / 85) * 100)}% of yield`,
            'String Depth': `${well.coordinates.depthMeters} m`,
          },
          activeRisk: 'Cyclic tension-compression harmonic fatigue and buckling under heavy crude drag.',
          dependencies: ['Downhole Pump Plunger', 'Surface Polished Rod'],
          suggestedAction: 'Run dynamometer diagnostic card to verify peak polished rod load envelope.',
        };
      case 'downhole-pump':
        return {
          id: 'PUMP-INSERT-25',
          name: 'Stationary Barrel Sucker Rod Pump',
          layer: 'wellbore',
          status: well.srpParams.pumpEfficiencyPct < 80 ? 'caution' : 'normal',
          healthPct: well.srpParams.pumpEfficiencyPct,
          telemetry: {
            'Pump Fillage': `${well.srpParams.pumpFillagePct}%`,
            'Intake Pressure': `${well.srpParams.pumpIntakePressureBar} bar`,
            'Pump Displacement': `${well.srpParams.pumpDisplacementBpd} BPD`,
          },
          activeRisk: 'Ball and seat valve wire-drawing wear from abrasive formation fines.',
          dependencies: ['Traveling Valve', 'Standing Valve', 'Production Tubing'],
          suggestedAction: 'Inspect valve leakage rate during next scheduled workover.',
        };
      case 'reservoir-heated-zone':
        return {
          id: 'RES-ZONE-HEAT',
          name: 'Steam-Stimulated Heated Matrix Chamber',
          layer: 'reservoir',
          status: well.viscosity > 8000 ? 'caution' : 'normal',
          healthPct: well.steamResponseScore,
          telemetry: {
            'Formation Temp': `${well.reservoirTemp}°C`,
            'Crude Viscosity': `${well.viscosity.toLocaleString()} cP`,
            'Pore Pressure': `${well.reservoirPressure} bar`,
            'Thermal Radius': `${Math.round(steamChamberWidth / 8)} meters`,
          },
          activeRisk: 'Premature thermal cooldown and perimeter heat dissipation into cold boundaries.',
          dependencies: ['Perforations (1140-1160m)', 'CSS Cycle Conformance'],
          suggestedAction: 'Evaluate optimum soak time before initiating high-drawdown production.',
        };
      case 'surface-separator':
        return {
          id: 'SEP-2PH-01',
          name: 'Two-Phase Heavy Oil Separator & Header',
          layer: 'surface',
          status: 'normal',
          healthPct: 95,
          telemetry: {
            'Net Oil Flow': `${well.oilRate} BOPD`,
            'Total Liquid': `${well.totalLiquidRate} BLPD`,
            'Water Cut': `${well.waterCut}%`,
            'Operating Temp': '64°C',
          },
          activeRisk: 'Emulsion stability requiring demulsifier dosage adjustment.',
          dependencies: ['Crude Storage Tank', 'Effluent Water Disposal Line'],
          suggestedAction: 'Monitor interface level and calibrate water-cut meter.',
        };
      default:
        return {
          id,
          name: 'Oil Field Subsystem Component',
          layer: 'wellbore',
          status: 'normal',
          healthPct: 90,
          telemetry: {},
          activeRisk: 'Nominal operational status.',
          dependencies: [],
          suggestedAction: 'Maintain baseline monitoring.',
        };
    }
  };

  return (
    <div className="bg-[#101622] border border-[#233149] rounded-xl overflow-hidden shadow-xl flex flex-col">
      {/* Control Toolbar */}
      <div className="p-3 bg-[#151d2d] border-b border-[#233149] flex flex-wrap items-center justify-between gap-3">
        {/* Layer / View Filters */}
        <div className="flex items-center gap-1 bg-[#101622] p-1 rounded-lg border border-[#233149] text-xs">
          <button
            onClick={() => setViewMode('all')}
            className={`px-2.5 py-1 rounded transition-colors font-medium ${
              viewMode === 'all'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Full Cross-Section
          </button>
          <button
            onClick={() => setViewMode('thermal')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors font-medium ${
              viewMode === 'thermal'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5 text-red-400" />
            <span>Thermal Response</span>
          </button>
          <button
            onClick={() => setViewMode('viscosity')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors font-medium ${
              viewMode === 'viscosity'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-amber-400" />
            <span>Viscosity Field</span>
          </button>
          <button
            onClick={() => setViewMode('pressure')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors font-medium ${
              viewMode === 'pressure'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span>Pressure Drawdown</span>
          </button>
          <button
            onClick={() => setViewMode('mechanical')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors font-medium ${
              viewMode === 'mechanical'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>SRP Mechanics</span>
          </button>
        </div>

        {/* Display Toggles */}
        <div className="flex items-center gap-2 text-xs">
          <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer bg-[#101622] px-2.5 py-1 rounded border border-[#233149]">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
              className="rounded bg-[#151d2d] border-[#233149] text-amber-500 focus:ring-0"
            />
            <span>Labels</span>
          </label>
          <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer bg-[#101622] px-2.5 py-1 rounded border border-[#233149]">
            <input
              type="checkbox"
              checked={showFlows}
              onChange={(e) => setShowFlows(e.target.checked)}
              className="rounded bg-[#151d2d] border-[#233149] text-amber-500 focus:ring-0"
            />
            <span>Flow Vectors</span>
          </label>
        </div>
      </div>

      {/* Main SVG Cross-Section Viewport */}
      <div className="relative w-full overflow-hidden bg-tech-grid min-h-[580px] flex items-center justify-center p-2 select-none">
        {/* Dynamic Watermark / Warning */}
        <div className="absolute top-3 left-4 text-[10px] font-mono text-slate-500/80 pointer-events-none z-10 flex flex-col gap-0.5">
          <span>WELL: {well.id} ({well.name})</span>
          <span>DEPTH: {well.coordinates.depthMeters} m TVD | CSS CYCLE: #{well.cycleNumber}</span>
          <span className="text-amber-500/70">
            PHASE: {well.currentPhase.toUpperCase()} ({well.phaseElapsedHours}h / {well.phaseTotalHours}h)
          </span>
        </div>

        <svg
          viewBox="0 0 960 620"
          className="w-full h-auto max-h-[620px] drop-shadow-2xl"
          style={{ transformOrigin: 'center center' }}
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            <linearGradient id="steamPipeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="50%" stopColor="#fdba74" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>

            <linearGradient id="oilPipeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="50%" stopColor="#d4b483" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>

            <radialGradient id="heatChamberGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#f97316" stopOpacity="0.55" />
              <stop offset="75%" stopColor="#eab308" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="viscosityGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.75" />
              <stop offset="45%" stopColor="#eab308" stopOpacity="0.5" />
              <stop offset="80%" stopColor="#f43f5e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="pressureGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#1e293b" stopOpacity="0" />
            </radialGradient>

            <pattern id="sandstonePattern" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.75" fill="#475569" opacity="0.6" />
              <circle cx="10" cy="10" r="0.75" fill="#475569" opacity="0.6" />
              <circle cx="14" cy="4" r="0.75" fill="#334155" opacity="0.4" />
            </pattern>
          </defs>

          {/* ========================================== */}
          {/* 1. SURFACE TERRAIN & FACILITIES LAYER      */}
          {/* ========================================== */}
          {/* Ground Surface Line */}
          <rect x="0" y="160" width="960" height="460" fill="url(#groundGrad)" opacity="0.95" />
          <line x1="0" y1="160" x2="960" y2="160" stroke="#334155" strokeWidth="2.5" />
          <text x="20" y="152" fill="#64748b" fontSize="10" fontFamily="monospace">
            GROUND SURFACE (RAJASTHAN THAR DESERT ELEVATION +120m MSL)
          </text>

          {/* Surface Steam Generator (Clickable) */}
          <g
            id="steam-generator"
            className="cursor-pointer transition-all hover:opacity-90"
            onClick={() => setSelectedComponent(getComponentData('steam-generator'))}
          >
            <rect
              x="60"
              y="55"
              width="130"
              height="85"
              rx="4"
              fill="#1e293b"
              stroke="#ea580c"
              strokeWidth={isInjecting ? '2.5' : '1.5'}
            />
            {/* Boiler Stack */}
            <rect x="80" y="25" width="16" height="30" fill="#334155" stroke="#ea580c" strokeWidth="1" />
            <path d="M 88 25 Q 92 12 98 8" stroke="#f97316" strokeWidth="2" strokeDasharray="3 3" fill="none" opacity="0.7" />
            
            <text x="125" y="80" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">
              OTSG BOILER
            </text>
            <text x="125" y="96" fill="#f97316" fontSize="10" fontFamily="monospace" textAnchor="middle">
              {well.cssParams.injectionRateTph} t/h Steam
            </text>
            <text x="125" y="110" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">
              {well.cssParams.injectionPressureBar} bar • {well.cssParams.steamQualityPct}% Q
            </text>
            {isInjecting && (
              <circle cx="175" cy="70" r="4" fill="#22c55e" className="animate-ping" />
            )}
          </g>

          {/* Steam Injection Manifold & Pipe (Clickable) */}
          <g
            id="steam-manifold"
            className="cursor-pointer"
            onClick={() => setSelectedComponent(getComponentData('steam-manifold'))}
          >
            <path
              d="M 190 98 L 470 98 L 470 160"
              fill="none"
              stroke="url(#steamPipeGrad)"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {showFlows && isInjecting && (
              <path
                d="M 190 98 L 470 98 L 470 160"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeDasharray="8 6"
                className="animate-fluid-flow"
              />
            )}
          </g>

          {/* Wellhead Christmas Tree (Clickable) */}
          <g
            id="wellhead"
            className="cursor-pointer"
            onClick={() => setSelectedComponent(getComponentData('wellhead'))}
          >
            <rect x="460" y="115" width="40" height="45" rx="2" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
            <circle cx="480" cy="125" r="5" fill="#0284c7" />
            <rect x="472" y="95" width="16" height="20" fill="#475569" stroke="#cbd5e1" strokeWidth="1" />
            {showLabels && (
              <text x="480" y="88" fill="#cbd5e1" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                WELLHEAD TREE
              </text>
            )}
          </g>

          {/* SRP Surface Pumping Unit (Walking Beam & Horsehead) */}
          <g
            id="srp-surface-unit"
            className="cursor-pointer"
            onClick={() => setSelectedComponent(getComponentData('srp-surface-unit'))}
          >
            {/* Samson Post Support Triangle */}
            <polygon points="560,160 595,75 630,160" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
            
            {/* Walking Beam */}
            <line x1="495" y1="62" x2="690" y2="78" stroke="#d4b483" strokeWidth="7" strokeLinecap="round" />
            
            {/* Horsehead */}
            <path
              d="M 495 62 Q 475 75 480 98"
              fill="none"
              stroke="#d4b483"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Bridle & Polished Rod to Wellhead */}
            <line x1="480" y1="98" x2="480" y2="120" stroke="#f1f5f9" strokeWidth="2.5" />

            {/* Counterweight & Crank */}
            <circle cx="690" cy="115" r="18" fill="#334155" stroke="#64748b" strokeWidth="2" />
            <line x1="690" y1="78" x2="690" y2="115" stroke="#94a3b8" strokeWidth="3" />

            {/* Motor Base Skid */}
            <rect x="670" y="140" width="45" height="20" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
            <text x="692" y="154" fill="#38bdf8" fontSize="8" fontFamily="monospace" textAnchor="middle">
              {well.srpParams.motorPowerKw} kW
            </text>

            {showLabels && (
              <text x="595" y="48" fill="#d4b483" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                SRP BEAM PUMP ({well.srpParams.strokesPerMinute} SPM)
              </text>
            )}
          </g>

          {/* Production Flowline into Separator & Storage (Clickable) */}
          <g
            id="surface-separator"
            className="cursor-pointer"
            onClick={() => setSelectedComponent(getComponentData('surface-separator'))}
          >
            {/* Flowline from wellhead */}
            <path
              d="M 500 135 L 770 135 L 770 100"
              fill="none"
              stroke="url(#oilPipeGrad)"
              strokeWidth="4"
            />
            {showFlows && isProducing && (
              <path
                d="M 500 135 L 770 135 L 770 100"
                fill="none"
                stroke="#fef08a"
                strokeWidth="2"
                strokeDasharray="6 4"
                className="animate-fluid-flow"
              />
            )}

            {/* Two-Phase Separator */}
            <rect x="760" y="60" width="70" height="42" rx="12" fill="#1e293b" stroke="#d4b483" strokeWidth="2" />
            <text x="795" y="80" fill="#f8fafc" fontSize="9" fontWeight="bold" textAnchor="middle">
              SEPARATOR
            </text>
            <text x="795" y="94" fill="#38bdf8" fontSize="8" fontFamily="monospace" textAnchor="middle">
              {well.oilRate} BOPD
            </text>

            {/* Crude Storage Tank */}
            <rect x="850" y="48" width="65" height="60" rx="3" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
            <text x="882" y="76" fill="#cbd5e1" fontSize="9" fontWeight="bold" textAnchor="middle">
              STORAGE
            </text>
            <text x="882" y="90" fill="#22c55e" fontSize="8" fontFamily="monospace" textAnchor="middle">
              1,240 bbl
            </text>
          </g>

          {/* ========================================== */}
          {/* 2. GEOLOGICAL FORMATION STRATIGRAPHY       */}
          {/* ========================================== */}
          {/* Upper Overburden (Alluvium & Clay) */}
          <rect x="0" y="160" width="960" height="150" fill="#1e293b" opacity="0.6" />
          <text x="25" y="220" fill="#64748b" fontSize="10" fontFamily="monospace">
            OVERBURDEN (SHALE & CLAY SEAL 0 - 550m)
          </text>

          {/* Intermediate Carbonate Caprock */}
          <rect x="0" y="310" width="960" height="100" fill="#0f172a" opacity="0.8" />
          <line x1="0" y1="310" x2="960" y2="310" stroke="#334155" strokeDasharray="4 4" />
          <text x="25" y="360" fill="#64748b" fontSize="10" fontFamily="monospace">
            BILARA DOLOMITE CAPROCK (550 - 1050m)
          </text>

          {/* Target Heavy Oil Sandstone Formation */}
          <rect x="0" y="410" width="960" height="175" fill="#1c1917" stroke="#44403c" strokeWidth="1" />
          <rect x="0" y="410" width="960" height="175" fill="url(#sandstonePattern)" />
          <text x="25" y="435" fill="#d4b483" fontSize="11" fontFamily="monospace" fontWeight="bold">
            JODHPUR HEAVY OIL SANDSTONE RESERVOIR (1050 - 1180m)
          </text>
          <text x="25" y="452" fill="#a8a29e" fontSize="9" fontFamily="monospace">
            K: 450 mD • Porosity: 26% • Initial Viscosity: 18,500 cP
          </text>

          {/* ========================================== */}
          {/* 3. DYNAMIC RESERVOIR STIMULATION OVERLAYS */}
          {/* ========================================== */}
          {/* Thermal / Viscosity / Pressure Chamber Plume around Perforations */}
          <g
            id="reservoir-heated-zone"
            className="cursor-pointer"
            onClick={() => setSelectedComponent(getComponentData('reservoir-heated-zone'))}
          >
            {/* View Mode: Thermal Response (or All) */}
            {(viewMode === 'all' || viewMode === 'thermal') && (
              <g className="animate-thermal-glow">
                <ellipse
                  cx="480"
                  cy="500"
                  rx={steamChamberWidth}
                  ry="58"
                  fill="url(#heatChamberGrad)"
                />
                {/* Isotherm Contour Lines */}
                <ellipse cx="480" cy="500" rx={steamChamberWidth * 0.75} ry="42" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="5 3" />
                <ellipse cx="480" cy="500" rx={steamChamberWidth * 0.45} ry="26" fill="none" stroke="#f97316" strokeWidth="1.5" strokeDasharray="4 2" />
                <text x={480 + steamChamberWidth - 30} y="495" fill="#fca5a5" fontSize="9" fontFamily="monospace">
                  {well.reservoirTemp}°C ISOTHERM
                </text>
              </g>
            )}

            {/* View Mode: Viscosity Field */}
            {viewMode === 'viscosity' && (
              <g>
                <ellipse cx="480" cy="500" rx={steamChamberWidth * 1.15} ry="65" fill="url(#viscosityGrad)" />
                <text x="350" y="480" fill="#86efac" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  HIGH MOBILITY ZONE: {well.viscosity} cP
                </text>
                <text x="620" y="540" fill="#fca5a5" fontSize="9" fontFamily="monospace">
                  COLD UNSTIMULATED CRUDE: 18,500 cP
                </text>
              </g>
            )}

            {/* View Mode: Pressure Drawdown */}
            {viewMode === 'pressure' && (
              <g>
                <ellipse cx="480" cy="500" rx={steamChamberWidth * 1.05} ry="60" fill="url(#pressureGrad)" />
                <text x="480" y="555" fill="#7dd3fc" fontSize="10" fontFamily="monospace" textAnchor="middle">
                  RESERVOIR PRESSURE: {well.reservoirPressure} bar (DRAWDOWN: {Math.max(2, well.reservoirPressure - well.srpParams.pumpIntakePressureBar).toFixed(1)} bar)
                </text>
              </g>
            )}

            {/* Fluid Inflow Arrows during Production */}
            {showFlows && isProducing && (
              <g>
                <path d="M 400 495 L 450 500" stroke="#fef08a" strokeWidth="2.5" markerEnd="url(#arrow)" strokeDasharray="4 2" className="animate-fluid-flow" />
                <path d="M 560 495 L 510 500" stroke="#fef08a" strokeWidth="2.5" markerEnd="url(#arrow)" strokeDasharray="4 2" className="animate-fluid-flow" />
                <path d="M 420 525 L 460 515" stroke="#fef08a" strokeWidth="2" strokeDasharray="4 2" className="animate-fluid-flow" />
                <path d="M 540 525 L 500 515" stroke="#fef08a" strokeWidth="2" strokeDasharray="4 2" className="animate-fluid-flow" />
              </g>
            )}
          </g>

          {/* ========================================== */}
          {/* 4. WELLBORE & DOWNHOLE SRP COMPLETION     */}
          {/* ========================================== */}
          {/* Casing Strings */}
          {/* Surface Casing (0 to 260px) */}
          <rect x="466" y="160" width="28" height="120" fill="#1e293b" stroke="#475569" strokeWidth="2" />
          {/* Intermediate Casing (160 to 420px) */}
          <rect x="470" y="160" width="20" height="260" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
          {/* Production Tubing (160 to 510px) */}
          <rect x="475" y="160" width="10" height="340" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />

          {/* Fluid Level inside Casing Annulus */}
          <rect
            x="471"
            y={280 + (well.srpParams.fluidLevelMeters / 1200) * 160}
            width="18"
            height={220 - (well.srpParams.fluidLevelMeters / 1200) * 160}
            fill="#78350f"
            opacity="0.5"
          />

          {/* Downhole Sucker Rod String (Clickable) */}
          <g
            id="srp-rod-string"
            className="cursor-pointer"
            onClick={() => setSelectedComponent(getComponentData('srp-rod-string'))}
          >
            {/* Reciprocating Steel Rod Line */}
            <line
              x1="480"
              y1="160"
              x2="480"
              y2="495"
              stroke={well.srpParams.surfaceRodLoadKn > 65 ? '#ef4444' : '#cbd5e1'}
              strokeWidth={well.srpParams.surfaceRodLoadKn > 65 ? '3.5' : '2'}
            />
            {/* Rod Centralizers */}
            <rect x="476" y="240" width="8" height="4" fill="#38bdf8" />
            <rect x="476" y="320" width="8" height="4" fill="#38bdf8" />
            <rect x="476" y="400" width="8" height="4" fill="#38bdf8" />
            <rect x="476" y="460" width="8" height="4" fill="#38bdf8" />
          </g>

          {/* Downhole Pump Plunger & Valves (Clickable) */}
          <g
            id="downhole-pump"
            className="cursor-pointer"
            onClick={() => setSelectedComponent(getComponentData('downhole-pump'))}
          >
            {/* Pump Barrel */}
            <rect x="473" y="485" width="14" height="28" rx="1" fill="#334155" stroke="#f59e0b" strokeWidth="1.5" />
            
            {/* Traveling Valve (Moves with rod) */}
            <circle cx="480" cy="493" r="3" fill="#22c55e" stroke="#14532d" strokeWidth="0.5" />
            
            {/* Standing Valve (Stationary at barrel bottom) */}
            <circle cx="480" cy="508" r="3.2" fill="#0284c7" stroke="#082f49" strokeWidth="0.5" />

            {/* Perforations into Sandstone (Casing shots) */}
            <g stroke="#f59e0b" strokeWidth="2">
              <line x1="465" y1="492" x2="472" y2="492" />
              <line x1="488" y1="492" x2="495" y2="492" />
              <line x1="465" y1="500" x2="472" y2="500" />
              <line x1="488" y1="500" x2="495" y2="500" />
              <line x1="465" y1="508" x2="472" y2="508" />
              <line x1="488" y1="508" x2="495" y2="508" />
            </g>
          </g>

          {/* Produced Fluid Upflow Animation inside Tubing */}
          {showFlows && isProducing && (
            <line
              x1="480"
              y1="485"
              x2="480"
              y2="160"
              stroke="#fef08a"
              strokeWidth="2"
              strokeDasharray="8 6"
              className="animate-fluid-flow"
              opacity="0.85"
            />
          )}

          {/* Steam Injection Downflow Animation inside Tubing */}
          {showFlows && isInjecting && (
            <line
              x1="480"
              y1="160"
              x2="480"
              y2="485"
              stroke="#f97316"
              strokeWidth="3"
              strokeDasharray="10 6"
              className="animate-fluid-flow"
              opacity="0.9"
            />
          )}

          {/* Downhole Sensor Marker */}
          <circle cx="489" cy="478" r="3" fill="#8b5cf6" stroke="#ffffff" strokeWidth="0.75" />
          {showLabels && (
            <text x="500" y="481" fill="#c4b5fd" fontSize="9" fontFamily="monospace">
              PT SENSOR ({well.reservoirPressure} bar, {well.reservoirTemp}°C)
            </text>
          )}

          {/* Depth Scale Markers along wellbore */}
          <g fill="#64748b" fontSize="8" fontFamily="monospace">
            <line x1="455" y1="200" x2="465" y2="200" stroke="#475569" />
            <text x="450" y="203" textAnchor="end">200m</text>

            <line x1="455" y1="300" x2="465" y2="300" stroke="#475569" />
            <text x="450" y="303" textAnchor="end">600m</text>

            <line x1="455" y1="400" x2="465" y2="400" stroke="#475569" />
            <text x="450" y="403" textAnchor="end">950m</text>

            <line x1="455" y1="500" x2="465" y2="500" stroke="#475569" />
            <text x="450" y="503" textAnchor="end">1160m</text>
          </g>
        </svg>

        {/* Legend Overlay Card */}
        <div className="absolute bottom-3 left-3 bg-[#151d2d]/90 backdrop-blur-md p-2.5 rounded-lg border border-[#233149] text-[11px] space-y-1.5 pointer-events-auto">
          <div className="text-[10px] uppercase font-mono font-bold text-slate-400">
            Interactive Cross-Section
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-slate-300">Steam / Thermal Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-slate-300">Heated Heavy Crude</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-slate-300">Lifted Liquid / Water</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-slate-300">Sucker Rod Pump Unit</span>
          </div>
          <div className="text-[9px] text-slate-500 pt-1 border-t border-[#233149]">
            Click any component for diagnostics
          </div>
        </div>
      </div>

      {/* Component Inspector Modal */}
      <ComponentInspectorModal
        component={selectedComponent}
        onClose={() => setSelectedComponent(null)}
      />
    </div>
  );
};
