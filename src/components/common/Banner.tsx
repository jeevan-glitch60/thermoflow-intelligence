import React from 'react';
import { AlertTriangle, ShieldCheck, DatabaseZap } from 'lucide-react';

export const Banner: React.FC = () => {
  return (
    <div className="bg-amber-950/80 border-b border-amber-500/30 text-amber-200 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 shadow-inner">
      <div className="flex items-center gap-2 font-mono font-medium tracking-wide">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
        <span className="font-semibold text-amber-300">DEMONSTRATOR MODE</span>
        <span className="text-amber-400/60">—</span>
        <span>SYNTHETIC FIELD DATA</span>
        <span className="text-amber-400/60">—</span>
        <span>READ-ONLY DECISION SUPPORT</span>
        <span className="text-amber-400/60">—</span>
        <span className="text-amber-300/90">NOT CONNECTED TO LIVE OIL-FIELD SYSTEMS</span>
      </div>

      <div className="flex items-center gap-3 text-[11px] text-amber-300/70">
        <span className="flex items-center gap-1">
          <DatabaseZap className="w-3 h-3 text-cyan-400" />
          <span>Simulated SCADA Engine (3s Tick)</span>
        </span>
        <span className="hidden sm:inline text-amber-400/40">|</span>
        <span className="hidden sm:flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Baghewala Field Synthetic Model</span>
        </span>
      </div>
    </div>
  );
};
