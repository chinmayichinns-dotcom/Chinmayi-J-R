import React from 'react';
import { Complaint, HotspotCluster } from '../types/civic';
import { NavView } from '../components/common/Header';
import {
  FilePlus,
  Search,
  LayoutDashboard,
  Flame,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Sparkles,
  GitMerge,
  MapPin,
  Building2,
  TrendingUp,
} from 'lucide-react';

interface HomeViewProps {
  complaints: Complaint[];
  hotspots: HotspotCluster[];
  onNavigate: (view: NavView) => void;
  onSelectComplaint: (complaint: Complaint) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  complaints,
  hotspots,
  onNavigate,
  onSelectComplaint,
}) => {
  const total = complaints.length;
  const critical = complaints.filter((c) => c.priority === 'Critical' && c.status !== 'Resolved').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress' || c.status === 'Assigned').length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;
  const duplicates = complaints.filter((c) => c.duplicateOfId || c.isDuplicateFlagged).length;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const duplicateRate = total > 0 ? Math.round((duplicates / total) * 100) : 0;

  const recentComplaints = [...complaints]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 rounded-2xl p-8 sm:p-12 text-white border border-slate-700/80 shadow-md relative overflow-hidden">
        {/* Background Subtle Grid Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/20 border border-sky-400/40 rounded-full text-xs font-semibold text-sky-300">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Smart City Operational Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            From Complaints to Action.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            An intelligent civic complaint management ecosystem that empowers citizens to report
            infrastructure hazards and enables municipal authorities to instantly triage, consolidate
            duplicates, and coordinate field resolutions.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('portal')}
              className="px-6 py-3 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <FilePlus className="w-4 h-4" />
              <span>Report Civic Problem</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => onNavigate('track')}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600/80 font-medium rounded-xl text-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Track Complaint Status</span>
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600/80 font-medium rounded-xl text-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4 text-sky-400" />
              <span>Admin Authority Console</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 mb-1">Total Reported</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">{total}</div>
          <div className="text-[11px] text-slate-400 mt-1">32 synthetic cases</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 mb-1">Critical Hazards</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-red-600">{critical}</div>
          <div className="text-[11px] text-red-500 mt-1 font-medium">&lt; 2h SLA Target</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 mb-1">Active Operations</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-sky-600">{inProgress}</div>
          <div className="text-[11px] text-slate-400 mt-1">Crews deployed</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 mb-1">Resolved Cases</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600">{resolved}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">{resolutionRate}% resolved</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 mb-1">Duplicate Redundancy</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-600">{duplicates}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">{duplicateRate}% consolidated</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 mb-1">GIS Hotspots</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-purple-600">{hotspots.length}</div>
          <div className="text-[11px] text-purple-700 font-medium mt-1">Recurring zones</div>
        </div>
      </div>

      {/* Mechanism-to-Outcome Pipeline Flow */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              CivicPulse AI Intelligent Operational Pipeline
            </h2>
            <p className="text-xs text-slate-500">
              How reports transform into coordinated civic resolutions with zero delay
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">
            Autonomous Triage Framework
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2">
          {/* Step 1 */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs space-y-2">
            <div className="w-7 h-7 rounded-md bg-sky-100 text-sky-700 font-bold flex items-center justify-center font-mono">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Citizen Intake</h3>
            <p className="text-slate-600 leading-relaxed">
              GPS geolocation pin, defect photos, address, and category selection across 6 municipal domains.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs space-y-2">
            <div className="w-7 h-7 rounded-md bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center font-mono">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Gemini AI Triage</h3>
            <p className="text-slate-600 leading-relaxed">
              Automated category validation, urgency scoring (Critical to Low), SLA estimation, and risk analysis.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs space-y-2">
            <div className="w-7 h-7 rounded-md bg-amber-100 text-amber-700 font-bold flex items-center justify-center font-mono">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Duplicate Merge</h3>
            <p className="text-slate-600 leading-relaxed">
              Haversine distance matching + semantic text similarity detects redundant calls and aggregates citizen weight.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs space-y-2">
            <div className="w-7 h-7 rounded-md bg-purple-100 text-purple-700 font-bold flex items-center justify-center font-mono">
              4
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Authority Dispatch</h3>
            <p className="text-slate-600 leading-relaxed">
              Direct routing to 1 of 5 municipal agencies (Roads, Water, Waste, Lighting, Safety) with officer assignment.
            </p>
          </div>

          {/* Step 5 */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs space-y-2">
            <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center font-mono">
              5
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Track & Resolve</h3>
            <p className="text-slate-600 leading-relaxed">
              Public tracking by complaint ID, timestamped audit notes, verified field photo proof, and SLA compliance.
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Hotspots Preview & Recent Intake */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hotspots Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-bold text-slate-900">
                  Critical Recurring Hotspot Zones
                </h2>
              </div>
              <button
                onClick={() => onNavigate('hotspots')}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Full Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Clusters where multiple complaints share geographic proximity and infrastructure patterns.
            </p>

            <div className="space-y-3 pt-1">
              {hotspots.slice(0, 3).map((hs) => (
                <div
                  key={hs.id}
                  onClick={() => onNavigate('hotspots')}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-100 transition-colors cursor-pointer text-xs"
                >
                  <div className="flex items-center justify-between font-semibold text-slate-900 mb-1">
                    <span>{hs.name}</span>
                    <span className="font-mono text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                      {hs.totalCount} reports ({hs.criticalCount} critical)
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px] line-clamp-1">{hs.actionPlan}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Aggregated across 6 municipal wards</span>
            <button
              onClick={() => onNavigate('hotspots')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-800 cursor-pointer"
            >
              Analyze Hotspots →
            </button>
          </div>
        </div>

        {/* Recent Intake Feed */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-500" />
                <h2 className="text-base font-bold text-slate-900">
                  Live Intake & Triage Activity
                </h2>
              </div>
              <button
                onClick={() => onNavigate('manage')}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Manage All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Real-time feed of recent citizen filings and automated priority determinations.
            </p>

            <div className="space-y-2.5 pt-1">
              {recentComplaints.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onSelectComplaint(c)}
                  className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-100 transition-colors cursor-pointer text-xs flex items-center justify-between gap-3"
                >
                  <div className="truncate">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono font-bold text-sky-700">{c.id}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-[11px] font-semibold text-slate-700">{c.category}</span>
                      <span className="text-slate-300">·</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          c.priority === 'Critical'
                            ? 'text-red-700 bg-red-100'
                            : c.priority === 'High'
                            ? 'text-amber-700 bg-amber-100'
                            : 'text-slate-700 bg-slate-200'
                        }`}
                      >
                        {c.priority}
                      </span>
                    </div>
                    <div className="text-slate-800 font-medium truncate">{c.title}</div>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400 shrink-0">
                    {new Date(c.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Instant click to inspect AI reasoning</span>
            <button
              onClick={() => onNavigate('dashboard')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-800 cursor-pointer"
            >
              View Analytics →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
