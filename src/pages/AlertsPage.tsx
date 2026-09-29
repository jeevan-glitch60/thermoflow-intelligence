import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle,
  Search,
  Filter,
  Check,
  ExternalLink,
  Wrench,
  Activity,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useFieldStore } from '../store/useFieldStore';
import { AlertSeverity, AlertCategory, AlertStatus } from '../types';
import { ModelBadge } from '../components/common/ModelBadge';

export const AlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    alerts,
    selectedWellId,
    setSelectedWellId,
    acknowledgeAlert,
    resolveAlert,
    createMaintenanceTask,
  } = useFieldStore();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'All'>('All');
  const [selectedAlertId, setSelectedAlertId] = useState<string>(alerts[0]?.id || '');

  // Filter alerts
  const filteredAlerts = alerts.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.wellId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'All' || a.severity === severityFilter;
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const activeAlert = alerts.find((a) => a.id === selectedAlertId) || alerts[0];

  const handleCreateTaskFromAlert = (alert: typeof activeAlert) => {
    createMaintenanceTask({
      title: `Corrective action: ${alert.title}`,
      wellId: alert.wellId,
      priority: alert.severity === 'Critical' ? 'High' : 'Medium',
      equipment: alert.equipment,
      requiredRole: alert.assignedRole,
      estimatedHours: 6,
      requiredSpare: 'Synthetic replacement parts kit & gaskets',
      evidence: alert.telemetryEvidence,
      status: 'Awaiting review',
      notes: [`Generated from alert ${alert.id}. Impact: ${alert.impact}`],
    });
    navigate('/maintenance');
  };

  return (
    <div className="space-y-6">
      {/* Title & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#233149] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-rose-500" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-mono tracking-tight">
              Alerts & Incidents Management
            </h1>
            <ModelBadge type="Synthetic estimate" />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time automated diagnostic incident log across Baghewala heavy-oil extraction subsystems.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Total Alerts:</span>
          <span className="text-amber-400 font-bold">{alerts.length}</span>
          <span className="text-slate-500">•</span>
          <span className="text-rose-400 font-bold">
            {alerts.filter((a) => a.severity === 'Critical' && a.status === 'Active').length} Critical Active
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#101622] border border-[#233149] p-3 rounded-xl flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search alerts by title, description, or well..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#151d2d] border border-[#233149] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
          />
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="bg-[#151d2d] border border-[#233149] text-slate-200 rounded px-2.5 py-1 text-xs focus:outline-none"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
            <option value="Information">Information</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-[#151d2d] border border-[#233149] text-slate-200 rounded px-2.5 py-1 text-xs focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Acknowledged">Acknowledged</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Main Alerts Split: Alert List vs Selected Alert Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Alert List */}
        <div className="lg:col-span-1 space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
          {filteredAlerts.map((alt) => {
            const isSelected = alt.id === selectedAlertId;
            return (
              <div
                key={alt.id}
                onClick={() => setSelectedAlertId(alt.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-rose-950/20 border-rose-500/60 shadow-md ring-1 ring-rose-500/30'
                    : 'bg-[#101622] border-[#233149] hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1 font-mono">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        alt.severity === 'Critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : alt.severity === 'High'
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                          : alt.severity === 'Medium'
                          ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                          : 'bg-cyan-500/20 text-cyan-300'
                      }`}
                    >
                      {alt.severity}
                    </span>
                    <span className="text-amber-400 font-bold">{alt.wellId}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{alt.timestamp.slice(11, 16)} UTC</span>
                </div>

                <h3 className="text-xs font-semibold text-slate-100 line-clamp-1">{alt.title}</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{alt.description}</p>

                <div className="mt-2 pt-2 border-t border-[#233149]/60 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400 truncate max-w-[140px]">{alt.category}</span>
                  <span
                    className={
                      alt.status === 'Active'
                        ? 'text-rose-400 font-bold'
                        : alt.status === 'Acknowledged'
                        ? 'text-yellow-400'
                        : 'text-emerald-400'
                    }
                  >
                    {alt.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Alert Detailed Inspector */}
        <div className="lg:col-span-2 bg-[#101622] border border-[#233149] rounded-xl p-5 space-y-4 flex flex-col justify-between">
          {activeAlert ? (
            <>
              <div className="space-y-4">
                {/* Detail Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#233149] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-400">{activeAlert.id}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs font-mono text-cyan-400">{activeAlert.wellId}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs font-mono text-slate-400">{activeAlert.timestamp}</span>
                    </div>
                    <h2 className="text-base font-bold text-slate-100 font-mono mt-1">
                      {activeAlert.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeAlert.status === 'Active' && (
                      <button
                        onClick={() => acknowledgeAlert(activeAlert.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#151d2d] hover:bg-[#1c273c] border border-[#233149] text-yellow-300 rounded text-xs transition-colors font-medium"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Acknowledge</span>
                      </button>
                    )}
                    {activeAlert.status !== 'Resolved' && (
                      <button
                        onClick={() => resolveAlert(activeAlert.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded text-xs transition-colors font-medium"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Resolve</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Subsystem & Category */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-[#151d2d] p-3 rounded-lg border border-[#233149]">
                    <span className="text-slate-400 text-[10px] block">AFFECTED EQUIPMENT</span>
                    <span className="text-slate-100 font-semibold">{activeAlert.equipment}</span>
                  </div>
                  <div className="bg-[#151d2d] p-3 rounded-lg border border-[#233149]">
                    <span className="text-slate-400 text-[10px] block">CATEGORY & ROLE</span>
                    <span className="text-slate-100 font-semibold">
                      {activeAlert.category} ({activeAlert.assignedRole})
                    </span>
                  </div>
                </div>

                {/* Telemetry Evidence Box */}
                <div className="bg-[#151d2d] border border-cyan-500/30 p-3.5 rounded-lg space-y-1 text-xs">
                  <div className="font-semibold text-cyan-300 font-mono flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Telemetry Evidence</span>
                  </div>
                  <p className="text-slate-300 font-mono text-[11px] leading-relaxed">
                    {activeAlert.telemetryEvidence}
                  </p>
                </div>

                {/* Operational Impact */}
                <div className="bg-[#151d2d] border border-amber-500/30 p-3.5 rounded-lg space-y-1 text-xs">
                  <div className="font-semibold text-amber-300 font-mono flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Asset Impact & Risk</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{activeAlert.impact}</p>
                </div>

                {/* Recommended Operational Action */}
                <div className="bg-[#151d2d] border border-emerald-500/30 p-3.5 rounded-lg space-y-1 text-xs">
                  <div className="font-semibold text-emerald-300 font-mono flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Recommended Resolution Protocol</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {activeAlert.recommendedAction}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#233149] flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setSelectedWellId(activeAlert.wellId);
                    navigate('/field-digital-twin');
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#151d2d] hover:bg-[#1c273c] border border-[#233149] rounded-lg text-xs text-slate-200 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Inspect in Field Digital Twin</span>
                </button>

                <button
                  onClick={() => handleCreateTaskFromAlert(activeAlert)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold rounded-lg text-xs transition-all shadow-md"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Create Maintenance Work Order</span>
                </button>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-500 font-mono text-xs">
              No alert selected. Choose an incident from the list to review diagnostics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
