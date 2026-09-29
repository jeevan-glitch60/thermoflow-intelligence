import { create } from 'zustand';
import {
  Well,
  UserRole,
  Alert,
  MaintenanceTask,
  AuditLogEntry,
  CssParameters,
  SrpParameters,
  SrpFaultType,
  TelemetryPoint,
} from '../types';
import {
  INITIAL_WELLS,
  INITIAL_ALERTS,
  INITIAL_MAINTENANCE_TASKS,
  INITIAL_AUDIT_LOGS,
  generateHistoricalTelemetry,
} from '../services/seedData';
import {
  calculateThermalResponse,
  estimateOilProduction,
  calculateWellPriority,
} from '../services/simulationEngine';

interface FieldStoreState {
  // Global states
  theme: 'dark' | 'light';
  selectedWellId: string;
  currentUserRole: UserRole;
  isTelemetryPaused: boolean;
  telemetryIntervalMs: number;
  lastTelemetryTick: string;
  dataQualityScore: number;
  modelConfidenceScore: number;

  // Domain collections
  wells: Well[];
  alerts: Alert[];
  maintenanceTasks: MaintenanceTask[];
  auditLogs: AuditLogEntry[];
  historicalTelemetry: Record<string, TelemetryPoint[]>;

  // Selection & helper getters
  getSelectedWell: () => Well;
  getWellById: (id: string) => Well | undefined;

  // Actions
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setSelectedWellId: (id: string) => void;
  setUserRole: (role: UserRole) => void;
  setTelemetryPaused: (paused: boolean) => void;
  setTelemetryIntervalMs: (interval: number) => void;

  updateCssParams: (wellId: string, params: Partial<CssParameters>) => void;
  updateSrpParams: (wellId: string, params: Partial<SrpParameters>) => void;
  injectSrpFault: (wellId: string, fault: SrpFaultType) => void;
  resetSrpFault: (wellId: string) => void;

  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  createMaintenanceTask: (task: Omit<MaintenanceTask, 'id' | 'createdTimestamp'>) => void;
  updateMaintenanceTaskStatus: (taskId: string, status: MaintenanceTask['status']) => void;

  tickTelemetry: () => void;
  loadDemoScenario: () => void;
  resetAllDemoData: () => void;
}

const THEME_STORAGE_KEY = 'thermoflow_theme_mode';

const getInitialTheme = (): 'dark' | 'light' => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark') return 'dark';
    if (saved === 'light') return 'light';
  }
  return 'light'; // Base mode is LIGHT by default
};

const applyThemeToDOM = (theme: 'dark' | 'light') => {
  if (typeof document !== 'undefined') {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      localStorage.removeItem('thermoflow_theme'); // Clean legacy dark-default key
    } catch {
      // ignore in restricted environments
    }
  }
};

const initialTheme = getInitialTheme();
applyThemeToDOM(initialTheme);

export const useFieldStore = create<FieldStoreState>((set, get) => {
  // Pre-seed telemetry histories for all wells
  const initialHistory: Record<string, TelemetryPoint[]> = {};
  INITIAL_WELLS.forEach((w) => {
    initialHistory[w.id] = generateHistoricalTelemetry(w);
  });

  return {
    theme: initialTheme,
    selectedWellId: 'BGW-03',
    currentUserRole: 'Production Engineer',
    isTelemetryPaused: false,
    telemetryIntervalMs: 3000,
    lastTelemetryTick: new Date().toISOString(),
    dataQualityScore: 98.4,
    modelConfidenceScore: 89.2,

    wells: INITIAL_WELLS,
    alerts: INITIAL_ALERTS,
    maintenanceTasks: INITIAL_MAINTENANCE_TASKS,
    auditLogs: INITIAL_AUDIT_LOGS,
    historicalTelemetry: initialHistory,

    setTheme: (theme: 'dark' | 'light') => {
      applyThemeToDOM(theme);
      set({ theme });
    },

    toggleTheme: () => {
      const current = get().theme;
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      applyThemeToDOM(nextTheme);
      set({ theme: nextTheme });
    },

    getSelectedWell: () => {
      const state = get();
      return state.wells.find((w) => w.id === state.selectedWellId) || state.wells[0];
    },

    getWellById: (id: string) => {
      return get().wells.find((w) => w.id === id);
    },

    setSelectedWellId: (id: string) => {
      const currentRole = get().currentUserRole;
      const well = get().wells.find((w) => w.id === id);
      const newAudit: AuditLogEntry = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString(),
        role: currentRole,
        action: 'Well selected',
        details: `Switched focus to ${id} (${well?.name || 'Unknown well'}).`,
        wellId: id,
      };

      set((state) => ({
        selectedWellId: id,
        auditLogs: [newAudit, ...state.auditLogs.slice(0, 99)],
      }));
    },

    setUserRole: (role: UserRole) => {
      const newAudit: AuditLogEntry = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString(),
        role: role,
        action: 'User role changed',
        details: `Session role updated to ${role}.`,
      };

      set((state) => ({
        currentUserRole: role,
        auditLogs: [newAudit, ...state.auditLogs.slice(0, 99)],
      }));
    },

    setTelemetryPaused: (paused: boolean) => {
      set({ isTelemetryPaused: paused });
    },

    setTelemetryIntervalMs: (interval: number) => {
      set({ telemetryIntervalMs: interval });
    },

    updateCssParams: (wellId: string, params: Partial<CssParameters>) => {
      set((state) => {
        const updatedWells = state.wells.map((well) => {
          if (well.id !== wellId) return well;

          const newCss = { ...well.cssParams, ...params };
          // Recalculate thermal response
          const thermal = calculateThermalResponse(
            newCss.steamVolumeTonnes,
            newCss.injectionPressureBar,
            newCss.steamQualityPct,
            newCss.heatLossFactorPct,
            newCss.soakTimeHours,
            well.reservoirTemp
          );

          // Recalculate production
          const prod = estimateOilProduction(
            thermal.viscosityCp,
            well.reservoirPressure,
            well.waterCut,
            well.srpParams
          );

          // Recalculate energy intensity
          const totalEnergyGj = newCss.steamVolumeTonnes * 2.75;
          const energyIntensity = prod.oilRateBopd > 0
            ? Math.round((totalEnergyGj / (prod.oilRateBopd * 30)) * 100) / 100
            : well.energyIntensity;

          const tempWell: Well = {
            ...well,
            cssParams: newCss,
            reservoirTemp: thermal.finalTempC,
            viscosity: thermal.viscosityCp,
            oilRate: prod.oilRateBopd,
            totalLiquidRate: prod.totalLiquidRateBlpd,
            energyIntensity,
            lastUpdate: new Date().toISOString(),
          };

          const prio = calculateWellPriority(tempWell);
          return {
            ...tempWell,
            priorityScore: prio.score,
            priorityReason: prio.rankReason,
          };
        });

        const newAudit: AuditLogEntry = {
          id: `AUD-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toISOString(),
          role: state.currentUserRole,
          action: 'CSS parameters updated',
          details: `Updated CSS parameters for ${wellId}. Model re-simulated thermal & production response.`,
          wellId,
        };

        return {
          wells: updatedWells,
          auditLogs: [newAudit, ...state.auditLogs.slice(0, 99)],
        };
      });
    },

    updateSrpParams: (wellId: string, params: Partial<SrpParameters>) => {
      set((state) => {
        const updatedWells = state.wells.map((well) => {
          if (well.id !== wellId) return well;

          const newSrp = { ...well.srpParams, ...params };
          const prod = estimateOilProduction(
            well.viscosity,
            well.reservoirPressure,
            well.waterCut,
            newSrp
          );

          // Motor power & rod load estimation
          const pprl = Math.round((38 + (newSrp.strokeLengthInches * Math.pow(newSrp.strokesPerMinute, 2)) / 1800) * 10) / 10;
          const motorAmp = Math.round((14 + newSrp.strokesPerMinute * 1.8) * 10) / 10;
          const motorPower = Math.round((motorAmp * 0.58) * 10) / 10;

          const tempWell: Well = {
            ...well,
            srpParams: {
              ...newSrp,
              surfaceRodLoadKn: newSrp.activeFault === 'rod_overload' ? 78.5 : pprl,
              motorCurrentAmp: motorAmp,
              motorPowerKw: motorPower,
            },
            oilRate: prod.oilRateBopd,
            totalLiquidRate: prod.totalLiquidRateBlpd,
            lastUpdate: new Date().toISOString(),
          };

          const prio = calculateWellPriority(tempWell);
          return {
            ...tempWell,
            priorityScore: prio.score,
            priorityReason: prio.rankReason,
          };
        });

        const newAudit: AuditLogEntry = {
          id: `AUD-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toISOString(),
          role: state.currentUserRole,
          action: 'SRP parameters updated',
          details: `Updated SRP stroke/SPM settings for ${wellId}. Pump displacement recalculated.`,
          wellId,
        };

        return {
          wells: updatedWells,
          auditLogs: [newAudit, ...state.auditLogs.slice(0, 99)],
        };
      });
    },

    injectSrpFault: (wellId: string, fault: SrpFaultType) => {
      set((state) => {
        const well = state.wells.find((w) => w.id === wellId);
        if (!well) return state;

        let newAlert: Alert | null = null;
        let newTask: MaintenanceTask | null = null;
        let rodLoad = well.srpParams.surfaceRodLoadKn;
        let srpHealth = 88;
        let status = well.status;

        if (fault === 'rod_overload') {
          rodLoad = 78.5;
          srpHealth = 65;
          status = 'critical';

          newAlert = {
            id: `ALT-${Date.now().toString().slice(-4)}`,
            timestamp: new Date().toISOString(),
            wellId,
            equipment: 'Surface Pumping Unit / Sucker Rod String',
            category: 'SRP health',
            severity: 'Critical',
            status: 'Active',
            title: `SRP rod-load anomaly detected on ${wellId}`,
            description: `Surface polished rod peak load spiked to ${rodLoad} kN (92% of yield rating). Heavy sinusoidal harmonics observed on upstroke dynamometer curve.`,
            telemetryEvidence: `Surface Rod Load: ${rodLoad} kN. Motor Current: 39.5 A. Vibration: 4.8 mm/s.`,
            impact: 'Possible artificial-lift efficiency loss, premature rod fatigue failure, and tubing wall friction wear.',
            recommendedAction: 'Review load pattern, down-rate SPM to 6.8, and schedule an ultrasonic rod-string inspection.',
            assignedRole: 'Artificial Lift Engineer',
            relatedComponentId: 'srp-rod-string',
          };

          newTask = {
            id: `MNT-${Date.now().toString().slice(-4)}`,
            title: `Inspect rod-load anomaly on ${wellId}`,
            wellId,
            priority: 'High',
            equipment: 'Surface Pumping Unit / Rod String',
            requiredRole: 'Artificial Lift Engineer',
            estimatedHours: 6,
            requiredSpare: 'Synthetic rod-string inspection kit & polished rod clamp',
            evidence: `Polished rod load spike to ${rodLoad} kN with severe harmonic distortion.`,
            status: 'Awaiting review',
            notes: ['Dynamometer card indicates severe harmonic stress approaching fatigue limit.'],
            createdTimestamp: new Date().toISOString(),
          };
        } else if (fault === 'fluid_pound') {
          srpHealth = 72;
          status = 'warning';
          newAlert = {
            id: `ALT-${Date.now().toString().slice(-4)}`,
            timestamp: new Date().toISOString(),
            wellId,
            equipment: 'Downhole Sucker Rod Pump',
            category: 'SRP health',
            severity: 'High',
            status: 'Active',
            title: `Fluid pound condition detected on ${wellId}`,
            description: 'Plunger hitting liquid surface prematurely in partially filled barrel during downstroke.',
            telemetryEvidence: 'Pump Fillage: 68%. Dynamometer card shows sharp downstroke load collapse.',
            impact: 'Severe compressive shock loading on rod string and shortened valve life.',
            recommendedAction: 'Reduce pump speed or lengthen cycle interval to allow fluid buildup.',
            assignedRole: 'Artificial Lift Engineer',
            relatedComponentId: 'downhole-pump',
          };
        } else if (fault === 'gas_interference') {
          srpHealth = 76;
          status = 'warning';
          newAlert = {
            id: `ALT-${Date.now().toString().slice(-4)}`,
            timestamp: new Date().toISOString(),
            wellId,
            equipment: 'Pump Traveling Valve',
            category: 'SRP health',
            severity: 'Medium',
            status: 'Active',
            title: `Gas interference detected in pump chamber on ${wellId}`,
            description: 'Free casing gas entering pump barrel, delaying opening of traveling valve.',
            telemetryEvidence: 'Rounded compression hysteresis on downstroke pump dynamometer card.',
            impact: 'Reduced volumetric lifting efficiency and erratic motor load.',
            recommendedAction: 'Increase casing head backpressure or set pump intake below perforations.',
            assignedRole: 'Production Engineer',
            relatedComponentId: 'downhole-pump',
          };
        }

        const updatedWells = state.wells.map((w) => {
          if (w.id !== wellId) return w;
          const updated: Well = {
            ...w,
            status,
            srpHealthScore: srpHealth,
            srpParams: {
              ...w.srpParams,
              activeFault: fault,
              surfaceRodLoadKn: rodLoad,
            },
            alertCount: w.alertCount + (newAlert ? 1 : 0),
          };
          const prio = calculateWellPriority(updated);
          return {
            ...updated,
            priorityScore: prio.score,
            priorityReason: prio.rankReason,
          };
        });

        const newAudit: AuditLogEntry = {
          id: `AUD-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toISOString(),
          role: state.currentUserRole,
          action: 'Fault injected',
          details: `Injected simulated fault [${fault}] on well ${wellId}. Generated diagnostic alert and maintenance task.`,
          wellId,
        };

        return {
          wells: updatedWells,
          alerts: newAlert ? [newAlert, ...state.alerts] : state.alerts,
          maintenanceTasks: newTask ? [newTask, ...state.maintenanceTasks] : state.maintenanceTasks,
          auditLogs: [newAudit, ...state.auditLogs.slice(0, 99)],
        };
      });
    },

    resetSrpFault: (wellId: string) => {
      set((state) => {
        const updatedWells = state.wells.map((w) => {
          if (w.id !== wellId) return w;
          const restored: Well = {
            ...w,
            status: 'optimal',
            srpHealthScore: 92,
            srpParams: {
              ...w.srpParams,
              activeFault: null,
              surfaceRodLoadKn: 48,
              strokesPerMinute: 6.5,
            },
          };
          const prio = calculateWellPriority(restored);
          return {
            ...restored,
            priorityScore: prio.score,
            priorityReason: prio.rankReason,
          };
        });

        const newAudit: AuditLogEntry = {
          id: `AUD-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toISOString(),
          role: state.currentUserRole,
          action: 'Fault reset',
          details: `Cleared active fault on well ${wellId}. Restored baseline operating conditions.`,
          wellId,
        };

        return {
          wells: updatedWells,
          auditLogs: [newAudit, ...state.auditLogs.slice(0, 99)],
        };
      });
    },

    acknowledgeAlert: (alertId: string) => {
      set((state) => {
        const updatedAlerts = state.alerts.map((a) =>
          a.id === alertId ? { ...a, status: 'Acknowledged' as const } : a
        );
        const alert = state.alerts.find((a) => a.id === alertId);
        const newAudit: AuditLogEntry = {
          id: `AUD-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toISOString(),
          role: state.currentUserRole,
          action: 'Alert acknowledged',
          details: `Acknowledged alert ${alertId} (${alert?.title || ''}).`,
          wellId: alert?.wellId,
        };
        return {
          alerts: updatedAlerts,
          auditLogs: [newAudit, ...state.auditLogs.slice(0, 99)],
        };
      });
    },

    resolveAlert: (alertId: string) => {
      set((state) => {
        const alert = state.alerts.find((a) => a.id === alertId);
        const updatedAlerts = state.alerts.map((a) =>
          a.id === alertId ? { ...a, status: 'Resolved' as const } : a
        );
        const newAudit: AuditLogEntry = {
          id: `AUD-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toISOString(),
          role: state.currentUserRole,
          action: 'Alert resolved',
          details: `Marked alert ${alertId} as resolved.`,
          wellId: alert?.wellId,
        };
        return {
          alerts: updatedAlerts,
          auditLogs: [newAudit, ...state.auditLogs.slice(0, 99)],
        };
      });
    },

    createMaintenanceTask: (task) => {
      set((state) => {
        const newTask: MaintenanceTask = {
          ...task,
          id: `MNT-${Date.now().toString().slice(-4)}`,
          createdTimestamp: new Date().toISOString(),
        };
        const newAudit: AuditLogEntry = {
          id: `AUD-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toISOString(),
          role: state.currentUserRole,
          action: 'Maintenance task created',
          details: `Created maintenance task ${newTask.id}: ${newTask.title}`,
          wellId: task.wellId,
        };
        return {
          maintenanceTasks: [newTask, ...state.maintenanceTasks],
          auditLogs: [newAudit, ...state.auditLogs.slice(0, 99)],
        };
      });
    },

    updateMaintenanceTaskStatus: (taskId, status) => {
      set((state) => {
        const updated = state.maintenanceTasks.map((t) =>
          t.id === taskId ? { ...t, status } : t
        );
        const task = state.maintenanceTasks.find((t) => t.id === taskId);
        const newAudit: AuditLogEntry = {
          id: `AUD-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toISOString(),
          role: state.currentUserRole,
          action: 'Task status updated',
          details: `Updated task ${taskId} status to ${status}.`,
          wellId: task?.wellId,
        };
        return {
          maintenanceTasks: updated,
          auditLogs: [newAudit, ...state.auditLogs.slice(0, 99)],
        };
      });
    },

    tickTelemetry: () => {
      if (get().isTelemetryPaused) return;

      set((state) => {
        const now = new Date();
        const timeStr = now.toISOString().substring(11, 19);

        const updatedHistory = { ...state.historicalTelemetry };
        const updatedWells = state.wells.map((w) => {
          // Subtle deterministic oscillation for realism
          const jitter = (Math.random() - 0.5) * 0.02;
          const oilRate = Math.max(0, Math.round(w.oilRate * (1 + jitter) * 10) / 10);
          const waterCut = Math.max(5, Math.min(95, Math.round((w.waterCut + jitter * 2) * 10) / 10));

          // Append telemetry point
          const hist = updatedHistory[w.id] || [];
          const newPt: TelemetryPoint = {
            timestamp: timeStr,
            oilRate,
            waterCut,
            liquidRate: w.totalLiquidRate,
            reservoirTemp: w.reservoirTemp,
            reservoirPressure: w.reservoirPressure,
            viscosity: w.viscosity,
            steamInjectionRate: w.currentPhase === 'Injection' ? w.cssParams.injectionRateTph : 0,
            srpMotorCurrent: w.srpParams.motorCurrentAmp,
            srpRodLoad: w.srpParams.surfaceRodLoadKn,
            srpFillage: w.srpParams.pumpFillagePct,
            steamQuality: w.cssParams.steamQualityPct,
          };

          updatedHistory[w.id] = [...hist.slice(-40), newPt];

          return {
            ...w,
            oilRate,
            waterCut,
            lastUpdate: now.toISOString(),
          };
        });

        return {
          wells: updatedWells,
          historicalTelemetry: updatedHistory,
          lastTelemetryTick: now.toISOString(),
        };
      });
    },

    loadDemoScenario: () => {
      set((state) => {
        // Set exact default demo configuration on BGW-03:
        // CSS cycle: 4, Current phase: Soak, Steam volume: 420 t, Injection pressure: 38 bar,
        // Injection duration: 12 hrs, Soak time: 30 hrs, Res temp: 52°C, Res pressure: 38 bar,
        // Viscosity: 8,400 cP, Water cut: 27%, Production rate: 16 BOPD, SRP health: 91%
        const updatedWells = state.wells.map((w) => {
          if (w.id !== 'BGW-03') return w;
          return {
            ...w,
            cycleNumber: 4,
            currentPhase: 'Soak' as const,
            phaseElapsedHours: 30,
            phaseTotalHours: 48,
            oilRate: 16,
            totalLiquidRate: 22,
            waterCut: 27,
            reservoirPressure: 38.0,
            reservoirTemp: 52,
            viscosity: 8400,
            steamResponseScore: 74,
            srpHealthScore: 91,
            energyIntensity: 1.62,
            priorityScore: 84,
            priorityReason: 'Soak stage nearly mature; high viscosity awaiting thermal diffusion optimization',
            status: 'caution' as const,
            cssParams: {
              steamVolumeTonnes: 420,
              injectionPressureBar: 38,
              injectionRateTph: 17.5,
              steamQualityPct: 78,
              injectionDurationHours: 12,
              soakTimeHours: 30,
              prodCutoffBopd: 22,
              heatLossFactorPct: 19,
              waterAvailabilityPct: 90,
              energyCostIndex: 1.1,
              steamGenEfficiencyPct: 84,
            },
            srpParams: {
              strokeLengthInches: 120,
              strokesPerMinute: 5.8,
              pumpDisplacementBpd: 210,
              fluidLevelMeters: 510,
              pumpIntakePressureBar: 16,
              tubingPressureBar: 11,
              surfaceRodLoadKn: 46,
              motorCurrentAmp: 21,
              motorPowerKw: 13.8,
              pumpFillagePct: 85,
              pumpEfficiencyPct: 88,
              vibrationMmS: 2.0,
              activeFault: null,
            },
          };
        });

        const newAudit: AuditLogEntry = {
          id: `AUD-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toISOString(),
          role: 'Administrator',
          action: 'Demo scenario loaded',
          details: 'Initialized predefined Baghewala BGW-03 CSS Soak & SRP Optimization scenario.',
          wellId: 'BGW-03',
        };

        return {
          selectedWellId: 'BGW-03',
          wells: updatedWells,
          auditLogs: [newAudit, ...state.auditLogs.slice(0, 99)],
        };
      });
    },

    resetAllDemoData: () => {
      const initialHistory: Record<string, TelemetryPoint[]> = {};
      INITIAL_WELLS.forEach((w) => {
        initialHistory[w.id] = generateHistoricalTelemetry(w);
      });

      const newAudit: AuditLogEntry = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString(),
        role: 'Administrator',
        action: 'Demo reset',
        details: 'Reset all field wells, telemetry streams, alerts, and maintenance logs to baseline.',
      };

      set({
        selectedWellId: 'BGW-03',
        currentUserRole: 'Production Engineer',
        wells: INITIAL_WELLS,
        alerts: INITIAL_ALERTS,
        maintenanceTasks: INITIAL_MAINTENANCE_TASKS,
        auditLogs: [newAudit, ...INITIAL_AUDIT_LOGS],
        historicalTelemetry: initialHistory,
      });
    },
  };
});
