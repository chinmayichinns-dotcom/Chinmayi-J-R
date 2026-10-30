import { Complaint, ComplaintStatus, ActionNote } from '../types/civic';
import { INITIAL_COMPLAINTS } from '../data/sampleComplaints';

const STORAGE_KEY = 'civicpulse_complaints_v1';
const RESET_COUNT_KEY = 'civicpulse_last_reset_v1';

export class StorageService {
  private static complaintsCache: Complaint[] | null = null;

  static getComplaints(): Complaint[] {
    if (this.complaintsCache) {
      return this.complaintsCache;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Complaint[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.complaintsCache = parsed;
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    // Initialize with sample complaints
    this.complaintsCache = [...INITIAL_COMPLAINTS];
    this.persistToLocalStorage(this.complaintsCache);
    return this.complaintsCache;
  }

  static getComplaintById(id: string): Complaint | undefined {
    const list = this.getComplaints();
    const cleanId = id.trim().toUpperCase();
    return list.find((c) => c.id.toUpperCase() === cleanId);
  }

  static saveComplaint(complaint: Complaint): void {
    const list = this.getComplaints();
    const index = list.findIndex((c) => c.id === complaint.id);

    if (index >= 0) {
      list[index] = { ...complaint, updatedAt: new Date().toISOString() };
    } else {
      list.unshift(complaint);
    }

    this.complaintsCache = [...list];
    this.persistToLocalStorage(this.complaintsCache);
  }

  static updateComplaintStatus(
    id: string,
    newStatus: ComplaintStatus,
    noteText?: string,
    author: string = 'Administrator'
  ): Complaint | null {
    const list = this.getComplaints();
    const target = list.find((c) => c.id === id);
    if (!target) return null;

    target.status = newStatus;
    target.updatedAt = new Date().toISOString();

    if (noteText) {
      const newNote: ActionNote = {
        id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        author,
        role: author.includes('Officer') ? 'Field Officer' : 'Administrator',
        note: noteText,
        statusChange: newStatus,
      };
      target.actionNotes.push(newNote);
    }

    this.complaintsCache = [...list];
    this.persistToLocalStorage(this.complaintsCache);
    return target;
  }

  static assignDepartmentAndOfficer(
    id: string,
    department: string,
    officer: string,
    noteText?: string,
    author: string = 'Admin Vance'
  ): Complaint | null {
    const list = this.getComplaints();
    const target = list.find((c) => c.id === id);
    if (!target) return null;

    target.assignedDepartment = department;
    target.assignedOfficer = officer;
    target.updatedAt = new Date().toISOString();

    if (target.status === 'Submitted' || target.status === 'Under Review') {
      target.status = 'Assigned';
    }

    const newNote: ActionNote = {
      id: `note-${Date.now()}`,
      timestamp: new Date().toISOString(),
      author,
      role: 'Administrator',
      note: noteText || `Assigned to ${department} (${officer}).`,
      statusChange: target.status,
    };
    target.actionNotes.push(newNote);

    this.complaintsCache = [...list];
    this.persistToLocalStorage(this.complaintsCache);
    return target;
  }

  static addActionNote(
    id: string,
    author: string,
    role: ActionNote['role'],
    note: string
  ): Complaint | null {
    const list = this.getComplaints();
    const target = list.find((c) => c.id === id);
    if (!target) return null;

    const actionNote: ActionNote = {
      id: `note-${Date.now()}`,
      timestamp: new Date().toISOString(),
      author,
      role,
      note,
    };
    target.actionNotes.push(actionNote);
    target.updatedAt = new Date().toISOString();

    this.complaintsCache = [...list];
    this.persistToLocalStorage(this.complaintsCache);
    return target;
  }

  static mergeDuplicate(duplicateId: string, parentId: string): { success: boolean; parent?: Complaint } {
    const list = this.getComplaints();
    const duplicate = list.find((c) => c.id === duplicateId);
    const parent = list.find((c) => c.id === parentId);

    if (!duplicate || !parent) return { success: false };

    duplicate.duplicateOfId = parentId;
    duplicate.isDuplicateFlagged = true;
    duplicate.status = parent.status;
    duplicate.updatedAt = new Date().toISOString();

    duplicate.actionNotes.push({
      id: `note-merge-${Date.now()}`,
      timestamp: new Date().toISOString(),
      author: 'Administrator',
      role: 'Administrator',
      note: `Confirmed duplicate. Merged into primary ticket ${parentId}.`,
    });

    if (!parent.mergedDuplicateIds) {
      parent.mergedDuplicateIds = [];
    }
    if (!parent.mergedDuplicateIds.includes(duplicateId)) {
      parent.mergedDuplicateIds.push(duplicateId);
    }
    parent.upvotes = (parent.upvotes || 0) + (duplicate.upvotes || 1);
    parent.actionNotes.push({
      id: `note-parent-${Date.now()}`,
      timestamp: new Date().toISOString(),
      author: 'Administrator',
      role: 'Administrator',
      note: `Aggregated duplicate report ${duplicateId} into this primary record. Upvote count consolidated.`,
    });

    this.complaintsCache = [...list];
    this.persistToLocalStorage(this.complaintsCache);
    return { success: true, parent };
  }

  static dismissDuplicate(duplicateId: string, targetId: string): boolean {
    const list = this.getComplaints();
    const item = list.find((c) => c.id === duplicateId);
    if (!item) return false;

    if (item.aiAnalysis && item.aiAnalysis.duplicateCandidates) {
      item.aiAnalysis.duplicateCandidates = item.aiAnalysis.duplicateCandidates.filter(
        (cand) => cand.existingComplaintId !== targetId
      );
    }
    item.isDuplicateFlagged = false;
    item.actionNotes.push({
      id: `note-dismiss-${Date.now()}`,
      timestamp: new Date().toISOString(),
      author: 'Administrator',
      role: 'Administrator',
      note: `Evaluated AI duplicate flag for ticket ${targetId}; confirmed as a distinct, independent civic incident.`,
    });

    this.complaintsCache = [...list];
    this.persistToLocalStorage(this.complaintsCache);
    return true;
  }

  static resetToSampleData(): Complaint[] {
    this.complaintsCache = JSON.parse(JSON.stringify(INITIAL_COMPLAINTS));
    this.persistToLocalStorage(this.complaintsCache!);
    try {
      localStorage.setItem(RESET_COUNT_KEY, new Date().toISOString());
    } catch {
      // ignore
    }
    return this.complaintsCache!;
  }

  static getStorageStats() {
    const list = this.getComplaints();
    return {
      mode: 'Local Demo Mode (Persistence Active: browser-local storage with full CRUD)',
      totalRecords: list.length,
      storageKey: STORAGE_KEY,
      isSynchronized: true,
    };
  }

  private static persistToLocalStorage(data: Complaint[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // storage full or disabled
    }
  }
}
