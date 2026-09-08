import React, { useEffect } from 'react';
import { Sparkles, Trophy, X, Award, CheckCircle2, ChevronRight, ShieldCheck, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEcoDex } from '../context/EcoDexContext';
import { calculateExplorerLevel } from '../services/gamificationService';
import { audio } from '../services/audioService';

export const AchievementModal: React.FC = () => {
  const { 
    activeAchievementPopup, 
    closeAchievementPopup, 
    achievementQueue = [], 
    user 
  } = useEcoDex();

  useEffect(() => {
    if (activeAchievementPopup) {
      audio.playBadgeUnlocked();

      // Multi-angle badge unlock confetti blast
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { x: 0.3, y: 0.55 },
        colors: ['#FFD54F', '#2E7D32', '#66BB6A', '#FFB300', '#4CAF50']
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { x: 0.7, y: 0.55 },
        colors: ['#FFD54F', '#FFA000', '#81C784', '#FFFFFF', '#4CAF50']
      });
    }
  }, [activeAchievementPopup?.id]);

  if (!activeAchievementPopup) return null;

  const currentXP = user?.ecoXP || 0;
  const levelProgress = calculateExplorerLevel(currentXP);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Emerald':
        return {
          gradient: 'from-emerald-500 via-teal-500 to-forest',
          badgeBg: 'bg-emerald-100 text-emerald-950 border-emerald-300',
          glow: 'rgba(46, 125, 50, 0.45)',
          border: 'border-emerald-300'
        };
      case 'Gold':
        return {
          gradient: 'from-amber-400 via-yellow-400 to-amber-600',
          badgeBg: 'bg-amber-100 text-amber-950 border-amber-300',
          glow: 'rgba(255, 179, 0, 0.45)',
          border: 'border-amber-300'
        };
      case 'Silver':
        return {
          gradient: 'from-slate-300 via-slate-200 to-slate-400',
          badgeBg: 'bg-slate-100 text-slate-900 border-slate-300',
          glow: 'rgba(148, 163, 184, 0.45)',
          border: 'border-slate-300'
        };
      default:
        return {
          gradient: 'from-amber-700 via-amber-600 to-amber-800',
          badgeBg: 'bg-amber-50 text-amber-900 border-amber-200',
          glow: 'rgba(180, 83, 9, 0.35)',
          border: 'border-amber-400'
        };
    }
  };

  const tierStyle = getTierColor(activeAchievementPopup.tier);
  const queueLength = achievementQueue.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      {/* Background Radial Glow */}
      <div 
        className="absolute w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-60 animate-pulse"
        style={{ background: tierStyle.glow }}
      ></div>

      {/* Glassmorphic Animated Achievement Card */}
      <div className="relative w-full max-w-sm rounded-3xl bg-white/95 backdrop-blur-xl p-6 text-center shadow-2xl border border-white/80 overflow-hidden animate-scaleUp">
        {/* Holographic Top Banner Sheen */}
        <div className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-r ${tierStyle.gradient}`}></div>

        {/* Close Button */}
        <button
          onClick={closeAchievementPopup}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Queue Counter if multiple badges */}
        {queueLength > 0 && (
          <div className="absolute top-4 left-4 px-2.5 py-0.5 rounded-full bg-forest/10 text-forest text-[10px] font-bold font-mono">
            +{queueLength} More Badge{queueLength > 1 ? 's' : ''}
          </div>
        )}

        {/* Glowing Badge Emblem with Layered Rings */}
        <div className="relative inline-flex items-center justify-center mt-2 mb-4">
          {/* Animated Pulsing Outer Ring */}
          <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-amber-300 via-emerald-400 to-golden opacity-40 blur-md animate-spin-slow"></div>
          
          <div className={`relative w-24 h-24 rounded-full p-1.5 bg-gradient-to-tr ${tierStyle.gradient} shadow-xl flex items-center justify-center transform hover:scale-105 transition-transform duration-300`}>
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-4xl shadow-inner border border-white/60">
              <span className="transform animate-bounce">{activeAchievementPopup.icon}</span>
            </div>
          </div>

          <div className="absolute -bottom-1 -right-1 bg-forest text-white p-2 rounded-full shadow-lg border-2 border-white">
            <Award className="w-4 h-4 text-golden" />
          </div>
        </div>

        {/* Tier & Category Pills */}
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shadow-xs ${tierStyle.badgeBg}`}>
            {activeAchievementPopup.tier} Badge
          </span>
          {activeAchievementPopup.category && (
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider border border-slate-200">
              {activeAchievementPopup.category}
            </span>
          )}
        </div>

        {/* Badge Title */}
        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
          {activeAchievementPopup.title}
        </h3>

        {/* Badge Description */}
        <p className="text-xs text-slate-600 mb-4 px-3 leading-relaxed">
          {activeAchievementPopup.description}
        </p>

        {/* Reward Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 font-bold text-xs mb-4 shadow-xs">
          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>+{activeAchievementPopup.xpReward} EcoXP Reward Earned!</span>
        </div>

        {/* Explorer Level Progress Bar */}
        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-left mb-5">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <span>{levelProgress.currentInfo.icon}</span>
              <span>Level {levelProgress.level}: {levelProgress.title}</span>
            </div>
            <span className="text-[10px] font-mono text-forest font-bold">
              {currentXP} / {levelProgress.maxXP} XP
            </span>
          </div>

          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-leaf rounded-full transition-all duration-500"
              style={{ width: `${levelProgress.progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Claim Action Button */}
        <button
          onClick={closeAchievementPopup}
          className="w-full py-3.5 px-4 rounded-2xl bg-forest hover:bg-forest-light text-white font-extrabold text-xs shadow-nature flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Trophy className="w-4 h-4 text-golden" />
          <span>{queueLength > 0 ? 'Claim & View Next Badge' : 'Claim Badge & Continue'}</span>
          {queueLength > 0 && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
