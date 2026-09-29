import React, { useState } from 'react';
import {
  Box,
  Layers,
  MapPin,
  Flame,
  Activity,
  Droplets,
  Gauge,
  Sliders,
  Sparkles,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { useFieldStore } from '../store/useFieldStore';
import { WellboreCutaway } from '../components/digital-twin/WellboreCutaway';
import { FieldMap2D } from '../components/field/FieldMap2D';
import { SrpSchematic } from '../components/srp/SrpSchematic';
import { ModelBadge } from '../components/common/ModelBadge';

export const FieldDigitalTwinPage: React.FC = () => {
  const { wells, selectedWellId, setSelectedWellId, loadDemoScenario } = useFieldStore();
  const selectedWell = wells.find((w) => w.id === selectedWellId) || wells[0];
  const [activeTab, setActiveTab] = useState<'wellbore' | 'field-map' | 'srp-mechanics'>('wellbore');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#233149] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Box className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-mono tracking-tight">
              Well-to-Surface Digital Twin
            </h1>
            <ModelBadge type="Illustrative model output" />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Interactive conceptual model of surface facilities, wellbore, reservoir thermal response, and artificial lift.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={loadDemoScenario}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600/30 to-orange-600/30 hover:from-amber-600/50 hover:to-orange-600/50 border border-amber-500/40 rounded-lg text-xs font-medium text-amber-300 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Demo State (BGW-03)</span>
          </button>
        </div>
      </div>

      {/* Mandatory Safety Notice */}
      <div className="bg-[#151d2d] border border-amber-500/30 p-2.5 rounded-lg flex items-center gap-2.5 text-xs text-amber-300/90 font-mono">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          CONCEPTUAL DIGITAL TWIN — SYNTHETIC DATA — NOT A CERTIFIED RESERVOIR OR WELL MODEL.
        </span>
      </div>

      {/* View Mode Tabs & Well Selection Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Visualizer Mode Tabs */}
        <div className="flex items-center gap-1 bg-[#101622] p-1 rounded-lg border border-[#233149] text-xs">
          <button
            onClick={() => setActiveTab('wellbore')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'wellbore'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-cyan-400" />
            <span>Wellbore & Reservoir Cross-Section</span>
          </button>

          <button
            onClick={() => setActiveTab('srp-mechanics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'srp-mechanics'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>SRP Mechanical Motion View</span>
          </button>

          <button
            onClick={() => setActiveTab('field-map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'field-map'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Field Reservoir Map (8 Wells)</span>
          </button>
        </div>

        {/* Selected Well Summary Strip */}
        <div className="flex items-center gap-3 text-xs bg-[#101622] px-3 py-1.5 rounded-lg border border-[#233149] font-mono">
          <span className="text-slate-400">Inspecting:</span>
          <span className="font-bold text-amber-400">{selectedWell.id}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-200">{selectedWell.currentPhase}</span>
          <span className="text-slate-500">•</span>
          <span className="text-red-400">{selectedWell.reservoirTemp}°C</span>
          <span className="text-slate-500">•</span>
          <span className="text-amber-300">{selectedWell.viscosity.toLocaleString()} cP</span>
        </div>
      </div>

      {/* Main Digital Twin Visualizer Display */}
      {activeTab === 'wellbore' && <WellboreCutaway well={selectedWell} />}
      {activeTab === 'srp-mechanics' && <SrpSchematic srpParams={selectedWell.srpParams} />}
      {activeTab === 'field-map' && <FieldMap2D />}

      {/* Live Well-to-Surface Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        <div className="bg-[#101622] p-2.5 rounded-lg border border-[#233149]">
          <div className="text-[10px] text-slate-400">Steam Volume</div>
          <div className="text-sm font-bold font-mono text-orange-400 mt-0.5">
            {selectedWell.cssParams.steamVolumeTonnes} t
          </div>
          <div className="text-[9px] text-slate-500">CSS slug</div>
        </div>

        <div className="bg-[#101622] p-2.5 rounded-lg border border-[#233149]">
          <div className="text-[10px] text-slate-400">Injection Press.</div>
          <div className="text-sm font-bold font-mono text-slate-100 mt-0.5">
            {selectedWell.cssParams.injectionPressureBar} bar
          </div>
          <div className="text-[9px] text-slate-500">Wellhead</div>
        </div>

        <div className="bg-[#101622] p-2.5 rounded-lg border border-[#233149]">
          <div className="text-[10px] text-slate-400">Soak Hours</div>
          <div className="text-sm font-bold font-mono text-amber-400 mt-0.5">
            {selectedWell.phaseElapsedHours} / {selectedWell.cssParams.soakTimeHours}h
          </div>
          <div className="text-[9px] text-slate-500">Conductive heat</div>
        </div>

        <div className="bg-[#101622] p-2.5 rounded-lg border border-[#233149]">
          <div className="text-[10px] text-slate-400">Oil Viscosity</div>
          <div className="text-sm font-bold font-mono text-amber-300 mt-0.5">
            {selectedWell.viscosity.toLocaleString()} cP
          </div>
          <div className="text-[9px] text-slate-500">In-situ matrix</div>
        </div>

        <div className="bg-[#101622] p-2.5 rounded-lg border border-[#233149]">
          <div className="text-[10px] text-slate-400">Stroke Length</div>
          <div className="text-sm font-bold font-mono text-slate-100 mt-0.5">
            {selectedWell.srpParams.strokeLengthInches} in
          </div>
          <div className="text-[9px] text-slate-500">Polished rod</div>
        </div>

        <div className="bg-[#101622] p-2.5 rounded-lg border border-[#233149]">
          <div className="text-[10px] text-slate-400">Pumping Speed</div>
          <div className="text-sm font-bold font-mono text-cyan-400 mt-0.5">
            {selectedWell.srpParams.strokesPerMinute} SPM
          </div>
          <div className="text-[9px] text-slate-500">Beam frequency</div>
        </div>

        <div className="bg-[#101622] p-2.5 rounded-lg border border-[#233149]">
          <div className="text-[10px] text-slate-400">Rod Peak Load</div>
          <div
            className={`text-sm font-bold font-mono mt-0.5 ${
              selectedWell.srpParams.surfaceRodLoadKn > 65 ? 'text-rose-400' : 'text-slate-100'
            }`}
          >
            {selectedWell.srpParams.surfaceRodLoadKn} kN
          </div>
          <div className="text-[9px] text-slate-500">Max limit: 85 kN</div>
        </div>

        <div className="bg-[#101622] p-2.5 rounded-lg border border-[#233149]">
          <div className="text-[10px] text-slate-400">Net Oil Rate</div>
          <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
            {selectedWell.oilRate} BOPD
          </div>
          <div className="text-[9px] text-slate-500">WC: {selectedWell.waterCut}%</div>
        </div>
      </div>
    </div>
  );
};
