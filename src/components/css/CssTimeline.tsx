import React from 'react';
import {
  Flame,
  Hourglass,
  Activity,
  CheckCircle2,
  TrendingUp,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Well, WellPhase } from '../../types';

interface CssTimelineProps {
  well: Well;
  onPhaseChange?: (newPhase: WellPhase) => void;
}

export const CssTimeline: React.FC<CssTimelineProps> = ({ well }) => {
  const stages = [
    { id: 'pre', label: '1. Pre-Injection', desc: 'Wellbore cleanout & pressure baseline' },
    { id: 'inj', label: '2. Steam Injection', desc: 'High-enthalpy saturated steam slug' },
    { id: 'soak', label: '3. Soak Phase', desc: 'Conductive matrix heat diffusion' },
    { id: 'prod', label: '4. Production Lift', desc: 'Viscosity-reduced heavy oil recovery' },
    { id: 'eval', label: '5. Evaluation', desc: 'SOR, water cut & thermal decay' },
    { id: 'next', label: '6. Next-Cycle Prep', desc: 'Economic cut-off & cycle optimization' },
  ];

  const getStageIndex = (phase: WellPhase): number => {
    switch (phase) {
      case 'Injection':
        return 1;
      case 'Soak':
        return 2;
      case 'Production':
        return 3;
      case 'Shut-in':
      case 'Maintenance':
        return 0;
      default:
        return 1;
    }
  };

  const currentIndex = getStageIndex(well.currentPhase);
  const progressPct =
    well.phaseTotalHours > 0
      ? Math.min(100, Math.round((well.phaseElapsedHours / well.phaseTotalHours) * 100))
      : 50;

  return (
    <div className="bg-[#101622] border border-[#233149] rounded-xl p-4">
      {/* Title & Stage Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>CSS Cycle #{well.cycleNumber} Lifecycle Progression</span>
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Current Phase: <strong className="text-amber-400">{well.currentPhase.toUpperCase()}</strong>{' '}
            ({well.phaseElapsedHours} hrs of {well.phaseTotalHours} hrs target)
          </p>
        </div>

        {/* Progress bar container */}
        <div className="w-48 bg-[#151d2d] rounded-full h-3 border border-[#233149] p-0.5">
          <div
            className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* 6-Stage Timeline Stepper */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {stages.map((st, idx) => {
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div
              key={st.id}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                isCurrent
                  ? 'bg-amber-500/15 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                  : isPassed
                  ? 'bg-[#151d2d] border-[#233149] text-slate-300'
                  : 'bg-[#101622] border-[#1c273c] text-slate-500 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span
                  className={`font-semibold font-mono ${
                    isCurrent ? 'text-amber-300' : isPassed ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  {st.label}
                </span>
                {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                {isCurrent && <Hourglass className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />}
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-2">{st.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
