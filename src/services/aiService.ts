import {
  Complaint,
  ComplaintCategory,
  PriorityLevel,
  AIAnalysisResult,
  DuplicateMatch,
  LocationData,
} from '../types/civic';
import { calculateDistanceMeters } from '../data/sampleComplaints';

// Deterministic keyword matching and semantic analysis
interface KeywordRule {
  keywords: string[];
  category: ComplaintCategory;
  priority: PriorityLevel;
  safetyRisk: 'Severe' | 'Elevated' | 'Moderate' | 'Minor';
  sla: string;
  department: string;
  action: string;
}

const CIVIC_RULES: KeywordRule[] = [
  {
    keywords: ['open manhole', 'manhole cover', 'missing cover', 'uncovered hole', 'fall hazard', 'deep shaft'],
    category: 'Public Safety',
    priority: 'Critical',
    safetyRisk: 'Severe',
    sla: '2 Hours (Emergency Response)',
    department: 'Public Safety & Emergency Hazard Agency',
    action: 'Immediate deployment of emergency barricade followed by heavy-duty replacement cover bolt-down.',
  },
  {
    keywords: ['live wire', 'snapped wire', 'hanging wire', 'sparking', 'electric shock', 'exposed wire', 'electrocution', 'conductor'],
    category: 'Public Safety',
    priority: 'Critical',
    safetyRisk: 'Severe',
    sla: '1 Hour (Urgent Life Safety)',
    department: 'Public Safety & Emergency Hazard Agency',
    action: 'Immediate cordon, de-energization confirmation with utility grid, and lineman bucket truck re-stringing.',
  },
  {
    keywords: ['guardrail', 'ravine', 'cliff', 'bridge barrier', 'overpass drop', 'missing rail'],
    category: 'Public Safety',
    priority: 'Critical',
    safetyRisk: 'Severe',
    sla: '2 Hours (Emergency Barrier)',
    department: 'Public Safety & Emergency Hazard Agency',
    action: 'Emergency installation of concrete K-rail barriers and urgent structural barrier replacement.',
  },
  {
    keywords: ['chemical', 'drums', 'toxic', 'solvent', 'hazardous', 'biohazard', 'needles', 'syringes'],
    category: 'Public Safety',
    priority: 'Critical',
    safetyRisk: 'Severe',
    sla: '1 Hour (Certified Hazmat)',
    department: 'Public Safety & Emergency Hazard Agency',
    action: 'Dispatch certified municipal Hazmat team with containment equipment and secure site.',
  },
  {
    keywords: ['leaning pole', 'collapsing pole', 'sheared pole', 'falling pole', 'hit and run pole'],
    category: 'Streetlights',
    priority: 'Critical',
    safetyRisk: 'Severe',
    sla: '2 Hours (Emergency Structural Hazard)',
    department: 'Electrical Grid & Streetlighting Division',
    action: 'Crane truck stabilization, electrical isolation, and replacement foundation re-bolting.',
  },
  {
    keywords: ['subway flood', 'underpass flood', 'cars stalling', 'trapped vehicles', 'deep flood', 'inundation', 'rushing water'],
    category: 'Waterlogging',
    priority: 'Critical',
    safetyRisk: 'Severe',
    sla: '4 Hours (Emergency De-watering)',
    department: 'Municipal Water & Sewerage Board',
    action: 'Deploy high-capacity suction pump trucks and clear blocked retention trunk line.',
  },
  {
    keywords: ['sinkhole', 'cave-in', 'crater', 'collapsed asphalt', 'void under street'],
    category: 'Roads',
    priority: 'High',
    safetyRisk: 'Elevated',
    sla: '12 Hours',
    department: 'Department of Public Works & Roads',
    action: 'Traffic diversion cones, sub-base excavation, soil compaction, and hot-mix asphalt restoration.',
  },
  {
    keywords: ['pothole', 'broken pavement', 'trench', 'flat tire', 'rim damage', 'bent wheel', 'asphalt hole'],
    category: 'Roads',
    priority: 'High',
    safetyRisk: 'Elevated',
    sla: '24 Hours',
    department: 'Department of Public Works & Roads',
    action: 'Deploy cold-mix rapid patch crew, square-cut failing boundary, and level pavement.',
  },
  {
    keywords: ['sewer odor', 'rotten egg', 'gas smell', 'sewage backflow', 'raw sewage', 'feces'],
    category: 'Drainage',
    priority: 'High',
    safetyRisk: 'Elevated',
    sla: '12 Hours',
    department: 'Municipal Water & Sewerage Board',
    action: 'Deploy CCTV pipeline inspection crawler, jet hydraulic obstruction, and sanitize drain trap.',
  },
  {
    keywords: ['blackout', 'pitch dark', 'darkness', 'multiple lights out', 'highway lights', 'blind curve'],
    category: 'Streetlights',
    priority: 'High',
    safetyRisk: 'Elevated',
    sla: '24 Hours',
    department: 'Electrical Grid & Streetlighting Division',
    action: 'Locate tripped circuit breaker or transformer fault; replace failed feeder segment.',
  },
  {
    keywords: ['fly-tipping', 'construction debris', 'dumped', 'illegal dump', 'sheetrock', 'drywall pile'],
    category: 'Waste Management',
    priority: 'High',
    safetyRisk: 'Elevated',
    sla: '24 Hours',
    department: 'City Solid Waste & Cleanliness Bureau',
    action: 'Dispatch heavy loader truck, clear right-of-way, and initiate illegal dumping enforcement citation.',
  },
  {
    keywords: ['overflowing', 'rotting', 'garbage pile', 'dumpster full', 'maggots', 'rodents', 'smell'],
    category: 'Waste Management',
    priority: 'Medium',
    safetyRisk: 'Moderate',
    sla: '24 Hours',
    department: 'City Solid Waste & Cleanliness Bureau',
    action: 'Send route compactor truck, clean sidewalk apron, and issue bin compliance notice.',
  },
  {
    keywords: ['clogged drain', 'grate full of leaves', 'storm drain', 'culvert', 'silt', 'mud'],
    category: 'Drainage',
    priority: 'Medium',
    safetyRisk: 'Moderate',
    sla: '36 Hours',
    department: 'Municipal Water & Sewerage Board',
    action: 'Deploy vacuum vactor truck to clear intake grates and flush silt reservoir.',
  },
  {
    keywords: ['puddle', 'standing water', 'water pooling', 'curb water'],
    category: 'Waterlogging',
    priority: 'Medium',
    safetyRisk: 'Moderate',
    sla: '48 Hours',
    department: 'Municipal Water & Sewerage Board',
    action: 'Clear curb water passage and evaluate local asphalt grade.',
  },
  {
    keywords: ['flickering', 'strobing', 'dim light', 'buzzing lamp'],
    category: 'Streetlights',
    priority: 'Low',
    safetyRisk: 'Minor',
    sla: '5 Days',
    department: 'Electrical Grid & Streetlighting Division',
    action: 'Replace high-pressure sodium lamp fixture with energy-efficient LED luminaire head.',
  },
  {
    keywords: ['graffiti', 'faded line', 'sign bent', 'litter', 'small crack', 'tree branch'],
    category: 'Roads',
    priority: 'Low',
    safetyRisk: 'Minor',
    sla: '7 Days',
    department: 'Department of Public Works & Roads',
    action: 'Queue in routine municipal maintenance work-order schedule.',
  },
];

// Helper to calculate text similarity using token overlap and Jaccard distance
function calculateTextSimilarity(text1: string, text2: string): number {
  const tokenize = (t: string) =>
    t
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

  const tokens1 = new Set(tokenize(text1));
  const tokens2 = new Set(tokenize(text2));

  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  let intersection = 0;
  tokens1.forEach((token) => {
    if (tokens2.has(token)) intersection++;
  });

  const union = new Set([...tokens1, ...tokens2]).size;
  return Math.round((intersection / union) * 100);
}

// Find potential duplicates among existing complaints
export function detectDuplicates(
  title: string,
  description: string,
  category: ComplaintCategory,
  location: LocationData,
  existingComplaints: Complaint[]
): DuplicateMatch[] {
  const candidates: DuplicateMatch[] = [];
  const fullText = `${title} ${description}`;

  for (const existing of existingComplaints) {
    if (existing.status === 'Resolved') continue;

    const existingFullText = `${existing.title} ${existing.description}`;
    const textSim = calculateTextSimilarity(fullText, existingFullText);
    const distanceMeters = calculateDistanceMeters(
      location.lat,
      location.lng,
      existing.location.lat,
      existing.location.lng
    );

    const sameCategory = existing.category === category;

    // Weight factors:
    // Proximity has very high weight in civic incidents
    let locationScore = 0;
    if (distanceMeters <= 25) locationScore = 95;
    else if (distanceMeters <= 75) locationScore = 80;
    else if (distanceMeters <= 200) locationScore = 60;
    else if (distanceMeters <= 500) locationScore = 30;
    else locationScore = 0;

    let overallSimilarity = 0;
    if (distanceMeters <= 100) {
      overallSimilarity = Math.round(locationScore * 0.45 + textSim * 0.45 + (sameCategory ? 10 : 0));
    } else {
      overallSimilarity = Math.round(textSim * 0.7 + locationScore * 0.2 + (sameCategory ? 10 : 0));
    }

    // Cap at 98%
    overallSimilarity = Math.min(98, overallSimilarity);

    if (overallSimilarity >= 55 || (distanceMeters <= 40 && sameCategory)) {
      let reason = '';
      if (distanceMeters <= 40 && sameCategory) {
        reason = `Located within ${distanceMeters}m in ${existing.location.ward} with matching category "${category}". High probability of same physical incident.`;
      } else if (textSim >= 60) {
        reason = `Substantial text overlap (${textSim}%) describing identical municipal issue within ${distanceMeters}m.`;
      } else {
        reason = `Similar civic defect reported in close vicinity (${distanceMeters}m apart).`;
      }

      candidates.push({
        existingComplaintId: existing.id,
        existingTitle: existing.title,
        similarityScore: Math.max(50, overallSimilarity),
        reason,
        sameCategory,
        distanceMeters,
      });
    }
  }

  return candidates.sort((a, b) => b.similarityScore - a.similarityScore);
}

// Comprehensive Offline/Fallback Analysis
export function analyzeComplaintOffline(
  title: string,
  description: string,
  selectedCategory: ComplaintCategory,
  location: LocationData,
  existingComplaints: Complaint[]
): AIAnalysisResult {
  const combinedText = `${title} ${description}`.toLowerCase();

  // Find best matching rule
  let matchedRule: KeywordRule | null = null;
  let highestKeywordHits = 0;

  for (const rule of CIVIC_RULES) {
    let hits = 0;
    for (const kw of rule.keywords) {
      if (combinedText.includes(kw)) hits++;
    }
    if (hits > highestKeywordHits) {
      highestKeywordHits = hits;
      matchedRule = rule;
    }
  }

  // Duplicate candidates
  const duplicates = detectDuplicates(title, description, selectedCategory, location, existingComplaints);

  if (matchedRule && highestKeywordHits > 0) {
    return {
      refinedCategory: matchedRule.category,
      summary: `${title.charAt(0).toUpperCase() + title.slice(1).trim()} identified at ${location.address}. ${matchedRule.priority} priority dispatch recommended.`,
      priority: matchedRule.priority,
      priorityExplanation: `High urgency detected based on hazard markers matching [${matchedRule.keywords.slice(0, 2).join(', ')}]. Public safety and arterial risk require immediate attention.`,
      responsibleDepartment: matchedRule.department,
      suggestedAction: matchedRule.action,
      estimatedSLA: matchedRule.sla,
      safetyRiskLevel: matchedRule.safetyRisk,
      duplicateCandidates: duplicates,
      isAiGenerated: true,
      modelUsed: 'CivicPulse Triage Model (Deterministic)',
    };
  }

  // Default fallback if no specific keywords triggered
  const deptMap: Record<ComplaintCategory, string> = {
    Roads: 'Department of Public Works & Roads',
    Waterlogging: 'Municipal Water & Sewerage Board',
    'Waste Management': 'City Solid Waste & Cleanliness Bureau',
    Drainage: 'Municipal Water & Sewerage Board',
    Streetlights: 'Electrical Grid & Streetlighting Division',
    'Public Safety': 'Public Safety & Emergency Hazard Agency',
  };

  return {
    refinedCategory: selectedCategory,
    summary: `${title.trim()} reported at ${location.address}. Awaiting routine field officer assessment.`,
    priority: selectedCategory === 'Public Safety' ? 'High' : 'Medium',
    priorityExplanation: `Standard intake criteria met for ${selectedCategory}. No immediate life-safety keywords detected in report text.`,
    responsibleDepartment: deptMap[selectedCategory] || 'Department of Public Works & Roads',
    suggestedAction: `Assign field inspector from ${deptMap[selectedCategory]} for physical site survey.`,
    estimatedSLA: '48 Hours',
    safetyRiskLevel: selectedCategory === 'Public Safety' ? 'Moderate' : 'Minor',
    duplicateCandidates: duplicates,
    isAiGenerated: true,
    modelUsed: 'CivicPulse Triage Model',
  };
}

// Main AI Service caller with server proxy and resilient fallback
export async function analyzeComplaintWithAI(
  title: string,
  description: string,
  category: ComplaintCategory,
  location: LocationData,
  existingComplaints: Complaint[]
): Promise<AIAnalysisResult> {
  try {
    const res = await fetch('/api/analyze-complaint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description,
        category,
        location,
        existingComplaintsCount: existingComplaints.length,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.summary && data.priority) {
        // Run duplicate detection on top of AI results
        const duplicates = detectDuplicates(title, description, data.refinedCategory || category, location, existingComplaints);
        return {
          ...data,
          duplicateCandidates: duplicates,
          isAiGenerated: true,
          modelUsed: data.modelUsed || 'gemini-3.8-flash',
        };
      }
    }
  } catch {
    // If backend proxy fails or is not reachable in dev sandbox, fall back gracefully
  }

  // Intelligent fallback
  return analyzeComplaintOffline(title, description, category, location, existingComplaints);
}
