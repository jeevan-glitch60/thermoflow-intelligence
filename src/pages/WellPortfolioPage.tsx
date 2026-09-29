import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Search,
  Filter,
  ArrowUpDown,
  Flame,
  Activity,
  Droplets,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Sliders,
  FileText,
  Wrench,
  Radio,
} from 'lucide-react';
import { useFieldStore } from '../store/useFieldStore';
import { Well, WellPhase } from '../types';
import { ModelBadge } from '../components/common/ModelBadge';

export const WellPortfolioPage: React.FC = () => {
  const navigate = useNavigate();
  const { wells, selectedWellId, setSelectedWellId } = useFieldStore();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [phaseFilter, setPhaseFilter] = useState<WellPhase | 'All'>('All');
  const [healthFilter, setHealthFilter] = useState<'All' | 'Low' | 'Normal'>('All');
  const [sortField, setSortField] = useState<keyof Well>('priorityScore');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'css' | 'srp' | 'telemetry'>('overview');

  const selectedWell = wells.find((w) => w.id === selectedWellId) || wells[0];

  // Filtering and sorting logic
  const filteredWells = useMemo(() => {
    return wells
      .filter((w) => {
        const matchesSearch =
          w.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPhase = phaseFilter === 'All' || w.currentPhase === phaseFilter;
        const matchesHealth =
          healthFilter === 'All' ||
          (healthFilter === 'Low' && w.srpHealthScore < 85) ||
          (healthFilter === 'Normal' && w.srpHealthScore >= 85);
        return matchesSearch && matchesPhase && matchesHealth;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAsc ? valA - valB : valB - valA;
        }
        return sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
  }, [wells, searchQuery, phaseFilter, healthFilter, sortField, sortAsc]);

  const handleSort = (field: keyof Well) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#233149] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-mono tracking-tight">
              Well Portfolio & Operations
            </h1>
            <ModelBadge type="Illustrative model output" />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete surveillance, status monitoring, and optimization profiles across Baghewala assets.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <span>Active Wells:</span>
          <span className="font-bold text-amber-400">{filteredWells.length} of {wells.length}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#101622] border border-[#233149] p-3 rounded-xl flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search well by ID or field sector..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#151d2d] border border-[#233149] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Phase Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400">Phase:</span>
          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value as any)}
            className="bg-[#151d2d] border border-[#233149] text-slate-200 rounded px-2.5 py-1 text-xs focus:outline-none"
          >
            <option value="All">All Phases</option>
            <option value="Injection">Injection</option>
            <option value="Soak">Soak</option>
            <option value="Production">Production</option>
            <option value="Shut-in">Shut-in</option>
          </select>
        </div>

        {/* SRP Health Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400">SRP Health:</span>
          <select
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value as any)}
            className="bg-[#151d2d] border border-[#233149] text-slate-200 rounded px-2.5 py-1 text-xs focus:outline-none"
          >
            <option value="All">All Ranges</option>
            <option value="Low">Warning / Critical (&lt;85%)</option>
            <option value="Normal">Optimal (≥85%)</option>
          </select>
        </div>
      </div>

      {/* Main Well Portfolio Table */}
      <div className="bg-[#101622] border border-[#233149] rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#233149] bg-[#151d2d] text-slate-400 font-mono text-[11px] select-none">
                <th
                  onClick={() => handleSort('id')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>Well ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('currentPhase')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>Phase</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('cycleNumber')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>CSS Cycle</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('oilRate')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Oil (BOPD)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('waterCut')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Water Cut</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('viscosity')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Viscosity (cP)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('reservoirTemp')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Res Temp</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('srpHealthScore')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>SRP Health</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('energyIntensity')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Energy (GJ/bbl)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('priorityScore')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Priority</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Alerts</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#233149]/60 font-mono">
              {filteredWells.map((w) => {
                const isSelected = w.id === selectedWellId;
                return (
                  <tr
                    key={w.id}
                    onClick={() => setSelectedWellId(w.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-amber-500/10 text-slate-100'
                        : 'hover:bg-[#151d2d] text-slate-300'
                    }`}
                  >
                    <td className="py-3 px-3 font-bold text-amber-400">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            w.status === 'critical'
                              ? 'bg-rose-500 animate-ping'
                              : w.status === 'warning'
                              ? 'bg-amber-400'
                              : w.status === 'caution'
                              ? 'bg-yellow-400'
                              : w.status === 'optimal'
                              ? 'bg-emerald-400'
                              : 'bg-slate-500'
                          }`}
                        />
                        <span>{w.id}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          w.currentPhase === 'Injection'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : w.currentPhase === 'Soak'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : w.currentPhase === 'Production'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {w.currentPhase}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">#{w.cycleNumber}</td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-100">{w.oilRate}</td>
                    <td className="py-3 px-3 text-right text-cyan-400">{w.waterCut}%</td>
                    <td className="py-3 px-3 text-right text-amber-300">{w.viscosity.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-red-300">{w.reservoirTemp}°C</td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`font-bold ${
                          w.srpHealthScore < 70
                            ? 'text-rose-400'
                            : w.srpHealthScore < 85
                            ? 'text-yellow-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {w.srpHealthScore}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300">{w.energyIntensity}</td>
                    <td className="py-3 px-3 text-right font-bold text-amber-400">{w.priorityScore}</td>
                    <td className="py-3 px-3 text-center">
                      {w.alertCount > 0 ? (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                          {w.alertCount}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWellId(w.id);
                        }}
                        className="px-2 py-1 bg-[#1c273c] hover:bg-[#283854] text-slate-200 rounded text-[11px] font-sans"
                      >
                        Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Well Detailed Profile Card */}
      <div className="bg-[#101622] border border-[#233149] rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#233149] pb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold font-mono text-slate-100 flex items-center gap-2">
              <span className="text-amber-400">{selectedWell.id}</span>
              <span className="text-slate-400 text-sm font-normal">({selectedWell.name})</span>
            </h2>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-[#151d2d] text-slate-300 border border-[#233149]">
              Depth: {selectedWell.coordinates.depthMeters} m
            </span>
          </div>

          {/* Profile Navigation Tabs */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => navigate('/css-optimizer')}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#151d2d] hover:bg-[#1c273c] border border-[#233149] text-amber-300"
            >
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Optimize CSS</span>
            </button>
            <button
              onClick={() => navigate('/srp-optimizer')}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#151d2d] hover:bg-[#1c273c] border border-[#233149] text-cyan-300"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Optimize SRP</span>
            </button>
            <button
              onClick={() => navigate('/field-digital-twin')}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300"
            >
              <span>View Twin</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Profile Content Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#151d2d] p-3.5 rounded-lg border border-[#233149] space-y-2 text-xs">
            <div className="font-semibold text-amber-400 font-mono">RESERVOIR & THERMAL PROFILE</div>
            <div className="flex justify-between py-1 border-b border-[#233149]">
              <span className="text-slate-400">Current Temperature:</span>
              <span className="font-mono text-slate-100">{selectedWell.reservoirTemp}°C</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#233149]">
              <span className="text-slate-400">Dynamic Viscosity:</span>
              <span className="font-mono text-amber-300">{selectedWell.viscosity.toLocaleString()} cP</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#233149]">
              <span className="text-slate-400">Pore Pressure:</span>
              <span className="font-mono text-slate-100">{selectedWell.reservoirPressure} bar</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Steam Response Score:</span>
              <span className="font-mono text-emerald-400">{selectedWell.steamResponseScore}%</span>
            </div>
          </div>

          <div className="bg-[#151d2d] p-3.5 rounded-lg border border-[#233149] space-y-2 text-xs">
            <div className="font-semibold text-cyan-400 font-mono">SRP ARTIFICIAL LIFT PROFILE</div>
            <div className="flex justify-between py-1 border-b border-[#233149]">
              <span className="text-slate-400">Stroke Length:</span>
              <span className="font-mono text-slate-100">{selectedWell.srpParams.strokeLengthInches} in</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#233149]">
              <span className="text-slate-400">Pumping Speed:</span>
              <span className="font-mono text-slate-100">{selectedWell.srpParams.strokesPerMinute} SPM</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#233149]">
              <span className="text-slate-400">Surface Rod Load:</span>
              <span
                className={`font-mono ${
                  selectedWell.srpParams.surfaceRodLoadKn > 65 ? 'text-rose-400 font-bold' : 'text-slate-100'
                }`}
              >
                {selectedWell.srpParams.surfaceRodLoadKn} kN
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Pump Efficiency:</span>
              <span className="font-mono text-emerald-400">{selectedWell.srpParams.pumpEfficiencyPct}%</span>
            </div>
          </div>

          <div className="bg-[#151d2d] p-3.5 rounded-lg border border-[#233149] space-y-2 text-xs">
            <div className="font-semibold text-emerald-400 font-mono">OPTIMIZATION RATIONALE</div>
            <p className="text-slate-300 leading-relaxed">{selectedWell.priorityReason}</p>
            <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between font-mono border-t border-[#233149]">
              <span>Priority Score: {selectedWell.priorityScore} / 100</span>
              <span className="text-amber-400">{selectedWell.currentPhase} stage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
