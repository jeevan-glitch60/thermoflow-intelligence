import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/common/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { FieldDigitalTwinPage } from './pages/FieldDigitalTwinPage';
import { WellPortfolioPage } from './pages/WellPortfolioPage';
import { CssOptimizerPage } from './pages/CssOptimizerPage';
import { SrpOptimizerPage } from './pages/SrpOptimizerPage';
import { TelemetryPage } from './pages/TelemetryPage';
import { SimulationPage } from './pages/SimulationPage';
import { PrioritizationPage } from './pages/PrioritizationPage';
import { AlertsPage } from './pages/AlertsPage';
import { EnergySteamPage } from './pages/EnergySteamPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SecurityPage } from './pages/SecurityPage';
import { SettingsPage } from './pages/SettingsPage';

import { AnimationProvider } from './components/common/AnimationWrapper';

export function App() {
  return (
    <AnimationProvider>
      <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Authenticated Operational Routes with AppLayout */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/field-digital-twin" element={<FieldDigitalTwinPage />} />
          <Route path="/wells" element={<WellPortfolioPage />} />
          <Route path="/css-optimizer" element={<CssOptimizerPage />} />
          <Route path="/srp-optimizer" element={<SrpOptimizerPage />} />
          <Route path="/telemetry" element={<TelemetryPage />} />
          <Route path="/simulation" element={<SimulationPage />} />
          <Route path="/prioritization" element={<PrioritizationPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/energy-steam" element={<EnergySteamPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      </BrowserRouter>
    </AnimationProvider>
  );
}

export default App;
