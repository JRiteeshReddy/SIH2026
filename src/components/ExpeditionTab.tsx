import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Flame, 
  Footprints, 
  Compass, 
  Clock, 
  Zap, 
  Camera, 
  AlertCircle,
  Plus,
  Navigation
} from 'lucide-react';
import { useEcoDex } from '../context/EcoDexContext';
import { audio } from '../services/audioService';
import { INITIAL_SPECIES } from '../data/speciesData';

export const ExpeditionTab: React.FC = () => {
  const { 
    isExpeditionActive, 
    currentExpedition, 
    startExpedition, 
    updateExpeditionProgress, 
    finishExpedition, 
    cancelExpedition,
    setOpenScannerModal
  } = useEcoDex();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [encounterAlert, setEncounterAlert] = useState<{ speciesName: string; distanceMeters: number } | null>(null);
  const timerRef = useRef<number | null>(null);

  // Timer loop when expedition is active
  useEffect(() => {
    if (isExpeditionActive) {
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsedSeconds(0);
      setEncounterAlert(null);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isExpeditionActive]);

  // Format MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Simulate a step or walking movement
  const handleSimulateWalk = () => {
    if (!isExpeditionActive) return;
    const delta = 0.25; // 250 meters
    updateExpeditionProgress(delta);
    audio.playChime();

    // Random chance of triggering wildlife radar encounter
    if (Math.random() > 0.4) {
      const candidates = INITIAL_SPECIES.slice(0, 15);
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      setEncounterAlert({
        speciesName: chosen.name,
        distanceMeters: Math.floor(25 + Math.random() * 60)
      });
      audio.playRadarPing();
    }
  };

  const distance = currentExpedition?.distanceKm || 0.0;
  const steps = currentExpedition?.steps || 0;
  const calories = currentExpedition?.caloriesBurned || 0;
  const pace = distance > 0 ? (elapsedSeconds / 60 / distance).toFixed(1) : '0.0';

  return (
    <div className="space-y-4 pb-20 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-forest">
            Outdoor Fitness Trek
          </span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Nature Expedition
          </h1>
        </div>

        {isExpeditionActive && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span>GPS Tracking Active</span>
          </div>
        )}
      </div>

      {/* Main Metrics Card */}
      <div className="rounded-card bg-gradient-forest text-white p-6 shadow-nature relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-leaf opacity-20 blur-3xl pointer-events-none"></div>

        {/* Distance Display */}
        <div className="text-center py-2">
          <div className="text-xs uppercase font-extrabold tracking-widest text-leaf-pale">
            Total Distance Covered
          </div>
          <div className="text-5xl sm:text-6xl font-black tracking-tight my-1">
            {distance.toFixed(2)} <span className="text-xl sm:text-2xl font-bold text-golden">km</span>
          </div>
          <div className="text-xs text-emerald-100 font-medium">
            Stay Fit • Explore Wilderness
          </div>
        </div>

        {/* 3-Grid Stats */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl py-2 px-1">
            <div className="flex items-center justify-center gap-1 text-leaf-pale mb-0.5">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-bold">Duration</span>
            </div>
            <div className="text-sm font-extrabold text-white font-mono">
              {formatTime(elapsedSeconds)}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl py-2 px-1">
            <div className="flex items-center justify-center gap-1 text-leaf-pale mb-0.5">
              <Footprints className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-bold">Steps</span>
            </div>
            <div className="text-sm font-extrabold text-white font-mono">
              {steps.toLocaleString()}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl py-2 px-1">
            <div className="flex items-center justify-center gap-1 text-golden mb-0.5">
              <Flame className="w-3.5 h-3.5 fill-golden" />
              <span className="text-[10px] uppercase font-bold">Burn</span>
            </div>
            <div className="text-sm font-extrabold text-white font-mono">
              {calories} kcal
            </div>
          </div>
        </div>
      </div>

      {/* Wildlife Encounter Radar Alert */}
      {encounterAlert && isExpeditionActive && (
        <div className="p-4 rounded-card bg-amber-500/10 border-2 border-amber-400 text-amber-950 shadow-nature animate-pulse-glow flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/30 flex items-center justify-center text-xl">
              ⚠️
            </div>
            <div>
              <div className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                Wildlife Scent In Vicinity!
              </div>
              <div className="text-sm font-extrabold text-slate-900">
                {encounterAlert.speciesName} (~{encounterAlert.distanceMeters}m away)
              </div>
            </div>
          </div>

          <button
            onClick={() => setOpenScannerModal(true)}
            className="px-3 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            Scan Now
          </button>
        </div>
      )}

      {/* Field Map Radar View */}
      <div className="rounded-card bg-white border border-leaf-pale shadow-nature p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-forest" />
            <h2 className="text-sm font-bold text-slate-800">Field Radar & Terrain Path</h2>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">GPS: Pune Eco-Reserve</span>
        </div>

        {/* Visual Map Radar Canvas */}
        <div className="relative h-60 w-full rounded-2xl bg-[#E8EFE9] border border-leaf/20 overflow-hidden flex items-center justify-center shadow-inner">
          {/* Topographic Contour Lines */}
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50%" cy="50%" r="40" fill="none" stroke="#2E7D32" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="50%" cy="50%" r="85" fill="none" stroke="#2E7D32" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="50%" cy="50%" r="130" fill="none" stroke="#2E7D32" strokeWidth="1" strokeDasharray="5 5" />
            <path d="M 0 40 Q 150 90 400 30" fill="none" stroke="#66BB6A" strokeWidth="1.5" />
            <path d="M 0 160 Q 200 210 400 140" fill="none" stroke="#66BB6A" strokeWidth="1.5" />
          </svg>

          {/* Rotating Radar Sweep Line when active */}
          {isExpeditionActive && (
            <div className="absolute w-64 h-64 rounded-full pointer-events-none radar-sweep flex items-center justify-center">
              <div className="w-1/2 h-0.5 bg-gradient-to-r from-transparent to-leaf-light origin-left"></div>
            </div>
          )}

          {/* Discovered species pins on the map */}
          <div className="absolute top-10 left-12 flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-white shadow-md border border-leaf flex items-center justify-center text-sm animate-bounce">
              🐿️
            </div>
            <span className="text-[9px] font-bold bg-white/80 px-1 rounded text-forest">Squirrel</span>
          </div>

          <div className="absolute bottom-12 right-14 flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-white shadow-md border border-leaf flex items-center justify-center text-sm">
              🦚
            </div>
            <span className="text-[9px] font-bold bg-white/80 px-1 rounded text-forest">Peafowl</span>
          </div>

          {/* Current Explorer Beacon */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative">
              <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-forest opacity-50"></span>
              <div className="w-8 h-8 rounded-full bg-forest border-2 border-white shadow-nature-glow flex items-center justify-center text-white">
                <Navigation className="w-4 h-4 fill-white rotate-45" />
              </div>
            </div>
            <span className="mt-1 text-[10px] font-extrabold bg-slate-900 text-white px-2 py-0.5 rounded-full shadow">
              You (Explorer)
            </span>
          </div>

          {/* Floating simulation walk pill */}
          {isExpeditionActive && (
            <button
              onClick={handleSimulateWalk}
              className="absolute bottom-3 right-3 z-20 px-3 py-1.5 rounded-full bg-white/95 text-forest border border-leaf/40 font-bold text-xs shadow-md flex items-center gap-1.5 hover:bg-leaf-pale transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Simulate Trek +0.25 km
            </button>
          )}
        </div>
      </div>

      {/* Expedition Action Controls */}
      <div className="flex gap-3">
        {!isExpeditionActive ? (
          <button
            onClick={startExpedition}
            className="flex-1 py-3.5 px-6 rounded-xl bg-forest hover:bg-forest-light text-white font-bold text-sm shadow-nature flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" />
            Launch Outdoor Expedition
          </button>
        ) : (
          <>
            <button
              onClick={handleSimulateWalk}
              className="flex-1 py-3 px-4 rounded-xl bg-leaf-pale hover:bg-emerald-100 text-forest font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              Log +250m Steps
            </button>

            <button
              onClick={finishExpedition}
              className="flex-1 py-3 px-4 rounded-xl bg-forest hover:bg-forest-light text-white font-bold text-xs shadow-nature flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Square className="w-4 h-4 fill-white" />
              Complete & Bank XP
            </button>

            <button
              onClick={cancelExpedition}
              className="px-3 py-3 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors text-xs font-semibold cursor-pointer"
              title="Cancel Trek"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};
