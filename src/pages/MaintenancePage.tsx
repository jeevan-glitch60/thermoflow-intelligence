import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Download,
  Filter,
  Package,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { useFieldStore } from '../store/useFieldStore';
import { MaintenanceTask, UserRole } from '../types';
import { ModelBadge } from '../components/common/ModelBadge';

export const MaintenancePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    maintenanceTasks,
    wells,
    selectedWellId,
    setSelectedWellId,
    createMaintenanceTask,
    updateMaintenanceTaskStatus,
  } = useFieldStore();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskWell, setNewTaskWell] = useState<string>(selectedWellId);
  const [newTaskPriority, setNewTaskPriority] = useState<MaintenanceTask['priority']>('High');
  const [newTaskEquipment, setNewTaskEquipment] = useState<string>('Surface Pumping Unit / Rod String');
  const [newTaskRole, setNewTaskRole] = useState<UserRole>('Artificial Lift Engineer');
  const [newTaskHours, setNewTaskHours] = useState<number>(6);
  const [newTaskSpare, setNewTaskSpare] = useState<string>('Synthetic rod-string inspection kit');
  const [newTaskEvidence, setNewTaskEvidence] = useState<string>('Load chart deviation and vibration trend');

  const filteredTasks = maintenanceTasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.wellId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.equipment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    createMaintenanceTask({
      title: newTaskTitle,
      wellId: newTaskWell,
      priority: newTaskPriority,
      equipment: newTaskEquipment,
      requiredRole: newTaskRole,
      estimatedHours: newTaskHours,
      requiredSpare: newTaskSpare,
      evidence: newTaskEvidence,
      status: 'Awaiting review',
      notes: ['Task manually initiated from Maintenance Planner.'],
    });

    setIsCreateModalOpen(false);
    setNewTaskTitle('');
  };

  const handleExportPlan = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(maintenanceTasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Baghewala_Maintenance_Plan_${Date.now()}.json`);
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
            <Wrench className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-mono tracking-tight">
              Maintenance Planner & Work Orders
            </h1>
            <ModelBadge type="Synthetic estimate" />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Work order lifecycle tracking, spare parts allocation, and scheduled turnaround management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Work Order</span>
          </button>

          <button
            onClick={handleExportPlan}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#151d2d] hover:bg-[#1c273c] border border-[#233149] rounded-lg text-xs text-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Plan</span>
          </button>
        </div>
      </div>

      {/* 9-Step Maintenance Workflow Header */}
      <div className="bg-[#101622] border border-[#233149] p-3.5 rounded-xl space-y-2">
        <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wide">
          Standard Operating Maintenance Workflow
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5 text-center text-[10px] font-mono">
          {[
            '1. Anomaly Detected',
            '2. Review Evidence',
            '3. Engineering Review',
            '4. Recommend Inspection',
            '5. Task Created',
            '6. Spares Verified',
            '7. Scheduled',
            '8. Completed',
            '9. Verified',
          ].map((st, i) => (
            <div
              key={st}
              className={`p-1.5 rounded border ${
                i === 0
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 font-bold'
                  : i === 4
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold'
                  : 'bg-[#151d2d] text-slate-400 border-[#233149]'
              }`}
            >
              {st}
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#101622] border border-[#233149] p-3 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search work orders by title, equipment, or well..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#151d2d] border border-[#233149] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#151d2d] border border-[#233149] text-slate-200 rounded px-2.5 py-1 text-xs focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Awaiting review">Awaiting review</option>
            <option value="Approved">Approved</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-[#151d2d] border border-[#233149] text-slate-200 rounded px-2.5 py-1 text-xs focus:outline-none"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Task List Cards */}
      <div className="space-y-3">
        {filteredTasks.map((t) => (
          <div
            key={t.id}
            className="bg-[#101622] border border-[#233149] p-4 rounded-xl space-y-3 hover:border-slate-600 transition-all"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#233149] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400">{t.id}</span>
                <span className="text-slate-600">•</span>
                <span className="text-xs font-mono font-semibold text-cyan-400">{t.wellId}</span>
                <span className="text-slate-600">•</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                    t.priority === 'Critical' || t.priority === 'High'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  }`}
                >
                  {t.priority} Priority
                </span>
              </div>

              {/* Status Selector Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Status:</span>
                <select
                  value={t.status}
                  onChange={(e) =>
                    updateMaintenanceTaskStatus(t.id, e.target.value as MaintenanceTask['status'])
                  }
                  className="bg-[#151d2d] border border-[#233149] text-slate-200 rounded px-2 py-0.5 text-xs font-mono focus:outline-none font-semibold cursor-pointer"
                >
                  <option value="Awaiting review">Awaiting review</option>
                  <option value="Approved">Approved</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-100">{t.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-mono text-[11px]">
                Target: {t.equipment} • Assigned: <strong className="text-slate-200">{t.requiredRole}</strong> • Est: {t.estimatedHours} hrs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="bg-[#151d2d] p-2.5 rounded-lg border border-[#233149]">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">
                  Diagnostic Telemetry Evidence:
                </span>
                <span className="text-slate-300 text-[11px] leading-snug">{t.evidence}</span>
              </div>
              <div className="bg-[#151d2d] p-2.5 rounded-lg border border-[#233149]">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">
                  Required Spare Parts:
                </span>
                <span className="text-emerald-300 text-[11px] leading-snug">{t.requiredSpare}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#233149]/50 text-xs">
              <span className="text-[10px] font-mono text-slate-500">
                Created: {t.createdTimestamp.slice(0, 16).replace('T', ' ')} UTC
              </span>
              <button
                onClick={() => {
                  setSelectedWellId(t.wellId);
                  navigate('/field-digital-twin');
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
              >
                <span>Inspect in Digital Twin</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Work Order Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#151d2d] border border-[#233149] rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold font-mono text-slate-100 flex items-center gap-2 border-b border-[#233149] pb-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>Create Maintenance Work Order</span>
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Task Title:</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g., Ultrasonic rod inspection on BGW-05"
                  className="w-full bg-[#101622] border border-[#233149] rounded p-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Well:</label>
                  <select
                    value={newTaskWell}
                    onChange={(e) => setNewTaskWell(e.target.value)}
                    className="w-full bg-[#101622] border border-[#233149] rounded p-2 text-slate-100 focus:outline-none"
                  >
                    {wells.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.id}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Priority:</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full bg-[#101622] border border-[#233149] rounded p-2 text-slate-100 focus:outline-none"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Assigned Role:</label>
                  <select
                    value={newTaskRole}
                    onChange={(e) => setNewTaskRole(e.target.value as any)}
                    className="w-full bg-[#101622] border border-[#233149] rounded p-2 text-slate-100 focus:outline-none"
                  >
                    <option value="Artificial Lift Engineer">Artificial Lift Engineer</option>
                    <option value="Production Engineer">Production Engineer</option>
                    <option value="Reservoir Engineer">Reservoir Engineer</option>
                    <option value="Maintenance Planner">Maintenance Planner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Est. Duration (hrs):</label>
                  <input
                    type="number"
                    min="1"
                    max="48"
                    value={newTaskHours}
                    onChange={(e) => setNewTaskHours(Number(e.target.value))}
                    className="w-full bg-[#101622] border border-[#233149] rounded p-2 text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Required Spare Part:</label>
                <input
                  type="text"
                  value={newTaskSpare}
                  onChange={(e) => setNewTaskSpare(e.target.value)}
                  className="w-full bg-[#101622] border border-[#233149] rounded p-2 text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Telemetry Evidence:</label>
                <textarea
                  rows={2}
                  value={newTaskEvidence}
                  onChange={(e) => setNewTaskEvidence(e.target.value)}
                  className="w-full bg-[#101622] border border-[#233149] rounded p-2 text-slate-100 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#233149] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-[#101622] border border-[#233149] text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Create Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
