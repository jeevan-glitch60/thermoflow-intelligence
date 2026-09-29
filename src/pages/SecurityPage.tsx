import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Lock,
  Download,
  Search,
  Filter,
  Layers,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useFieldStore } from '../store/useFieldStore';
import { UserRole } from '../types';
import { ModelBadge } from '../components/common/ModelBadge';

export const SecurityPage: React.FC = () => {
  const { currentUserRole, setUserRole, auditLogs } = useFieldStore();
  const [searchLog, setSearchLog] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('All');

  const roles: { role: UserRole; perms: string; accessLevel: string }[] = [
    {
      role: 'Administrator',
      perms: 'Global configuration, role switching, demo state reset, and audit export.',
      accessLevel: 'Full Administrative Access',
    },
    {
      role: 'Production Engineer',
      perms: 'Wellhead production monitoring, drawdown analysis, and scenario review.',
      accessLevel: 'Operational Decision Support',
    },
    {
      role: 'Reservoir Engineer',
      perms: 'CSS thermodynamic simulation, soak diffusion modeling, and steam sizing.',
      accessLevel: 'Thermal Model Authority',
    },
    {
      role: 'Artificial Lift Engineer',
      perms: 'SRP dynamometer diagnostics, stroke/SPM tuning, and rod fatigue analysis.',
      accessLevel: 'Mechanical Lift Authority',
    },
    {
      role: 'Maintenance Planner',
      perms: 'Work order creation, status transitions, spare parts check, and task logging.',
      accessLevel: 'Work Order Management',
    },
    {
      role: 'Viewer',
      perms: 'Read-only observation across all digital twin views and telemetry feeds.',
      accessLevel: 'Read-Only Surveillance',
    },
  ];

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchLog.toLowerCase()) ||
      log.details.toLowerCase().includes(searchLog.toLowerCase()) ||
      (log.wellId && log.wellId.toLowerCase().includes(searchLog.toLowerCase()));
    const matchesRole = roleFilter === 'All' || log.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleExportAudit = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Audit_Log_${Date.now()}.json`);
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
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-mono tracking-tight">
              Security, Roles & Audit Trail
            </h1>
            <ModelBadge type="Synthetic estimate" />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Access governance, mock role permissions, and immutable operational action logging.
          </p>
        </div>

        <button
          onClick={handleExportAudit}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#151d2d] hover:bg-[#1c273c] border border-[#233149] rounded-lg text-xs font-semibold text-slate-200 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Security Baseline Status Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-[#101622] p-3 rounded-lg border border-[#233149]">
          <span className="text-slate-400 text-[10px] block">DEMONSTRATOR MODE</span>
          <span className="text-emerald-400 font-bold mt-1 block">ACTIVE (READ-ONLY)</span>
        </div>
        <div className="bg-[#101622] p-3 rounded-lg border border-[#233149]">
          <span className="text-slate-400 text-[10px] block">REAL SCADA ACCESS</span>
          <span className="text-rose-400 font-bold mt-1 block">AIR-GAPPED / DISABLED</span>
        </div>
        <div className="bg-[#101622] p-3 rounded-lg border border-[#233149]">
          <span className="text-slate-400 text-[10px] block">DIRECT ACTUATOR SIGNALS</span>
          <span className="text-rose-400 font-bold mt-1 block">BLOCKED (DECISION-SUPPORT)</span>
        </div>
        <div className="bg-[#101622] p-3 rounded-lg border border-[#233149]">
          <span className="text-slate-400 text-[10px] block">AUDIT LOGGING</span>
          <span className="text-cyan-400 font-bold mt-1 block">ENABLED (LOCAL STORAGE)</span>
        </div>
      </div>

      {/* Role-Based Access Control Table */}
      <div className="bg-[#101622] border border-[#233149] rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-amber-400" />
          <span>Prototype Role Hierarchy & Permissions</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#233149] text-slate-400 text-[11px] bg-[#151d2d]">
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Access Level</th>
                <th className="py-2.5 px-3">Functional Scope</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#233149]/60">
              {roles.map((r) => {
                const isCurrent = r.role === currentUserRole;
                return (
                  <tr
                    key={r.role}
                    className={`cursor-pointer transition-colors ${
                      isCurrent ? 'bg-amber-500/10 text-slate-100' : 'hover:bg-[#151d2d]/60 text-slate-300'
                    }`}
                    onClick={() => setUserRole(r.role)}
                  >
                    <td className="py-2.5 px-3 font-bold text-amber-400 flex items-center gap-1.5">
                      {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      <span>{r.role}</span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-cyan-400">{r.accessLevel}</td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans text-[11px]">{r.perms}</td>
                    <td className="py-2.5 px-3 text-center">
                      {isCurrent ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                          Active Session
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setUserRole(r.role);
                          }}
                          className="px-2 py-0.5 rounded text-[10px] bg-[#1c273c] hover:bg-[#283854] text-slate-300"
                        >
                          Switch
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Trail */}
      <div className="bg-[#101622] border border-[#233149] rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#233149] pb-3">
          <div>
            <h2 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Immutable Operational Audit Trail</span>
            </h2>
            <p className="text-xs text-slate-400">
              Timestamped log of engineering adjustments, scenario executions, and alarm acknowledgements.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchLog}
              onChange={(e) => setSearchLog(e.target.value)}
              className="bg-[#151d2d] border border-[#233149] rounded px-2.5 py-1 text-xs text-slate-100 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#233149] text-slate-400 text-[11px] bg-[#151d2d] sticky top-0">
                <th className="py-2.5 px-3">Log ID</th>
                <th className="py-2.5 px-3">UTC Timestamp</th>
                <th className="py-2.5 px-3">User Role</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Target Well</th>
                <th className="py-2.5 px-3">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#233149]/60">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#151d2d]/60">
                  <td className="py-2.5 px-3 font-semibold text-slate-400">{log.id}</td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {log.timestamp.slice(0, 19).replace('T', ' ')}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-amber-300">{log.role}</td>
                  <td className="py-2.5 px-3 text-cyan-400 font-bold">{log.action}</td>
                  <td className="py-2.5 px-3 text-slate-200">{log.wellId || '—'}</td>
                  <td className="py-2.5 px-3 text-slate-300 font-sans text-[11px]">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
