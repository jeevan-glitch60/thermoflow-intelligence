import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Radio,
  Play,
  Pause,
  AlertOctagon,
  Sparkles,
  UserCheck,
  MapPin,
  Clock,
  Layers,
  Sun,
  Moon,
  Settings,
} from 'lucide-react';
import { useFieldStore } from '../../store/useFieldStore';
import { UserRole } from '../../types';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const {
    wells,
    selectedWellId,
    setSelectedWellId,
    currentUserRole,
    setUserRole,
    isTelemetryPaused,
    setTelemetryPaused,
    loadDemoScenario,
    alerts,
    theme,
    toggleTheme,
  } = useFieldStore();

  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const selectedWell = wells.find((w) => w.id === selectedWellId) || wells[0];
  const criticalAlertsCount = alerts.filter(
    (a) => a.severity === 'Critical' && a.status === 'Active'
  ).length;

  const roles: UserRole[] = [
    'Administrator',
    'Production Engineer',
    'Reservoir Engineer',
    'Artificial Lift Engineer',
    'Maintenance Planner',
    'Viewer',
  ];

  return (
    <header className="bg-[#101622] border-b border-[#233149] px-4 py-2.5 flex items-center justify-between gap-4 sticky top-0 z-40 select-none">
      {/* Brand & Context */}
      <div className="flex items-center gap-3 shrink-0">
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-950/40">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-wider text-slate-100 font-mono">
                THERMOFLOW
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Twin
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <span>Oil India Limited</span>
              <span>•</span>
              <span className="text-sandstone-300 text-amber-200/80">Baghewala Asset</span>
            </div>
          </div>
        </div>

        {/* Field Selector */}
        <div className="hidden lg:flex items-center gap-1.5 ml-3 pl-3 border-l border-[#233149] text-xs text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-medium">Baghewala Field</span>
          <span className="text-[10px] text-slate-500">(Heavy Crude Sandstone)</span>
        </div>
      </div>

      {/* Center Controls: Well Selector & Quick Demo Load */}
      <div className="flex items-center gap-2.5">
        {/* Global Well Selector */}
        <div className="flex items-center bg-[#151d2d] border border-[#233149] rounded-md px-2.5 py-1 text-xs">
          <Layers className="w-3.5 h-3.5 text-cyan-400 mr-2 shrink-0" />
          <span className="text-slate-400 mr-2 text-[11px] hidden sm:inline">Active Well:</span>
          <select
            value={selectedWellId}
            onChange={(e) => setSelectedWellId(e.target.value)}
            className="bg-transparent text-slate-100 font-mono font-medium focus:outline-none cursor-pointer"
          >
            {wells.map((w) => (
              <option key={w.id} value={w.id} className="bg-[#151d2d] text-slate-200">
                {w.id} — {w.name} ({w.currentPhase})
              </option>
            ))}
          </select>
          <span
            className={`ml-2 w-2 h-2 rounded-full shrink-0 ${
              selectedWell.status === 'critical'
                ? 'bg-rose-500 animate-ping'
                : selectedWell.status === 'warning'
                ? 'bg-amber-400'
                : selectedWell.status === 'caution'
                ? 'bg-yellow-400'
                : selectedWell.status === 'optimal'
                ? 'bg-emerald-400'
                : 'bg-slate-500'
            }`}
            title={`Status: ${selectedWell.status}`}
          />
        </div>

        {/* Load Demo Scenario button */}
        <button
          onClick={loadDemoScenario}
          className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-600/30 to-orange-600/30 hover:from-amber-600/50 hover:to-orange-600/50 border border-amber-500/40 text-amber-300 rounded text-xs font-medium transition-all shadow-sm active:scale-95"
          title="Reset & Load predefined BGW-03 CSS Soak & SRP Optimization scenario"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Load Demo Scenario</span>
          <span className="md:hidden">Demo</span>
        </button>
      </div>

      {/* Right Controls: Telemetry, Clock, Roles, Alerts */}
      <div className="flex items-center gap-3">
        {/* Telemetry Stream Toggle */}
        <button
          onClick={() => setTelemetryPaused(!isTelemetryPaused)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono border transition-all ${
            isTelemetryPaused
              ? 'bg-rose-950/40 text-rose-300 border-rose-500/40 hover:bg-rose-900/50'
              : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/50'
          }`}
          title={isTelemetryPaused ? 'Resume simulated telemetry' : 'Pause simulated telemetry'}
        >
          <Radio
            className={`w-3 h-3 ${isTelemetryPaused ? 'text-rose-400' : 'text-emerald-400 animate-pulse'}`}
          />
          <span className="hidden sm:inline">{isTelemetryPaused ? 'PAUSED' : 'LIVE SCADA'}</span>
          {isTelemetryPaused ? <Play className="w-2.5 h-2.5" /> : <Pause className="w-2.5 h-2.5" />}
        </button>

        {/* UTC Clock */}
        <div className="hidden xl:flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-[#151d2d] px-2 py-1 rounded border border-[#233149]">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>{utcTime}</span>
        </div>

        {/* Role Selector */}
        <div className="flex items-center bg-[#151d2d] border border-[#233149] rounded px-2 py-1 text-xs">
          <UserCheck className="w-3 h-3 text-amber-400 mr-1.5 hidden sm:inline" />
          <select
            value={currentUserRole}
            onChange={(e) => setUserRole(e.target.value as UserRole)}
            className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer"
          >
            {roles.map((r) => (
              <option key={r} value={r} className="bg-[#151d2d] text-slate-200">
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded border transition-all text-slate-300 hover:text-slate-100 hover:bg-[#1c273c] border-[#233149] bg-[#151d2d] flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* Settings Navigation Shortcut */}
        <button
          onClick={() => navigate('/settings')}
          className="p-1.5 rounded border transition-all text-slate-400 hover:text-slate-100 hover:bg-[#1c273c] border-[#233149] bg-[#151d2d] flex items-center justify-center cursor-pointer shadow-sm"
          title="System & Simulation Settings"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Critical Alerts Badge */}
        <button
          onClick={() => navigate('/alerts')}
          className={`relative p-1.5 rounded transition-colors ${
            criticalAlertsCount > 0
              ? 'bg-rose-950/50 text-rose-400 hover:bg-rose-900/50 border border-rose-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1c273c]'
          }`}
          title={`${criticalAlertsCount} critical active alert(s)`}
        >
          <AlertOctagon className="w-4 h-4" />
          {criticalAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center animate-bounce">
              {criticalAlertsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
