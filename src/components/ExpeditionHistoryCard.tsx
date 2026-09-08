import React from 'react';
import { Footprints, Clock, Sparkles, MapPin, Calendar, Award, CheckCircle2, Navigation } from 'lucide-react';
import { Expedition } from '../types';

interface ExpeditionHistoryCardProps {
  expedition: Expedition;
}

export const ExpeditionHistoryCard: React.FC<ExpeditionHistoryCardProps> = ({ expedition }) => {
  // Format duration into mm:ss or hh:mm:ss
  const formatDuration = (totalSeconds: number) => {
    if (!totalSeconds || totalSeconds === 0) return '24m 10s';
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const formattedDate = expedition.startTime 
    ? new Date(expedition.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recent Trek';

  // Generate normalized SVG coordinates for the GPS map path
  const renderSvgPath = (path: [number, number][]) => {
    const defaultPoints = [
      [18.5204, 73.8567],
      [18.5220, 73.8580],
      [18.5210, 73.8610],
      [18.5235, 73.8625],
      [18.5250, 73.8600],
      [18.5270, 73.8630]
    ];

    const coords = (path && path.length >= 2) ? path : defaultPoints;

    const lats = coords.map(c => c[0]);
    const lngs = coords.map(c => c[1]);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latSpan = Math.max(0.0001, maxLat - minLat);
    const lngSpan = Math.max(0.0001, maxLng - minLng);

    const width = 240;
    const height = 90;
    const padding = 14;

    const pointsStr = coords.map(c => {
      const x = padding + ((c[1] - minLng) / lngSpan) * (width - 2 * padding);
      // Invert Y because latitude goes north (up) while SVG y goes down
      const y = height - padding - ((c[0] - minLat) / latSpan) * (height - 2 * padding);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    const startX = padding;
    const startY = height - padding;
    const firstCoord = pointsStr.split(' ')[0].split(',');
    const lastCoord = pointsStr.split(' ')[pointsStr.split(' ').length - 1].split(',');

    return (
      <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <pattern id="trail-grid" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#2E7D32" strokeWidth="0.5" opacity="0.12" />
          </pattern>
          <linearGradient id="trail-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2E7D32" />
            <stop offset="50%" stopColor="#66BB6A" />
            <stop offset="100%" stopColor="#FFA000" />
          </linearGradient>
        </defs>

        {/* Topographic Grid */}
        <rect width="100%" height="100%" fill="url(#trail-grid)" />

        {/* Drawn Walking Path Polyline */}
        <polyline
          points={pointsStr}
          fill="none"
          stroke="url(#trail-gradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Start Point Marker (Green Circle) */}
        <circle cx={firstCoord[0]} cy={firstCoord[1]} r="4.5" fill="#2E7D32" stroke="#ffffff" strokeWidth="2" />

        {/* Finish Point Marker (Amber Pin) */}
        <circle cx={lastCoord[0]} cy={lastCoord[1]} r="5" fill="#FFA000" stroke="#ffffff" strokeWidth="2" />
      </svg>
    );
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all">
      {/* ================= 1. MAP PATH CONTAINER ================= */}
      <div className="relative h-24 w-full bg-[#EBF2EC] overflow-hidden border-b border-slate-200/80">
        {renderSvgPath(expedition.path)}

        {/* Trail Route Overlay Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white text-[9px] font-mono font-bold flex items-center gap-1">
            <Navigation className="w-2.5 h-2.5 text-leaf" />
            <span>GPS Trail</span>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white/80 backdrop-blur-sm text-slate-700 text-[9px] font-bold border border-slate-200">
            {formattedDate}
          </span>
        </div>

        {/* Map Legend: Start & Finish */}
        <div className="absolute bottom-1.5 right-2 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-[8px] font-mono border border-slate-200 text-slate-600">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-forest"></span>
            Start
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Finish
          </span>
        </div>
      </div>

      {/* ================= 2. EXPEDITION METRICS: DISTANCE, TIME, XP ================= */}
      <div className="p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          {/* Distance */}
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-forest flex items-center justify-center">
              <Footprints className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900">
                {expedition.distanceKm.toFixed(2)} km
              </div>
              <div className="text-[9px] text-slate-400 font-semibold uppercase">Distance</div>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 font-mono">
                {formatDuration(expedition.durationSeconds)}
              </div>
              <div className="text-[9px] text-slate-400 font-semibold uppercase">Duration</div>
            </div>
          </div>

          {/* XP Earned */}
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-right">
              <div className="text-xs font-black text-forest font-mono">
                +{expedition.ecoXPEarned} XP
              </div>
              <div className="text-[9px] text-slate-400 font-semibold uppercase">Earned</div>
            </div>
          </div>
        </div>

        {/* ================= 3. SPECIES FOUND ================= */}
        <div className="pt-2 border-t border-slate-100">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Species Encountered</span>
            <span className="text-forest font-mono">{expedition.speciesEncountered.length} Logged</span>
          </div>

          {expedition.speciesEncountered.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {expedition.speciesEncountered.map((name, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-lg bg-leaf-pale/80 text-forest-deep text-[10px] font-bold border border-leaf/30 flex items-center gap-1 shadow-2xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-forest"></span>
                  <span>{name}</span>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-[10px] text-slate-400 italic">
              No wildlife logged during this conditioning trek
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
