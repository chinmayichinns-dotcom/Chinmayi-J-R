export type ComplaintCategory =
  | 'Roads'
  | 'Waterlogging'
  | 'Waste Management'
  | 'Drainage'
  | 'Streetlights'
  | 'Public Safety';

export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved';

export interface LocationData {
  address: string;
  ward: string;
  lat: number;
  lng: number;
  landmark?: string;
}

export interface ActionNote {
  id: string;
  timestamp: string;
  author: string;
  role: 'Citizen' | 'AI System' | 'Administrator' | 'Field Officer';
  note: string;
  statusChange?: ComplaintStatus;
}

export interface DuplicateMatch {
  existingComplaintId: string;
  existingTitle: string;
  similarityScore: number; // 0 to 100
  reason: string;
  sameCategory: boolean;
  distanceMeters: number;
  isConfirmedDuplicate?: boolean;
}

export interface AIAnalysisResult {
  refinedCategory: ComplaintCategory;
  summary: string;
  priority: PriorityLevel;
  priorityExplanation: string;
  responsibleDepartment: string;
  suggestedAction: string;
  estimatedSLA: string;
  safetyRiskLevel: 'Severe' | 'Elevated' | 'Moderate' | 'Minor';
  duplicateCandidates: DuplicateMatch[];
  isAiGenerated?: boolean;
  modelUsed?: string;
}

export interface Complaint {
  id: string; // e.g. "CP-2026-1042"
  title: string;
  description: string;
  category: ComplaintCategory;
  location: LocationData;
  imageUrl?: string;
  citizenName?: string;
  citizenPhone?: string;
  citizenEmail?: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  status: ComplaintStatus;
  priority: PriorityLevel;
  aiAnalysis?: AIAnalysisResult;
  assignedDepartment?: string;
  assignedOfficer?: string;
  actionNotes: ActionNote[];
  duplicateOfId?: string; // If merged into another complaint
  mergedDuplicateIds?: string[]; // IDs of duplicates merged into this
  isDuplicateFlagged: boolean;
  upvotes: number;
}

export interface CityWard {
  id: string;
  name: string;
  zone: string;
  center: [number, number]; // [lat, lng]
  boundaries?: [number, number][];
}

export interface HotspotCluster {
  id: string;
  name: string;
  ward: string;
  center: { lat: number; lng: number };
  radiusMeters: number;
  complaintIds: string[];
  dominantCategory: ComplaintCategory;
  criticalCount: number;
  totalCount: number;
  severityScore: number; // 1 to 10
  actionPlan: string;
}

export interface DepartmentInfo {
  id: string;
  name: string;
  shortCode: string;
  head: string;
  phone: string;
  activeWorkforce: number;
  categories: ComplaintCategory[];
}
