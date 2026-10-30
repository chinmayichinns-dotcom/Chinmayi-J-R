import React, { useState } from 'react';
import {
  Complaint,
  ComplaintStatus,
  PriorityLevel,
  ActionNote,
} from '../../types/civic';
import { DEPARTMENTS } from '../../data/sampleComplaints';
import {
  X,
  MapPin,
  Clock,
  Sparkles,
  ShieldAlert,
  Building,
  User,
  Send,
  AlertTriangle,
  GitMerge,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface ComplaintDetailModalProps {
  complaint: Complaint | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: ComplaintStatus, note?: string) => void;
  onAssignDepartment: (id: string, department: string, officer: string, note?: string) => void;
  onAddNote: (id: string, author: string, role: ActionNote['role'], note: string) => void;
  onOpenDuplicateModal?: (complaint: Complaint) => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  onClose,
  onUpdateStatus,
  onAssignDepartment,
  onAddNote,
  onOpenDuplicateModal,
}) => {
  if (!complaint) return null;

  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>(complaint.status);
  const [selectedDept, setSelectedDept] = useState<string>(
    complaint.assignedDepartment || DEPARTMENTS[0].name
  );
  const [officerName, setOfficerName] = useState<string>(complaint.assignedOfficer || '');
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>('Admin Vance');

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStatus !== complaint.status) {
      onUpdateStatus(
        complaint.id,
        selectedStatus,
        `Status updated from ${complaint.status} to ${selectedStatus}.`
      );
    }
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDept) {
      onAssignDepartment(
        complaint.id,
        selectedDept,
        officerName || 'Duty Dispatch Officer',
        `Assigned to ${selectedDept} (${officerName || 'Duty Dispatch Officer'}).`
      );
    }
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddNote(complaint.id, authorName, 'Administrator', newNoteText.trim());
    setNewNoteText('');
  };

  const priorityColor =
    complaint.priority === 'Critical'
      ? 'text-red-700 bg-red-50 border-red-200'
      : complaint.priority === 'High'
      ? 'text-amber-700 bg-amber-50 border-amber-200'
      : complaint.priority === 'Medium'
      ? 'text-sky-700 bg-sky-50 border-sky-200'
      : 'text-slate-700 bg-slate-50 border-slate-200';

  const statusColor =
    complaint.status === 'Resolved'
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : complaint.status === 'In Progress'
      ? 'text-blue-700 bg-blue-50 border-blue-200'
      : complaint.status === 'Assigned'
      ? 'text-purple-700 bg-purple-50 border-purple-200'
      : 'text-amber-700 bg-amber-50 border-amber-200';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between bg-slate-50/70 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-mono text-xs font-bold text-sky-700 tracking-wider">
                {complaint.id}
              </span>
              <span className="text-slate-300">·</span>
              <span className={`text-xs px-2 py-0.5 font-semibold rounded-md border ${priorityColor}`}>
                {complaint.priority} Priority
              </span>
              <span className="text-slate-300">·</span>
              <span className={`text-xs px-2 py-0.5 font-semibold rounded-md border ${statusColor}`}>
                {complaint.status}
              </span>
              {complaint.duplicateOfId && (
                <span className="text-xs px-2 py-0.5 font-semibold rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                  Merged into {complaint.duplicateOfId}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-snug">
              {complaint.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
              <span className="font-medium text-slate-700">{complaint.category}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {complaint.location.address} ({complaint.location.ward})
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(complaint.createdAt).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Description & Citizen Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Citizen Description
            </h3>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-sm text-slate-800 leading-relaxed">
              {complaint.description}
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>
                Reported by:{' '}
                <strong className="font-semibold text-slate-700">
                  {complaint.isAnonymous ? 'Anonymous Citizen' : complaint.citizenName || 'Verified Resident'}
                </strong>
              </span>
              {complaint.citizenEmail && (
                <>
                  <span>·</span>
                  <span>{complaint.citizenEmail}</span>
                </>
              )}
              <span>·</span>
              <span className="font-mono tabular-nums text-sky-600 font-semibold">
                {complaint.upvotes || 1} citizens affected
              </span>
            </div>
          </div>

          {/* AI Complaint Analysis Card */}
          {complaint.aiAnalysis && (
            <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-sky-600 text-white flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-sm font-bold text-sky-950">
                    AI Municipal Triage Intelligence
                  </h4>
                </div>
                <span className="text-[11px] font-mono font-medium text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded">
                  {complaint.aiAnalysis.modelUsed || 'CivicPulse Triage Model'}
                </span>
              </div>

              {/* Summary */}
              <div>
                <div className="text-[11px] font-bold text-sky-800 uppercase tracking-wider mb-1">
                  Executive Briefing
                </div>
                <p className="text-sm text-slate-800 font-medium">
                  {complaint.aiAnalysis.summary}
                </p>
              </div>

              {/* Priority Explanation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/80 p-3 rounded-lg border border-sky-100 text-xs">
                  <span className="font-bold text-slate-700 block mb-1">
                    Priority & Urgency Rationale
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    {complaint.aiAnalysis.priorityExplanation}
                  </p>
                </div>
                <div className="bg-white/80 p-3 rounded-lg border border-sky-100 text-xs">
                  <span className="font-bold text-slate-700 block mb-1">
                    Suggested Action & Target SLA
                  </span>
                  <p className="text-slate-600 leading-relaxed mb-1.5">
                    {complaint.aiAnalysis.suggestedAction}
                  </p>
                  <div className="flex items-center gap-1.5 text-sky-800 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Target Resolution: {complaint.aiAnalysis.estimatedSLA}</span>
                  </div>
                </div>
              </div>

              {/* Duplicate Warnings Banner if present */}
              {complaint.aiAnalysis.duplicateCandidates &&
                complaint.aiAnalysis.duplicateCandidates.length > 0 && (
                  <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <span className="font-bold text-amber-900">
                          Possible Duplicate Detected:
                        </span>{' '}
                        <span className="text-amber-800">
                          {complaint.aiAnalysis.duplicateCandidates[0].reason}
                        </span>
                      </div>
                    </div>
                    {onOpenDuplicateModal && (
                      <button
                        onClick={() => onOpenDuplicateModal(complaint)}
                        className="ml-3 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded text-xs shrink-0 cursor-pointer transition-colors"
                      >
                        Compare & Merge
                      </button>
                    )}
                  </div>
                )}
            </div>
          )}

          {/* Quick Management Actions Grid (Status & Assignment) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Status Transition */}
            <form onSubmit={handleStatusSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Update Complaint Status
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-600 block mb-1">Current Lifecycle Phase</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as ComplaintStatus)}
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-sky-500"
                  >
                    <option value="Submitted">Submitted (Citizen Intake)</option>
                    <option value="Under Review">Under Review (AI & Human Triage)</option>
                    <option value="Assigned">Assigned (Designated to Dept)</option>
                    <option value="In Progress">In Progress (Field Crew On-Site)</option>
                    <option value="Resolved">Resolved (Work Completed)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={selectedStatus === complaint.status}
                  className={`w-full py-2 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    selectedStatus !== complaint.status
                      ? 'bg-sky-600 text-white hover:bg-sky-500'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Save Status Change
                </button>
              </div>
            </form>

            {/* Department Assignment */}
            <form onSubmit={handleAssignSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Assign Authority Department
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-600 block mb-1">Responsible Agency</label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-sky-500"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name} ({dept.shortCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-600 block mb-1">Field Officer / Unit Lead</label>
                  <input
                    type="text"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    placeholder="e.g. Inspector Marcus Vance (Unit 3)"
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-sky-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-3 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>

          {/* Action Notes & Audit Trail */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Action Notes & Incident History ({complaint.actionNotes.length})
            </h4>

            {/* Timeline */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {complaint.actionNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <User className="w-3 h-3 text-sky-600" />
                      {note.author}{' '}
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({note.role})
                      </span>
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {new Date(note.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{note.note}</p>
                </div>
              ))}
            </div>

            {/* Add note input */}
            <form onSubmit={handleAddNoteSubmit} className="flex gap-2 pt-1">
              <input
                type="text"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Add official dispatch note, inspection update, or resolution remark..."
                className="flex-1 text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-sky-500"
              />
              <button
                type="submit"
                disabled={!newNoteText.trim()}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-200 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Note</span>
              </button>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Complaint Reference: {complaint.id}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
