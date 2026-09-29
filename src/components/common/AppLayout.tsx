import React from 'react';
import { Outlet } from 'react-router-dom';
import { Banner } from './Banner';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { TelemetryRunner } from './TelemetryRunner';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0e14] text-slate-100 transition-colors duration-200">
      <TelemetryRunner />
      <Banner />
      <Header />
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-85px)]">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-y-auto bg-[#0b0e14]">
          <main className="flex-1 p-4 md:p-6 space-y-6">
            <Outlet />
          </main>
          <footer className="py-3 px-6 border-t border-[#233149] bg-[#101622] text-xs font-mono text-slate-400 text-center select-none shrink-0 transition-colors">
            © {new Date().getFullYear()} Thermoflow Intelligence • Oil India Limited
          </footer>
        </div>
      </div>
    </div>
  );
};
