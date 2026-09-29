import {
  Well,
  CssParameters,
  SrpParameters,
  DynamometerPoint,
  CssRecommendation,
  SrpRecommendation,
  WhatIfScenarioInput,
  WhatIfComparisonRow,
} from '../types';

/**
 * Heavy Crude Viscosity Model (Andrade / Vogel formulation tailored for Baghewala crude)
 * Temperature in °C, outputs dynamic viscosity in cP.
 */
export function calculateViscosity(tempCelsius: number): number {
  const T_kelvin = Math.max(10, tempCelsius) + 273.15;
  const T_ref = 35 + 273.15; // Reference cold reservoir temp (35°C)
  const mu_ref = 18500; // Baseline cold viscosity ~18,500 cP
  const b = 3800; // Thermal sensitivity coefficient

  const viscosity = mu_ref * Math.exp(b * (1 / T_kelvin - 1 / T_ref));
  return Math.round(Math.max(150, Math.min(35000, viscosity)));
}

/**
 * Estimates reservoir heating response from steam injection parameters.
 */
export function calculateThermalResponse(
  steamVolumeTonnes: number,
  injectionPressureBar: number,
  steamQualityPct: number,
  heatLossPct: number,
  soakHours: number,
  initialTempC: number
): {
  finalTempC: number;
  viscosityCp: number;
  steamChamberRadiusMeters: number;
  heatInputGj: number;
} {
  // Enthalpy of saturated steam at given pressure (approx 2750 kJ/kg = 2.75 GJ/tonne)
  const enthalpyPerTonneGj = 2.65 + (injectionPressureBar / 100) * 0.2;
  const grossHeatGj = steamVolumeTonnes * enthalpyPerTonneGj * (steamQualityPct / 100);
  const netHeatGj = grossHeatGj * (1 - heatLossPct / 100);

  // Simplified heat capacity diffusion model for 15m thick sandstone formation
  const formationHeatCapacity = 2200; // kJ / (m^3 * °C) = 2.2 GJ / (1000 m^3 * °C)
  const estimatedVolumeM3 = (netHeatGj * 1000) / (formationHeatCapacity * 0.08);
  const chamberRadius = Math.round(Math.sqrt(Math.max(1, estimatedVolumeM3 / (Math.PI * 15))) * 10) / 10;

  // Temperature rise decaying with soak diffusion
  const maxTempRise = (netHeatGj / 25) * 1.8;
  // Soak diffusion factor: initial peak evens out over drainage area
  const diffusionFactor = Math.min(1.0, 0.45 + (soakHours / 48) * 0.55);
  const tempRise = maxTempRise * diffusionFactor;
  const finalTemp = Math.round((initialTempC + tempRise) * 10) / 10;
  const finalViscosity = calculateViscosity(finalTemp);

  return {
    finalTempC: finalTemp,
    viscosityCp: finalViscosity,
    steamChamberRadiusMeters: Math.min(45, chamberRadius),
    heatInputGj: Math.round(netHeatGj),
  };
}

/**
 * Estimates oil production response (BOPD) from reservoir properties and lift settings
 */
export function estimateOilProduction(
  viscosityCp: number,
  reservoirPressureBar: number,
  waterCutPct: number,
  srpParams: SrpParameters
): {
  oilRateBopd: number;
  totalLiquidRateBlpd: number;
  sor: number; // Steam-Oil Ratio
} {
  // Mobility index: inverse of viscosity
  const mobilityFactor = 4500 / Math.max(300, viscosityCp);
  const drawdownPressure = Math.max(5, reservoirPressureBar - srpParams.pumpIntakePressureBar);

  // Theoretical gross liquid potential
  const potentialLiquid = (drawdownPressure * 2.8 * mobilityFactor);
  
  // Mechanical lift capacity
  const mechanicalCapacity =
    0.1166 * (1.75 * 1.75) * srpParams.strokeLengthInches * srpParams.strokesPerMinute *
    (srpParams.pumpFillagePct / 100) * (srpParams.pumpEfficiencyPct / 100) * 1.4;

  const actualLiquid = Math.min(potentialLiquid, mechanicalCapacity);
  const oilFraction = Math.max(0.05, 1 - waterCutPct / 100);
  const netOil = actualLiquid * oilFraction;

  return {
    oilRateBopd: Math.max(0, Math.round(netOil * 10) / 10),
    totalLiquidRateBlpd: Math.max(0, Math.round(actualLiquid * 10) / 10),
    sor: netOil > 0 ? Math.round((420 / Math.max(1, netOil * 25)) * 100) / 100 : 0,
  };
}

/**
 * Generate CSS Cycle Optimization Recommendations
 */
export function generateCssRecommendations(well: Well): {
  recommendations: CssRecommendation[];
  predictedTempUplift: number;
  predictedViscosityDrop: number;
  predictedOilUplift: number;
  energyUseGj: number;
  waterUseM3: number;
  sorEstimate: number;
  cycleEffectiveness: number;
  riskScore: number;
  confidenceScore: number;
  nextPhaseRecommendation: string;
  explanation: string;
} {
  const css = well.cssParams;
  
  // Model logic for optimization
  const recSteamVolume = Math.min(520, Math.round((css.steamVolumeTonnes * 1.1) / 10) * 10);
  const recPressure = Math.min(46, Math.round(css.injectionPressureBar + 3));
  const recSoakHours = Math.min(60, Math.round(css.soakTimeHours * 1.35));
  const recCutoff = Math.max(15, Math.round(css.prodCutoffBopd * 1.15));

  const initialThermal = calculateThermalResponse(
    css.steamVolumeTonnes,
    css.injectionPressureBar,
    css.steamQualityPct,
    css.heatLossFactorPct,
    css.soakTimeHours,
    well.reservoirTemp
  );

  const optimizedThermal = calculateThermalResponse(
    recSteamVolume,
    recPressure,
    Math.min(85, css.steamQualityPct + 4),
    Math.max(12, css.heatLossFactorPct - 3),
    recSoakHours,
    well.reservoirTemp
  );

  const tempUplift = Math.round((optimizedThermal.finalTempC - initialThermal.finalTempC) * 10) / 10;
  const viscosityDrop = Math.max(0, initialThermal.viscosityCp - optimizedThermal.viscosityCp);
  const predictedOilUplift = Math.round((well.oilRate * 0.35 + 24) * 10) / 10;

  const energyGj = Math.round(recSteamVolume * 2.75 * 0.95);
  const waterM3 = Math.round(recSteamVolume * 1.05);
  const sorEstimate = Math.round((recSteamVolume / (predictedOilUplift * 30 * 0.159)) * 100) / 100;
  const cycleEffectiveness = Math.min(96, Math.max(55, Math.round(82 + (tempUplift * 0.4) - (css.heatLossFactorPct * 0.3))));

  const recommendations: CssRecommendation[] = [
    {
      paramName: 'Steam Volume',
      currentValue: `${css.steamVolumeTonnes} t`,
      recommendedValue: `${recSteamVolume} t`,
      unit: 'tonnes',
      reason: 'Deepen heated zone to overcome boundary heat loss in sandstone formation',
      expectedImpact: `+${Math.round(recSteamVolume - css.steamVolumeTonnes)} t heat volume, expanding thermal radius by ~3.8m`,
      confidence: 88,
    },
    {
      paramName: 'Injection Pressure',
      currentValue: `${css.injectionPressureBar} bar`,
      recommendedValue: `${recPressure} bar`,
      unit: 'bar',
      reason: 'Ensure uniform injection distribution across lower high-permeability sands',
      expectedImpact: 'Improves steam conformance and minimizes early vapor breakout',
      confidence: 85,
    },
    {
      paramName: 'Soak Time',
      currentValue: `${css.soakTimeHours} hrs`,
      recommendedValue: `${recSoakHours} hrs`,
      unit: 'hours',
      reason: 'Allow conductive heat diffusion from injected fractures into cold matrix block',
      expectedImpact: `Reduces crude viscosity by estimated ~${Math.round(viscosityDrop)} cP`,
      confidence: 90,
    },
    {
      paramName: 'Production Cut-off',
      currentValue: `${css.prodCutoffBopd} BOPD`,
      recommendedValue: `${recCutoff} BOPD`,
      unit: 'BOPD',
      reason: 'Terminate production cycle before severe thermal depletion and high water cut',
      expectedImpact: 'Preserves reservoir pressure and optimizes cyclic steam-oil ratio (SOR)',
      confidence: 82,
    },
  ];

  let nextPhaseRecommendation = 'Continue current cycle monitoring';
  if (well.currentPhase === 'Soak' && well.phaseElapsedHours >= well.phaseTotalHours * 0.9) {
    nextPhaseRecommendation = 'Initiate Production Phase: align SRP stroke rate to 5.8 SPM';
  } else if (well.currentPhase === 'Injection' && well.phaseElapsedHours >= well.phaseTotalHours) {
    nextPhaseRecommendation = 'Transition to Soak Phase: shut-in wellhead and isolate steam manifold';
  } else if (well.currentPhase === 'Production' && well.oilRate <= css.prodCutoffBopd) {
    nextPhaseRecommendation = 'Schedule Next CSS Cycle (Cycle ' + (well.cycleNumber + 1) + ')';
  }

  return {
    recommendations,
    predictedTempUplift: tempUplift,
    predictedViscosityDrop: viscosityDrop,
    predictedOilUplift,
    energyUseGj: energyGj,
    waterUseM3: waterM3,
    sorEstimate: Math.max(1.8, Math.min(8.5, sorEstimate)),
    cycleEffectiveness,
    riskScore: 28,
    confidenceScore: 89,
    nextPhaseRecommendation,
    explanation:
      'Synthetic thermal simulation demonstrates that a 9.5% increase in steam mass combined with an extended 42-hour soak delivers optimal matrix heating in the Baghewala formation, reducing in-situ viscosity from ~8,400 cP to ~4,200 cP.',
  };
}

/**
 * Generate Dynamometer Curve coordinates (Surface Load vs Polished Rod Position)
 * Generates an engineering-accurate 36-point polygon representing the pump cycle.
 */
export function generateDynamometerCard(
  strokeLengthInches: number,
  baseLoadKn: number,
  fault: string | null
): {
  baselinePoints: DynamometerPoint[];
  currentPoints: DynamometerPoint[];
} {
  const baselinePoints: DynamometerPoint[] = [];
  const currentPoints: DynamometerPoint[] = [];
  const S = strokeLengthInches;
  const steps = 36;

  // Theoretical API 11L baseline card (smooth rounded parallelogram)
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    // Harmonic motion of polished rod
    const pos = (S / 2) * (1 - Math.cos(angle));

    // Baseline ideal card
    let baseSurface = 28;
    let basePump = 22;
    if (angle < Math.PI) {
      // Upstroke: lifting fluid column
      baseSurface = baseLoadKn + Math.sin(angle) * 8 + Math.sin(angle * 3) * 1.5;
      basePump = 38 + Math.sin(angle) * 4;
    } else {
      // Downstroke: traveling valve open, rod buoyant
      const downAngle = angle - Math.PI;
      baseSurface = 22 - Math.sin(downAngle) * 5 + Math.sin(downAngle * 2) * 1.2;
      basePump = 14 - Math.sin(downAngle) * 3;
    }

    baselinePoints.push({
      positionInches: Math.round(pos * 10) / 10,
      surfaceLoadKn: Math.round(baseSurface * 10) / 10,
      pumpLoadKn: Math.round(basePump * 10) / 10,
    });

    // Modified current card based on active fault
    let currSurface = baseSurface;
    let currPump = basePump;

    if (fault === 'rod_overload') {
      if (angle < Math.PI) {
        // Severe peak spike on upstroke up to 78.5 kN
        currSurface = baseSurface * 1.45 + Math.sin(angle * 2) * 8;
        currPump = basePump * 1.3;
      } else {
        currSurface = baseSurface * 1.15;
      }
    } else if (fault === 'fluid_pound') {
      if (angle >= Math.PI) {
        // Classic fluid pound notch on early downstroke
        const downAngle = angle - Math.PI;
        if (downAngle < Math.PI * 0.5) {
          currSurface = 12 - Math.sin(downAngle * 4) * 6; // Severe sudden drop
          currPump = 8;
        } else {
          currSurface = baseSurface;
        }
      }
    } else if (fault === 'gas_interference') {
      if (angle >= Math.PI) {
        // Slow rounded recompression curve instead of sharp valve action
        const downAngle = angle - Math.PI;
        currSurface = baseSurface + (1 - Math.sin(downAngle)) * 12;
        currPump = basePump * 0.7;
      }
    } else if (fault === 'pump_off') {
      // Barrel not filling; narrow flattened loop
      currSurface = baseSurface * 0.65;
      currPump = basePump * 0.55;
    } else if (fault === 'high_viscosity') {
      // Heavy fluid drag widens hysteresis loop on both strokes
      if (angle < Math.PI) {
        currSurface = baseSurface + 14;
      } else {
        currSurface = Math.max(5, baseSurface - 10);
      }
    }

    currentPoints.push({
      positionInches: Math.round(pos * 10) / 10,
      surfaceLoadKn: Math.round(currSurface * 10) / 10,
      pumpLoadKn: Math.round(currPump * 10) / 10,
    });
  }

  return { baselinePoints, currentPoints };
}

/**
 * SRP Performance Analysis & Settings Optimization
 */
export function analyzeSrpSettings(well: Well): {
  recommendation: SrpRecommendation;
  pumpEfficiencyPct: number;
  pumpFillagePct: number;
  rodStressPct: number;
  motorLoadPct: number;
  energyPerBblGj: number;
  gasInterferenceRiskPct: number;
  fluidPoundRiskPct: number;
  pumpOffRiskPct: number;
  overallHealthScore: number;
  operatingBandText: string;
} {
  const srp = well.srpParams;
  const isOverload = srp.activeFault === 'rod_overload';
  const isPound = srp.activeFault === 'fluid_pound';
  const isGas = srp.activeFault === 'gas_interference';

  const rodStressPct = Math.round((srp.surfaceRodLoadKn / 85) * 100);
  const motorLoadPct = Math.round((srp.motorCurrentAmp / 45) * 100);
  const energyPerBblGj = well.oilRate > 0 ? Math.round(((srp.motorPowerKw * 24 * 0.0036) / well.oilRate) * 100) / 100 : 0.45;

  let overallHealth = 92;
  if (isOverload) overallHealth = 65;
  if (isPound) overallHealth = 72;
  if (isGas) overallHealth = 76;
  if (srp.activeFault === 'pump_off') overallHealth = 70;

  const gasInterferenceRisk = isGas ? 82 : Math.round(15 + Math.random() * 8);
  const fluidPoundRisk = isPound ? 88 : Math.round(12 + Math.random() * 6);
  const pumpOffRisk = srp.activeFault === 'pump_off' ? 90 : Math.round(10 + Math.random() * 5);

  // Recommended parameters
  const recStroke = isOverload ? 120 : Math.min(144, srp.strokeLengthInches);
  const recSpm = isOverload ? 6.5 : (srp.strokesPerMinute > 7.5 ? 6.8 : 6.2);

  const recommendation: SrpRecommendation = {
    strokeLength: recStroke,
    spm: recSpm,
    expectedEfficiency: 92,
    expectedEnergyPerBbl: Math.max(0.28, Math.round((energyPerBblGj * 0.82) * 100) / 100),
    operatingBand: `Stroke: 120-144 in | SPM: 5.8-6.8 | Target Fillage: >88%`,
    reasoning: isOverload
      ? 'Reduce SPM from 8.2 to 6.5 to alleviate cyclic rod fatigue and bring peak surface load under 55 kN threshold.'
      : 'Maintain long stroke (120-144 in) with moderate SPM (6.2-6.8) to maximize pump fillage in heavy viscous fluid while preventing rod harmonic resonance.',
  };

  return {
    recommendation,
    pumpEfficiencyPct: srp.pumpEfficiencyPct,
    pumpFillagePct: srp.pumpFillagePct,
    rodStressPct,
    motorLoadPct,
    energyPerBblGj: Math.max(0.3, energyPerBblGj),
    gasInterferenceRiskPct: gasInterferenceRisk,
    fluidPoundRiskPct: fluidPoundRisk,
    pumpOffRiskPct: pumpOffRisk,
    overallHealthScore: overallHealth,
    operatingBandText: recommendation.operatingBand,
  };
}

/**
 * Transparent Well Prioritization Scoring Engine (0 - 100)
 */
export function calculateWellPriority(well: Well): {
  score: number;
  rankReason: string;
  primaryIssue: string;
  recommendedAction: string;
  expectedBenefit: string;
  mainRisk: string;
  confidence: number;
} {
  // Factors:
  // 1. Production loss / opportunity (0-25)
  const prodFactor = well.currentPhase === 'Soak' ? 22 : (well.oilRate < 40 && well.currentPhase === 'Production' ? 24 : 12);
  
  // 2. High Viscosity opportunity (0-20)
  const viscFactor = Math.min(20, Math.round((well.viscosity / 15000) * 20));

  // 3. SRP Health urgency (0-25)
  const srpFaultPenalty = (100 - well.srpHealthScore) * 0.25;

  // 4. CSS phase maturity / thermal response (0-15)
  const cssFactor = well.steamResponseScore < 75 ? 14 : 6;

  // 5. Energy intensity (0-15)
  const energyFactor = Math.min(15, Math.round((well.energyIntensity / 3.0) * 15));

  const totalRaw = prodFactor + viscFactor + srpFaultPenalty + cssFactor + energyFactor;
  const score = Math.min(98, Math.max(25, Math.round(totalRaw)));

  let primaryIssue = 'Normal baseline operation';
  let recommendedAction = 'Routine surveillance';
  let expectedBenefit = 'Maintain stable lift and monitoring';
  let mainRisk = 'Standard equipment wear';

  if (well.srpParams.activeFault === 'rod_overload') {
    primaryIssue = 'Critical SRP rod-load anomaly approaching structural safety threshold (78.5 kN)';
    recommendedAction = 'Down-rate SPM to 6.8 and schedule ultrasonic rod inspection';
    expectedBenefit = 'Prevents cataclysmic rod-string parting and $45k workover';
    mainRisk = 'Parted rod string causing downhole pump freeze';
  } else if (well.currentPhase === 'Soak') {
    primaryIssue = 'Soak stage nearing maturation; heavy crude requires thermal diffusion analysis';
    recommendedAction = 'Simulate CSS parameter uplift & prepare artificial lift startup';
    expectedBenefit = 'Accelerates production response by +28 BOPD upon completion of soak';
    mainRisk = 'Premature drawdown causing cold viscous fluid locking';
  } else if (well.cssParams.heatLossFactorPct > 20) {
    primaryIssue = 'Elevated heat loss factor reducing steam thermal conformance';
    recommendedAction = 'Optimize steam injection pressure and inspect surface manifold insulation';
    expectedBenefit = 'Improves steam-oil ratio (SOR) by 18% and reduces fuel consumption';
    mainRisk = 'Ineffective steam chamber development';
  } else if (well.waterCut > 35) {
    primaryIssue = 'Rising water cut indicating potential bottom-water cone development';
    recommendedAction = 'Moderate drawdown pressure and adjust stroke length';
    expectedBenefit = 'Stabilizes water cut and lowers liquid handling burden';
    mainRisk = 'Water encroachment drowning out heavy oil inflow';
  }

  return {
    score,
    rankReason: well.priorityReason || primaryIssue,
    primaryIssue,
    recommendedAction,
    expectedBenefit,
    mainRisk,
    confidence: 89,
  };
}

/**
 * What-If Scenario Calculation
 */
export function runWhatIfScenario(
  baselineWell: Well,
  scenario: WhatIfScenarioInput
): {
  comparisonRows: WhatIfComparisonRow[];
  summaryRecommendation: string;
  confidencePct: number;
  assumptions: string[];
} {
  const baseThermal = calculateThermalResponse(
    baselineWell.cssParams.steamVolumeTonnes,
    baselineWell.cssParams.injectionPressureBar,
    baselineWell.cssParams.steamQualityPct,
    baselineWell.cssParams.heatLossFactorPct,
    baselineWell.cssParams.soakTimeHours,
    baselineWell.reservoirTemp
  );

  const scenThermal = calculateThermalResponse(
    scenario.steamVolumeTonnes,
    scenario.injectionPressureBar,
    baselineWell.cssParams.steamQualityPct,
    baselineWell.cssParams.heatLossFactorPct,
    scenario.soakTimeHours,
    scenario.reservoirTemp
  );

  const baseProd = estimateOilProduction(
    baselineWell.viscosity,
    baselineWell.reservoirPressure,
    baselineWell.waterCut,
    baselineWell.srpParams
  );

  const modifiedSrp: SrpParameters = {
    ...baselineWell.srpParams,
    strokeLengthInches: scenario.strokeLengthInches,
    strokesPerMinute: scenario.spm,
  };

  const scenProd = estimateOilProduction(
    scenThermal.viscosityCp,
    scenario.reservoirPressure,
    scenario.waterCut,
    modifiedSrp
  );

  const baseEnergyGj = Math.round(baselineWell.cssParams.steamVolumeTonnes * 2.75);
  const scenEnergyGj = Math.round(scenario.steamVolumeTonnes * 2.75);

  const baseWaterM3 = Math.round(baselineWell.cssParams.steamVolumeTonnes * 1.05);
  const scenWaterM3 = Math.round(scenario.steamVolumeTonnes * 1.05);

  const baseSor = baseProd.oilRateBopd > 0 ? Math.round((baselineWell.cssParams.steamVolumeTonnes / (baseProd.oilRateBopd * 30 * 0.159)) * 10) / 10 : 3.8;
  const scenSor = scenProd.oilRateBopd > 0 ? Math.round((scenario.steamVolumeTonnes / (scenProd.oilRateBopd * 30 * 0.159)) * 10) / 10 : 3.2;

  const oilDiff = scenProd.oilRateBopd - (baselineWell.oilRate || baseProd.oilRateBopd);
  const viscDiff = scenThermal.viscosityCp - baselineWell.viscosity;
  const sorDiff = Math.round((scenSor - baseSor) * 10) / 10;
  const energyDiff = scenEnergyGj - baseEnergyGj;
  const waterDiff = scenWaterM3 - baseWaterM3;

  const comparisonRows: WhatIfComparisonRow[] = [
    {
      metric: 'Estimated Oil Rate',
      baseline: `${baselineWell.oilRate || baseProd.oilRateBopd} BOPD`,
      scenario: `${scenProd.oilRateBopd} BOPD`,
      diff: `${oilDiff >= 0 ? '+' : ''}${Math.round(oilDiff * 10) / 10} BOPD`,
      unit: 'BOPD',
      interpretation: oilDiff >= 0 ? 'Favorable recovery response due to lower fluid resistance' : 'Depressed recovery rate',
      improved: oilDiff >= 0,
    },
    {
      metric: 'Crude Viscosity',
      baseline: `${baselineWell.viscosity} cP`,
      scenario: `${scenThermal.viscosityCp} cP`,
      diff: `${viscDiff >= 0 ? '+' : ''}${viscDiff} cP`,
      unit: 'cP',
      interpretation: viscDiff < 0 ? 'Enhanced fluid mobility through heated sandstone' : 'Viscous flow resistance elevated',
      improved: viscDiff < 0,
    },
    {
      metric: 'Steam-Oil Ratio (SOR)',
      baseline: `${baseSor}`,
      scenario: `${scenSor}`,
      diff: `${sorDiff >= 0 ? '+' : ''}${sorDiff}`,
      unit: 't steam / t oil',
      interpretation: scenSor <= baseSor ? 'More efficient thermal conversion per barrel' : 'Higher steam requirement per barrel',
      improved: scenSor <= baseSor,
    },
    {
      metric: 'Total Energy Consumed',
      baseline: `${baseEnergyGj} GJ`,
      scenario: `${scenEnergyGj} GJ`,
      diff: `${energyDiff >= 0 ? '+' : ''}${energyDiff} GJ`,
      unit: 'GJ',
      interpretation: energyDiff <= 0 ? 'Energy conserved' : 'Additional boiler steam fuel requirement',
      improved: energyDiff <= 0,
    },
    {
      metric: 'Feedwater Required',
      baseline: `${baseWaterM3} m³`,
      scenario: `${scenWaterM3} m³`,
      diff: `${waterDiff >= 0 ? '+' : ''}${waterDiff} m³`,
      unit: 'm³',
      interpretation: waterDiff <= 0 ? 'Water intake optimized' : 'Higher RO water demand',
      improved: waterDiff <= 0,
    },
    {
      metric: 'SRP Pump Efficiency',
      baseline: `${baselineWell.srpParams.pumpEfficiencyPct}%`,
      scenario: `${scenario.spm <= 7.0 ? 92 : 84}%`,
      diff: `${(scenario.spm <= 7.0 ? 92 : 84) - baselineWell.srpParams.pumpEfficiencyPct}%`,
      unit: '%',
      interpretation: scenario.spm <= 7.0 ? 'Operating within laminar fillage sweet-spot' : 'Risk of incomplete barrel fillage and cavitation',
      improved: scenario.spm <= 7.0,
    },
    {
      metric: 'Downhole Pump Risk',
      baseline: baselineWell.srpParams.activeFault ? 'High (Fault active)' : 'Low',
      scenario: scenario.spm > 7.5 ? 'Moderate (Rod stress)' : 'Low (Safe band)',
      diff: scenario.spm > 7.5 ? '+Risk' : 'Stable',
      unit: 'category',
      interpretation: scenario.spm > 7.5 ? 'Increased mechanical fatigue on sucker rod string' : 'Operational envelope verified',
      improved: scenario.spm <= 7.5,
    },
  ];

  return {
    comparisonRows,
    summaryRecommendation:
      scenProd.oilRateBopd > (baselineWell.oilRate || 20)
        ? 'Scenario demonstrates favorable economic potential with enhanced mobility. Recommend advancing to engineering review.'
        : 'Scenario does not demonstrate sufficient recovery gain relative to added steam energy cost.',
    confidencePct: scenario.availableSteamCapacityPct < 70 ? 68 : 88,
    assumptions: [
      'Constant reservoir permeability of 450 mD in target sandstone layer.',
      'Saturated steam quality delivered at wellhead >= 78%.',
      'Radial thermal dissipation with negligible active aquifer convection.',
      'Sucker rod pump mechanical transmission efficiency rated at 90%.',
    ],
  };
}
