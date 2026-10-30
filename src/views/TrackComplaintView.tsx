import React, { useState } from 'react';
import { Complaint, ComplaintStatus } from '../types/civic';
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Building2,
  User,
  ThumbsUp,
  Sparkles,
  AlertCircle,
  GitMerge,
  ArrowRight,
} from 'lucide-react';

interface TrackComplaintViewProps {
  complaints: Complaint[];
  initialComplaintId?: string;
  onUpvoteComplaint: (id: string) => void;
  onSelectComplaintForDetail?: (complaint: Complaint) => void;
}

const SAMPLE_TRACK_IDS = [
  { id: 'CP-2026-1001', label: 'CP-1001 (Critical Safety · In Progress)' },
  { id: 'CP-2026-1002', label: 'CP-1002 (Road Pothole · Has Duplicates)' },
  { id: 'CP-2026-1009', label: 'CP-1009 (Resolved Trip Hazard)' },
  { id: 'CP-2026-1014', label: 'CP-1014 (Merged Duplicate)' },
  { id: 'CP-2026-1007', label: 'CP-1007 (Fallen Live Wire)' },
];

const LIFECYCLE_STEPS: { status: ComplaintStatus; label: string; desc: string }[] = [
  { status: 'Submitted', label: 'Submitted', desc: 'Citizen report received' },
  { status: 'Under Review', label: 'Under Review', desc: 'AI triage & verification' },
  { status: 'Assigned', label: 'Assigned', desc: 'Department unit designated' },
  { status: 'In Progress', label: 'In Progress', desc: 'Field crew active on site' },
  { status: 'Resolved', label: 'Resolved', desc: 'Repair verified & closed' },
];

export const TrackComplaintView: React.FC<TrackComplaintViewProps> = ({
  complaints,
  initialComplaintId = '',
  onUpvoteComplaint,
  onSelectComplaintForDetail,
}) => {
  const [searchInput, setSearchInput] = useState(initialComplaintId || 'CP-2026-1001');
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(() => {
    const found = complaints.find(
      (c) => c.id.toUpperCase() === (initialComplaintId || 'CP-2026-1001').toUpperCase()
    );
    return found || complaints[0] || null;
  });

  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim().toUpperCase();
    if (!query) return;

    const found = complaints.find((c) => c.id.toUpperCase() === query);
    if (found) {
      setActiveComplaint(found);
      setNotFound(false);
      setHasUpvoted(false);
    } else {
      setNotFound(true);
    }
  };

  const handleSelectSample = (id: string) => {
    setSearchInput(id);
    const found = complaints.find((c) => c.id.toUpperCase() === id.toUpperCase());
    if (found) {
      setActiveComplaint(found);
      setNotFound(false);
      setHasUpvoted(false);
    }
  };

  const handleUpvote = () => {
    if (!activeComplaint || hasUpvoted) return;
    onUpvoteComplaint(activeComplaint.id);
    setHasUpvoted(true);
    activeComplaint.upvotes = (activeComplaint.upvotes || 0) + 1;
  };

  // Calculate current step index
  const getStepIndex = (status: ComplaintStatus): number => {
    switch (status) {
      case 'Submitted':
        return 0;
      case 'Under Review':
        return 1;
      case 'Assigned':
        return 2;
      case 'In Progress':
        return 3;
      case 'Resolved':
        return 4;
      default:
        return 0;
    }
  };

  const currentStep = activeComplaint ? getStepIndex(activeComplaint.status) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Search Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Citizen Complaint Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track real-time municipal triage status, assigned field squads, and resolution progress
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter Complaint ID (e.g. CP-2026-1001)..."
              className="w-full text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 focus:bg-white focus:outline-sky-500 uppercase transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Track Status
          </button>
        </form>

        {/* Quick Sample Selector */}
        <div className="pt-2 flex items-center gap-2 flex-wrap text-xs">
          <span className="font-semibold text-slate-500">Demo Quick Picker:</span>
          {SAMPLE_TRACK_IDS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelectSample(sample.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
                activeComplaint?.id === sample.id
                  ? 'bg-sky-600 text-white font-semibold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {sample.id}
            </button>
          ))}
        </div>
      </div>

      {notFound && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-6 text-center space-y-2 text-xs">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
          <h3 className="text-sm font-bold text-amber-900">Complaint ID Not Found</h3>
          <p className="text-amber-800">
            No complaint was found matching "{searchInput}". Please verify the ID or choose one of the sample cases above.
          </p>
        </div>
      )}

      {/* Active Complaint Inspector */}
      {activeComplaint && !notFound && (
        <div className="space-y-6">
          {/* Main Status & Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xs">
            {/* Top metadata */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                    {activeComplaint.id}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs font-semibold text-slate-700">
                    {activeComplaint.category}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500">
                    {activeComplaint.location.ward}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {activeComplaint.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {activeComplaint.location.address}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(activeComplaint.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Upvote / Community Support Action */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleUpvote}
                  disabled={hasUpvoted}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    hasUpvoted
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                  title="Upvote if you are also experiencing this civic issue"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{activeComplaint.upvotes || 1} Citizens Affected</span>
                </button>
              </div>
            </div>

            {/* Merged Duplicate Notice if applicable */}
            {activeComplaint.duplicateOfId && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-purple-900">
                  <GitMerge className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>
                    This complaint was flagged as a duplicate and merged into master ticket{' '}
                    <strong className="font-mono">{activeComplaint.duplicateOfId}</strong>. Progress is tracked centrally.
                  </span>
                </div>
                <button
                  onClick={() => handleSelectSample(activeComplaint.duplicateOfId!)}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold cursor-pointer shrink-0"
                >
                  View Master Ticket
                </button>
              </div>
            )}

            {/* Lifecycle Progress Stepper */}
            <div className="py-4 border-y border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Resolution Lifecycle Progress
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {LIFECYCLE_STEPS.map((step, idx) => {
                  const isDone = idx < currentStep;
                  const isCurrent = idx === currentStep;

                  return (
                    <div
                      key={step.status}
                      className={`p-3 rounded-xl border text-xs transition-colors ${
                        isCurrent
                          ? 'bg-sky-50 border-sky-400 text-sky-950 font-medium shadow-2xs'
                          : isDone
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] font-bold">0{idx + 1}</span>
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : isCurrent ? (
                          <Clock className="w-3.5 h-3.5 text-sky-600 animate-spin" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                        )}
                      </div>
                      <div className="font-bold text-xs">{step.label}</div>
                      <div className="text-[10px] mt-0.5 opacity-80">{step.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description & AI Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Citizen Filing
                </span>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-800 leading-relaxed">
                  {activeComplaint.description}
                </div>
              </div>

              {activeComplaint.aiAnalysis && (
                <div className="space-y-2">
                  <span className="font-bold text-sky-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                    AI Triage Assessment
                  </span>
                  <div className="bg-sky-50/80 p-4 rounded-xl border border-sky-200 space-y-2">
                    <p className="text-slate-800 font-medium">
                      {activeComplaint.aiAnalysis.summary}
                    </p>
                    <div className="pt-2 border-t border-sky-100 text-slate-600 space-y-1 text-[11px]">
                      <div>
                        <strong>Responsible Agency:</strong>{' '}
                        {activeComplaint.assignedDepartment || activeComplaint.aiAnalysis.responsibleDepartment}
                      </div>
                      <div>
                        <strong>Target Turnaround SLA:</strong>{' '}
                        {activeComplaint.aiAnalysis.estimatedSLA}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action History / Dispatch Notes */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Official Incident Timeline & Notes
              </div>

              <div className="space-y-2">
                {activeComplaint.actionNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 text-xs flex items-start justify-between gap-4"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-800">
                        {note.author} <span className="text-slate-400 font-normal">({note.role})</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{note.note}</p>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400 shrink-0">
                      {new Date(note.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
