export type UserRole =
  | 'Administrator'
  | 'Production Engineer'
  | 'Reservoir Engineer'
  | 'Artificial Lift Engineer'
  | 'Maintenance Planner'
  | 'Viewer';

export type WellPhase =
  | 'Injection'
  | 'Soak'
  | 'Production'
  | 'Shut-in'
  | 'Maintenance';

export type AlertSeverity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Information';

export type AlertCategory =
  | 'CSS performance'
  | 'Steam injection'
  | 'Reservoir response'
  | 'Pressure anomaly'
  | 'Thermal anomaly'
  | 'SRP health'
  | 'Production decline'
  | 'Energy intensity'
  | 'Water usage'
  | 'Data quality'
  | 'Maintenance'
  | 'Security/audit';

export type AlertStatus = 'Active' | 'Acknowledged' | 'Resolved';

export type SrpFaultType =
  | 'rod_overload'
  | 'fluid_pound'
  | 'gas_interference'
  | 'pump_off'
  | 'high_water_cut'
  | 'high_viscosity'
  | 'motor_overload'
  | 'tubing_restriction'
  | 'sensor_drift'
  | null;

export interface WellCoordinates {
  x: number; // 0-100 percentage on field map
  y: number; // 0-100 percentage on field map
  depthMeters: number;
}

export interface CssParameters {
  steamVolumeTonnes: number;
  injectionPressureBar: number;
  injectionRateTph: number;
  steamQualityPct: number;
  injectionDurationHours: number;
  soakTimeHours: number;
  prodCutoffBopd: number;
  heatLossFactorPct: number;
  waterAvailabilityPct: number;
  energyCostIndex: number;
  steamGenEfficiencyPct: number;
}

export interface SrpParameters {
  strokeLengthInches: number;
  strokesPerMinute: number;
  pumpDisplacementBpd: number;
  fluidLevelMeters: number;
  pumpIntakePressureBar: number;
  tubingPressureBar: number;
  surfaceRodLoadKn: number;
  motorCurrentAmp: number;
  motorPowerKw: number;
  pumpFillagePct: number;
  pumpEfficiencyPct: number;
  vibrationMmS: number;
  activeFault: SrpFaultType;
}

export interface Well {
  id: string;
  name: string;
  coordinates: WellCoordinates;
  cycleNumber: number;
  currentPhase: WellPhase;
  phaseElapsedHours: number;
  phaseTotalHours: number;
  
  // Real-time / dynamic production metrics
  oilRate: number; // BOPD
  totalLiquidRate: number; // BLPD
  waterCut: number; // %
  reservoirPressure: number; // bar
  reservoirTemp: number; // °C
  viscosity: number; // cP
  
  // Computed scores
  steamResponseScore: number; // 0-100
  srpHealthScore: number; // 0-100
  energyIntensity: number; // GJ/bbl
  priorityScore: number; // 0-100
  priorityReason: string;
  alertCount: number;
  status: 'optimal' | 'caution' | 'warning' | 'critical' | 'inactive';
  lastUpdate: string;

  // Subsystem configs
  cssParams: CssParameters;
  srpParams: SrpParameters;
}

export interface Alert {
  id: string;
  timestamp: string; // UTC ISO string
  wellId: string;
  equipment: string;
  category: AlertCategory;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  description: string;
  telemetryEvidence: string;
  impact: string;
  recommendedAction: string;
  assignedRole: UserRole;
  relatedComponentId: string;
}

export interface MaintenanceTask {
  id: string;
  title: string;
  wellId: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  equipment: string;
  requiredRole: UserRole;
  estimatedHours: number;
  requiredSpare: string;
  evidence: string;
  status: 'Awaiting review' | 'Approved' | 'Scheduled' | 'In Progress' | 'Completed';
  notes: string[];
  createdTimestamp: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  role: UserRole;
  action: string;
  details: string;
  wellId?: string;
}

export interface TelemetryPoint {
  timestamp: string;
  oilRate: number;
  waterCut: number;
  liquidRate: number;
  reservoirTemp: number;
  reservoirPressure: number;
  viscosity: number;
  steamInjectionRate: number;
  srpMotorCurrent: number;
  srpRodLoad: number;
  srpFillage: number;
  steamQuality: number;
}

export interface DynamometerPoint {
  positionInches: number;
  surfaceLoadKn: number;
  pumpLoadKn: number;
}

export interface CssRecommendation {
  paramName: string;
  currentValue: string | number;
  recommendedValue: string | number;
  unit: string;
  reason: string;
  expectedImpact: string;
  confidence: number;
}

export interface SrpRecommendation {
  strokeLength: number;
  spm: number;
  expectedEfficiency: number;
  expectedEnergyPerBbl: number;
  operatingBand: string;
  reasoning: string;
}

export interface WhatIfScenarioInput {
  wellId: string;
  templateName?: string;
  steamVolumeTonnes: number;
  injectionPressureBar: number;
  injectionDurationHours: number;
  soakTimeHours: number;
  prodCutoffBopd: number;
  strokeLengthInches: number;
  spm: number;
  reservoirTemp: number;
  reservoirPressure: number;
  viscosity: number;
  waterCut: number;
  energyCostIndex: number;
  availableSteamCapacityPct: number;
  waterAvailabilityPct: number;
}

export interface WhatIfComparisonRow {
  metric: string;
  baseline: number | string;
  scenario: number | string;
  diff: string;
  unit: string;
  interpretation: string;
  improved: boolean;
}

export interface TwinComponent {
  id: string;
  name: string;
  layer: 'surface' | 'wellbore' | 'reservoir';
  status: 'normal' | 'caution' | 'warning' | 'critical' | 'offline';
  healthPct: number;
  telemetry: Record<string, string | number>;
  activeRisk: string;
  dependencies: string[];
  suggestedAction: string;
}
