import React from 'react';
import { PlusCircle, ShieldAlert } from 'lucide-react';

export type NavView = 'home' | 'portal' | 'track' | 'dashboard' | 'hotspots' | 'manage';

interface HeaderProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  criticalCount: number;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, criticalCount }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('home')}
            className="text-left group flex items-center gap-2 cursor-pointer focus-visible:outline-hidden"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center font-bold text-white shadow-sm group-hover:bg-sky-400 transition-colors">
              CP
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
                CivicPulse AI
              </span>
              <span className="text-[10px] text-sky-400 tracking-wider font-semibold uppercase -mt-1">
                From Complaints to Action
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: 4-5 Clean Single-Line Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigate('home')}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors cursor-pointer pb-0.5 ${
              currentView === 'home' ? 'text-white border-b-2 border-sky-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('portal')}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors cursor-pointer pb-0.5 ${
              currentView === 'portal' ? 'text-white border-b-2 border-sky-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Citizen Portal
          </button>
          <button
            onClick={() => onNavigate('track')}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors cursor-pointer pb-0.5 ${
              currentView === 'track' ? 'text-white border-b-2 border-sky-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Track Status
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors cursor-pointer pb-0.5 ${
              currentView === 'dashboard' ? 'text-white border-b-2 border-sky-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Admin Dashboard
          </button>
          <button
            onClick={() => onNavigate('hotspots')}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors cursor-pointer pb-0.5 ${
              currentView === 'hotspots' ? 'text-white border-b-2 border-sky-400 font-semibold' : 'text-slate-400'
            }`}
          >
            AI Hotspots
          </button>
          <button
            onClick={() => onNavigate('manage')}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors cursor-pointer pb-0.5 ${
              currentView === 'manage' ? 'text-white border-b-2 border-sky-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Manage Triage
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {criticalCount > 0 && (
            <button
              onClick={() => onNavigate('dashboard')}
              title={`${criticalCount} active critical emergency complaints requiring action`}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-red-200 bg-red-950/80 border border-red-800/80 rounded-md hover:bg-red-900 transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>{criticalCount} Critical</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('portal')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-500 active:bg-sky-700 transition-colors shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Problem</span>
          </button>
        </div>
      </div>
    </header>
  );
};
