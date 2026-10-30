import React, { useState } from 'react';
import {
  Complaint,
  ComplaintStatus,
  ComplaintCategory,
  DuplicateMatch,
} from '../types/civic';
import { DEPARTMENTS } from '../data/sampleComplaints';
import {
  CheckSquare,
  GitMerge,
  Filter,
  Search,
  User,
  Building,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Clock,
  Check,
} from 'lucide-react';

interface ManageComplaintsViewProps {
  complaints: Complaint[];
  onSelectComplaint: (complaint: Complaint) => void;
  onUpdateStatus: (id: string, newStatus: ComplaintStatus, note?: string) => void;
  onAssignDepartment: (id: string, department: string, officer: string, note?: string) => void;
  onOpenDuplicateResolution: (complaint: Complaint) => void;
}

export const ManageComplaintsView: React.FC<ManageComplaintsViewProps> = ({
  complaints,
  onSelectComplaint,
  onUpdateStatus,
  onAssignDepartment,
  onOpenDuplicateResolution,
}) => {
  const [activeTab, setActiveTab] = useState<'triage' | 'duplicates' | 'all'>('triage');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Filter complaints flagged with duplicate candidates
  const duplicateFlaggedComplaints = complaints.filter(
    (c) =>
      c.aiAnalysis?.duplicateCandidates &&
      c.aiAnalysis.duplicateCandidates.length > 0 &&
      !c.duplicateOfId
  );

  // Filter complaints needing assignment or review
  const triageQueueComplaints = complaints.filter(
    (c) => c.status === 'Submitted' || c.status === 'Under Review' || c.status === 'Assigned'
  );

  // List based on active tab
  const baseList =
    activeTab === 'duplicates'
      ? duplicateFlaggedComplaints
      : activeTab === 'triage'
      ? triageQueueComplaints
      : complaints;

  const filteredList = baseList.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.location.address.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-sky-700 text-white flex items-center justify-center font-bold shadow-xs">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Complaint Management & Field Dispatch
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Assign authority departments, transition lifecycle statuses, and confirm duplicate merges
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 flex-wrap">
          <button
            onClick={() => setActiveTab('triage')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'triage'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Active Triage Queue ({triageQueueComplaints.length})
          </button>

          <button
            onClick={() => setActiveTab('duplicates')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'duplicates'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <GitMerge className="w-3.5 h-3.5" />
            <span>Duplicate Review ({duplicateFlaggedComplaints.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Master Records ({complaints.length})
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by ID, keywords, street..."
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-800 focus:outline-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-700 text-xs focus:outline-sky-500 font-medium"
          >
            <option value="all">All</option>
            <option value="Roads">Roads</option>
            <option value="Waterlogging">Waterlogging</option>
            <option value="Waste Management">Waste Management</option>
            <option value="Drainage">Drainage</option>
            <option value="Streetlights">Streetlights</option>
            <option value="Public Safety">Public Safety</option>
          </select>
        </div>
      </div>

      {/* Complaints List / Cards */}
      <div className="space-y-4">
        {filteredList.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
            No complaints found matching the selected filter.
          </div>
        ) : (
          filteredList.map((c) => {
            const hasDuplicateCandidate =
              c.aiAnalysis?.duplicateCandidates && c.aiAnalysis.duplicateCandidates.length > 0;
            const topCandidate = hasDuplicateCandidate ? c.aiAnalysis!.duplicateCandidates[0] : null;

            return (
              <div
                key={c.id}
                className={`bg-white rounded-xl border p-5 shadow-2xs hover:border-slate-300 transition-all ${
                  c.priority === 'Critical' && c.status !== 'Resolved'
                    ? 'border-red-200 bg-red-50/15'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Complaint Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-sky-700">{c.id}</span>
                      <span className="text-slate-300">·</span>
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
                      <span className="text-slate-300">·</span>
                      <span className="text-xs font-semibold text-slate-700">{c.category}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-500">{c.location.ward}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {c.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {c.description}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1 flex-wrap">
                      <span>Address: <strong className="text-slate-700">{c.location.address}</strong></span>
                      <span>·</span>
                      <span>Assigned: <strong className="text-slate-700">{c.assignedDepartment || 'Unassigned'}</strong></span>
                      {c.assignedOfficer && (
                        <>
                          <span>·</span>
                          <span>Officer: <strong className="text-slate-700">{c.assignedOfficer}</strong></span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Interactive Fast Action Controls */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">Status:</span>
                      <select
                        value={c.status}
                        onChange={(e) =>
                          onUpdateStatus(
                            c.id,
                            e.target.value as ComplaintStatus,
                            `Administrator fast status update to ${e.target.value}.`
                          )
                        }
                        className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-sky-500 cursor-pointer"
                      >
                        <option value="Submitted">Submitted</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Assigned">Assigned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      {hasDuplicateCandidate && !c.duplicateOfId && (
                        <button
                          onClick={() => onOpenDuplicateResolution(c)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <GitMerge className="w-3.5 h-3.5" />
                          <span>Resolve Duplicate ({topCandidate?.similarityScore}%)</span>
                        </button>
                      )}

                      <button
                        onClick={() => onSelectComplaint(c)}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Inspect & Assign
                      </button>
                    </div>
                  </div>
                </div>

                {/* Duplicate Notification Bar if present */}
                {topCandidate && !c.duplicateOfId && (
                  <div className="mt-3 pt-3 border-t border-amber-200/80 bg-amber-50/50 -mx-5 -mb-5 px-5 py-2.5 rounded-b-xl flex items-center justify-between text-xs text-amber-900">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>
                        Suspected duplicate of <strong>{topCandidate.existingComplaintId}</strong> ({topCandidate.distanceMeters}m away). Confidence: {topCandidate.similarityScore}%.
                      </span>
                    </div>
                    <button
                      onClick={() => onOpenDuplicateResolution(c)}
                      className="font-semibold text-amber-800 hover:underline cursor-pointer"
                    >
                      Compare Details →
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
