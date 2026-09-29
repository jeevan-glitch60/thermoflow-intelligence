import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Sliders,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Wrench,
  CheckCircle2,
  TrendingDown,
  Info,
  Flame,
  Zap,
} from 'lucide-react';
import { useFieldStore } from '../store/useFieldStore';
import { SrpSchematic } from '../components/srp/SrpSchematic';
import { DynamometerCard } from '../components/srp/DynamometerCard';
import { ModelBadge } from '../components/common/ModelBadge';
import { analyzeSrpSettings } from '../services/simulationEngine';
import { SrpFaultType } from '../types';

export const SrpOptimizerPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    wells,
    selectedWellId,
    updateSrpParams,
    injectSrpFault,
    resetSrpFault,
    createMaintenanceTask,
  } = useFieldStore();

  const well = wells.find((w) => w.id === selectedWellId) || wells[0];
  const srp = well.srpParams;

  const [strokeLen, setStrokeLen] = useState<number>(srp.strokeLengthInches);
  const [spm, setSpm] = useState<number>(srp.strokesPerMinute);

  const analysis = analyzeSrpSettings(well);

  const handleApplyParams = () => {
    updateSrpParams(well.id, {
      strokeLengthInches: strokeLen,
      strokesPerMinute: spm,
    });
  };

  const handleOptimize = () => {
    const recStroke = analysis.recommendation.strokeLength;
    const recSpm = analysis.recommendation.spm;
    setStrokeLen(recStroke);
    setSpm(recSpm);
    updateSrpParams(well.id, {
      strokeLengthInches: recStroke,
      strokesPerMinute: recSpm,
      pumpEfficiencyPct: 92,
    });
  };

  const handleInjectFault = (fault: SrpFaultType) => {
    injectSrpFault(well.id, fault);
  };

  const handleResetPump = () => {
    resetSrpFault(well.id);
    setStrokeLen(120);
    setSpm(6.2);
  };

  const handleCreateMaintenance = () => {
    createMaintenanceTask({
      title: `SRP Inspection and Dynamometer Verification for ${well.id}`,
      wellId: well.id,
      priority: srp.activeFault ? 'High' : 'Medium',
      equipment: 'Surface Beam Unit & Sucker Rod String',
      requiredRole: 'Artificial Lift Engineer',
      estimatedHours: 6,
      requiredSpare: 'Synthetic rod-string inspection kit & polished rod clamp',
      evidence: `Surface rod load: ${srp.surfaceRodLoadKn} kN. Active condition: ${srp.activeFault || 'Scheduled review'}.`,
      status: 'Awaiting review',
      notes: [`Dynamometer card verified on well ${well.id}. Recommend load cell recalibration.`],
    });
    navigate('/maintenance');
  };

  return (
    <div className="space-y-6">
      {/* Title & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#233149] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-mono tracking-tight">
              Sucker Rod Pump Optimizer
            </h1>
            <ModelBadge type="Illustrative model output" />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Monitor artificial-lift performance, simulate downhole faults, and recommend efficient operating settings for {well.id}.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleOptimize}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600/30 to-cyan-600/30 hover:from-emerald-600/50 hover:to-cyan-600/50 border border-emerald-500/40 rounded-lg text-xs font-semibold text-emerald-300 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Optimize SRP Settings</span>
          </button>
          <button
            onClick={handleResetPump}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#151d2d] hover:bg-[#1c273c] border border-[#233149] rounded-lg text-xs text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Pump</span>
          </button>
        </div>
      </div>

      {/* Top Split: Animated Mechanical Schematic vs Dynamometer Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SrpSchematic srpParams={srp} />
        <DynamometerCard srpParams={srp} />
      </div>

      {/* Row 2: Controls, Health Diagnostics & Fault Injections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Speed & Stroke Parameter Controls */}
        <div className="bg-[#101622] border border-[#233149] rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[#233149] pb-2">
            <h2 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Pump Setting Controls</span>
            </h2>
            <span className="text-[11px] font-mono text-slate-400">{well.id}</span>
          </div>

          {/* Stroke Length */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Stroke Length:</span>
              <span className="text-amber-400 font-bold">{strokeLen} inches</span>
            </div>
            <input
              type="range"
              min="84"
              max="168"
              step="6"
              value={strokeLen}
              onChange={(e) => setStrokeLen(Number(e.target.value))}
              className="w-full accent-amber-500 bg-[#151d2d] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>84 in</span>
              <span>Nominal: 120 in</span>
              <span>168 in</span>
            </div>
          </div>

          {/* Strokes Per Minute (SPM) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Pumping Speed:</span>
              <span className="text-cyan-400 font-bold">{spm} SPM</span>
            </div>
            <input
              type="range"
              min="3.0"
              max="10.5"
              step="0.2"
              value={spm}
              onChange={(e) => setSpm(Number(e.target.value))}
              className="w-full accent-cyan-500 bg-[#151d2d] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>3.0 SPM</span>
              <span>Safe Band: 5.5 - 6.8</span>
              <span>10.5 SPM</span>
            </div>
          </div>

          {/* Lift Metrics Summary */}
          <div className="bg-[#151d2d] p-3 rounded-lg border border-[#233149] space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Displacement:</span>
              <span className="text-slate-200">{srp.pumpDisplacementBpd} BPD</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Motor Current:</span>
              <span className="text-slate-200">{srp.motorCurrentAmp} A</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Motor Power:</span>
              <span className="text-slate-200">{srp.motorPowerKw} kW</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Fluid Level:</span>
              <span className="text-slate-200">{srp.fluidLevelMeters} m</span>
            </div>
          </div>

          <button
            onClick={handleApplyParams}
            className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold rounded-lg transition-colors"
          >
            Apply SRP Settings
          </button>
        </div>

        {/* Column 2: Health, Efficiency & Risk Matrix */}
        <div className="bg-[#101622] border border-[#233149] rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[#233149] pb-2">
            <h2 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Pump Diagnostics & Risk</span>
            </h2>
            <span
              className={`text-xs font-mono font-bold ${
                analysis.overallHealthScore < 75 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              Health: {analysis.overallHealthScore}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#151d2d] p-2.5 rounded-lg border border-[#233149]">
              <div className="text-slate-400 text-[11px]">Pump Efficiency</div>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                {analysis.pumpEfficiencyPct}%
              </div>
            </div>
            <div className="bg-[#151d2d] p-2.5 rounded-lg border border-[#233149]">
              <div className="text-slate-400 text-[11px]">Pump Fillage</div>
              <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5">
                {analysis.pumpFillagePct}%
              </div>
            </div>
            <div className="bg-[#151d2d] p-2.5 rounded-lg border border-[#233149]">
              <div className="text-slate-400 text-[11px]">Rod Stress Level</div>
              <div
                className={`text-lg font-bold font-mono mt-0.5 ${
                  analysis.rodStressPct > 80 ? 'text-rose-400' : 'text-slate-200'
                }`}
              >
                {analysis.rodStressPct}%
              </div>
            </div>
            <div className="bg-[#151d2d] p-2.5 rounded-lg border border-[#233149]">
              <div className="text-slate-400 text-[11px]">Energy / Barrel</div>
              <div className="text-lg font-bold font-mono text-yellow-300 mt-0.5">
                {analysis.energyPerBblGj} GJ/bbl
              </div>
            </div>
          </div>

          {/* Risk Sliders / Bars */}
          <div className="space-y-2 text-xs font-mono pt-1">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Fluid Pound Risk:</span>
                <span className={analysis.fluidPoundRiskPct > 60 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                  {analysis.fluidPoundRiskPct}%
                </span>
              </div>
              <div className="h-2 w-full bg-[#151d2d] rounded-full overflow-hidden">
                <div
                  className={`h-full ${analysis.fluidPoundRiskPct > 60 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  style={{ width: `${analysis.fluidPoundRiskPct}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Gas Interference Risk:</span>
                <span className={analysis.gasInterferenceRiskPct > 60 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                  {analysis.gasInterferenceRiskPct}%
                </span>
              </div>
              <div className="h-2 w-full bg-[#151d2d] rounded-full overflow-hidden">
                <div
                  className={`h-full ${analysis.gasInterferenceRiskPct > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${analysis.gasInterferenceRiskPct}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Pump-Off Risk:</span>
                <span className={analysis.pumpOffRiskPct > 60 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                  {analysis.pumpOffRiskPct}%
                </span>
              </div>
              <div className="h-2 w-full bg-[#151d2d] rounded-full overflow-hidden">
                <div
                  className={`h-full ${analysis.pumpOffRiskPct > 60 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                  style={{ width: `${analysis.pumpOffRiskPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-[#151d2d] rounded-lg border border-[#233149] text-xs">
            <span className="text-slate-400 block mb-1">Recommended Operating Band:</span>
            <span className="text-emerald-400 font-mono font-semibold">{analysis.operatingBandText}</span>
          </div>
        </div>

        {/* Column 3: Fault Injection Laboratory */}
        <div className="bg-[#101622] border border-[#233149] rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[#233149] pb-2">
            <h2 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Fault Injection Laboratory</span>
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">Demo Testing</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Test automated anomaly detection by simulating realistic mechanical and downhole pump failure modes.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
            {/* Rod Overload (Demo Scenario key item) */}
            <button
              onClick={() => handleInjectFault('rod_overload')}
              className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                srp.activeFault === 'rod_overload'
                  ? 'bg-rose-950/40 border-rose-500 text-rose-300 ring-1 ring-rose-500/50'
                  : 'bg-[#151d2d] border-[#233149] text-slate-300 hover:border-rose-500/50'
              }`}
            >
              <div>
                <div className="font-semibold font-mono">Rod-Load Overload (78.5 kN)</div>
                <div className="text-[10px] text-slate-400">Structural fatigue spike</div>
              </div>
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            </button>

            {/* Fluid Pound */}
            <button
              onClick={() => handleInjectFault('fluid_pound')}
              className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                srp.activeFault === 'fluid_pound'
                  ? 'bg-yellow-950/40 border-yellow-500 text-yellow-300 ring-1 ring-yellow-500/50'
                  : 'bg-[#151d2d] border-[#233149] text-slate-300 hover:border-yellow-500/50'
              }`}
            >
              <div>
                <div className="font-semibold font-mono">Fluid Pound Condition</div>
                <div className="text-[10px] text-slate-400">Plunger impact on downstroke</div>
              </div>
              <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
            </button>

            {/* Gas Interference */}
            <button
              onClick={() => handleInjectFault('gas_interference')}
              className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                srp.activeFault === 'gas_interference'
                  ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500/50'
                  : 'bg-[#151d2d] border-[#233149] text-slate-300 hover:border-cyan-500/50'
              }`}
            >
              <div>
                <div className="font-semibold font-mono">Gas Interference</div>
                <div className="text-[10px] text-slate-400">Delayed traveling valve opening</div>
              </div>
              <AlertTriangle className="w-4 h-4 text-cyan-400 shrink-0" />
            </button>

            {/* Pump Off */}
            <button
              onClick={() => handleInjectFault('pump_off')}
              className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                srp.activeFault === 'pump_off'
                  ? 'bg-purple-950/40 border-purple-500 text-purple-300 ring-1 ring-purple-500/50'
                  : 'bg-[#151d2d] border-[#233149] text-slate-300 hover:border-purple-500/50'
              }`}
            >
              <div>
                <div className="font-semibold font-mono">Pump-Off / Cavitation</div>
                <div className="text-[10px] text-slate-400">Underfilled pump chamber</div>
              </div>
              <AlertTriangle className="w-4 h-4 text-purple-400 shrink-0" />
            </button>
          </div>

          <button
            onClick={handleCreateMaintenance}
            className="w-full py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-mono text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Generate Maintenance Work Order</span>
          </button>

          <div className="text-[10px] text-slate-500 text-center font-mono">
            Simulated maintenance recommendation — requires field verification.
          </div>
        </div>
      </div>
    </div>
  );
};
