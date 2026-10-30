import React, { useState, useEffect } from 'react';
import {
  Complaint,
  ComplaintCategory,
  LocationData,
  AIAnalysisResult,
  DuplicateMatch,
} from '../types/civic';
import { CITY_WARDS } from '../data/sampleComplaints';
import { InteractiveCityMap, getWardForCoordinates } from '../components/map/InteractiveCityMap';
import { analyzeComplaintWithAI, detectDuplicates } from '../services/aiService';
import {
  MapPin,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Camera,
  Image as ImageIcon,
  X,
  Clock,
  Layers,
} from 'lucide-react';
import { NavView } from '../components/common/Header';

interface CitizenPortalViewProps {
  existingComplaints: Complaint[];
  onSubmitComplaint: (complaint: Complaint) => void;
  onNavigateToTrack: (id: string) => void;
}

const CATEGORIES: ComplaintCategory[] = [
  'Roads',
  'Waterlogging',
  'Waste Management',
  'Drainage',
  'Streetlights',
  'Public Safety',
];

// Quick preset civic sample images and scenarios for rapid hackathon testing
const PRESET_SCENARIOS = [
  {
    label: 'Open Manhole',
    category: 'Public Safety' as ComplaintCategory,
    title: 'Missing iron manhole cover on busy school crosswalk',
    desc: 'Uncovered 8-foot vertical drop right beside crossing path. High danger for pedestrians.',
    address: '430 Oakridge Blvd',
    lat: 37.7458,
    lng: -122.4340,
    ward: 'Ward 5 - Oakridge Heights',
  },
  {
    label: 'Deep Pothole',
    category: 'Roads' as ComplaintCategory,
    title: 'Major asphalt crater at 5th and Main intersection',
    desc: 'Deep hole in southbound center lane bending car rims and causing emergency swerving.',
    address: 'Corner of 5th Ave & Main St',
    lat: 37.7753,
    lng: -122.4187,
    ward: 'Ward 1 - Central Downtown',
  },
  {
    label: 'Subway Flooding',
    category: 'Waterlogging' as ComplaintCategory,
    title: 'Underpass pedestrian walkway flooded with 15 inches of storm runoff',
    desc: 'Water pooling completely blocks entrance to Metro Station. Commuters cannot pass.',
    address: 'Metro South Walkway Underpass',
    lat: 37.7612,
    lng: -122.4146,
    ward: 'Ward 2 - Metro South & Transit Hub',
  },
  {
    label: 'Illegal Dump',
    category: 'Waste Management' as ComplaintCategory,
    title: 'Massive pile of drywall and commercial trash dumped on lane',
    desc: 'Four tons of construction waste dumped overnight blocking bicycle lane.',
    address: '1122 Industrial Way',
    lat: 37.7943,
    lng: -122.4074,
    ward: 'Ward 4 - North Industrial Corridor',
  },
];

export const CitizenPortalView: React.FC<CitizenPortalViewProps> = ({
  existingComplaints,
  onSubmitComplaint,
  onNavigateToTrack,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Roads');
  const [address, setAddress] = useState('5th Ave & Main Street');
  const [ward, setWard] = useState('Ward 1 - Central Downtown');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 37.7752,
    lng: -122.4188,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [citizenName, setCitizenName] = useState('');
  const [citizenEmail, setCitizenEmail] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);

  // Live duplicate preview
  const [liveDuplicates, setLiveDuplicates] = useState<DuplicateMatch[]>([]);

  useEffect(() => {
    if (title.length > 5 || description.length > 10) {
      const dups = detectDuplicates(
        title,
        description,
        category,
        { address, ward, lat: coords.lat, lng: coords.lng },
        existingComplaints
      );
      setLiveDuplicates(dups.slice(0, 2));
    } else {
      setLiveDuplicates([]);
    }
  }, [title, description, category, coords, address, ward, existingComplaints]);

  // Handle map selection
  const handleMapLocationSelect = (loc: { lat: number; lng: number; ward: string }) => {
    setCoords({ lat: loc.lat, lng: loc.lng });
    setWard(loc.ward);
    if (!address || address === '5th Ave & Main Street') {
      setAddress(`Near ${loc.ward.split('-')[1]?.trim() || 'Civic District'}`);
    }
  };

  // Image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Apply quick scenario
  const applyPreset = (preset: typeof PRESET_SCENARIOS[0]) => {
    setTitle(preset.title);
    setDescription(preset.desc);
    setCategory(preset.category);
    setAddress(preset.address);
    setCoords({ lat: preset.lat, lng: preset.lng });
    setWard(preset.ward);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);

    const locationData: LocationData = {
      address: address.trim() || 'Metropolitan Public Way',
      ward,
      lat: coords.lat,
      lng: coords.lng,
    };

    // Run AI analysis
    const aiResult = await analyzeComplaintWithAI(
      title.trim(),
      description.trim(),
      category,
      locationData,
      existingComplaints
    );

    // Generate unique complaint ID
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `CP-2026-${randomNum}`;

    const newComplaint: Complaint = {
      id: newId,
      title: title.trim(),
      description: description.trim(),
      category: aiResult.refinedCategory || category,
      location: locationData,
      imageUrl: imagePreview || undefined,
      citizenName: isAnonymous ? undefined : citizenName.trim() || 'Concerned Citizen',
      citizenEmail: isAnonymous ? undefined : citizenEmail.trim() || undefined,
      citizenPhone: isAnonymous ? undefined : citizenPhone.trim() || undefined,
      isAnonymous,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'Submitted',
      priority: aiResult.priority,
      assignedDepartment: aiResult.responsibleDepartment,
      isDuplicateFlagged: aiResult.duplicateCandidates.length > 0 && aiResult.duplicateCandidates[0].similarityScore >= 80,
      upvotes: 1,
      actionNotes: [
        {
          id: `note-${Date.now()}-1`,
          timestamp: new Date().toISOString(),
          author: isAnonymous ? 'Anonymous Citizen' : citizenName.trim() || 'Citizen',
          role: 'Citizen',
          note: `Complaint submitted via Citizen Portal. Category: ${category}.`,
        },
        {
          id: `note-${Date.now()}-2`,
          timestamp: new Date(Date.now() + 1000).toISOString(),
          author: 'CivicPulse AI Triage Engine',
          role: 'AI System',
          note: `Automated assessment: ${aiResult.priority} Priority. Department: ${aiResult.responsibleDepartment}. Target SLA: ${aiResult.estimatedSLA}.`,
        },
      ],
      aiAnalysis: aiResult,
    };

    onSubmitComplaint(newComplaint);
    setSubmittedComplaint(newComplaint);
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Citizen Complaint Filing Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Report municipal issues directly to city operations with instant AI triage and verified GPS tagging
            </p>
          </div>
        </div>

        {/* Quick Hackathon Demo Scenarios */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
          <span className="font-semibold text-slate-600">Quick Hackathon Demo Scenarios:</span>
          {PRESET_SCENARIOS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p)}
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
            >
              + {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submission Success Dialog */}
      {submittedComplaint ? (
        <div className="bg-white rounded-2xl border border-emerald-300 p-8 shadow-md text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">
              Complaint Registered Successfully!
            </h2>
            <p className="text-sm text-slate-600 max-w-lg mx-auto">
              Your report has been received, analyzed by CivicPulse AI, and queued for municipal field dispatch.
            </p>
            <div className="inline-block bg-sky-50 border border-sky-200 px-4 py-2 rounded-xl mt-2">
              <span className="text-xs text-slate-500 block">Complaint Tracking ID:</span>
              <span className="text-xl font-bold font-mono text-sky-800 tracking-wider">
                {submittedComplaint.id}
              </span>
            </div>
          </div>

          {/* AI Triage Result Box */}
          {submittedComplaint.aiAnalysis && (
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 max-w-2xl mx-auto text-left space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  AI Triage Result
                </span>
                <span className={`px-2 py-0.5 rounded font-bold ${
                  submittedComplaint.priority === 'Critical'
                    ? 'bg-red-100 text-red-700'
                    : submittedComplaint.priority === 'High'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-sky-100 text-sky-700'
                }`}>
                  {submittedComplaint.priority} Priority
                </span>
              </div>
              <p className="text-slate-700 font-medium">
                {submittedComplaint.aiAnalysis.summary}
              </p>
              <div className="text-slate-600">
                <strong>Assigned Dept:</strong> {submittedComplaint.assignedDepartment} ·{' '}
                <strong>Target SLA:</strong> {submittedComplaint.aiAnalysis.estimatedSLA}
              </div>

              {submittedComplaint.aiAnalysis.duplicateCandidates.length > 0 && (
                <div className="p-2.5 bg-amber-50 rounded border border-amber-200 text-amber-800">
                  ⚠️ Note: A similar active complaint was found within{' '}
                  {submittedComplaint.aiAnalysis.duplicateCandidates[0].distanceMeters}m. City dispatchers will consolidate reports to accelerate repair.
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigateToTrack(submittedComplaint.id)}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <span>Track this Complaint</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSubmittedComplaint(null);
                setTitle('');
                setDescription('');
                setImagePreview(null);
              }}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              File Another Report
            </button>
          </div>
        </div>
      ) : (
        /* The Complaint Form */
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Main Details */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xs">
              {/* Category Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Problem Category *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-2.5 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                        category === cat
                          ? 'bg-sky-600 border-sky-600 text-white shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  2. Brief Issue Summary *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Deep pothole causing damaged rims near 5th and Main intersection"
                  className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:bg-white focus:outline-sky-500 transition-colors"
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  3. Detailed Description & Hazard Specifics *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe exact conditions: depth, width, water level, risk to pedestrians/children, traffic obstruction, or visible wires..."
                  className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl p-4 text-slate-900 focus:bg-white focus:outline-sky-500 transition-colors"
                ></textarea>
              </div>

              {/* Live AI Duplicate Pre-warning Alert */}
              {liveDuplicates.length > 0 && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Live AI Check: Possible Similar Incident Already Logged</span>
                  </div>
                  <p className="text-amber-800">
                    "{liveDuplicates[0].existingTitle}" ({liveDuplicates[0].distanceMeters}m away).
                    You can still submit; our triage engine will automatically consolidate your report to boost municipal priority!
                  </p>
                </div>
              )}

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  4. Upload Photographic Evidence (Optional)
                </label>
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-56 bg-slate-100 flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="Complaint attachment"
                      className="max-h-56 object-cover w-full"
                    />
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-xs text-slate-500 cursor-pointer bg-slate-50 hover:bg-sky-50/50 transition-colors">
                    <Upload className="w-6 h-6 text-slate-400" />
                    <span className="font-semibold text-slate-700">Click to upload photo evidence</span>
                    <span className="text-[11px] text-slate-400">PNG, JPG, WebP supported</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>

              {/* Citizen Contact Section */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    5. Contact Details
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span>Submit Anonymously</span>
                  </label>
                </div>

                {!isAnonymous && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-600 block mb-1">Your Full Name</label>
                      <input
                        type="text"
                        value={citizenName}
                        onChange={(e) => setCitizenName(e.target.value)}
                        placeholder="e.g. Elena Rostova"
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-sky-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 block mb-1">Email for SMS/Status</label>
                      <input
                        type="email"
                        value={citizenEmail}
                        onChange={(e) => setCitizenEmail(e.target.value)}
                        placeholder="e.g. citizen@example.com"
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-sky-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Location & Interactive Map */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  6. Location & Ward Pin
                </label>

                <div>
                  <label className="text-xs text-slate-600 block mb-1">Municipal Ward</label>
                  <select
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-sky-500"
                  >
                    {CITY_WARDS.map((w) => (
                      <option key={w.id} value={w.name}>
                        {w.name} ({w.zone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-600 block mb-1">Street Address or Landmark</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 5th Ave & Main Street, Gate 3"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-sky-500"
                  />
                </div>

                {/* Map Interactive Pin Component */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                    <span>Click on map to drop precise pin:</span>
                    <span className="font-mono text-sky-700">
                      {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                    </span>
                  </div>
                  <InteractiveCityMap
                    complaints={existingComplaints}
                    mode="picker"
                    height="h-64"
                    selectedLocation={coords}
                    onSelectLocation={handleMapLocationSelect}
                  />
                </div>
              </div>

              {/* Submit CTA Card */}
              <div className="bg-gradient-to-br from-slate-900 to-sky-950 p-6 rounded-2xl text-white space-y-4 border border-slate-800 shadow-md">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-sky-400" />
                  <span className="text-sm font-bold">Autonomous AI Triage Active</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Upon submission, Gemini AI immediately evaluates urgency, detects duplicate tickets, alerts emergency dispatchers if life safety risks are present, and generates your tracking ID.
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 disabled:bg-slate-700 text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Evaluating with AI Triage...</span>
                  ) : (
                    <>
                      <span>Submit Complaint</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
