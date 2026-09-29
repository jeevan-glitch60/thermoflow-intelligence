import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StaggeredContainer, AnimatedCard, INDUSTRIAL_EASE } from '../components/common/AnimationWrapper';
import {
  Flame,
  Activity,
  Box,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Zap,
  Droplets,
  Gauge,
  TrendingUp,
  Cpu,
  RefreshCw,
  Sliders,
  CheckCircle2,
  FileText,
  MapPin,
  AlertTriangle,
  Clock,
  Target,
} from 'lucide-react';
import { useFieldStore } from '../store/useFieldStore';
import { Banner } from '../components/common/Banner';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { loadDemoScenario } = useFieldStore();

  const handleLoadDemo = () => {
    loadDemoScenario();
    navigate('/dashboard');
  };

  // Official Problem Statement Background Pillars
  const problemPillars = [
    {
      badge: 'LOCATION & RESERVOIR',
      title: 'Baghewala Field, Rajasthan',
      subtitle: 'Jodhpur Sandstone Reservoir',
      desc: 'Located in the Bikaner-Nagaur Basin. Low reservoir temperature (46°C–48°C) and tight sandstone matrix cause extremely poor native oil mobility, rendering primary cold recovery virtually negligible (<2% OOIP).',
      icon: MapPin,
      metric: '46°C–48°C Res Temp',
      metricColor: 'text-cyan-400',
      tagColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    },
    {
      badge: 'OIL CHARACTERISTICS',
      title: 'Heavy Crude & High Asphaltenes',
      subtitle: '18°C–19°C API Dense Fluid',
      desc: 'Ultra-heavy crude oil (18°C–19°C API) with high asphaltene fractions. Virgin viscosity exceeds 18,000 cP at native 46°C conditions, requiring intense cyclic thermal stimulation to unlock mobility and flow.',
      icon: Droplets,
      metric: '18°C–19°C API • >18k cP',
      metricColor: 'text-amber-400',
      tagColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    {
      badge: 'CURRENT ISSUES',
      title: 'Siloed Empirical Heuristics',
      subtitle: 'Post-Steam Viscosity Rebound',
      desc: 'CSS and SRP operations are optimized separately using historical experience. As reservoir temperature declines post-injection, crude viscosity rebounds rapidly, causing pump fluid pound, rod stress overloads, energy waste, and lost recovery.',
      icon: AlertTriangle,
      metric: 'Reduced Pump Efficiency',
      metricColor: 'text-rose-400',
      tagColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    },
    {
      badge: 'THE NEED & SOLUTION',
      title: 'Simultaneous Closed-Loop Optimization',
      subtitle: 'Integrated Data-Driven Twin',
      desc: 'An integrated, data-driven system that continuously optimizes both CSS thermal injection and artificial lift operations simultaneously, preventing premature rod failures, cutting energy draw, and maximizing cumulative recovery.',
      icon: Cpu,
      metric: 'Real-Time Synergy',
      metricColor: 'text-emerald-400',
      tagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
  ];

  // Parameters to Optimize Simultaneously (From Official Problem Statement)
  const optimizationParameters = [
    {
      param: 'Steam Volume',
      category: 'Thermal Sizing',
      value: '1,800 – 2,400 t/cycle',
      desc: 'Sized to formation net pay and drainage pore volume to optimize thermal chamber expansion without premature breakthrough or fuel waste.',
      icon: Flame,
      color: 'text-orange-400',
    },
    {
      param: 'Injection Pressure',
      category: 'Formation Integrity',
      value: '38 – 44 bar (< Fracture)',
      desc: 'Regulated strictly below caprock fracture pressure while maintaining >80% steam dryness quality at the sandface perforations.',
      icon: Gauge,
      color: 'text-blue-400',
    },
    {
      param: 'Soak Time',
      category: 'Viscosity Diffusion',
      value: '4 – 7 Days Dynamic',
      desc: 'Dynamically calculated for peak Andrade thermal diffusion and viscosity reduction across the matrix before conductive overburden loss begins.',
      icon: Clock,
      color: 'text-amber-400',
    },
    {
      param: 'Production Cut-Off',
      category: 'Economic Transition',
      value: 'Dynamic SOR & cP Cut-Off',
      desc: 'Continuously monitors viscosity rebound and SRP rod friction load to pinpoint the optimal hour for the next CSS cycle before operating loss occurs.',
      icon: Sliders,
      color: 'text-emerald-400',
    },
  ];

  const workflowSteps = [
    { step: '01', title: 'MONITOR', subtitle: 'SCADA Telemetry', desc: 'Real-time telemetry ingestion from wellhead PT gauges, downhole sensors, and SRP drive VFDs.' },
    { step: '02', title: 'MODEL', subtitle: 'Physics Core', desc: 'Coupled thermal diffusion, Andrade viscosity drop, and API 11L sucker rod dynamometer physics.' },
    { step: '03', title: 'SIMULATE', subtitle: 'What-If Engine', desc: 'Predict thermal chamber expansion, fluid mobility, and pump load under alternative operating states.' },
    { step: '04', title: 'OPTIMIZE', subtitle: 'Simultaneous Tuning', desc: 'Harmonize steam volume, pressure, soak time, stroke length, and SPM as one unified system.' },
    { step: '05', title: 'RECOMMEND', subtitle: 'Decision Support', desc: 'Explainable, engineering-ready setpoints for thermal injection and beam pump operating envelopes.' },
    { step: '06', title: 'REVIEW', subtitle: 'Multi-Role Audit', desc: 'Integrated engineering review with audit logging, risk scoring, and automated maintenance planning.' },
  ];

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col">
      <Banner />

      {/* Hero Section */}
      <header className="relative overflow-hidden border-b border-[#233149] bg-gradient-to-b from-[#101622] via-[#0d121c] to-[#0b0e14] py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Text */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: INDUSTRIAL_EASE }}
            className="flex-1 space-y-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
              <Flame className="w-3.5 h-3.5" />
              <span>Oil India Limited • Baghewala Field Heavy Oil Demonstrator</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-mono text-slate-100">
                THERMOFLOW <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500">INTELLIGENCE</span>
              </h1>
              <p className="text-lg sm:text-xl font-medium text-amber-200/90 font-mono">
                “From Steam Injection to Smarter Oil Recovery.”
              </p>
            </div>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              An intelligent decision-support platform for heavy-oil fields that connects reservoir response,
              steam injection, artificial lift, surface production, energy consumption, and maintenance
              intelligence in one synchronized digital twin.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-press interactive-lift flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-all shadow-lg shadow-amber-950/40 text-sm"
              >
                <span>Explore Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/field-digital-twin')}
                className="btn-press interactive-lift flex items-center gap-2 px-5 py-3 bg-[#151d2d] hover:bg-[#1c273c] border border-[#233149] text-slate-200 font-semibold rounded-lg transition-all text-sm"
              >
                <Box className="w-4 h-4 text-cyan-400" />
                <span>Open Field Digital Twin</span>
              </button>

              <button
                onClick={handleLoadDemo}
                className="btn-press interactive-lift flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-600/30 to-orange-600/30 hover:from-amber-600/50 hover:to-orange-600/50 border border-amber-500/40 text-amber-300 font-semibold rounded-lg transition-all text-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Load Demo Scenario</span>
              </button>
            </div>

            <div className="text-[11px] font-mono text-slate-500 flex items-center justify-center lg:justify-start gap-2">
              <span>Theme: Smart Automation</span>
              <span>•</span>
              <span>Category: Software</span>
              <span>•</span>
              <span>Rajasthan Heavy Oil</span>
            </div>
          </motion.div>

          {/* Right Visual: Technical Well-to-Surface Flow Schematic */}
          <AnimatedCard
            hoverLift
            className="flex-1 w-full max-w-lg bg-[#151d2d] border border-[#233149] rounded-md p-5 shadow-xl relative"
          >
            <div className="text-xs font-mono font-bold text-amber-400 mb-2 flex items-center justify-between border-b border-[#233149] pb-2">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span>STEAM INJECTION TO SMARTER OIL RECOVERY</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono px-1.5 py-0.5 rounded bg-[#101622] border border-[#233149]">
                Baghewala CSS-SRP Loop
              </span>
            </div>

            {/* SVG Visual Flow Schematic */}
            <svg viewBox="0 0 400 310" className="w-full h-auto drop-shadow-md bg-[#0a0e17]/80 rounded p-1 border border-[#1c273c]">
              <defs>
                <linearGradient id="flowSteam" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ea580c" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
                <linearGradient id="flowOil" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#d4b483" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>

              {/* Step 1: Surface Steam Generator (OTSG) */}
              <rect x="15" y="15" width="110" height="46" rx="4" fill="#151e2e" stroke="#ea580c" strokeWidth="1.5" />
              <text x="70" y="32" fill="#f8fafc" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                1. Steam Generation
              </text>
              <text x="70" y="44" fill="#ea580c" fontSize="7.5" fontFamily="monospace" textAnchor="middle">
                OTSG: 18 t/h • 40 bar
              </text>
              <text x="70" y="54" fill="#94a3b8" fontSize="6.5" fontFamily="monospace" textAnchor="middle">
                80% Dryness Quality
              </text>

              {/* Steam Injection Line (Downward flow) */}
              <path d="M 125 38 L 180 38 L 180 225" fill="none" stroke="url(#flowSteam)" strokeWidth="3" strokeDasharray="5 3" className="animate-fluid-flow-down" />

              {/* Wellbore Column */}
              <rect x="172" y="65" width="16" height="175" fill="#0f172a" stroke="#475569" strokeWidth="1.2" />

              {/* Step 2: Heated Reservoir Zone */}
              <ellipse cx="200" cy="245" rx="145" ry="38" fill="#dc2626" fillOpacity="0.2" stroke="#ea580c" strokeWidth="1.5" strokeDasharray="4 2" className="animate-thermal-glow" />
              <text x="200" y="246" fill="#fca5a5" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                2. HEATED RESERVOIR ZONE (182°C • 920 cP)
              </text>
              <text x="200" y="258" fill="#cbd5e1" fontSize="7" fontFamily="monospace" textAnchor="middle">
                Andrade Viscosity Drop: 18,000 cP → 920 cP
              </text>

              {/* Step 3: Downhole Sucker Rod Pump */}
              <rect x="210" y="190" width="12" height="38" rx="2" fill="#1e293b" stroke="#10b981" strokeWidth="1.2" />
              <line x1="216" y1="65" x2="216" y2="190" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* Surface Beam Pump Unit */}
              <polygon points="205,65 216,30 227,65" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
              <line x1="168" y1="26" x2="245" y2="34" stroke="#d4b483" strokeWidth="3" />
              <text x="216" y="20" fill="#d4b483" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                3. SRP Artificial Lift
              </text>

              {/* Liquid Lift Upward Flow through Tubing */}
              <path d="M 216 190 L 216 65 L 290 65 L 290 38" fill="none" stroke="url(#flowOil)" strokeWidth="2.5" strokeDasharray="6 3" className="animate-fluid-flow" />

              {/* Step 4: Surface Separator & Storage */}
              <rect x="285" y="15" width="100" height="46" rx="4" fill="#151e2e" stroke="#0891b2" strokeWidth="1.5" />
              <text x="335" y="32" fill="#f8fafc" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                4. Surface Separation
              </text>
              <text x="335" y="44" fill="#0891b2" fontSize="7.5" fontFamily="monospace" textAnchor="middle">
                Net Oil: 426 BOPD
              </text>
              <text x="335" y="54" fill="#94a3b8" fontSize="6.5" fontFamily="monospace" textAnchor="middle">
                Water Cut: 74% • Gas: 2.1 Mscf
              </text>
            </svg>

            {/* Clear Industrial Legend */}
            <div className="mt-3 grid grid-cols-2 gap-2 p-2 bg-[#101622] rounded border border-[#233149] text-[10px] font-mono">
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
                <span>Steam Injection (40 bar, 250°C)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0" />
                <span>Heavy Crude Production</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 shrink-0" />
                <span>Thermal Soak (Viscosity Drop)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                <span>SRP Dynamometer Monitoring</span>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </header>

      {/* Section 1: Official Problem Statement Context */}
      <section className="py-16 px-4 md:px-8 border-b border-[#233149] bg-[#0d121c]">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Section Header with Official Title */}
          <div className="text-center max-w-4xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Official Problem Statement Context • Oil India Limited</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-100 font-mono tracking-tight leading-snug">
              Digital Twin for Well-to-Surface Optimization of Cyclic Steam Stimulation (CSS) and Sucker Rod Pump (SRP) Operations for Heavy Oil Wells of Baghewala Field
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl mx-auto">
              Heavy oil recovery in the Jodhpur Sandstone requires synchronizing downhole thermal diffusion with surface beam lift kinematics. Thermoflow Intelligence bridges isolated operational silos to deliver predictive, closed-loop decision support.
            </p>
          </div>

          {/* 4 Core Background Detail Cards */}
          <StaggeredContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" staggerDelay={0.07}>
            {problemPillars.map((p) => {
              const Icon = p.icon;
              return (
                <AnimatedCard
                  key={p.title}
                  hoverLift
                  className="bg-[#151d2d] border border-[#233149] hover:border-amber-500/50 p-4 rounded-md transition-all space-y-3 flex flex-col justify-between shadow-sm group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${p.tagColor}`}>
                        {p.badge}
                      </span>
                      <div className="w-7 h-7 rounded bg-[#101622] border border-[#233149] flex items-center justify-center text-slate-300 group-hover:scale-110 transition-transform">
                        <Icon className="w-4 h-4 text-amber-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 font-mono">{p.title}</h3>
                      <div className="text-[11px] font-mono text-amber-400 font-medium">{p.subtitle}</div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{p.desc}</p>
                  </div>
                  <div className="pt-2 border-t border-[#233149]/80 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Key Metric:</span>
                    <span className={`font-bold ${p.metricColor}`}>{p.metric}</span>
                  </div>
                </AnimatedCard>
              );
            })}
          </StaggeredContainer>

          {/* Parameters to Optimize Simultaneously (SCADA Grid Panel) */}
          <div className="bg-[#101622] border border-[#233149] rounded-md p-6 space-y-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#233149] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">
                    Parameters to Optimize Simultaneously
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Core decision variables continuously calculated and tuned across cyclic thermal and artificial lift lifecycles.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 font-semibold">
                Coupled Multi-Objective Target
              </span>
            </div>

            <StaggeredContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5" staggerDelay={0.06}>
              {optimizationParameters.map((param) => {
                const Icon = param.icon;
                return (
                  <AnimatedCard
                    key={param.param}
                    hoverLift
                    className="bg-[#151d2d] border border-[#233149] hover:border-slate-500 p-3.5 rounded-md space-y-2 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">
                        {param.category}
                      </span>
                      <Icon className={`w-4 h-4 ${param.color}`} />
                    </div>
                    <div>
                      <div className="text-sm font-bold font-mono text-slate-100">{param.param}</div>
                      <div className={`text-xs font-mono font-semibold ${param.color} mt-0.5`}>
                        {param.value}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">{param.desc}</p>
                  </AnimatedCard>
                );
              })}
            </StaggeredContainer>
          </div>
        </div>
      </section>

      {/* Section 2: Why CSS & SRP Must Be Optimized Together */}
      <section className="py-16 px-4 md:px-8 border-b border-[#233149] bg-[#101622]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider">
              System-Level Synergy
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono">
              Why CSS and SRP Must Be Synchronized
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              When reservoir teams design steam slugs without artificial lift visibility, pumps either face
              damaging gas interference and fluid pound during early drawdowns, or suffer chronic mechanical
              overloads when lifting unheated viscous fluids.
            </p>
            <div className="space-y-3 text-xs text-slate-300 pt-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Thermal Conformance to Lift Capacity:</strong> Tune stroke length and SPM to match
                  the post-soak thermal mobility curve, preventing severe rod drag and premature pump seizure.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Economic Cut-Off Timing:</strong> Detect when thermal dissipation causes crude
                  viscosity to rebound, triggering the next CSS cycle before lifting energy costs outstrip oil revenue.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Steam Allocation Prioritization:</strong> Allocate precious boiler steam to wells
                  with verified artificial lift integrity and the highest potential thermal uplift.
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#151d2d] border border-[#233149] rounded-md p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-amber-400 font-mono uppercase tracking-wider">
              Closed-Loop Optimization Impact (Simulated Multi-Well Field Model)
            </h3>
            <StaggeredContainer className="grid grid-cols-2 gap-3.5" staggerDelay={0.06}>
              <AnimatedCard hoverLift className="bg-[#101622] p-3.5 rounded-md border border-[#233149]">
                <div className="text-2xl font-extrabold font-mono text-emerald-400">+28%</div>
                <div className="text-xs text-slate-200 font-medium mt-1">Recovery Acceleration</div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Synchronized thermal lift</div>
              </AnimatedCard>
              <AnimatedCard hoverLift className="bg-[#101622] p-3.5 rounded-md border border-[#233149]">
                <div className="text-2xl font-extrabold font-mono text-cyan-400">-18%</div>
                <div className="text-xs text-slate-200 font-medium mt-1">Energy Intensity (GJ/bbl)</div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Boiler fuel conservation</div>
              </AnimatedCard>
              <AnimatedCard hoverLift className="bg-[#101622] p-3.5 rounded-md border border-[#233149]">
                <div className="text-2xl font-extrabold font-mono text-amber-400">-42%</div>
                <div className="text-xs text-slate-200 font-medium mt-1">SRP Rod Stress Failures</div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Harmonic load suppression</div>
              </AnimatedCard>
              <AnimatedCard hoverLift className="bg-[#101622] p-3.5 rounded-md border border-[#233149]">
                <div className="text-2xl font-extrabold font-mono text-purple-400">100%</div>
                <div className="text-xs text-slate-200 font-medium mt-1">Digital Traceability</div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Full audit trail & logs</div>
              </AnimatedCard>
            </StaggeredContainer>
          </div>
        </div>
      </section>

      {/* Section 3: Operational Architecture (Enterprise SCADA Dashboard Style) */}
      <section className="py-16 px-4 md:px-8 border-b border-[#233149] bg-[#0d121c]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider">
              Operational Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono">
              Monitor → Model → Simulate → Optimize → Recommend → Review
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              The continuous intelligent loop driving decision support across all 8 Baghewala wells.
            </p>
          </div>

          <StaggeredContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3" staggerDelay={0.08}>
            {workflowSteps.map((ws) => (
              <AnimatedCard
                key={ws.step}
                hoverLift
                className="bg-[#151d2d] border border-[#233149] hover:border-amber-500/50 p-4 rounded-md space-y-2 relative overflow-hidden transition-all shadow-sm group"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent group-hover:via-amber-400 transition-colors" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-extrabold text-amber-500/50 group-hover:text-amber-400 transition-colors">
                    {ws.step}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-[#101622] border border-[#233149]">
                    {ws.subtitle}
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-slate-100 pt-1 flex items-center justify-between">
                  <span>{ws.title}</span>
                  <ArrowRight className="w-3 h-3 text-amber-500/40 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{ws.desc}</p>
              </AnimatedCard>
            ))}
          </StaggeredContainer>
        </div>
      </section>

      {/* Footer / Safety Disclaimer (Clean, Dynamic Current Year) */}
      <footer className="py-10 px-4 md:px-8 bg-[#0a0d14] text-center space-y-4 border-t border-[#233149]">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-mono shadow-sm">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>PROTOTYPE NOTICE: Synthetic Field Data — Read-Only Decision Support Only</span>
        </div>
        <p className="text-xs text-slate-400 max-w-2xl mx-auto leading-relaxed">
          THERMOFLOW INTELLIGENCE is an enterprise decision-support platform designed for operational modeling and decision
          support. It does not establish real-time connections to Oil India Limited SCADA/DCS systems or send
          automated control signals to physical industrial equipment.
        </p>
        <div className="text-xs font-mono text-slate-400 font-medium">
          © {new Date().getFullYear()} Thermoflow Intelligence • Oil India Limited
        </div>
      </footer>
    </div>
  );
};
