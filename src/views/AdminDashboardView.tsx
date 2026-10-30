import React, { useState, useMemo } from 'react';
import {
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
  PriorityLevel,
} from '../types/civic';
import {
  LayoutDashboard,
  ShieldAlert,
  Clock,
  CheckCircle2,
  GitMerge,
  Search,
  Filter,
  Download,
  Eye,
  Building,
  Layers,
  Sparkles,
} from 'lucide-react';

interface AdminDashboardViewProps {
  complaints: Complaint[];
  onSelectComplaint: (complaint: Complaint) => void;
  onOpenDuplicateResolution?: (complaint: Complaint) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  complaints,
  onSelectComplaint,
  onOpenDuplicateResolution,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [wardFilter, setWardFilter] = useState<string>('all');

  // Aggregated KPIs
  const total = complaints.length;
  const critical = complaints.filter((c) => c.priority === 'Critical' && c.status !== 'Resolved').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress' || c.status === 'Assigned').length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;
  const underReview = complaints.filter((c) => c.status === 'Submitted' || c.status === 'Under Review').length;
  const duplicates = complaints.filter((c) => c.duplicateOfId || c.isDuplicateFlagged).length;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const duplicateRate = total > 0 ? Math.round((duplicates / total) * 100) : 0;

  // Priority Distribution
  const priorityCounts = useMemo(() => {
    return {
      Critical: complaints.filter((c) => c.priority === 'Critical').length,
      High: complaints.filter((c) => c.priority === 'High').length,
      Medium: complaints.filter((c) => c.priority === 'Medium').length,
      Low: complaints.filter((c) => c.priority === 'Low').length,
    };
  }, [complaints]);

  // Category Counts
  const categoryCounts = useMemo(() => {
    const counts: Record<ComplaintCategory, number> = {
      Roads: 0,
      Waterlogging: 0,
      'Waste Management': 0,
      Drainage: 0,
      Streetlights: 0,
      'Public Safety': 0,
    };
    complaints.forEach((c) => {
      if (counts[c.category] !== undefined) {
        counts[c.category]++;
      }
    });
    return counts;
  }, [complaints]);

  // Filtered complaints table
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchesSearch =
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location.address.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || c.priority === priorityFilter;
      const matchesWard = wardFilter === 'all' || c.location.ward.includes(wardFilter);

      return matchesSearch && matchesCategory && matchesStatus && matchesPriority && matchesWard;
    });
  }, [complaints, searchTerm, categoryFilter, statusFilter, priorityFilter, wardFilter]);

  // Download CSV export
  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Category', 'Priority', 'Status', 'Ward', 'Address', 'Department', 'Created At'];
    const rows = filteredComplaints.map((c) => [
      c.id,
      `"${c.title.replace(/"/g, '""')}"`,
      c.category,
      c.priority,
      c.status,
      `"${c.location.ward}"`,
      `"${c.location.address}"`,
      `"${c.assignedDepartment || 'Unassigned'}"`,
      c.createdAt,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CivicPulse_Complaints_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="w-5 h-5 text-sky-600" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Municipal Operations & Triage Dashboard
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time telemetry across city wards, automated priority routing, and SLA compliance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer border border-slate-300"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Total Registered</div>
          <div className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 mt-1">
            {total}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Active municipal intake</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-red-200 shadow-2xs bg-red-50/20">
          <div className="text-xs font-medium text-red-700 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Critical Emergency</span>
          </div>
          <div className="text-3xl font-extrabold font-mono tabular-nums text-red-600 mt-1">
            {critical}
          </div>
          <div className="text-[11px] text-red-500 mt-1 font-semibold">Immediate safety priority</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Awaiting Triage</div>
          <div className="text-3xl font-extrabold font-mono tabular-nums text-amber-600 mt-1">
            {underReview}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Submitted / Review</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Active Field Operations</div>
          <div className="text-3xl font-extrabold font-mono tabular-nums text-sky-600 mt-1">
            {inProgress}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Assigned / In Progress</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Resolved Cases</div>
          <div className="text-3xl font-extrabold font-mono tabular-nums text-emerald-600 mt-1">
            {resolved}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            {resolutionRate}% turnaround rate
          </div>
        </div>
      </div>

      {/* Analytics Visualizers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Complaint Priority Distribution
            </h2>
            <span className="text-xs text-slate-400 font-mono">100% Triage Coverage</span>
          </div>

          {/* Segmented Bar Visualizer */}
          <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-100">
            <div
              style={{ width: `${(priorityCounts.Critical / total) * 100}%` }}
              className="bg-red-500 h-full"
              title={`Critical: ${priorityCounts.Critical}`}
            />
            <div
              style={{ width: `${(priorityCounts.High / total) * 100}%` }}
              className="bg-amber-500 h-full"
              title={`High: ${priorityCounts.High}`}
            />
            <div
              style={{ width: `${(priorityCounts.Medium / total) * 100}%` }}
              className="bg-sky-500 h-full"
              title={`Medium: ${priorityCounts.Medium}`}
            />
            <div
              style={{ width: `${(priorityCounts.Low / total) * 100}%` }}
              className="bg-slate-400 h-full"
              title={`Low: ${priorityCounts.Low}`}
            />
          </div>

          {/* Priority Breakdown Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-100">
              <span className="font-semibold text-red-700 block">Critical</span>
              <span className="text-lg font-bold font-mono text-red-900 tabular-nums">
                {priorityCounts.Critical}
              </span>
              <span className="text-[10px] text-red-600 block">
                {Math.round((priorityCounts.Critical / total) * 100)}% of intake
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-100">
              <span className="font-semibold text-amber-700 block">High</span>
              <span className="text-lg font-bold font-mono text-amber-900 tabular-nums">
                {priorityCounts.High}
              </span>
              <span className="text-[10px] text-amber-600 block">
                {Math.round((priorityCounts.High / total) * 100)}% of intake
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-100">
              <span className="font-semibold text-sky-700 block">Medium</span>
              <span className="text-lg font-bold font-mono text-sky-900 tabular-nums">
                {priorityCounts.Medium}
              </span>
              <span className="text-[10px] text-sky-600 block">
                {Math.round((priorityCounts.Medium / total) * 100)}% of intake
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-700 block">Low</span>
              <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                {priorityCounts.Low}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {Math.round((priorityCounts.Low / total) * 100)}% of intake
              </span>
            </div>
          </div>
        </div>

        {/* Category Breakdown Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Category Distribution & Routing
            </h2>
            <span className="text-xs text-slate-400 font-mono">6 Municipal Domains</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / total) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-slate-700 font-medium">
                    <span>{cat}</span>
                    <span className="font-mono tabular-nums text-slate-500">
                      {count} cases ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-sky-600 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filterable Master Complaints Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Table Filters Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50/70 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by ID, keyword, address..."
                className="w-full text-xs bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-800 focus:outline-sky-500"
              />
            </div>

            <div className="text-xs text-slate-500 font-mono">
              Showing <strong className="text-slate-900">{filteredComplaints.length}</strong> of{' '}
              {complaints.length} complaints
            </div>
          </div>

          {/* Dropdown Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-700 text-xs focus:outline-sky-500"
              >
                <option value="all">All Categories</option>
                <option value="Roads">Roads</option>
                <option value="Waterlogging">Waterlogging</option>
                <option value="Waste Management">Waste Management</option>
                <option value="Drainage">Drainage</option>
                <option value="Streetlights">Streetlights</option>
                <option value="Public Safety">Public Safety</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-700 text-xs focus:outline-sky-500"
              >
                <option value="all">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-700 text-xs focus:outline-sky-500"
              >
                <option value="all">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Ward</label>
              <select
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-700 text-xs focus:outline-sky-500"
              >
                <option value="all">All Wards</option>
                <option value="Ward 1">Ward 1 - Central Downtown</option>
                <option value="Ward 2">Ward 2 - Metro South</option>
                <option value="Ward 3">Ward 3 - Riverfront West</option>
                <option value="Ward 4">Ward 4 - North Industrial</option>
                <option value="Ward 5">Ward 5 - Oakridge Heights</option>
                <option value="Ward 6">Ward 6 - Harbor & Maritime</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Complaint ID</th>
                <th className="py-3 px-4">Title & Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Ward / Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No complaints match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => {
                  const isCritical = c.priority === 'Critical';

                  return (
                    <tr
                      key={c.id}
                      onClick={() => onSelectComplaint(c)}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                        isCritical && c.status !== 'Resolved' ? 'bg-red-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-sky-700 whitespace-nowrap">
                        {c.id}
                        {c.duplicateOfId && (
                          <span className="block text-[10px] text-purple-700 font-normal">
                            ↳ merged
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 truncate">{c.title}</div>
                        <div className="text-slate-500 text-[11px] truncate">{c.description}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700 whitespace-nowrap">
                        {c.category}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                            c.priority === 'Critical'
                              ? 'text-red-700 bg-red-100'
                              : c.priority === 'High'
                              ? 'text-amber-700 bg-amber-100'
                              : c.priority === 'Medium'
                              ? 'text-sky-700 bg-sky-100'
                              : 'text-slate-700 bg-slate-100'
                          }`}
                        >
                          {c.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-[180px] truncate">
                        <div className="font-medium truncate">{c.location.ward}</div>
                        <div className="text-[11px] text-slate-400 truncate">{c.location.address}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                            c.status === 'Resolved'
                              ? 'text-emerald-700 bg-emerald-100'
                              : c.status === 'In Progress'
                              ? 'text-blue-700 bg-blue-100'
                              : c.status === 'Assigned'
                              ? 'text-purple-700 bg-purple-100'
                              : 'text-amber-700 bg-amber-100'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectComplaint(c);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded border border-sky-200 transition-colors cursor-pointer"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
