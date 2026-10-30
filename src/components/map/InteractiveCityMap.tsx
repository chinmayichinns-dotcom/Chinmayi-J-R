import React, { useState } from 'react';
import { Complaint, HotspotCluster, CityWard } from '../../types/civic';
import { MapPin, AlertTriangle, Layers, Navigation, Info } from 'lucide-react';

interface InteractiveCityMapProps {
  complaints: Complaint[];
  hotspots?: HotspotCluster[];
  selectedLocation?: { lat: number; lng: number; address?: string };
  onSelectLocation?: (loc: { lat: number; lng: number; ward: string }) => void;
  onSelectComplaint?: (complaint: Complaint) => void;
  onSelectHotspot?: (hotspot: HotspotCluster) => void;
  mode?: 'view' | 'picker' | 'hotspots';
  height?: string;
  activeHotspotId?: string;
}

// Coordinate mapping boundaries for the synthetic city
// Lat: 37.735 to 37.805 (approx 7.7km)
// Lng: -122.455 to -122.380 (approx 6.6km)
const BOUNDS = {
  minLat: 37.735,
  maxLat: 37.805,
  minLng: -122.455,
  maxLng: -122.380,
};

function latLngToSvg(lat: number, lng: number, width: number = 800, height: number = 600) {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * width;
  // Invert Y because SVG coordinates increase downwards
  const y = (1 - (lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * height;
  return { x: Math.max(20, Math.min(width - 20, x)), y: Math.max(20, Math.min(height - 20, y)) };
}

function svgToLatLng(x: number, y: number, width: number = 800, height: number = 600) {
  const lng = BOUNDS.minLng + (x / width) * (BOUNDS.maxLng - BOUNDS.minLng);
  const lat = BOUNDS.minLat + (1 - y / height) * (BOUNDS.maxLat - BOUNDS.minLat);
  return { lat: Number(lat.toFixed(4)), lng: Number(lng.toFixed(4)) };
}

// Determine ward based on coordinates
export function getWardForCoordinates(lat: number, lng: number): string {
  if (lat > 37.785) return 'Ward 4 - North Industrial Corridor';
  if (lng > -122.395) return 'Ward 6 - Harbor & Maritime Gate';
  if (lat < 37.752) return 'Ward 5 - Oakridge Heights';
  if (lng < -122.430) return 'Ward 3 - Riverfront West';
  if (lat < 37.768) return 'Ward 2 - Metro South & Transit Hub';
  return 'Ward 1 - Central Downtown';
}

export const InteractiveCityMap: React.FC<InteractiveCityMapProps> = ({
  complaints,
  hotspots = [],
  selectedLocation,
  onSelectLocation,
  onSelectComplaint,
  onSelectHotspot,
  mode = 'view',
  height = 'h-96',
  activeHotspotId,
}) => {
  const [mapLayer, setMapLayer] = useState<'standard' | 'clusters' | 'heatmap'>('clusters');
  const [hoveredItem, setHoveredItem] = useState<{ text: string; sub: string; x: number; y: number } | null>(null);

  const svgWidth = 800;
  const svgHeight = 560;

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (mode !== 'picker' || !onSelectLocation) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * svgWidth;
    const clickY = ((e.clientY - rect.top) / rect.height) * svgHeight;
    const coords = svgToLatLng(clickX, clickY, svgWidth, svgHeight);
    const ward = getWardForCoordinates(coords.lat, coords.lng);
    onSelectLocation({ lat: coords.lat, lng: coords.lng, ward });
  };

  const selectedSvgCoord = selectedLocation
    ? latLngToSvg(selectedLocation.lat, selectedLocation.lng, svgWidth, svgHeight)
    : null;

  return (
    <div className={`relative w-full ${height} bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-sm flex flex-col select-none`}>
      {/* Top Map Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 shadow text-xs pointer-events-auto text-slate-200">
          <Navigation className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-semibold text-white">Metropolitan District GIS</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400 font-mono text-[11px]">Grid: WGS-84</span>
        </div>

        {mode !== 'picker' && (
          <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-700/80 pointer-events-auto">
            <button
              onClick={() => setMapLayer('clusters')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                mapLayer === 'clusters' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hotspot Clusters
            </button>
            <button
              onClick={() => setMapLayer('standard')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                mapLayer === 'standard' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Incidents ({complaints.length})
            </button>
            <button
              onClick={() => setMapLayer('heatmap')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                mapLayer === 'heatmap' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Density Heat
            </button>
          </div>
        )}

        {mode === 'picker' && (
          <div className="bg-sky-500/90 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow pointer-events-auto flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 animate-bounce" />
            <span>Click anywhere on the city map to set problem location</span>
          </div>
        )}
      </div>

      {/* SVG GIS Map Canvas */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className={`w-full h-full ${mode === 'picker' ? 'cursor-crosshair' : 'cursor-default'}`}
          onClick={handleSvgClick}
        >
          <defs>
            {/* Water gradient */}
            <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f2b48" />
              <stop offset="100%" stopColor="#081c30" />
            </linearGradient>

            {/* Hotspot Radial Glow */}
            <radialGradient id="hotspotGlowCritical" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#ef4444" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="hotspotGlowHigh" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Land Surface */}
          <rect width={svgWidth} height={svgHeight} fill="#0d1b2a" />

          {/* Waterway (River & Harbor Bay on East/West) */}
          <path
            d="M 620,0 C 640,120 660,250 630,380 C 600,480 640,540 680,600 L 800,600 L 800,0 Z"
            fill="url(#waterGrad)"
            stroke="#1e3a5f"
            strokeWidth="1.5"
          />
          <path
            d="M 0,180 C 50,220 70,320 40,420 C 20,490 60,560 80,600 L 0,600 Z"
            fill="url(#waterGrad)"
            stroke="#1e3a5f"
            strokeWidth="1.5"
          />

          {/* Municipal Ward Grid Lines & Zones */}
          <g stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3">
            <line x1="0" y1="180" x2="800" y2="180" />
            <line x1="0" y1="360" x2="800" y2="360" />
            <line x1="280" y1="0" x2="280" y2="560" />
            <line x1="560" y1="0" x2="560" y2="560" />
          </g>

          {/* Major City Arteries / Highway Grid */}
          <g stroke="#334155" strokeWidth="2.5" strokeLinecap="round">
            {/* Express Ring Road */}
            <path d="M 60,260 Q 400,240 700,260" fill="none" stroke="#2563eb" strokeOpacity="0.3" strokeWidth="6" />
            <path d="M 60,260 Q 400,240 700,260" fill="none" stroke="#38bdf8" strokeWidth="2" />

            {/* Central Avenue (North-South) */}
            <path d="M 400,0 L 400,560" fill="none" stroke="#475569" strokeWidth="2.5" />
            {/* 5th Avenue Spine */}
            <path d="M 460,80 L 440,480" fill="none" stroke="#64748b" strokeWidth="2" />
            {/* Main Street Spine */}
            <path d="M 120,310 L 680,310" fill="none" stroke="#475569" strokeWidth="2.5" />

            {/* Harbor Expressway */}
            <path d="M 520,60 C 580,180 570,340 640,520" fill="none" stroke="#64748b" strokeWidth="2" />
            {/* Riverfront Parkway */}
            <path d="M 90,160 C 130,280 110,400 130,520" fill="none" stroke="#475569" strokeWidth="1.8" />
          </g>

          {/* Ward Labels */}
          <g fill="#475569" fontSize="11" fontWeight="600" letterSpacing="0.05em">
            <text x="360" y="110">WARD 4 · NORTH INDUSTRIAL</text>
            <text x="390" y="270">WARD 1 · DOWNTOWN CORE</text>
            <text x="380" y="420">WARD 2 · METRO SOUTH</text>
            <text x="110" y="380">WARD 3 · RIVERFRONT</text>
            <text x="240" y="520">WARD 5 · OAKRIDGE</text>
            <text x="650" y="210">WARD 6 · HARBOR</text>
          </g>

          {/* Density Heatmap Layer */}
          {mapLayer === 'heatmap' && (
            <g opacity="0.6">
              {hotspots.map((hs) => {
                const coord = latLngToSvg(hs.center.lat, hs.center.lng, svgWidth, svgHeight);
                return (
                  <circle
                    key={`heat-${hs.id}`}
                    cx={coord.x}
                    cy={coord.y}
                    r={hs.criticalCount > 0 ? 95 : 75}
                    fill={hs.criticalCount > 0 ? 'url(#hotspotGlowCritical)' : 'url(#hotspotGlowHigh)'}
                  />
                );
              })}
            </g>
          )}

          {/* Hotspot Cluster Rings (Clusters View) */}
          {(mapLayer === 'clusters' || mode === 'hotspots') && (
            <g>
              {hotspots.map((hs) => {
                const coord = latLngToSvg(hs.center.lat, hs.center.lng, svgWidth, svgHeight);
                const isSelected = activeHotspotId === hs.id;
                const isCritical = hs.criticalCount > 0;

                return (
                  <g
                    key={`cluster-${hs.id}`}
                    className="cursor-pointer transition-transform hover:scale-105"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectHotspot && onSelectHotspot(hs);
                    }}
                    onMouseEnter={() => {
                      setHoveredItem({
                        text: hs.name,
                        sub: `${hs.totalCount} complaints (${hs.criticalCount} critical) · Severity: ${hs.severityScore}/10`,
                        x: coord.x,
                        y: coord.y,
                      });
                    }}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {/* Pulsing ring for critical areas */}
                    {isCritical && (
                      <circle
                        cx={coord.x}
                        cy={coord.y}
                        r="38"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="1.5"
                        strokeOpacity="0.4"
                        className="animate-ping"
                      />
                    )}

                    {/* Cluster Zone Circle */}
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r={isSelected ? '32' : '26'}
                      fill={isCritical ? '#7f1d1d' : '#1e3a8a'}
                      fillOpacity="0.8"
                      stroke={isSelected ? '#38bdf8' : isCritical ? '#f87171' : '#60a5fa'}
                      strokeWidth={isSelected ? '3' : '1.5'}
                    />

                    {/* Cluster Count Text */}
                    <text
                      x={coord.x}
                      y={coord.y - 2}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="12"
                      fontWeight="700"
                      className="font-mono"
                    >
                      {hs.totalCount}
                    </text>
                    <text
                      x={coord.x}
                      y={coord.y + 11}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="9"
                      fontWeight="600"
                    >
                      CASES
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Individual Complaint Markers */}
          {mapLayer === 'standard' && (
            <g>
              {complaints.map((c) => {
                const coord = latLngToSvg(c.location.lat, c.location.lng, svgWidth, svgHeight);
                const isCritical = c.priority === 'Critical';
                const isResolved = c.status === 'Resolved';
                const isHigh = c.priority === 'High';

                let pinColor = '#3b82f6';
                if (isResolved) pinColor = '#10b981';
                else if (isCritical) pinColor = '#ef4444';
                else if (isHigh) pinColor = '#f59e0b';

                return (
                  <g
                    key={`pin-${c.id}`}
                    className="cursor-pointer transition-transform hover:scale-125"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectComplaint && onSelectComplaint(c);
                    }}
                    onMouseEnter={() => {
                      setHoveredItem({
                        text: `${c.id}: ${c.title}`,
                        sub: `${c.category} · Priority: ${c.priority} · Status: ${c.status}`,
                        x: coord.x,
                        y: coord.y,
                      });
                    }}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r={isCritical ? '6.5' : '4.5'}
                      fill={pinColor}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* Selected Picker Marker */}
          {selectedSvgCoord && (
            <g className="animate-pulse">
              <circle
                cx={selectedSvgCoord.x}
                cy={selectedSvgCoord.y}
                r="18"
                fill="#38bdf8"
                fillOpacity="0.25"
                stroke="#38bdf8"
                strokeWidth="1.5"
              />
              <circle
                cx={selectedSvgCoord.x}
                cy={selectedSvgCoord.y}
                r="7"
                fill="#0284c7"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <text
                x={selectedSvgCoord.x}
                y={selectedSvgCoord.y - 12}
                textAnchor="middle"
                fill="#38bdf8"
                fontSize="11"
                fontWeight="700"
              >
                REPORT PIN
              </text>
            </g>
          )}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredItem && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-950/95 backdrop-blur-md text-white text-xs px-3 py-2 rounded-lg border border-slate-700 shadow-xl max-w-xs -translate-x-1/2 -translate-y-full mb-3"
            style={{
              left: `${(hoveredItem.x / svgWidth) * 100}%`,
              top: `${(hoveredItem.y / svgHeight) * 100}%`,
            }}
          >
            <p className="font-semibold text-slate-100 line-clamp-1">{hoveredItem.text}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{hoveredItem.sub}</p>
          </div>
        )}
      </div>

      {/* Map Footer Legend */}
      <div className="bg-slate-950/80 px-4 py-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
            Critical Emergency
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            High Priority
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
            Standard Intake
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            Resolved
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-slate-400">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Interactive GIS Vector Engine · City of Metro Pulse</span>
        </div>
      </div>
    </div>
  );
};
