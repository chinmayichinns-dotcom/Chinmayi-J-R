import React from 'react';
import {
  Home,
  FilePlus,
  Search,
  LayoutDashboard,
  Flame,
  CheckSquare,
  Sparkles,
  Database,
  RefreshCw,
} from 'lucide-react';
import { NavView } from './Header';

interface SidebarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  stats: {
    total: number;
    pending: number;
    critical: number;
    inProgress: number;
    resolved: number;
  };
  onResetSampleData: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  stats,
  onResetSampleData,
}) => {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-65px)]">
      {/* Workspace Context */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          <span className="text-xs font-semibold text-slate-200 tracking-wide uppercase">
            Municipal Operations Center
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">Metropolitan District · City of Metro Pulse</p>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Citizen Services
        </div>

        <button
          onClick={() => onNavigate('home')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
            currentView === 'home'
              ? 'bg-sky-500/15 text-sky-400 font-semibold border-l-2 border-sky-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Home className="w-4 h-4 shrink-0" />
          <span className="truncate">Home & Overview</span>
        </button>

        <button
          onClick={() => onNavigate('portal')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
            currentView === 'portal'
              ? 'bg-sky-500/15 text-sky-400 font-semibold border-l-2 border-sky-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FilePlus className="w-4 h-4 shrink-0" />
          <span className="truncate">Report Complaint</span>
        </button>

        <button
          onClick={() => onNavigate('track')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
            currentView === 'track'
              ? 'bg-sky-500/15 text-sky-400 font-semibold border-l-2 border-sky-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Search className="w-4 h-4 shrink-0" />
          <span className="truncate">Track by Complaint ID</span>
        </button>

        <div className="pt-4 px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Authority Management
        </div>

        <button
          onClick={() => onNavigate('dashboard')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
            currentView === 'dashboard'
              ? 'bg-sky-500/15 text-sky-400 font-semibold border-l-2 border-sky-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-3 truncate">
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span className="truncate">Admin Dashboard</span>
          </div>
          <span className="font-mono text-[11px] tabular-nums text-slate-400">
            {stats.total}
          </span>
        </button>

        <button
          onClick={() => onNavigate('hotspots')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
            currentView === 'hotspots'
              ? 'bg-sky-500/15 text-sky-400 font-semibold border-l-2 border-sky-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-3 truncate">
            <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">AI Hotspots & Clusters</span>
          </div>
          <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/80 border border-amber-800/70 px-1.5 py-0.5 rounded">
            6 Zones
          </span>
        </button>

        <button
          onClick={() => onNavigate('manage')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
            currentView === 'manage'
              ? 'bg-sky-500/15 text-sky-400 font-semibold border-l-2 border-sky-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-3 truncate">
            <CheckSquare className="w-4 h-4 shrink-0" />
            <span className="truncate">Manage & Assign</span>
          </div>
          {stats.pending > 0 && (
            <span className="font-mono text-[11px] tabular-nums text-amber-400">
              {stats.pending}
            </span>
          )}
        </button>
      </div>

      {/* Quick Metrics Widget */}
      <div className="p-3 mx-3 mb-3 bg-slate-950/70 rounded-lg border border-slate-800 text-xs">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
          <span>Active Operations</span>
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <div className="text-slate-400">Critical</div>
            <div className="font-bold font-mono tabular-nums text-red-400 text-sm">
              {stats.critical}
            </div>
          </div>
          <div>
            <div className="text-slate-400">Resolved</div>
            <div className="font-bold font-mono tabular-nums text-emerald-400 text-sm">
              {stats.resolved}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Storage & Reset Controls */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Database className="w-3.5 h-3.5 text-slate-400" />
          <span>Local Demo Storage (Sync Active)</span>
        </div>
        <button
          onClick={onResetSampleData}
          className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 rounded border border-slate-700/80 transition-colors cursor-pointer"
          title="Restore original 32 synthetic hackathon sample complaints"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Sample Data</span>
        </button>
      </div>
    </aside>
  );
};
