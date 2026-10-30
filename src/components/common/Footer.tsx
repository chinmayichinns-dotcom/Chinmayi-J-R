import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">CivicPulse AI</span>
          <span className="text-slate-600">·</span>
          <span>From Complaints to Action</span>
          <span className="text-slate-600">·</span>
          <span>Municipal Civic Tech Prototype</span>
        </div>
        <div className="flex items-center gap-6 text-slate-400">
          <span>WGS-84 GIS Engine</span>
          <span>·</span>
          <span>Autonomous Triage Matrix</span>
          <span>·</span>
          <span className="font-mono tabular-nums text-slate-400">© 2026 City of Metro Pulse</span>
        </div>
      </div>
    </footer>
  );
};
