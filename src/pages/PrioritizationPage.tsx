import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SortDesc,
  Sparkles,
  Flame,
  Activity,
  Droplets,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useFieldStore } from '../store/useFieldStore';
import { ModelBadge } from '../components/common/ModelBadge';
import { calculateWellPriority } from '../services/simulationEngine';

export const PrioritizationPage: React.FC = () => {
  const navigate = useNavigate();
  const { wells, selectedWellId, setSelectedWellId } = useFieldStore();

  // Compute transparent rankings
  const rankedWells = [...wells]
    .map((w) => {
      const prio = calculateWellPriority(w);
      return {
        ...w,
        computedScore: prio.score,
        details: prio,
      };
    })
    .sort((a, b) => b.computedScore - a.computedScore);

  // Specialized focus lists
  const highestProdOpportunity = [...wells].sort((a, b) => {
    const oppA = a.currentPhase === 'Soak' ? 100 : a.oilRate < 40 ? 80 : 30;
    const oppB = b.currentPhase === 'Soak' ? 100 : b.oilRate < 40 ? 80 : 30;
    return oppB - oppA;
  })[0];

  const highestThermalOpp = [...wells].sort((a, b) => b.viscosity - a.viscosity)[0];
  const highestSrpUrgency = [...wells].sort((a, b) => a.srpHealthScore - b.srpHealthScore)[0];
  const highestEnergyIneff = [...wells].sort((a, b) => b.energyIntensity - a.energyIntensity)[0];

  return (
    <div className="space-y-6">
      {/* Title & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#233149] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <SortDesc className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-mono tracking-tight">
              Well Prioritization Engine
            </h1>
            <ModelBadge type="Illustrative model output" />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Explainable multi-criteria ranking based on production loss risk, thermal potential, pump fatigue, and energy intensity.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-[#101622] px-3 py-1.5 rounded-lg border border-[#233149]">
          Scoring Scale: <strong className="text-amber-400">0 (Low) to 100 (Urgent)</strong>
        </div>
      </div>

      {/* Specialized Focus Quadrants */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Highest Production Opportunity */}
        <div
          onClick={() => {
            setSelectedWellId(highestProdOpportunity.id);
            navigate('/css-optimizer');
          }}
          className="bg-[#101622] border border-[#233149] hover:border-amber-500/50 p-3.5 rounded-md cursor-pointer transition-all space-y-1 shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-amber-400">Production Opportunity</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold font-mono text-slate-100">
            {highestProdOpportunity.id}
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-2">
            In soak phase; ready for post-thermal draw down lift (+28 BOPD uplift).
          </p>
        </div>

        {/* Highest Thermal Optimization */}
        <div
          onClick={() => {
            setSelectedWellId(highestThermalOpp.id);
            navigate('/field-digital-twin');
          }}
          className="bg-[#101622] border border-[#233149] hover:border-orange-500/50 p-3.5 rounded-md cursor-pointer transition-all space-y-1 shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-orange-400">Thermal Viscosity Target</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-lg font-bold font-mono text-slate-100">
            {highestThermalOpp.id}
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-2">
            Viscosity {highestThermalOpp.viscosity.toLocaleString()} cP; highest potential mobility gain.
          </p>
        </div>

        {/* Highest SRP Maintenance Urgency */}
        <div
          onClick={() => {
            setSelectedWellId(highestSrpUrgency.id);
            navigate('/srp-optimizer');
          }}
          className="bg-[#101622] border border-[#233149] hover:border-rose-500/50 p-3.5 rounded-md cursor-pointer transition-all space-y-1 shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-rose-400">SRP Maintenance Urgency</span>
            <Activity className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-lg font-bold font-mono text-rose-300">
            {highestSrpUrgency.id} ({highestSrpUrgency.srpHealthScore}%)
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-2">
            Peak rod load reaching 78.5 kN; structural fatigue threat.
          </p>
        </div>

        {/* Highest Energy Inefficiency */}
        <div
          onClick={() => {
            setSelectedWellId(highestEnergyIneff.id);
            navigate('/energy-steam');
          }}
          className="bg-[#101622] border border-[#233149] hover:border-amber-500/50 p-3.5 rounded-md cursor-pointer transition-all space-y-1 shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-amber-300">Energy Intensity Peak</span>
            <Zap className="w-4 h-4 text-amber-300" />
          </div>
          <div className="text-lg font-bold font-mono text-amber-300">
            {highestEnergyIneff.id} ({highestEnergyIneff.energyIntensity} GJ/bbl)
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-2">
            Early steam injection with elevated thermal boundary heat loss.
          </p>
        </div>
      </div>

      {/* Main Ranked Well Prioritization List */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold font-mono text-slate-100 flex items-center justify-between">
          <span>Ranked Priority Action Queue</span>
          <span className="text-xs text-slate-400 font-normal">8 Asset Units Analyzed</span>
        </h2>

        {rankedWells.map((rw, index) => {
          const isSelected = rw.id === selectedWellId;
          const isCritical = rw.status === 'critical';
          const isWarning = rw.status === 'warning';

          const tintClasses = isCritical
            ? 'bg-rose-500/10 border-rose-500/30'
            : isWarning
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-[#101622] border-[#233149]';

          return (
            <div
              key={rw.id}
              onClick={() => setSelectedWellId(rw.id)}
              className={`p-4 rounded-md border transition-all cursor-pointer shadow-sm ${tintClasses} ${
                isSelected
                  ? 'ring-1 ring-amber-400 border-amber-400 shadow-md'
                  : 'hover:border-slate-500'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Rank & Header */}
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded font-mono font-extrabold flex items-center justify-center text-sm shrink-0 ${
                      index === 0
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : index === 1
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-[#151d2d] text-slate-300 border border-[#233149]'
                    }`}
                  >
                    #{index + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base font-mono text-slate-100">{rw.id}</span>
                      <span className="text-xs text-slate-400">({rw.name})</span>
                      <span
                        className={`px-2 py-0.2 rounded text-[10px] font-mono font-semibold ${
                          rw.currentPhase === 'Injection'
                            ? 'bg-rose-500/20 text-rose-300'
                            : rw.currentPhase === 'Soak'
                            ? 'bg-amber-500/20 text-amber-300'
                            : rw.currentPhase === 'Production'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {rw.currentPhase}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 font-medium leading-relaxed">
                      {rw.details.primaryIssue}
                    </p>
                  </div>
                </div>

                {/* Right: Scores & Actions */}
                <div className="flex flex-wrap items-center gap-6 text-xs font-mono">
                  <div>
                    <div className="text-[10px] text-slate-400">Priority Score</div>
                    <div className="text-lg font-bold text-amber-400">
                      {rw.computedScore} <span className="text-xs text-slate-500">/ 100</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-400">Current Lift Rate</div>
                    <div className="text-sm font-semibold text-slate-200">{rw.oilRate} BOPD</div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-400">Viscosity</div>
                    <div className="text-sm font-semibold text-amber-300">
                      {rw.viscosity.toLocaleString()} cP
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-400">SRP Health</div>
                    <div
                      className={`text-sm font-semibold ${
                        rw.srpHealthScore < 70 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {rw.srpHealthScore}%
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWellId(rw.id);
                        navigate('/field-digital-twin');
                      }}
                      className="px-2.5 py-1 bg-[#151d2d] hover:bg-[#1c273c] border border-[#233149] rounded text-[11px] font-sans text-slate-200 transition-colors"
                    >
                      Inspect Twin
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWellId(rw.id);
                        navigate(rw.currentPhase === 'Soak' || rw.currentPhase === 'Injection' ? '/css-optimizer' : '/srp-optimizer');
                      }}
                      className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded text-[11px] font-sans text-amber-300 transition-colors"
                    >
                      Optimize
                    </button>
                  </div>
                </div>
              </div>

              {/* Collapsed Details Strip */}
              <div className="mt-3 pt-2.5 border-t border-[#233149]/60 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono text-[11px]">Recommended Action:</span>
                  <span className="text-cyan-300 text-[11px]">{rw.details.recommendedAction}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono text-[11px]">Expected Benefit:</span>
                  <span className="text-emerald-300 text-[11px]">{rw.details.expectedBenefit}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
