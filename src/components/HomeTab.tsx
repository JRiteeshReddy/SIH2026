import React from 'react';
import { 
  Flame, 
  Sparkles, 
  Compass, 
  Footprints, 
  Trophy, 
  BookOpen, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Award, 
  ChevronRight, 
  Play, 
  Clock, 
  Target,
  TreePine,
  ArrowUpRight
} from 'lucide-react';
import { useEcoDex } from '../context/EcoDexContext';
import { audio } from '../services/audioService';

import { calculateExplorerLevel } from '../services/gamificationService';

export const HomeTab: React.FC = () => {
  const { 
    user, 
    species, 
    dailyChallenges, 
    claimChallenge, 
    startExpedition, 
    setActiveTab,
    soundEnabled, 
    setSoundEnabled 
  } = useEcoDex();

  if (!user) return null;

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning, Explorer!';
    if (hour < 17) return 'Good Afternoon, Explorer!';
    return 'Good Evening, Explorer!';
  };

  const levelProgress = calculateExplorerLevel(user.ecoXP);

  const distanceToday = user.distanceToday ?? 2.4;
  const weeklyRank = user.weeklyRank ?? 4;
  const speciesFound = user.speciesFound ?? species.filter(s => s.discovered).length;

  return (
    <div className="space-y-5 pb-32 pt-2">
      {/* Top Header: Greeting, Avatar, Sound */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-13 h-13 rounded-2xl bg-leaf-pale border border-leaf/30 flex items-center justify-center text-3xl shadow-sm">
            {user.avatar}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-forest">
                {user.college}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-forest"></span>
              <span className="text-xs text-slate-500 font-medium">{user.cityState}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {getGreeting()}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-forest transition-colors cursor-pointer shadow-sm"
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-forest" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Level & EcoXP Progress Bar Card */}
      <div className="rounded-card bg-gradient-forest text-white p-5 shadow-nature relative overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-leaf opacity-20 blur-2xl pointer-events-none"></div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-white/20 uppercase tracking-widest text-leaf-pale">
                Explorer Rank
              </span>
              <span className="text-xs text-emerald-100 font-bold flex items-center gap-1">
                <span>{levelProgress.currentInfo.icon}</span>
                <span>{levelProgress.title}</span>
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black mt-1 tracking-tight flex items-baseline gap-1.5">
              <span>Level {levelProgress.level}</span>
              <span className="text-sm font-semibold text-leaf-pale font-sans">
                ({user.ecoXP.toLocaleString()} EcoXP)
              </span>
            </div>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center text-center shadow-inner">
            <span className="text-xl">{levelProgress.currentInfo.badgeIcon}</span>
            <span className="text-[9px] font-extrabold text-golden mt-0.5 uppercase tracking-wider">{levelProgress.title}</span>
          </div>
        </div>

        {/* EcoXP Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-leaf-pale font-medium">
            <span>
              {levelProgress.nextInfo ? `Next: Level ${levelProgress.level + 1} (${levelProgress.nextInfo.title})` : 'Maximum Master Rank'}
            </span>
            <span className="font-bold text-golden">
              {user.ecoXP} / {levelProgress.maxXP} XP ({levelProgress.progressPercent}%)
            </span>
          </div>
          <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/20 shadow-inner">
            <div
              className="h-full bg-gradient-golden rounded-full transition-all duration-1000 ease-out shadow-gold-glow relative"
              style={{ width: `${levelProgress.progressPercent}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/70 rounded-full animate-ping"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Four Stat Cards */}
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
          Daily Explorer Metrics
        </div>
        <div className="grid grid-cols-2 gap-3">
          {/* Stat 1: Distance Walked Today */}
          <div className="p-4 rounded-card bg-white border border-leaf-pale shadow-nature flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Distance Today</span>
              <div className="w-8 h-8 rounded-xl bg-leaf-pale flex items-center justify-center text-forest">
                <Footprints className="w-4 h-4 text-forest" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {distanceToday.toFixed(1)} <span className="text-xs font-bold text-forest">km</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                Daily outdoor fitness
              </p>
            </div>
          </div>

          {/* Stat 2: Species Collected */}
          <div className="p-4 rounded-card bg-white border border-leaf-pale shadow-nature flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Species Collected</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <BookOpen className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {speciesFound} <span className="text-xs font-bold text-slate-400">/ 23</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                {Math.round((speciesFound / 23) * 100)}% of Native Taxa
              </p>
            </div>
          </div>

          {/* Stat 3: Current Streak */}
          <div className="p-4 rounded-card bg-white border border-leaf-pale shadow-nature flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Current Streak</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {user.streak} <span className="text-xs font-bold text-amber-600">Days</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                Active daily naturalist
              </p>
            </div>
          </div>

          {/* Stat 4: Weekly Rank */}
          <div className="p-4 rounded-card bg-white border border-leaf-pale shadow-nature flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Weekly Rank</span>
              <div className="w-8 h-8 rounded-xl bg-amber-100/60 flex items-center justify-center text-amber-600">
                <Trophy className="w-4 h-4 fill-amber-400 text-amber-600" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                #{weeklyRank} <span className="text-xs font-bold text-slate-500">Campus</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                Top 5% among peers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Challenges Section */}
      <div className="bg-white rounded-card p-4 sm:p-5 border border-leaf-pale shadow-nature">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-leaf-pale flex items-center justify-center text-forest">
              <Target className="w-4 h-4 text-forest" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Daily Challenges</h2>
              <p className="text-[10px] text-slate-400">Complete quests to earn bonus EcoXP</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-forest bg-leaf-pale px-2.5 py-1 rounded-full">
            Resets at 00:00
          </span>
        </div>

        {/* Quests List */}
        <div className="space-y-3">
          {dailyChallenges.map(quest => {
            const isCompleted = quest.completed || quest.current >= quest.target;
            const isClaimed = quest.claimed;
            const progress = Math.min(100, Math.round((quest.current / quest.target) * 100));

            return (
              <div
                key={quest.id}
                className={`p-3 rounded-2xl border transition-all ${
                  isClaimed
                    ? 'bg-slate-50/70 border-slate-200 opacity-70'
                    : isCompleted
                    ? 'bg-amber-50/50 border-amber-200 shadow-sm'
                    : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className="text-2xl select-none mt-0.5">{quest.icon}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold text-slate-900">{quest.title}</h3>
                        <span className="text-[10px] font-extrabold text-golden-dark bg-golden/20 px-1.5 py-0.2 rounded">
                          +{quest.xpReward} EcoXP
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {quest.description}
                      </p>
                    </div>
                  </div>

                  {/* Claim Button or Status */}
                  <div className="flex-shrink-0">
                    {isClaimed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-200 text-slate-600 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Claimed
                      </span>
                    ) : isCompleted ? (
                      <button
                        onClick={() => claimChallenge(quest.id)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-golden text-amber-950 font-extrabold text-[11px] shadow-gold-glow flex items-center gap-1 hover:scale-105 transition-all cursor-pointer animate-pulse"
                      >
                        <Sparkles className="w-3 h-3 fill-amber-900" />
                        Claim XP
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 font-mono">
                        {quest.current} / {quest.target} {quest.unit}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {!isClaimed && (
                  <div className="mt-2.5">
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-amber-500' : 'bg-forest'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Large Floating Green Button: Start Expedition */}
      <div className="pt-2">
        <button
          onClick={startExpedition}
          className="relative w-full overflow-hidden p-5 rounded-card-lg bg-gradient-forest text-white shadow-nature-glow hover:shadow-nature hover:scale-[1.01] active:scale-[0.99] transition-all text-left flex items-center justify-between group cursor-pointer border-2 border-leaf-light/40"
        >
          {/* Animated Background Pulse */}
          <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-leaf opacity-30 blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>

          <div className="flex items-center gap-4 relative z-10">
            {/* Animated Compass Icon with Ring */}
            <div className="relative">
              <span className="animate-ping absolute inline-flex h-12 w-12 rounded-2xl bg-leaf opacity-60"></span>
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg group-hover:rotate-45 transition-transform duration-500">
                <Compass className="w-7 h-7 text-golden" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200 bg-white/15 px-2 py-0.5 rounded-md">
                  GPS Location & Trail Tracking
                </span>
              </div>
              <h2 className="text-lg font-black tracking-tight text-white mt-0.5">
                Start Expedition
              </h2>
              <p className="text-xs text-leaf-pale font-medium">
                Track outdoor walking path, live timer & radar
              </p>
            </div>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white group-hover:translate-x-1 transition-transform relative z-10">
            <ArrowUpRight className="w-5 h-5 text-golden" />
          </div>
        </button>
      </div>
    </div>
  );
};
