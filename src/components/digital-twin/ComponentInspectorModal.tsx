import React from 'react';
import {
  X,
  Activity,
  AlertTriangle,
  ArrowRight,
  Wrench,
  Sliders,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { TwinComponent } from '../../types';
import { useFieldStore } from '../../store/useFieldStore';
import { useNavigate } from 'react-router-dom';

interface ComponentInspectorModalProps {
  component: TwinComponent | null;
  onClose: () => void;
}

export const ComponentInspectorModal: React.FC<ComponentInspectorModalProps> = ({
  component,
  onClose,
}) => {
  const navigate = useNavigate();
  const { createMaintenanceTask, selectedWellId } = useFieldStore();

  if (!component) return null;

  const handleCreateMaintenance = () => {
    createMaintenanceTask({
      title: `Scheduled inspection for ${component.name}`,
      wellId: selectedWellId,
      priority: component.status === 'critical' ? 'High' : 'Medium',
      equipment: component.name,
      requiredRole: 'Artificial Lift Engineer',
      estimatedHours: 4,
      requiredSpare: 'OEM inspection kit and replacement seals',
      evidence: `Health indicator: ${component.healthPct}%. Active condition: ${component.activeRisk}.`,
      status: 'Awaiting review',
      notes: [`Generated from interactive Field Digital Twin inspector on well ${selectedWellId}.`],
    });
    onClose();
    navigate('/maintenance');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#151d2d] border border-[#233149] rounded-xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#233149] flex items-center justify-between bg-[#101622]">
          <div className="flex items-center gap-3">
            <div
              className={`w-3.5 h-3.5 rounded-full ${
                component.status === 'normal'
                  ? 'bg-emerald-400'
                  : component.status === 'caution'
                  ? 'bg-yellow-400'
                  : 'bg-rose-500 animate-pulse'
              }`}
            />
            <div>
              <h3 className="font-semibold text-slate-100 text-base">{component.name}</h3>
              <p className="text-xs font-mono text-slate-400">
                ID: {component.id} • Layer: {component.layer.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-[#1c273c]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Health and Status KPI */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#101622] p-3 rounded-lg border border-[#233149]">
              <div className="text-[11px] text-slate-400">Subsystem Health</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                {component.healthPct}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Synthetic metric</div>
            </div>
            <div className="bg-[#101622] p-3 rounded-lg border border-[#233149]">
              <div className="text-[11px] text-slate-400">Condition Status</div>
              <div
                className={`text-sm font-bold font-mono uppercase mt-1.5 ${
                  component.status === 'normal'
                    ? 'text-emerald-400'
                    : component.status === 'caution'
                    ? 'text-yellow-400'
                    : 'text-rose-400'
                }`}
              >
                {component.status}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Automated rule</div>
            </div>
          </div>

          {/* Telemetry Snapshot */}
          <div className="bg-[#101622] p-3.5 rounded-lg border border-[#233149]">
            <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Real-Time Simulated Telemetry</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(component.telemetry).map(([k, v]) => (
                <div key={k} className="flex justify-between py-1 border-b border-[#233149]/60">
                  <span className="text-slate-400">{k}:</span>
                  <span className="font-mono text-slate-100 font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Risk */}
          <div className="bg-amber-950/20 border border-amber-500/30 p-3 rounded-lg text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-amber-300 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Diagnostic Assessment</span>
            </div>
            <p className="text-slate-300 leading-relaxed">{component.activeRisk}</p>
          </div>

          {/* Direct Dependencies */}
          <div>
            <div className="text-xs font-semibold text-slate-400 mb-1.5">Direct Process Dependencies</div>
            <div className="flex flex-wrap gap-1.5">
              {component.dependencies.map((dep) => (
                <span
                  key={dep}
                  className="px-2 py-0.5 text-[11px] font-mono rounded bg-[#101622] text-slate-300 border border-[#233149]"
                >
                  {dep}
                </span>
              ))}
            </div>
          </div>

          {/* Suggested Operational Action */}
          <div className="bg-[#101622] p-3 rounded-lg border border-[#233149] text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-cyan-300 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Recommended Action</span>
            </div>
            <p className="text-slate-300 leading-relaxed">{component.suggestedAction}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-[#233149] bg-[#101622] flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              navigate('/telemetry');
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-[#151d2d] hover:bg-[#1c273c] border border-[#233149] rounded-lg transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Open Telemetry</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                navigate('/simulation');
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate</span>
            </button>
            <button
              onClick={handleCreateMaintenance}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors shadow-sm"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
