import React, { useEffect } from 'react';
import { Sparkles, Trophy, X, ShieldCheck, Crown, Check, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEcoDex } from '../context/EcoDexContext';
import { ExplorerLevelInfo } from '../types';
import { audio } from '../services/audioService';

export const LevelUpModal: React.FC = () => {
  const { activeLevelUpPopup, closeLevelUpPopup } = useEcoDex();

  useEffect(() => {
    if (activeLevelUpPopup) {
      audio.playLevelUp();
      confetti({
        particleCount: 140,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#FFD54F', '#2E7D32', '#66BB6A', '#FFB300', '#1B5E20', '#4CAF50']
      });
    }
  }, [activeLevelUpPopup?.level]);

  if (!activeLevelUpPopup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      {/* Background Radiance */}
      <div className="absolute w-96 h-96 rounded-full bg-golden/30 blur-3xl pointer-events-none animate-pulse"></div>

      <div className="relative w-full max-w-sm rounded-3xl bg-white/95 backdrop-blur-xl p-6 text-center shadow-2xl border border-leaf-pale overflow-hidden animate-scaleUp">
        {/* Top Gold Bar */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-golden"></div>

        {/* Close Button */}
        <button
          onClick={closeLevelUpPopup}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Subtitle */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-widest mb-3 border border-amber-300">
          <Sparkles className="w-3 h-3 text-amber-600 fill-amber-600" />
          <span>Explorer Rank Promotion!</span>
        </div>

        {/* Rank Icon Emblem */}
        <div className="relative inline-flex items-center justify-center mb-3">
          <div className="w-24 h-24 rounded-3xl bg-gradient-forest p-1 shadow-nature-lg flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform">
            <div className="w-full h-full rounded-[20px] bg-white/95 flex flex-col items-center justify-center">
              <span className="text-4xl mb-0.5">{activeLevelUpPopup.icon}</span>
              <span className="text-[10px] font-black font-mono text-forest uppercase">
                LVL {activeLevelUpPopup.level}
              </span>
            </div>
          </div>
          <div className="absolute -top-2 -right-2 bg-golden p-1.5 rounded-full shadow-md text-slate-900 border-2 border-white">
            <Crown className="w-4 h-4" />
          </div>
        </div>

        {/* New Rank Title */}
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
          {activeLevelUpPopup.title}
        </h2>
        <p className="text-xs text-slate-600 mb-4 px-2">
          You have reached Explorer Level {activeLevelUpPopup.level} in the National Biodiversity Field Guild!
        </p>

        {/* Unlocked Rank Badge */}
        <div className="p-3 rounded-2xl bg-leaf-pale/60 border border-leaf/30 mb-4 text-left">
          <div className="text-[10px] font-bold text-forest uppercase tracking-wider mb-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-forest" />
            <span>Unlocked Guild Badge</span>
          </div>
          <div className="flex items-center gap-2.5 bg-white p-2 rounded-xl border border-leaf/20 shadow-2xs">
            <span className="text-2xl">{activeLevelUpPopup.badgeIcon}</span>
            <div>
              <div className="text-xs font-black text-slate-900">{activeLevelUpPopup.badgeName}</div>
              <div className="text-[10px] text-slate-500">Official Guild Rank Insignia</div>
            </div>
          </div>
        </div>

        {/* Unlocked Perks */}
        {activeLevelUpPopup.perks && activeLevelUpPopup.perks.length > 0 && (
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 mb-5 text-left">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Unlocked Rank Perks
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {activeLevelUpPopup.perks.map((perk, i) => (
                <li key={i} className="flex items-center gap-2 text-[11px]">
                  <Check className="w-3.5 h-3.5 text-forest flex-shrink-0 font-bold" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={closeLevelUpPopup}
          className="w-full py-3.5 px-4 rounded-2xl bg-forest hover:bg-forest-light text-white font-extrabold text-xs shadow-nature flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>Continue Journey as {activeLevelUpPopup.title}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
