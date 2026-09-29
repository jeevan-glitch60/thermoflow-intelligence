import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { INDUSTRIAL_EASE } from './AnimationWrapper';
import {
  LayoutDashboard,
  Box,
  Layers,
  Flame,
  Activity,
  Radio,
  Sliders,
  SortDesc,
  AlertTriangle,
  Zap,
  Wrench,
  BarChart3,
  FileText,
  ShieldCheck,
  Settings,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';
import { useFieldStore } from '../../store/useFieldStore';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  category?: string;
}

export const Sidebar: React.FC = () => {
  const { wells, selectedWellId, alerts } = useFieldStore();
  const selectedWell = wells.find((w) => w.id === selectedWellId) || wells[0];
  const activeAlertCount = alerts.filter((a) => a.status === 'Active').length;

  const navItems: NavItem[] = [
    { to: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
    { to: '/field-digital-twin', label: 'Field Digital Twin', icon: Box, badge: '2.5D' },
    { to: '/wells', label: 'Well Portfolio', icon: Layers },
    { to: '/css-optimizer', label: 'CSS Optimizer', icon: Flame, badge: 'Thermal' },
    { to: '/srp-optimizer', label: 'SRP Optimizer', icon: Activity, badge: 'Lift' },
    { to: '/telemetry', label: 'Live Telemetry', icon: Radio },
    { to: '/simulation', label: 'What-If Simulation', icon: Sliders },
    { to: '/prioritization', label: 'Well Prioritization', icon: SortDesc },
    {
      to: '/alerts',
      label: 'Alerts & Incidents',
      icon: AlertTriangle,
      badge: activeAlertCount > 0 ? `${activeAlertCount}` : undefined,
    },
    { to: '/energy-steam', label: 'Energy & Steam', icon: Zap },
    { to: '/maintenance', label: 'Maintenance Planner', icon: Wrench },
    { to: '/analytics', label: 'Field Analytics', icon: BarChart3 },
    { to: '/reports', label: 'Reports & Export', icon: FileText },
    { to: '/security', label: 'Security & Audit', icon: ShieldCheck },
    { to: '/settings', label: 'Simulation Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#101622] border-r border-[#233149] flex flex-col justify-between shrink-0 select-none overflow-y-auto">
      {/* Navigation Links */}
      <div className="py-3 px-2 space-y-0.5">
        <div className="px-3 pb-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
          Digital Twin Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors group ${
                  isActive
                    ? 'text-amber-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[#151d2d]/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActiveBackground"
                      className="absolute inset-0 bg-amber-500/15 border border-amber-500/30 rounded-md -z-10 shadow-sm"
                      transition={{ type: 'tween', ease: INDUSTRIAL_EASE, duration: 0.22 }}
                    />
                  )}
                  {isActive && (
                    <motion.span
                      layoutId="sidebarActiveBar"
                      className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-amber-400 rounded-r-full"
                      transition={{ type: 'tween', ease: INDUSTRIAL_EASE, duration: 0.22 }}
                    />
                  )}
                  <div className="flex items-center gap-2.5 min-w-0 transition-transform group-hover:translate-x-0.5 duration-150">
                    <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold flex items-center gap-1 ${
                        item.badge === `${activeAlertCount}`
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                          : 'bg-[#1c273c] text-slate-300 border border-[#233149]'
                      }`}
                    >
                      {item.badge === `${activeAlertCount}` && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      )}
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Selected Well Mini-Status Footer */}
      <div className="p-3 m-2 bg-[#151d2d] border border-[#233149] rounded-lg">
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <span className="text-amber-400 font-semibold">{selectedWell.id}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1c273c] text-slate-300 border border-[#233149]">
            {selectedWell.currentPhase}
          </span>
        </div>
        <div className="space-y-1.5 text-[11px]">
          <div className="flex justify-between text-slate-400">
            <span>Oil Rate:</span>
            <span className="text-slate-200 font-mono font-medium">{selectedWell.oilRate} BOPD</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Viscosity:</span>
            <span className="text-amber-300 font-mono font-medium">{selectedWell.viscosity.toLocaleString()} cP</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>SRP Health:</span>
            <span
              className={`font-mono font-medium ${
                selectedWell.srpHealthScore < 70
                  ? 'text-rose-400'
                  : selectedWell.srpHealthScore < 85
                  ? 'text-yellow-400'
                  : 'text-emerald-400'
              }`}
            >
              {selectedWell.srpHealthScore}%
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Cycle:</span>
            <span className="text-slate-200 font-mono">#{selectedWell.cycleNumber}</span>
          </div>
        </div>
        <NavLink
          to={`/wells`}
          className="mt-2.5 flex items-center justify-center gap-1 w-full py-1 text-[11px] text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded transition-colors"
        >
          <span>View Well Profile</span>
          <ChevronRight className="w-3 h-3" />
        </NavLink>
      </div>
    </aside>
  );
};
