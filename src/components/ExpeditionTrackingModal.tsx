import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Pause, 
  Play, 
  Square, 
  Compass, 
  Footprints, 
  Flame, 
  Clock, 
  Plus, 
  Navigation, 
  AlertCircle,
  X,
  Sparkles,
  TreePine,
  ShieldCheck
} from 'lucide-react';
import { useEcoDex } from '../context/EcoDexContext';
import { audio } from '../services/audioService';
import { INITIAL_SPECIES } from '../data/speciesData';
import { Expedition } from '../types';

interface ExpeditionTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinishExpedition: (summary: Expedition) => void;
}

export const ExpeditionTrackingModal: React.FC<ExpeditionTrackingModalProps> = ({
  isOpen,
  onClose,
  onFinishExpedition
}) => {
  const { setOpenScannerModal, user } = useEcoDex();

  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [distanceKm, setDistanceKm] = useState(0.0);
  const [steps, setSteps] = useState(0);
  const [calories, setCalories] = useState(0);
  const [coords, setCoords] = useState<[number, number][]>([[18.5204, 73.8567]]);
  const [gpsPermissionState, setGpsPermissionState] = useState<'prompt' | 'granted' | 'simulated'>('prompt');
  const [encounteredSpecies, setEncounteredSpecies] = useState<string[]>(['Indian Palm Squirrel']);
  const [wildlifeAlert, setWildlifeAlert] = useState<{ name: string; distance: number } | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  // Initialize GPS Tracking and Timer on open
  useEffect(() => {
    if (!isOpen) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      return;
    }

    audio.playRadarPing();
    setSeconds(0);
    setDistanceKm(0.0);
    setSteps(0);
    setCalories(0);
    setIsPaused(false);
    setEncounteredSpecies(['Indian Palm Squirrel']);

    // Request GPS Permission
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsPermissionState('granted');
          setCoords([[pos.coords.latitude, pos.coords.longitude]]);
        },
        (err) => {
          console.warn('GPS permission denied or unavailable, using nature reserve coordinates:', err);
          setGpsPermissionState('simulated');
          setCoords([[18.5204, 73.8567]]);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );

      // Start watching position
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          if (!isPaused) {
            const newLat = pos.coords.latitude;
            const newLng = pos.coords.longitude;
            setCoords(prev => [...prev, [newLat, newLng]]);
          }
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 3000 }
      );
    } else {
      setGpsPermissionState('simulated');
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [isOpen]);

  // Live Timer
  useEffect(() => {
    if (isOpen && !isPaused) {
      timerRef.current = window.setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isPaused]);

  if (!isOpen) return null;

  // Format seconds to HH:MM:SS
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Add Distance Delta
  const addDistance = (deltaKm: number) => {
    if (isPaused) return;
    const nextDist = parseFloat((distanceKm + deltaKm).toFixed(2));
    const nextSteps = Math.round(nextDist * 1350);
    const nextCalories = Math.round(nextDist * 65);

    setDistanceKm(nextDist);
    setSteps(nextSteps);
    setCalories(nextCalories);

    // Simulate GPS path delta
    const lastCoord = coords[coords.length - 1] || [18.5204, 73.8567];
    const nextLat = lastCoord[0] + (Math.random() - 0.45) * 0.001;
    const nextLng = lastCoord[1] + (Math.random() - 0.45) * 0.001;
    setCoords(prev => [...prev, [nextLat, nextLng]]);

    audio.playChime();

    // Random chance of proximity wildlife alert
    if (Math.random() > 0.45) {
      const candidates = INITIAL_SPECIES.slice(0, 12);
      const spotted = candidates[Math.floor(Math.random() * candidates.length)];
      setWildlifeAlert({
        name: spotted.name,
        distance: Math.floor(20 + Math.random() * 50)
      });
      if (!encounteredSpecies.includes(spotted.name)) {
        setEncounteredSpecies(prev => [...prev, spotted.name]);
      }
      audio.playRadarPing();
    }
  };

  const handleTogglePause = () => {
    audio.playChime();
    setIsPaused(prev => !prev);
  };

  const handleFinish = () => {
    audio.playDiscovery();
    const finalDist = distanceKm > 0 ? distanceKm : 0.85;
    const earnedXP = Math.max(80, Math.round(finalDist * 110));

    // Calculate rating based on distance and duration
    let rating = 5;
    let ratingTitle = 'Master Trailblazer';
    if (finalDist < 0.5) {
      rating = 4;
      ratingTitle = 'Curious Scout';
    } else if (finalDist >= 2.0) {
      rating = 5;
      ratingTitle = 'Grand Field Naturalist';
    }

    const expeditionSummary: Expedition = {
      id: 'exp_' + Date.now(),
      userId: user?.uid || '',
      startTime: Date.now() - seconds * 1000,
      endTime: Date.now(),
      distanceKm: finalDist,
      steps: steps > 0 ? steps : Math.round(finalDist * 1350),
      durationSeconds: seconds > 0 ? seconds : 142,
      caloriesBurned: calories > 0 ? calories : Math.round(finalDist * 65),
      speciesEncountered: encounteredSpecies,
      ecoXPEarned: earnedXP,
      path: coords,
      active: false,
      explorerRating: rating,
      ratingTitle
    };

    onFinishExpedition(expeditionSummary);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-card-lg shadow-2xl border border-leaf/30 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top App Bar with Live Indicator */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-forest text-white">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className={`absolute inline-flex h-full w-full rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-ping'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isPaused ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider font-mono">
              {isPaused ? 'Expedition Paused' : 'Live GPS Expedition'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full text-leaf-pale font-medium">
              {gpsPermissionState === 'granted' ? '📡 High Accuracy GPS' : '🛰️ Nature Reserve Radar'}
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Timer & Distance Hero */}
        <div className="bg-slate-900 text-white p-5 text-center relative overflow-hidden">
          <div className="text-[11px] uppercase font-bold tracking-widest text-emerald-400 mb-0.5">
            Active Exploration Time
          </div>
          <div className="text-4xl sm:text-5xl font-black tracking-tight font-mono text-white mb-2">
            {formatTime(seconds)}
          </div>

          <div className="inline-flex items-baseline gap-1.5 bg-white/10 px-4 py-1 rounded-2xl backdrop-blur-sm border border-white/10">
            <span className="text-2xl sm:text-3xl font-black text-golden">{distanceKm.toFixed(2)}</span>
            <span className="text-xs font-bold uppercase text-emerald-200">Kilometers</span>
          </div>

          {/* Mini Stats Bar */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-white/10 max-w-xs mx-auto text-center">
            <div>
              <div className="text-xs font-bold text-white flex items-center justify-center gap-1">
                <Footprints className="w-3.5 h-3.5 text-leaf-light" />
                {steps.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Steps Counted</div>
            </div>

            <div>
              <div className="text-xs font-bold text-white flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                {calories} kcal
              </div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Calories Burned</div>
            </div>
          </div>
        </div>

        {/* Wildlife Proximity Alert */}
        {wildlifeAlert && (
          <div className="bg-amber-500/15 border-y border-amber-400/40 px-4 py-2 flex items-center justify-between text-amber-950">
            <div className="flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <span className="text-xs font-bold">
                {wildlifeAlert.name} detected (~{wildlifeAlert.distance}m away)!
              </span>
            </div>
            <button
              onClick={() => setOpenScannerModal(true)}
              className="px-2.5 py-1 rounded-lg bg-forest text-white text-[11px] font-bold flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              Scan
            </button>
          </div>
        )}

        {/* Interactive Map View with Walking Path Drawing */}
        <div className="relative flex-1 min-h-[220px] sm:min-h-[260px] bg-[#E8EFE9] overflow-hidden flex items-center justify-center">
          {/* Topographic Background Pattern & Trail */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#2E7D32" strokeWidth="0.5" opacity="0.1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Dynamic Drawn Walking Path Polyline */}
            <polyline
              points="120,220 160,190 200,205 240,160 280,180 320,130 360,145 400,100"
              fill="none"
              stroke="#2E7D32"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="6 2"
              className="animate-pulse"
            />
          </svg>

          {/* Radar Sweep Effect */}
          <div className="absolute w-56 h-56 rounded-full pointer-events-none radar-sweep flex items-center justify-center">
            <div className="w-1/2 h-0.5 bg-gradient-to-r from-transparent to-leaf-light origin-left"></div>
          </div>

          {/* Wildlife markers along trail */}
          <div className="absolute top-16 left-28 flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-white shadow-md border border-leaf flex items-center justify-center text-xs animate-bounce">
              🐿️
            </div>
            <span className="text-[9px] font-bold bg-white/90 px-1 rounded text-forest shadow">Squirrel</span>
          </div>

          <div className="absolute top-28 right-24 flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-white shadow-md border border-leaf flex items-center justify-center text-xs">
              🕊️
            </div>
            <span className="text-[9px] font-bold bg-white/90 px-1 rounded text-forest shadow">Pigeon</span>
          </div>

          {/* Current Explorer Beacon */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative">
              <span className="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-forest opacity-50"></span>
              <div className="w-10 h-10 rounded-full bg-forest border-2 border-white shadow-nature-glow flex items-center justify-center text-white">
                <Navigation className="w-5 h-5 fill-white rotate-45" />
              </div>
            </div>
            <span className="mt-1 text-[10px] font-extrabold bg-slate-900 text-white px-2.5 py-0.5 rounded-full shadow">
              You (Tracking Path)
            </span>
          </div>

          {/* Quick Simulate Walk Button (for seamless desktop testing) */}
          <button
            onClick={() => addDistance(0.25)}
            className="absolute bottom-3 right-3 z-20 px-3 py-1.5 rounded-full bg-white text-forest border border-leaf/40 font-bold text-xs shadow-md flex items-center gap-1.5 hover:bg-leaf-pale transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Trek +0.25 km
          </button>
        </div>

        {/* Buttons During Expedition: Camera Scanner, Pause Expedition, Finish Expedition */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-2.5">
          {/* 1. Camera Scanner */}
          <button
            onClick={() => setOpenScannerModal(true)}
            className="flex-1 py-3 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-forest border border-leaf/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Camera className="w-4 h-4 text-forest" />
            <span>Camera Scanner</span>
          </button>

          {/* 2. Pause Expedition */}
          <button
            onClick={handleTogglePause}
            className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border cursor-pointer ${
              isPaused
                ? 'bg-amber-500 text-white border-amber-600'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
            }`}
          >
            {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4" />}
            <span>{isPaused ? 'Resume' : 'Pause Expedition'}</span>
          </button>

          {/* 3. Finish Expedition */}
          <button
            onClick={handleFinish}
            className="flex-1 py-3 px-3 rounded-xl bg-forest hover:bg-forest-light text-white font-bold text-xs shadow-nature flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Square className="w-4 h-4 fill-white" />
            <span>Finish Expedition</span>
          </button>
        </div>
      </div>
    </div>
  );
};
