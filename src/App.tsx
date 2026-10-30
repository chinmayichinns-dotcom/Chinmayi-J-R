import React, { useState, useEffect, useMemo } from 'react';
import { Complaint, ComplaintStatus, ActionNote, DuplicateMatch } from './types/civic';
import { StorageService } from './services/storageService';
import { generateHotspotClusters } from './data/sampleComplaints';
import { Header, NavView } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { Footer } from './components/common/Footer';
import { ComplaintDetailModal } from './components/complaint/ComplaintDetailModal';
import { DuplicateResolutionModal } from './components/complaint/DuplicateResolutionModal';
import { HomeView } from './views/HomeView';
import { CitizenPortalView } from './views/CitizenPortalView';
import { TrackComplaintView } from './views/TrackComplaintView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AIInsightsHotspotsView } from './views/AIInsightsHotspotsView';
import { ManageComplaintsView } from './views/ManageComplaintsView';
import { Database, AlertTriangle, Check, RefreshCw } from 'lucide-react';

export default function App() {
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    return StorageService.getComplaints();
  });

  const [currentView, setCurrentView] = useState<NavView>('home');
  const [selectedComplaintForDetail, setSelectedComplaintForDetail] = useState<Complaint | null>(null);
  const [duplicateModalData, setDuplicateModalData] = useState<{
    current: Complaint;
    existing: Complaint;
    matchInfo: DuplicateMatch;
  } | null>(null);
  const [trackTargetId, setTrackTargetId] = useState<string>('CP-2026-1001');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Compute hotspots
  const hotspots = useMemo(() => {
    return generateHotspotClusters(complaints);
  }, [complaints]);

  // Compute live stats for sidebar
  const stats = useMemo(() => {
    return {
      total: complaints.length,
      pending: complaints.filter((c) => c.status === 'Submitted' || c.status === 'Under Review').length,
      critical: complaints.filter((c) => c.priority === 'Critical' && c.status !== 'Resolved').length,
      inProgress: complaints.filter((c) => c.status === 'In Progress' || c.status === 'Assigned').length,
      resolved: complaints.filter((c) => c.status === 'Resolved').length,
    };
  }, [complaints]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Actions
  const handleCreateComplaint = (newComplaint: Complaint) => {
    StorageService.saveComplaint(newComplaint);
    setComplaints([...StorageService.getComplaints()]);
    showToast(`Complaint #${newComplaint.id} registered and triaged.`);
  };

  const handleUpdateStatus = (id: string, newStatus: ComplaintStatus, note?: string) => {
    const updated = StorageService.updateComplaintStatus(id, newStatus, note);
    if (updated) {
      setComplaints([...StorageService.getComplaints()]);
      if (selectedComplaintForDetail?.id === id) {
        setSelectedComplaintForDetail(updated);
      }
      showToast(`Complaint #${id} updated to ${newStatus}.`);
    }
  };

  const handleAssignDepartment = (
    id: string,
    department: string,
    officer: string,
    note?: string
  ) => {
    const updated = StorageService.assignDepartmentAndOfficer(id, department, officer, note);
    if (updated) {
      setComplaints([...StorageService.getComplaints()]);
      if (selectedComplaintForDetail?.id === id) {
        setSelectedComplaintForDetail(updated);
      }
      showToast(`Complaint #${id} assigned to ${department}.`);
    }
  };

  const handleAddNote = (
    id: string,
    author: string,
    role: ActionNote['role'],
    note: string
  ) => {
    const updated = StorageService.addActionNote(id, author, role, note);
    if (updated) {
      setComplaints([...StorageService.getComplaints()]);
      if (selectedComplaintForDetail?.id === id) {
        setSelectedComplaintForDetail(updated);
      }
      showToast(`Dispatch note logged for #${id}.`);
    }
  };

  const handleOpenDuplicateResolution = (complaint: Complaint) => {
    if (complaint.aiAnalysis?.duplicateCandidates && complaint.aiAnalysis.duplicateCandidates.length > 0) {
      const match = complaint.aiAnalysis.duplicateCandidates[0];
      const existing = complaints.find((c) => c.id === match.existingComplaintId);
      if (existing) {
        setDuplicateModalData({
          current: complaint,
          existing,
          matchInfo: match,
        });
        return;
      }
    }
    // If not found in candidate list, open detail modal
    setSelectedComplaintForDetail(complaint);
  };

  const handleConfirmMerge = (duplicateId: string, parentId: string) => {
    const result = StorageService.mergeDuplicate(duplicateId, parentId);
    if (result.success) {
      setComplaints([...StorageService.getComplaints()]);
      setDuplicateModalData(null);
      if (selectedComplaintForDetail) setSelectedComplaintForDetail(null);
      showToast(`Merged #${duplicateId} into parent record #${parentId}.`);
    }
  };

  const handleDismissDuplicate = (duplicateId: string, targetId: string) => {
    const success = StorageService.dismissDuplicate(duplicateId, targetId);
    if (success) {
      setComplaints([...StorageService.getComplaints()]);
      setDuplicateModalData(null);
      showToast(`Marked #${duplicateId} as distinct independent incident.`);
    }
  };

  const handleResetSampleData = () => {
    if (window.confirm('Reset all complaint data back to the original 32 hackathon sample incidents?')) {
      const fresh = StorageService.resetToSampleData();
      setComplaints([...fresh]);
      setSelectedComplaintForDetail(null);
      setDuplicateModalData(null);
      showToast('Restored 32 synthetic civic records to local storage.');
    }
  };

  const handleUpvoteComplaint = (id: string) => {
    const target = complaints.find((c) => c.id === id);
    if (target) {
      target.upvotes = (target.upvotes || 0) + 1;
      StorageService.saveComplaint(target);
      setComplaints([...StorageService.getComplaints()]);
      showToast(`Recorded citizen verification for #${id}.`);
    }
  };

  const handleNavigateToTrack = (id: string) => {
    setTrackTargetId(id);
    setCurrentView('track');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar Header */}
      <Header
        currentView={currentView}
        onNavigate={setCurrentView}
        criticalCount={stats.critical}
      />

      {/* Main Workspace Layout (Sidebar + Viewport) */}
      <div className="flex-1 flex w-full">
        {/* Left Workspace Sidebar (Hidden on small mobile, visible on md+) */}
        <div className="hidden md:block">
          <Sidebar
            currentView={currentView}
            onNavigate={setCurrentView}
            stats={stats}
            onResetSampleData={handleResetSampleData}
          />
        </div>

        {/* Central Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Storage Mode Notice */}
          <div className="mb-6 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-sky-600" />
              <span>
                <strong>Persistent Demo Mode Active:</strong> Browser-local storage synchronized with{' '}
                <strong className="font-mono text-slate-800">{complaints.length}</strong> realistic civic records.
              </span>
            </div>
            <button
              onClick={handleResetSampleData}
              className="text-[11px] font-semibold text-sky-700 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Data</span>
            </button>
          </div>

          {/* Render Active View */}
          {currentView === 'home' && (
            <HomeView
              complaints={complaints}
              hotspots={hotspots}
              onNavigate={setCurrentView}
              onSelectComplaint={(c) => setSelectedComplaintForDetail(c)}
            />
          )}

          {currentView === 'portal' && (
            <CitizenPortalView
              existingComplaints={complaints}
              onSubmitComplaint={handleCreateComplaint}
              onNavigateToTrack={handleNavigateToTrack}
            />
          )}

          {currentView === 'track' && (
            <TrackComplaintView
              complaints={complaints}
              initialComplaintId={trackTargetId}
              onUpvoteComplaint={handleUpvoteComplaint}
              onSelectComplaintForDetail={(c) => setSelectedComplaintForDetail(c)}
            />
          )}

          {currentView === 'dashboard' && (
            <AdminDashboardView
              complaints={complaints}
              onSelectComplaint={(c) => setSelectedComplaintForDetail(c)}
              onOpenDuplicateResolution={handleOpenDuplicateResolution}
            />
          )}

          {currentView === 'hotspots' && (
            <AIInsightsHotspotsView
              complaints={complaints}
              hotspots={hotspots}
              onSelectComplaint={(c) => setSelectedComplaintForDetail(c)}
            />
          )}

          {currentView === 'manage' && (
            <ManageComplaintsView
              complaints={complaints}
              onSelectComplaint={(c) => setSelectedComplaintForDetail(c)}
              onUpdateStatus={handleUpdateStatus}
              onAssignDepartment={handleAssignDepartment}
              onOpenDuplicateResolution={handleOpenDuplicateResolution}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Complaint Detail Modal */}
      {selectedComplaintForDetail && (
        <ComplaintDetailModal
          complaint={selectedComplaintForDetail}
          onClose={() => setSelectedComplaintForDetail(null)}
          onUpdateStatus={handleUpdateStatus}
          onAssignDepartment={handleAssignDepartment}
          onAddNote={handleAddNote}
          onOpenDuplicateModal={handleOpenDuplicateResolution}
        />
      )}

      {/* Duplicate Resolution Modal */}
      {duplicateModalData && (
        <DuplicateResolutionModal
          currentComplaint={duplicateModalData.current}
          existingCandidate={duplicateModalData.existing}
          matchInfo={duplicateModalData.matchInfo}
          onClose={() => setDuplicateModalData(null)}
          onConfirmMerge={handleConfirmMerge}
          onDismissDuplicate={handleDismissDuplicate}
        />
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
