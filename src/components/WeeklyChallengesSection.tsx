import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Sparkles, 
  Clock, 
  Award, 
  CheckCircle2, 
  ChevronRight, 
  Users, 
  Flame, 
  Zap, 
  Target 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WeeklyChallenge, Achievement } from '../types';
import { INITIAL_WEEKLY_CHALLENGES } from '../data/weeklyChallengesData';
import { useEcoDex } from '../context/EcoDexContext';
import { audio } from '../services/audioService';

export const WeeklyChallengesSection: React.FC = () => {
  const { user, achievements, activeAchievementPopup } = useEcoDex();
  const [challenges, setChallenges] = useState<WeeklyChallenge[]>(() => {
    const saved = localStorage.getItem('ecodex_weekly_challenges_v1');
    return saved ? JSON.parse(saved) : INITIAL_WEEKLY_CHALLENGES;
  });

  const [activeChallengeId, setActiveChallengeId] = useState<string>(challenges[0]?.id || 'wc_bird_week');
  const [now, setNow] = useState<number>(Date.now());

  // Save challenges to local storage on changes
  useEffect(() => {
    localStorage.setItem('ecodex_weekly_challenges_v1', JSON.stringify(challenges));
  }, [challenges]);

  // Live countdown timer interval
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeChallenge = challenges.find(c => c.id === activeChallengeId) || challenges[0];

  // Helper for live countdown format
  const formatCountdown = (endsAt: number) => {
    const remainingMs = Math.max(0, endsAt - now);
    if (remainingMs === 0) return 'Challenge Ended';

    const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const handleClaimChallenge = (challengeId: string) => {
    const target = challenges.find(c => c.id === challengeId);
    if (!target || !target.completed || target.claimed) return;

    audio.playDiscovery();
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#FFD54F', '#2E7D32', '#66BB6A', '#FFA000']
    });

    setChallenges(prev => prev.map(c => {
      if (c.id === challengeId) {
        return { ...c, claimed: true };
      }
      return c;
    }));
  };

  return (
    <div className="rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white p-4 sm:p-5 border border-slate-800 shadow-2xl relative overflow-hidden space-y-4">
      {/* Background Radiance */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-forest/20 blur-3xl pointer-events-none"></div>

      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-golden text-[10px] font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-golden fill-golden" />
            <span>Seasonal Guild Competitions</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
            Weekly Challenges
          </h2>
        </div>

        {/* Challenge Badges Count */}
        <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-mono text-golden font-bold flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-golden" />
          <span>Exclusive Badges</span>
        </div>
      </div>

      {/* Challenge Selector Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {challenges.map(ch => {
          const isActive = ch.id === activeChallengeId;
          return (
            <button
              key={ch.id}
              onClick={() => {
                setActiveChallengeId(ch.id);
                audio.playChime();
              }}
              className={`px-3 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-gradient-forest text-white border-leaf shadow-lg shadow-forest/30 scale-100'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <span className="text-base">{ch.icon}</span>
              <span>{ch.title}</span>
              {ch.completed && (
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Challenge Card */}
      {activeChallenge && (
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-4 backdrop-blur-sm">
          {/* Header with Title & Countdown Timer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeChallenge.icon}</span>
                <div>
                  <h3 className="text-base font-black text-white">{activeChallenge.title}</h3>
                  <p className="text-xs text-emerald-300 font-medium">{activeChallenge.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Countdown Timer Box */}
            <div className="flex items-center gap-2 bg-black/40 border border-amber-400/30 px-3 py-1.5 rounded-xl self-start sm:self-auto">
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
              <div>
                <div className="text-[9px] uppercase font-bold text-amber-300/80">Time Remaining</div>
                <div className="text-xs font-black font-mono text-amber-300">
                  {formatCountdown(activeChallenge.endsAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-300 leading-relaxed">
            {activeChallenge.description}
          </p>

          {/* Progress Bar */}
          <div className="space-y-1.5 bg-black/30 p-3 rounded-xl border border-white/5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">Your Progress</span>
              <span className="text-golden font-mono font-bold">
                {activeChallenge.current} / {activeChallenge.target} {activeChallenge.unit}
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-leaf rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, Math.round((activeChallenge.current / activeChallenge.target) * 100))}%`
                }}
              ></div>
            </div>
          </div>

          {/* Exclusive Badge Reward Preview */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-golden/10 to-transparent border border-amber-400/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-golden p-0.5 shadow-gold-glow flex items-center justify-center flex-shrink-0">
                <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-2xl">
                  {activeChallenge.exclusiveBadge.icon}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-golden">{activeChallenge.exclusiveBadge.title}</span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 text-[9px] font-black uppercase">
                    {activeChallenge.exclusiveBadge.tier}
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 line-clamp-1">{activeChallenge.exclusiveBadge.description}</p>
                <div className="text-[10px] text-emerald-400 font-bold mt-0.5">
                  +{activeChallenge.rewardXP} EcoXP for Top Finishers
                </div>
              </div>
            </div>

            {/* Claim / Status Button */}
            {activeChallenge.completed ? (
              activeChallenge.claimed ? (
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Claimed
                </span>
              ) : (
                <button
                  onClick={() => handleClaimChallenge(activeChallenge.id)}
                  className="px-3.5 py-2 rounded-xl bg-golden hover:bg-golden-dark text-slate-950 text-xs font-extrabold shadow-gold-glow flex items-center gap-1.5 transition-all cursor-pointer animate-bounce"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  Claim Badge
                </button>
              )
            ) : (
              <span className="text-[11px] text-slate-400 font-semibold italic">
                In Progress
              </span>
            )}
          </div>

          {/* Top Contenders Podium Mini-Board */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-forest" />
                <span>Top Contenders (Sprint Leaders)</span>
              </span>
              <span className="text-[10px] font-mono text-amber-300">Live Standings</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {activeChallenge.topPlayers.map(p => (
                <div key={p.rank} className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 text-center text-xs font-black font-mono ${
                      p.rank === 1 ? 'text-amber-400' : p.rank === 2 ? 'text-slate-300' : 'text-amber-600'
                    }`}>
                      #{p.rank}
                    </span>
                    <span className="text-xl">{p.avatar}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate max-w-[90px]">{p.username}</div>
                      <div className="text-[9px] text-slate-400 truncate max-w-[90px]">{p.college}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 ml-1">
                    {p.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
