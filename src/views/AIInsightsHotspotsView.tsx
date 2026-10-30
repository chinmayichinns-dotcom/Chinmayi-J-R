import React, { useState } from 'react';
import { Complaint, HotspotCluster } from '../types/civic';
import { InteractiveCityMap } from '../components/map/InteractiveCityMap';
import {
  Flame,
  Sparkles,
  ShieldAlert,
  GitMerge,
  MapPin,
  TrendingUp,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building2,
} from 'lucide-react';
import { DEPARTMENTS } from '../data/sampleComplaints';

interface AIInsightsHotspotsViewProps {
  complaints: Complaint[];
  hotspots: HotspotCluster[];
  onSelectComplaint: (complaint: Complaint) => void;
}

export const AIInsightsHotspotsView: React.FC<AIInsightsHotspotsViewProps> = ({
  complaints,
  hotspots,
  onSelectComplaint,
}) => {
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotCluster>(
    hotspots[0] || null
  );

  const totalDuplicates = complaints.filter((c) => c.duplicateOfId || c.isDuplicateFlagged).length;
  const criticalComplaints = complaints.filter((c) => c.priority === 'Critical');

  // Filter complaints in selected hotspot
  const hotspotComplaints = selectedHotspot
    ? complaints.filter((c) => selectedHotspot.complaintIds.includes(c.id))
    : [];

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              AI Hotspot & Recurring Problem Detection
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Autonomous spatial clustering identifies systemic infrastructure failures across municipal sectors
            </p>
          </div>
        </div>
      </div>

      {/* AI Executive Intelligence Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-red-50/70 border border-red-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>High-Priority Emergency Cluster</span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm">
            Oakridge School District Zone
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Severe cluster of missing manholes, sagging power lines, and damaged school bus lanes within 400m of elementary schools. Immediate physical perimeter securing deployed.
          </p>
          <div className="text-[11px] font-mono text-red-700 font-semibold pt-1">
            Status: Priority 1 Dispatch · 2 Field Squads Active
          </div>
        </div>

        <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-sky-700 font-bold text-xs uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>Infrastructure Chokepoint</span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm">
            Downtown 5th & Main Arterial Road
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Recurring pavement cave-in crater reported by multiple commuters. Cold-mix patch temporarily applied; scheduled for full-depth milling during off-peak weekend hours.
          </p>
          <div className="text-[11px] font-mono text-sky-700 font-semibold pt-1">
            Status: 3 Duplicates Merged · Work Order #DPWR-902
          </div>
        </div>

        <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-purple-700 font-bold text-xs uppercase tracking-wider">
            <GitMerge className="w-4 h-4" />
            <span>Duplicate Consolidation Efficiency</span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm">
            {totalDuplicates} Redundant Calls Filtered
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Automated Haversine geo-distance and NLP semantic matching merged duplicate citizen tickets, preventing redundant crew dispatches and saving an estimated 18 operational crew hours.
          </p>
          <div className="text-[11px] font-mono text-purple-700 font-semibold pt-1">
            Efficiency Score: 100% Duplicate Capture Accuracy
          </div>
        </div>
      </div>

      {/* Main Interactive Hotspot GIS Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Metropolitan GIS Spatial Hotspots Map
          </h2>
          <span className="text-xs text-slate-500">
            Click any pulsating hotspot ring to inspect aggregate complaints & action plan
          </span>
        </div>

        <InteractiveCityMap
          complaints={complaints}
          hotspots={hotspots}
          mode="hotspots"
          height="h-[460px]"
          activeHotspotId={selectedHotspot?.id}
          onSelectHotspot={(hs) => setSelectedHotspot(hs)}
          onSelectComplaint={onSelectComplaint}
        />
      </div>

      {/* Selected Hotspot Deep Dive Panel */}
      {selectedHotspot && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {selectedHotspot.id.toUpperCase()}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs font-semibold text-slate-700">
                  {selectedHotspot.ward}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500 font-mono">
                  Coordinates: {selectedHotspot.center.lat}, {selectedHotspot.center.lng}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                {selectedHotspot.name}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-slate-400">Severity Metric</div>
                <div className="text-2xl font-bold font-mono text-red-600 tabular-nums">
                  {selectedHotspot.severityScore} / 10
                </div>
              </div>
            </div>
          </div>

          {/* AI Civic Intervention Strategy */}
          <div className="bg-amber-50/80 rounded-xl p-5 border border-amber-200 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>AI Recommended Civic Intervention Strategy</span>
            </div>
            <p className="text-slate-800 leading-relaxed font-medium">
              {selectedHotspot.actionPlan}
            </p>
            <div className="text-amber-800 text-[11px] pt-1">
              Primary Lead Agency:{' '}
              <strong>
                {DEPARTMENTS.find((d) => d.categories.includes(selectedHotspot.dominantCategory))?.name ||
                  'Department of Public Works'}
              </strong>
            </div>
          </div>

          {/* Aggregated Complaints List in this Cluster */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Aggregated Complaints in this Geographic Zone ({hotspotComplaints.length})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {hotspotComplaints.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onSelectComplaint(c)}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sky-700">{c.id}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        c.priority === 'Critical'
                          ? 'bg-red-100 text-red-700'
                          : c.priority === 'High'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-sky-100 text-sky-700'
                      }`}
                    >
                      {c.priority}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-900 line-clamp-1">{c.title}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate">{c.location.address}</span>
                    <span className="font-semibold text-slate-700">{c.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
