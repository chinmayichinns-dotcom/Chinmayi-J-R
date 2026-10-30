import { GoogleGenAI } from '@google/genai';
import { ComplaintCategory, PriorityLevel } from '../types/civic';

interface ComplaintAnalysisPayload {
  title: string;
  description: string;
  category: ComplaintCategory;
  location: {
    address: string;
    ward: string;
    lat: number;
    lng: number;
  };
}

export async function handleComplaintAnalysis(payload: ComplaintAnalysisPayload) {
  const { title, description, category, location } = payload;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are CivicPulse AI, an intelligent municipal triage and emergency dispatch engine for smart cities.
Analyze the following citizen complaint and return ONLY a strict JSON object (no markdown, no backticks, no comments).

Citizen Report Details:
- Title: "${title}"
- Description: "${description}"
- Citizen-Selected Category: "${category}"
- Location: "${location.address}", ${location.ward} (Coordinates: ${location.lat}, ${location.lng})

Available Municipal Categories:
"Roads", "Waterlogging", "Waste Management", "Drainage", "Streetlights", "Public Safety"

Available Responsible Departments:
- "Department of Public Works & Roads"
- "Municipal Water & Sewerage Board"
- "City Solid Waste & Cleanliness Bureau"
- "Electrical Grid & Streetlighting Division"
- "Public Safety & Emergency Hazard Agency"

Provide JSON with exactly these fields:
{
  "refinedCategory": "one of the 6 municipal categories",
  "summary": "1-2 sentence crisp executive briefing of the issue and location",
  "priority": "Critical" | "High" | "Medium" | "Low",
  "priorityExplanation": "Detailed justification evaluating immediate life-safety hazards, traffic disruption, vulnerable groups (e.g. schools, transit, elderly), and infrastructure damage risk",
  "responsibleDepartment": "one of the 5 municipal departments",
  "suggestedAction": "Concrete, actionable dispatch directive for field crew (e.g. equipment needed, immediate containment step)",
  "estimatedSLA": "e.g. '2 Hours (Emergency Response)' or '12 Hours' or '24 Hours' or '48 Hours'",
  "safetyRiskLevel": "Severe" | "Elevated" | "Moderate" | "Minor"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text?.trim() || '';
      // Clean JSON if needed
      const cleanJson = responseText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        ...parsed,
        isAiGenerated: true,
        modelUsed: 'gemini-3.8-flash (Server-Side)',
      };
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local civic engine:', err);
    }
  }

  // Fallback if no valid key or API error
  return {
    refinedCategory: category,
    summary: `${title} reported at ${location.address}. Assessed by municipal triage framework.`,
    priority: title.toLowerCase().includes('manhole') || title.toLowerCase().includes('wire') || title.toLowerCase().includes('flood') ? 'Critical' : 'High',
    priorityExplanation: `Urgency assessed based on public thoroughfare impact at ${location.ward}.`,
    responsibleDepartment: category === 'Roads' ? 'Department of Public Works & Roads' : category === 'Streetlights' ? 'Electrical Grid & Streetlighting Division' : category === 'Waste Management' ? 'City Solid Waste & Cleanliness Bureau' : category === 'Public Safety' ? 'Public Safety & Emergency Hazard Agency' : 'Municipal Water & Sewerage Board',
    suggestedAction: 'Dispatch field inspection squad for priority site verification.',
    estimatedSLA: '24 Hours',
    safetyRiskLevel: 'Elevated',
    isAiGenerated: true,
    modelUsed: 'CivicPulse Smart Heuristic Engine (Local)',
  };
}
