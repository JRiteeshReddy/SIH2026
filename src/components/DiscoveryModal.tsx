import React, { useState, useEffect } from 'react';
import { Sparkles, X, CheckCircle, Crown, Eye, Flame, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEcoDex } from '../context/EcoDexContext';
import { audio } from '../services/audioService';

export const DiscoveryModal: React.FC = () => {
  const { activeDiscoveryModal, closeDiscoveryModal } = useEcoDex();
  const [isFlipped, setIsFlipped] = useState(false);
  const [showRumble, setShowRumble] = useState(false);

  useEffect(() => {
    if (!activeDiscoveryModal || !activeDiscoveryModal.species) {
      setIsFlipped(false);
      setShowRumble(false);
      return;
    }

    const { species } = activeDiscoveryModal;
    const isLegendary = species?.rarity === 'Legendary';
    let legendaryInterval: ReturnType<typeof setInterval> | null = null;

    if (isLegendary) {
      setShowRumble(true);
      audio.playLegendaryEncounter();
      // Massive golden confetti barrage for Legendary
      const end = Date.now() + 2500;
      legendaryInterval = setInterval(() => {
        if (Date.now() > end) {
          if (legendaryInterval) clearInterval(legendaryInterval);
          return;
        }
        confetti({
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          origin: { x: Math.random(), y: Math.random() * 0.4 },
          colors: ['#FFD54F', '#FFA000', '#FF8F00', '#FFFFFF', '#66BB6A']
        });
      }, 300);
    } else {
      audio.playDiscovery();
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#2E7D32', '#66BB6A', '#FFD54F']
      });
    }

    // Trigger smooth 3D card flip after 350ms suspense
    const flipTimer = setTimeout(() => {
      setIsFlipped(true);
      audio.playChime();
    }, 450);

    const rumbleTimer = setTimeout(() => {
      setShowRumble(false);
    }, 700);

    return () => {
      if (legendaryInterval) clearInterval(legendaryInterval);
      clearTimeout(flipTimer);
      clearTimeout(rumbleTimer);
    };
  }, [activeDiscoveryModal?.species?.id]);

  if (!activeDiscoveryModal || !activeDiscoveryModal.species) return null;

  const { species, xpAwarded = 20, isNew = false, breakdown } = activeDiscoveryModal;
  const isLegendary = species?.rarity === 'Legendary';

  const getRarityBadgeColor = (rarity?: string) => {
    switch (rarity) {
      case 'Legendary': return 'bg-amber-400 text-amber-950 shadow-gold-glow';
      case 'Epic': return 'bg-purple-400 text-purple-950';
      case 'Rare': return 'bg-blue-400 text-blue-950';
      default: return 'bg-emerald-400 text-emerald-950';
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-hidden ${
        isLegendary
          ? 'bg-slate-950/90 backdrop-blur-xl'
          : 'bg-black/75 backdrop-blur-md'
      } animate-fadeIn ${showRumble ? 'shake-cinematic' : ''}`}
    >
      {/* ================= LEGENDARY CINEMATIC FULL-SCREEN BACKGROUND ================= */}
      {isLegendary && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
          {/* Rotating Sunburst Cosmic Light Rays */}
          <div className="absolute w-[800px] h-[800px] sm:w-[1100px] sm:h-[1100px] opacity-35 animate-sunburst">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                <linearGradient id="sunburstGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFA000" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#FFD54F" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
                </linearGradient>
              </defs>
              {Array.from({ length: 16 }).map((_, i) => (
                <path
                  key={i}
                  d={`M 50 50 L ${50 + 45 * Math.cos((i * Math.PI) / 8)} ${50 + 45 * Math.sin((i * Math.PI) / 8)} L ${50 + 45 * Math.cos(((i + 0.5) * Math.PI) / 8)} ${50 + 45 * Math.sin(((i + 0.5) * Math.PI) / 8)} Z`}
                  fill="url(#sunburstGrad)"
                />
              ))}
            </svg>
          </div>

          {/* Pulsing Golden Core Glow */}
          <div className="absolute w-96 h-96 rounded-full bg-amber-400/35 blur-3xl animate-pulse"></div>

          {/* Floating Mythical Header Banner */}
          <div className="absolute top-6 inset-x-0 flex flex-col items-center text-center px-4 animate-bounce">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-golden text-slate-950 font-black text-xs uppercase tracking-widest shadow-gold-glow border-2 border-white">
              <Crown className="w-4 h-4 text-slate-900" />
              <span>Mythical Legendary Encounter!</span>
              <Crown className="w-4 h-4 text-slate-900" />
            </div>
            <p className="text-amber-200 font-mono text-[11px] tracking-wider mt-1 drop-shadow">
              Apex Wildlife Sovereign Documented
            </p>
          </div>
        </div>
      )}

      {/* ================= 3D CARD FLIP CONTAINER ================= */}
      <div className="relative w-full max-w-sm perspective-1000 my-auto">
        <div
          className={`flip-card-inner relative w-full ${isFlipped ? 'is-flipped' : ''}`}
          onClick={() => {
            if (!isFlipped) {
              setIsFlipped(true);
              audio.playChime();
            }
          }}
        >
          {/* ================= 1. CARD BACK (MYSTERY ECO-CARD) ================= */}
          <div className="backface-hidden w-full h-[520px] rounded-3xl bg-gradient-forest p-1 shadow-2xl border-2 border-golden/70 flex flex-col items-center justify-between text-white p-6 cursor-pointer">
            <div className="w-full flex items-center justify-between text-xs text-leaf-pale font-mono">
              <span>ECODEX FIELD ARCHIVE</span>
              <span>SEC-2026</span>
            </div>

            <div className="flex flex-col items-center justify-center text-center my-auto">
              <div className="relative mb-4">
                <div className="w-28 h-28 rounded-3xl bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center text-5xl shadow-2xl animate-pulse">
                  🌿
                </div>
                <div className="absolute -top-2 -right-2 bg-golden text-slate-900 p-2 rounded-full shadow-lg animate-spin-slow">
                  <Sparkles className="w-5 h-5 fill-current" />
                </div>
              </div>

              <span className="text-lg font-black tracking-tight uppercase text-golden">
                Wild Specimen Sighted
              </span>
              <p className="text-xs text-emerald-100 mt-1 max-w-[200px]">
                Flipping naturalist holographic card...
              </p>
            </div>

            <div className="w-full py-2.5 rounded-xl bg-white/15 text-center text-xs font-bold text-white tracking-widest uppercase border border-white/20">
              Tap to Reveal
            </div>
          </div>

          {/* ================= 2. CARD FRONT (REVEALED WILDLIFE SPECIMEN) ================= */}
          <div
            className={`backface-hidden rotate-y-180 absolute inset-0 w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col justify-between max-h-[92vh] ${
              isLegendary
                ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-400 glow-legendary'
                : 'bg-white border border-leaf-pale glow-epic'
            }`}
          >
            {/* Banner image with overlay */}
            <div className="relative h-48 w-full overflow-hidden bg-slate-950 flex-shrink-0">
              <img
                src={species?.discoveryPhoto || species?.image || 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=600&q=80'}
                alt={species?.name || 'Wildlife'}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

              {/* Close button */}
              <button
                onClick={closeDiscoveryModal}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white/90 hover:text-white transition-colors cursor-pointer z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Rarity & Category Badges */}
              <div className="absolute top-3 left-3 flex gap-1.5">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getRarityBadgeColor(species?.rarity)}`}>
                  {species?.rarity || 'Common'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                  {species?.category || 'Wildlife'}
                </span>
              </div>

              {/* Species Name in Bottom of Photo */}
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <div className="text-xs uppercase font-extrabold text-golden tracking-wider flex items-center gap-1 mb-0.5">
                  <Sparkles className="w-3.5 h-3.5 fill-golden" />
                  <span>{isNew ? 'New Field Discovery!' : 'Specimen Re-Encountered'}</span>
                </div>
                <h3 className="text-2xl font-black tracking-tight leading-none flex items-center gap-2">
                  <span>{species?.name || 'Nature Discovery'}</span>
                  {isLegendary && <span className="text-lg">👑</span>}
                </h3>
                <p className="text-xs italic text-slate-300 font-serif mt-0.5">{species?.scientificName || 'Fauna'}</p>
              </div>
            </div>

            {/* Content Body */}
            <div className={`p-4 overflow-y-auto space-y-3 text-xs flex-1 ${isLegendary ? 'text-slate-200' : 'text-slate-800'}`}>
              {/* EcoXP Breakdown Card with Smooth XP Counter */}
              <div className={`rounded-2xl p-3.5 border ${
                isLegendary
                  ? 'bg-amber-950/40 border-amber-500/50'
                  : 'bg-amber-50/70 border-amber-200/80'
              }`}>
                <div className="flex items-center justify-between pb-2 border-b border-amber-300/30 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className={`text-xs font-black uppercase tracking-wide ${isLegendary ? 'text-amber-200' : 'text-amber-950'}`}>
                      EcoXP Calculation
                    </span>
                  </div>
                  <span className="text-base font-black text-amber-500 font-mono">
                    +{xpAwarded} XP
                  </span>
                </div>

                {/* Itemized Bonuses */}
                {breakdown && Array.isArray(breakdown.bonuses) && breakdown.bonuses.length > 0 ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] opacity-80">
                      <span className="flex items-center gap-1">
                        <span>🏷️</span>
                        <span>Base {species?.rarity || 'Common'} Reward</span>
                      </span>
                      <span className="font-bold">+{breakdown?.baseXP ?? 20} XP</span>
                    </div>

                    {breakdown.bonuses.map((bonus, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between text-[11px] font-semibold px-2 py-1 rounded-lg border ${
                          isLegendary
                            ? 'bg-amber-500/20 text-amber-200 border-amber-500/30'
                            : 'bg-emerald-50/70 text-emerald-800 border-emerald-100'
                        }`}
                      >
                        <span className="flex items-center gap-1 truncate">
                          <span>{bonus?.icon || '⭐'}</span>
                          <span className="truncate">{bonus?.label || 'Bonus'}</span>
                        </span>
                        <span className="font-extrabold flex-shrink-0">+{bonus?.xp ?? 0} XP</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-[11px]">
                    <span>Field Species XP Bounty</span>
                    <span className="font-bold text-forest">+{xpAwarded} XP</span>
                  </div>
                )}
              </div>

              {/* Description & Wildlife Fact */}
              <div className="space-y-1.5">
                <p className="text-xs leading-relaxed opacity-90">
                  {species?.description || 'A remarkable wildlife specimen recorded in your field journal.'}
                </p>

                <div className={`rounded-xl p-2.5 border text-xs ${
                  isLegendary
                    ? 'bg-amber-900/30 border-amber-500/40 text-amber-100'
                    : 'bg-leaf-pale/60 border-leaf/20 text-forest-deep'
                }`}>
                  <span className="font-bold text-golden">🌿 Field Fact: </span>
                  {species?.funFact || 'Observed and documented during nature exploration.'}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={closeDiscoveryModal}
                className={`w-full py-3 rounded-2xl font-extrabold text-xs shadow-nature flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isLegendary
                    ? 'bg-gradient-golden text-slate-950 hover:brightness-110 shadow-gold-glow'
                    : 'bg-forest hover:bg-forest-light text-white'
                }`}
              >
                <CheckCircle className={`w-4 h-4 ${isLegendary ? 'text-slate-900' : 'text-leaf-light'}`} />
                <span>Add to Field Journal</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
