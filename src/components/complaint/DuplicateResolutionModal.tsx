import React from 'react';
import { Complaint, DuplicateMatch } from '../../types/civic';
import { GitMerge, Check, AlertCircle, X, MapPin, Calendar, ArrowRight } from 'lucide-react';

interface DuplicateResolutionModalProps {
  currentComplaint: Complaint | null;
  existingCandidate: Complaint | null;
  matchInfo: DuplicateMatch | null;
  onClose: () => void;
  onConfirmMerge: (duplicateId: string, parentId: string) => void;
  onDismissDuplicate: (duplicateId: string, targetId: string) => void;
}

export const DuplicateResolutionModal: React.FC<DuplicateResolutionModalProps> = ({
  currentComplaint,
  existingCandidate,
  matchInfo,
  onClose,
  onConfirmMerge,
  onDismissDuplicate,
}) => {
  if (!currentComplaint || !existingCandidate || !matchInfo) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-amber-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
              <GitMerge className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                AI Duplicate Resolution Engine
              </h2>
              <p className="text-xs text-amber-800">
                Compare suspected redundant reports and choose whether to merge tickets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diagnostic Metrics Bar */}
        <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between flex-wrap gap-4 text-xs font-mono">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-slate-400">Match Confidence:</span>{' '}
              <span className="text-amber-400 font-bold text-sm">
                {matchInfo.similarityScore}%
              </span>
            </div>
            <div>
              <span className="text-slate-400">Geographic Proximity:</span>{' '}
              <span className="text-sky-300 font-bold">
                {matchInfo.distanceMeters} meters
              </span>
            </div>
            <div>
              <span className="text-slate-400">Category Correlation:</span>{' '}
              <span className={matchInfo.sameCategory ? 'text-emerald-400' : 'text-slate-300'}>
                {matchInfo.sameCategory ? 'Exact Match' : 'Adjacent Category'}
              </span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-sans">
            Algorithm: Haversine Geo-Radius + Semantic Token Overlap
          </div>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1: Incoming / Flagged Complaint */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-700 font-mono">
                {currentComplaint.id} (Under Review)
              </span>
              <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold">
                Incoming Report
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-900 leading-snug">
              {currentComplaint.title}
            </h3>

            <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed flex-1">
              {currentComplaint.description}
            </div>

            <div className="text-xs space-y-1 text-slate-600 pt-2 border-t border-slate-200">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium">{currentComplaint.location.address}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {new Date(currentComplaint.createdAt).toLocaleString(undefined, {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Reporter:{' '}
                {currentComplaint.isAnonymous
                  ? 'Anonymous'
                  : currentComplaint.citizenName || 'Resident'}
              </div>
            </div>
          </div>

          {/* Column 2: Existing Master Complaint */}
          <div className="bg-sky-50/60 rounded-xl p-5 border border-sky-200 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-800 font-mono">
                {existingCandidate.id} (Primary Master)
              </span>
              <span className="text-xs bg-sky-200 text-sky-800 px-2 py-0.5 rounded font-semibold">
                Active Master Record
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-900 leading-snug">
              {existingCandidate.title}
            </h3>

            <div className="bg-white p-3 rounded-lg border border-sky-100 text-xs text-slate-700 leading-relaxed flex-1">
              {existingCandidate.description}
            </div>

            <div className="text-xs space-y-1 text-slate-600 pt-2 border-t border-sky-200">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium">{existingCandidate.location.address}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {new Date(existingCandidate.createdAt).toLocaleString(undefined, {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Status: <strong className="text-slate-800">{existingCandidate.status}</strong> ·
                Assigned: {existingCandidate.assignedDepartment || 'Pending'}
              </div>
            </div>
          </div>
        </div>

        {/* AI Rationale Box */}
        <div className="px-6 py-3 bg-amber-50/90 border-t border-amber-200 text-xs text-amber-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold">AI Comparison Rationale:</strong>{' '}
            {matchInfo.reason}. Merging will link the citizen report to master record{' '}
            <span className="font-mono font-bold">{existingCandidate.id}</span>, consolidate
            community impact metrics, and prevent duplicate field crew dispatch.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
          <button
            onClick={() => onDismissDuplicate(currentComplaint.id, existingCandidate.id)}
            className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark as Distinct Incident (Do Not Merge)</span>
          </button>

          <button
            onClick={() => onConfirmMerge(currentComplaint.id, existingCandidate.id)}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <GitMerge className="w-4 h-4" />
            <span>Confirm Duplicate & Merge into #{existingCandidate.id}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
