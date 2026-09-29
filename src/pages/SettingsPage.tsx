import React, { useState } from 'react';
import {
  Settings,
  Sparkles,
  RotateCcw,
  Play,
  Pause,
  Download,
  Upload,
  Database,
  Sliders,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useFieldStore } from '../store/useFieldStore';
import { ModelBadge } from '../components/common/ModelBadge';

export const SettingsPage: React.FC = () => {
  const {
    isTelemetryPaused,
    setTelemetryPaused,
    telemetryIntervalMs,
    setTelemetryIntervalMs,
    loadDemoScenario,
    resetAllDemoData,
    currentUserRole,
    setUserRole,
    wells,
  } = useFieldStore();

  const [message, setMessage] = useState<string | null>(null);

  const handleTriggerDemo = () => {
    loadDemoScenario();
    setMessage('Demo scenario loaded: BGW-03 set to Soak Phase (Cycle 4, 8,400 cP, 420t steam).');
    setTimeout(() => setMessage(null), 4000);
  };

  const handleResetDemo = () => {
    resetAllDemoData();
    setMessage('All field wells, telemetry streams, and logs reset to baseline.');
    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Title & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#233149] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-slate-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-mono tracking-tight">
              Simulation Settings & Demo Controls
            </h1>
            <ModelBadge type="Synthetic estimate" />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Global synthetic SCADA parameters, update cadence, baseline thresholds, and dataset resets.
          </p>
        </div>

        {/* Global Demo Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600/30 to-orange-600/30 hover:from-amber-600/50 hover:to-orange-600/50 border border-amber-500/40 rounded-lg text-xs font-semibold text-amber-300 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Demo Scenario</span>
          </button>
          <button
            onClick={handleResetDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#151d2d] hover:bg-[#1c273c] border border-[#233149] rounded-lg text-xs font-semibold text-rose-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Confirmation Toast */}
      {message && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-xs font-mono text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Grid: Global Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Telemetry Stream Cadence */}
        <div className="bg-[#101622] border border-[#233149] rounded-xl p-5 space-y-4">
          <div className="border-b border-[#233149] pb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Simulated SCADA Engine Controls</span>
            </h3>
            <span className="text-xs font-mono text-amber-400">
              {isTelemetryPaused ? 'PAUSED' : 'ACTIVE'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-mono">
                Update Frequency (Tick Interval):
              </label>
              <div className="grid grid-cols-4 gap-2 font-mono">
                {[1000, 2000, 3000, 5000].map((ms) => (
                  <button
                    key={ms}
                    onClick={() => setTelemetryIntervalMs(ms)}
                    className={`py-1.5 rounded border text-center transition-colors ${
                      telemetryIntervalMs === ms
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                        : 'bg-[#151d2d] text-slate-400 border-[#233149]'
                    }`}
                  >
                    {ms / 1000}s
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-slate-300 font-mono">Stream Transmission State:</span>
              <button
                onClick={() => setTelemetryPaused(!isTelemetryPaused)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-semibold border ${
                  isTelemetryPaused
                    ? 'bg-rose-950/40 text-rose-300 border-rose-500/40'
                    : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                }`}
              >
                {isTelemetryPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                <span>{isTelemetryPaused ? 'Resume All Streams' : 'Pause All Streams'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Session Persona & Role Assignment */}
        <div className="bg-[#101622] border border-[#233149] rounded-xl p-5 space-y-4">
          <div className="border-b border-[#233149] pb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-400" />
              <span>Session Persona & Role</span>
            </h3>
            <span className="text-xs font-mono text-emerald-400">{currentUserRole}</span>
          </div>

          <div className="space-y-3 text-xs">
            <label className="block text-slate-300 font-mono">Select Active Operating Role:</label>
            <div className="grid grid-cols-2 gap-2 font-mono">
              {[
                'Administrator',
                'Production Engineer',
                'Reservoir Engineer',
                'Artificial Lift Engineer',
                'Maintenance Planner',
                'Viewer',
              ].map((r) => (
                <button
                  key={r}
                  onClick={() => setUserRole(r as any)}
                  className={`p-2 rounded border text-left text-xs transition-colors ${
                    currentUserRole === r
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                      : 'bg-[#151d2d] text-slate-400 border-[#233149]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Diagnostic Thresholds and Calibration Limits */}
      <div className="bg-[#101622] border border-[#233149] rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2 border-b border-[#233149] pb-2">
          <span>Safety Alarms & Diagnostic Thresholds</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-[#151d2d] p-3 rounded-lg border border-[#233149] space-y-1">
            <span className="text-slate-400 text-[10px] block">SRP ROD STRESS ALARM</span>
            <div className="text-sm font-bold text-rose-400">75.0 kN Yield Warning</div>
            <p className="text-[11px] text-slate-500">Triggers critical diagnostic alarm ALT-1092</p>
          </div>

          <div className="bg-[#151d2d] p-3 rounded-lg border border-[#233149] space-y-1">
            <span className="text-slate-400 text-[10px] block">STEAM HEAT LOSS LIMIT</span>
            <div className="text-sm font-bold text-amber-400">20.0% Max Conformance Loss</div>
            <p className="text-[11px] text-slate-500">Triggers manifold insulation warning ALT-1088</p>
          </div>

          <div className="bg-[#151d2d] p-3 rounded-lg border border-[#233149] space-y-1">
            <span className="text-slate-400 text-[10px] block">WATER CUT ESCALATION</span>
            <div className="text-sm font-bold text-cyan-400">35.0% Water Fraction Limit</div>
            <p className="text-[11px] text-slate-500">Triggers drawdown throttling review ALT-1085</p>
          </div>
        </div>
      </div>
    </div>
  );
};
