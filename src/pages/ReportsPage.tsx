import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { useFieldStore } from '../store/useFieldStore';
import { ModelBadge } from '../components/common/ModelBadge';

export const ReportsPage: React.FC = () => {
  const { wells, selectedWellId, setSelectedWellId, alerts, maintenanceTasks } = useFieldStore();
  const selectedWell = wells.find((w) => w.id === selectedWellId) || wells[0];

  const reportTemplates = [
    { id: 'css_cycle', name: 'CSS Cycle Performance Report', desc: 'Detailed thermal stimulation, soak diffusion, and SOR evaluation' },
    { id: 'daily_prod', name: 'Daily Production Summary', desc: 'Net oil, gross liquid, water cut, and wellhead metrics' },
    { id: 'srp_health', name: 'SRP Artificial Lift Health Report', desc: 'Dynamometer envelope, rod stress, and motor efficiency' },
    { id: 'well_prio', name: 'Well Prioritization Report', desc: 'Ranking matrix, operational urgency, and simulated uplift' },
    { id: 'steam_energy', name: 'Steam & Energy Efficiency Report', desc: 'Boiler feedwater, fuel burn, and specific energy per barrel' },
    { id: 'maintenance', name: 'Maintenance Work Order Plan', desc: 'Outstanding inspection backlog, spare parts, and scheduled downtime' },
  ];

  const [activeTemplate, setActiveTemplate] = useState<string>('css_cycle');
  const [reportDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const reportData = {
      reportType: activeTemplate,
      generationDate: new Date().toISOString(),
      field: 'Baghewala Field, Rajasthan',
      operator: 'Oil India Limited (Synthetic Prototype)',
      well: selectedWell,
      activeAlerts: alerts.filter((a) => a.wellId === selectedWell.id),
      scheduledTasks: maintenanceTasks.filter((m) => m.wellId === selectedWell.id),
      disclaimer: 'DEMONSTRATOR MODE — SYNTHETIC FIELD DATA — READ-ONLY DECISION SUPPORT',
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${selectedWell.id}_${activeTemplate}_Report.json`);
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
            <FileText className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-mono tracking-tight">
              Reports & Export Centre
            </h1>
            <ModelBadge type="Illustrative model output" />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Generate engineering-grade synthesis reports, export tabular datasets, and print compliance summaries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#151d2d] hover:bg-[#1c273c] border border-[#233149] rounded-lg text-xs font-semibold text-slate-200 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report (PDF)</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Template Selector & Well Picker */}
      <div className="bg-[#101622] border border-[#233149] p-3 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Template:</span>
          <select
            value={activeTemplate}
            onChange={(e) => setActiveTemplate(e.target.value)}
            className="bg-[#151d2d] border border-[#233149] text-amber-400 font-mono rounded px-2.5 py-1 text-xs focus:outline-none"
          >
            {reportTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Well Focus:</span>
          <select
            value={selectedWell.id}
            onChange={(e) => setSelectedWellId(e.target.value)}
            className="bg-[#151d2d] border border-[#233149] text-slate-100 rounded px-2.5 py-1 text-xs"
          >
            {wells.map((w) => (
              <option key={w.id} value={w.id}>
                {w.id} ({w.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Printable Report Preview Document */}
      <div className="bg-[#101622] border border-[#233149] rounded-xl p-6 sm:p-8 space-y-6 max-w-4xl mx-auto shadow-2xl print:bg-white print:text-black print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="border-b-2 border-amber-500/40 pb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase font-mono tracking-widest text-amber-400">
              OIL INDIA LIMITED • HEAVY OIL ASSET (RAJASTHAN)
            </div>
            <h2 className="text-2xl font-extrabold font-mono text-slate-100 mt-1">
              CSS Cycle Performance & Lift Report
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Target Well: <strong className="text-amber-300">{selectedWell.id}</strong> ({selectedWell.name}) • Cycle #{selectedWell.cycleNumber}
            </p>
          </div>

          <div className="text-right text-xs font-mono text-slate-400 space-y-0.5">
            <div>Date: {reportDate}</div>
            <div>Ref: OIL-CSS-{selectedWell.id}-C{selectedWell.cycleNumber}</div>
            <div className="text-[10px] text-emerald-400">Status: Engineering Verified</div>
          </div>
        </div>

        {/* Mandatory Prototype Disclaimer inside Report */}
        <div className="p-3 bg-[#151d2d] border border-amber-500/30 rounded-lg text-xs font-mono text-amber-300/90 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            SYNTHETIC DEMONSTRATOR REPORT — GENERATED FOR DECISION SUPPORT TESTING ONLY.
          </span>
        </div>

        {/* Executive Summary Narrative */}
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed font-sans">
          <h3 className="font-bold font-mono text-sm text-slate-100 uppercase">1. Executive Summary</h3>
          <p>
            Well <strong className="text-amber-400">{selectedWell.id}</strong> is currently in the{' '}
            <strong className="text-amber-300">{selectedWell.currentPhase} phase</strong> of CSS Cycle #{selectedWell.cycleNumber}.
            Thermal slug injection of {selectedWell.cssParams.steamVolumeTonnes} tonnes of 78% quality steam at {selectedWell.cssParams.injectionPressureBar} bar
            has reduced estimated downhole crude viscosity from virgin 18,500 cP to{' '}
            <strong className="text-emerald-400">{selectedWell.viscosity.toLocaleString()} cP</strong>.
          </p>
        </div>

        {/* Key Operational KPIs Table */}
        <div className="space-y-2">
          <h3 className="font-bold font-mono text-sm text-slate-100 uppercase">2. Key Reservoir & Lift Parameters</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-[#151d2d] p-3 rounded-lg border border-[#233149]">
              <div className="text-slate-400 text-[10px]">Reservoir Temp</div>
              <div className="text-base font-bold text-red-400 mt-1">{selectedWell.reservoirTemp}°C</div>
            </div>
            <div className="bg-[#151d2d] p-3 rounded-lg border border-[#233149]">
              <div className="text-slate-400 text-[10px]">Crude Viscosity</div>
              <div className="text-base font-bold text-amber-300 mt-1">{selectedWell.viscosity.toLocaleString()} cP</div>
            </div>
            <div className="bg-[#151d2d] p-3 rounded-lg border border-[#233149]">
              <div className="text-slate-400 text-[10px]">Net Oil Lift</div>
              <div className="text-base font-bold text-emerald-400 mt-1">{selectedWell.oilRate} BOPD</div>
            </div>
            <div className="bg-[#151d2d] p-3 rounded-lg border border-[#233149]">
              <div className="text-slate-400 text-[10px]">SRP Health</div>
              <div className="text-base font-bold text-slate-100 mt-1">{selectedWell.srpHealthScore}%</div>
            </div>
          </div>
        </div>

        {/* Parameter Optimization Recommendations Table */}
        <div className="space-y-2">
          <h3 className="font-bold font-mono text-sm text-slate-100 uppercase">3. Recommended Operating Adjustments</h3>
          <div className="border border-[#233149] rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#151d2d] text-slate-400 text-[11px] border-b border-[#233149]">
                <tr>
                  <th className="p-2.5">Parameter</th>
                  <th className="p-2.5 text-right">Current Setting</th>
                  <th className="p-2.5 text-right">Target Setpoint</th>
                  <th className="p-2.5">Engineering Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#233149]/60">
                <tr>
                  <td className="p-2.5 font-bold text-slate-200">Steam Slug Mass</td>
                  <td className="p-2.5 text-right text-slate-400">{selectedWell.cssParams.steamVolumeTonnes} t</td>
                  <td className="p-2.5 text-right text-amber-400 font-bold">460 t</td>
                  <td className="p-2.5 text-slate-300 font-sans text-[11px]">Expands heated matrix radius by +3.8m</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-200">Soak Period</td>
                  <td className="p-2.5 text-right text-slate-400">{selectedWell.cssParams.soakTimeHours} hrs</td>
                  <td className="p-2.5 text-right text-amber-400 font-bold">42 hrs</td>
                  <td className="p-2.5 text-slate-300 font-sans text-[11px]">Enables deep conductive heat diffusion into cold matrix block</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-200">SRP Pumping Speed</td>
                  <td className="p-2.5 text-right text-slate-400">{selectedWell.srpParams.strokesPerMinute} SPM</td>
                  <td className="p-2.5 text-right text-cyan-400 font-bold">6.5 SPM</td>
                  <td className="p-2.5 text-slate-300 font-sans text-[11px]">Maintains 88% pump fillage while mitigating cyclic rod fatigue</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Signatures & Quality Stamp */}
        <div className="pt-6 border-t border-[#233149] grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div>
            <div className="text-slate-500 text-[10px]">PREPARED BY</div>
            <div className="text-slate-300 font-semibold mt-1">ThermoFlow Automated Twin</div>
            <div className="text-[10px] text-slate-500">Algorithm v2.4.1</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px]">REVIEWED BY</div>
            <div className="text-slate-300 font-semibold mt-1">Reservoir & Production Eng.</div>
            <div className="text-[10px] text-slate-500">Synthetic Sign-off</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px]">CONFIDENCE SCORE</div>
            <div className="text-emerald-400 font-bold mt-1">89.2%</div>
            <div className="text-[10px] text-slate-500">Model Convergence: PASS</div>
          </div>
        </div>
      </div>
    </div>
  );
};
