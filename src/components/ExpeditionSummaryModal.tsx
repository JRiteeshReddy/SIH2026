import React from 'react';
import { 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  Footprints, 
  Clock, 
  Flame, 
  Star, 
  TreePine, 
  Share2, 
  X,
  Compass,
  Database
} from 'lucide-react';
import { Expedition } from '../types';
import { audio } from '../services/audioService';

interface ExpeditionSummaryModalProps {
  expedition: Expedition | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveToFirestore: () => void;
}

export const ExpeditionSummaryModal: React.FC<ExpeditionSummaryModalProps> = ({
  expedition,
  isOpen,
  onClose,
  onSaveToFirestore
}) => {
  if (!isOpen || !expedition) return null;

  const durationMins = Math.floor(expedition.durationSeconds / 60);
  const durationSecs = expedition.durationSeconds % 60;
  const timeFormatted = `${durationMins}m ${durationSecs}s`;

  // Rating calculation: 5 stars based on activity
  const rating = expedition.explorerRating || 5;
  const ratingTitle = expedition.ratingTitle || (
    expedition.distanceKm >= 2.0 
      ? 'Elite Trailblazer' 
      : expedition.distanceKm >= 1.0 
      ? 'Seasoned Explorer' 
      : 'Eager Naturalist'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-card-lg shadow-nature-lg border border-leaf-pale overflow-hidden animate-scaleUp">
        {/* Top Triumphant Header */}
        <div className="bg-gradient-forest text-white p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-leaf opacity-20 blur-2xl pointer-events-none"></div>

          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-full bg-black/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-3xl mb-2 shadow-nature-glow animate-bounce">
            🥾
          </div>

          <h2 className="text-xl font-black tracking-tight text-white">
            Expedition Complete!
          </h2>
          <p className="text-xs text-leaf-pale mt-0.5">
            Field Trek Logged Successfully
          </p>

          {/* Star Rating Badge */}
          <div className="mt-3 inline-flex flex-col items-center bg-black/20 backdrop-blur-sm px-4 py-1.5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= rating
                      ? 'text-golden fill-golden'
                      : 'text-white/30'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-golden uppercase tracking-widest mt-0.5">
              {ratingTitle}
            </span>
          </div>
        </div>

        {/* Expedition Metrics Breakdown */}
        <div className="p-5 space-y-4">
          {/* Main 2x2 Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                <Footprints className="w-3.5 h-3.5 text-forest" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Distance</span>
              </div>
              <div className="text-xl font-black text-slate-900">
                {expedition.distanceKm.toFixed(2)} <span className="text-xs text-forest">km</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                <Clock className="w-3.5 h-3.5 text-forest" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Duration</span>
              </div>
              <div className="text-xl font-black text-slate-900 font-mono">
                {timeFormatted}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Calories</span>
              </div>
              <div className="text-xl font-black text-slate-900">
                {expedition.caloriesBurned} <span className="text-xs text-rose-600">kcal</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-800 mb-0.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">EcoXP Earned</span>
              </div>
              <div className="text-xl font-black text-amber-700">
                +{expedition.ecoXPEarned} <span className="text-xs text-amber-800">XP</span>
              </div>
            </div>
          </div>

          {/* Species Observed During Trek */}
          <div className="p-3.5 rounded-2xl bg-leaf-pale/50 border border-leaf/20">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-forest flex items-center gap-1.5">
                <TreePine className="w-4 h-4" />
                Wildlife Species Encountered
              </span>
              <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full text-forest border border-leaf/20">
                {expedition.speciesEncountered?.length || 2} Recorded
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pt-1">
              {(expedition.speciesEncountered?.length ? expedition.speciesEncountered : ['Indian Palm Squirrel', 'House Crow']).map((sp, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-leaf-pale text-xs shadow-sm">
                  <span>{idx === 0 ? '🐿️' : '🦅'}</span>
                  <span className="font-semibold text-slate-800 text-[11px] whitespace-nowrap">{sp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Firestore Sync Notice */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 px-1">
            <Database className="w-3.5 h-3.5 text-forest flex-shrink-0" />
            <span>Telemetry path & stats will be archived to Firestore <code className="text-forest">expeditions</code> collection.</span>
          </div>

          {/* Save & Bank XP Button */}
          <div className="pt-2">
            <button
              onClick={() => {
                audio.playDiscovery();
                onSaveToFirestore();
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-forest hover:bg-forest-light text-white font-bold text-sm shadow-nature flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-golden" />
              Save Expedition to Firestore & Bank XP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
