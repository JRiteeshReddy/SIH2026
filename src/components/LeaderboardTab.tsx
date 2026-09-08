import React, { useState } from 'react';
import { 
  Trophy, 
  Flame, 
  Footprints, 
  BookOpen, 
  Sparkles, 
  School, 
  MapPin, 
  Globe, 
  Users, 
  Calendar, 
  Clock, 
  Award,
  Crown,
  ChevronRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { useEcoDex } from '../context/EcoDexContext';
import { audio } from '../services/audioService';
import { LeaderboardTabScope, LeaderboardMetric, LeaderboardUser } from '../types';
import { calculateExplorerLevel } from '../services/gamificationService';
import { WeeklyChallengesSection } from './WeeklyChallengesSection';

export const LeaderboardTab: React.FC = () => {
  const { user, leaderboard, achievements } = useEcoDex();
  const [scope, setScope] = useState<LeaderboardTabScope>('Global');
  const [metric, setMetric] = useState<LeaderboardMetric>('ecoXP');
  const [showWeeklyChallenges, setShowWeeklyChallenges] = useState(true);

  if (!user) return null;

  // Unlocked achievements count for current user
  const userAchievementsCount = achievements.filter(a => a.unlocked).length;

  // Build combined list including current user with full metrics
  const combinedUsers: LeaderboardUser[] = [
    ...leaderboard.filter(u => u.uid !== user.uid),
    {
      uid: user.uid,
      username: user.username,
      college: user.college || 'EcoDex Academy',
      avatar: user.avatar,
      cityState: user.cityState,
      level: user.level,
      ecoXP: user.ecoXP,
      totalDistance: user.totalDistance,
      speciesFound: user.speciesFound,
      streak: user.streak,
      achievementsCount: userAchievementsCount,
      isFriend: true,
      weeklyXP: 380,
      weeklyDistance: 4.2,
      weeklySpecies: 2,
      monthlyXP: 820,
      monthlyDistance: 8.6,
      monthlySpecies: 6
    }
  ];

  // 1. Filter based on scope: Global, College, Friends, Weekly, Monthly
  const filteredUsers = combinedUsers.filter(u => {
    switch (scope) {
      case 'College': {
        const userCollege = (user.college || '').toLowerCase();
        const candidateCollege = (u.college || '').toLowerCase();
        return candidateCollege.includes(userCollege) || userCollege.includes(candidateCollege);
      }
      case 'Friends':
        return u.isFriend || u.uid === user.uid;
      case 'Weekly':
      case 'Monthly':
      case 'Global':
      default:
        return true;
    }
  });

  // 2. Sort by selected metric: EcoXP, Distance, Unique species, Achievements
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (scope === 'Weekly') {
      if (metric === 'ecoXP') return (b.weeklyXP || 0) - (a.weeklyXP || 0);
      if (metric === 'totalDistance') return (b.weeklyDistance || 0) - (a.weeklyDistance || 0);
      if (metric === 'speciesFound') return (b.weeklySpecies || 0) - (a.weeklySpecies || 0);
      return (b.achievementsCount || 0) - (a.achievementsCount || 0);
    }
    if (scope === 'Monthly') {
      if (metric === 'ecoXP') return (b.monthlyXP || 0) - (a.monthlyXP || 0);
      if (metric === 'totalDistance') return (b.monthlyDistance || 0) - (a.monthlyDistance || 0);
      if (metric === 'speciesFound') return (b.monthlySpecies || 0) - (a.monthlySpecies || 0);
      return (b.achievementsCount || 0) - (a.achievementsCount || 0);
    }

    // Standard All-time sorting
    return (b[metric] as number) - (a[metric] as number);
  });

  const top3 = sortedUsers.slice(0, 3);

  const getMetricDisplay = (u: LeaderboardUser) => {
    if (scope === 'Weekly') {
      switch (metric) {
        case 'ecoXP': return `${(u.weeklyXP || 0).toLocaleString()} XP`;
        case 'totalDistance': return `${(u.weeklyDistance || 0).toFixed(1)} km`;
        case 'speciesFound': return `${u.weeklySpecies || 0} Species`;
        case 'achievementsCount': return `${u.achievementsCount} Medals`;
      }
    }
    if (scope === 'Monthly') {
      switch (metric) {
        case 'ecoXP': return `${(u.monthlyXP || 0).toLocaleString()} XP`;
        case 'totalDistance': return `${(u.monthlyDistance || 0).toFixed(1)} km`;
        case 'speciesFound': return `${u.monthlySpecies || 0} Species`;
        case 'achievementsCount': return `${u.achievementsCount} Medals`;
      }
    }

    switch (metric) {
      case 'ecoXP': return `${u.ecoXP.toLocaleString()} XP`;
      case 'totalDistance': return `${u.totalDistance.toFixed(1)} km`;
      case 'speciesFound': return `${u.speciesFound} Species`;
      case 'achievementsCount': return `${u.achievementsCount} Medals`;
    }
  };

  const getMetricLabel = (m: LeaderboardMetric) => {
    switch (m) {
      case 'ecoXP': return 'EcoXP';
      case 'totalDistance': return 'Distance';
      case 'speciesFound': return 'Unique Species';
      case 'achievementsCount': return 'Achievements';
    }
  };

  return (
    <div className="space-y-4 pb-28 pt-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-forest">
            National Explorer Guild
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
            Leaderboard Standings
            <span className="text-sm">🏆</span>
          </h1>
        </div>

        <button
          onClick={() => setShowWeeklyChallenges(prev => !prev)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
            showWeeklyChallenges
              ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Challenges</span>
        </button>
      </div>

      {/* Embedded Weekly Challenges Section with Countdown Timers */}
      {showWeeklyChallenges && <WeeklyChallengesSection />}

      {/* 5 Leaderboard Scope Tabs */}
      <div className="space-y-2">
        <div className="flex p-1 bg-slate-200/80 rounded-2xl gap-1">
          {(['Global', 'College', 'Friends', 'Weekly', 'Monthly'] as LeaderboardTabScope[]).map(sc => {
            const isActive = scope === sc;
            return (
              <button
                key={sc}
                onClick={() => {
                  setScope(sc);
                  audio.playChime();
                }}
                className={`flex-1 py-2 text-[11px] font-black rounded-xl transition-all cursor-pointer whitespace-nowrap text-center ${
                  isActive
                    ? 'bg-forest text-white shadow-md shadow-forest/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {sc}
              </button>
            );
          })}
        </div>

        {/* 4 Ranking Metric Selectors */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-xs">
          {(['ecoXP', 'totalDistance', 'speciesFound', 'achievementsCount'] as LeaderboardMetric[]).map(m => {
            const isSelected = metric === m;
            return (
              <button
                key={m}
                onClick={() => {
                  setMetric(m);
                  audio.playChime();
                }}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {m === 'ecoXP' && <Sparkles className="w-3.5 h-3.5 text-golden" />}
                {m === 'totalDistance' && <Footprints className="w-3.5 h-3.5 text-emerald-500" />}
                {m === 'speciesFound' && <BookOpen className="w-3.5 h-3.5 text-blue-500" />}
                {m === 'achievementsCount' && <Award className="w-3.5 h-3.5 text-purple-500" />}
                <span>{getMetricLabel(m)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {top3.length > 0 && (
        <div className="grid grid-cols-3 gap-2 pt-3 items-end">
          {/* 2nd Place */}
          {top3[1] && (
            <div className="rounded-2xl bg-white border border-slate-200 p-2.5 text-center shadow-xs flex flex-col items-center">
              <div className="text-xs font-black text-slate-400 mb-1">#2 Silver</div>
              <div className="relative mb-1.5">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl border-2 border-slate-300">
                  {top3[1].avatar}
                </div>
                <span className="absolute -bottom-1 -right-1 text-xs">🥈</span>
              </div>
              <div className="text-xs font-bold text-slate-900 truncate w-full">{top3[1].username}</div>
              <div className="text-[10px] text-slate-500 truncate w-full">{top3[1].college}</div>
              <div className="mt-1 text-xs font-black text-forest font-mono">{getMetricDisplay(top3[1])}</div>
            </div>
          )}

          {/* 1st Place (Crown Champion) */}
          {top3[0] && (
            <div className="rounded-2xl bg-gradient-to-b from-amber-50 via-white to-white border-2 border-amber-400 p-3 text-center shadow-nature -mt-3 flex flex-col items-center">
              <div className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-900 mb-0.5">
                <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Champion</span>
              </div>
              <div className="relative mb-1.5">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl border-2 border-golden shadow-gold-glow">
                  {top3[0].avatar}
                </div>
                <span className="absolute -bottom-1 -right-1 text-sm">🥇</span>
              </div>
              <div className="text-xs font-black text-slate-900 truncate w-full">{top3[0].username}</div>
              <div className="text-[10px] text-slate-500 truncate w-full">{top3[0].college}</div>
              <div className="mt-1 text-xs font-black text-amber-700 font-mono">{getMetricDisplay(top3[0])}</div>
            </div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <div className="rounded-2xl bg-white border border-slate-200 p-2.5 text-center shadow-xs flex flex-col items-center">
              <div className="text-xs font-black text-amber-700/60 mb-1">#3 Bronze</div>
              <div className="relative mb-1.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-50/50 flex items-center justify-center text-2xl border-2 border-amber-200">
                  {top3[2].avatar}
                </div>
                <span className="absolute -bottom-1 -right-1 text-xs">🥉</span>
              </div>
              <div className="text-xs font-bold text-slate-900 truncate w-full">{top3[2].username}</div>
              <div className="text-[10px] text-slate-500 truncate w-full">{top3[2].college}</div>
              <div className="mt-1 text-xs font-black text-forest font-mono">{getMetricDisplay(top3[2])}</div>
            </div>
          )}
        </div>
      )}

      {/* ================= ALL RANKED PROFILE CARDS ================= */}
      {/*
        Each profile card shows:
        * Avatar
        * Level
        * College
        * Species Count
        * Distance
        * EcoXP
      */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-400">
          <span>Ranked Explorers ({sortedUsers.length})</span>
          <span>Sorted by {getMetricLabel(metric)}</span>
        </div>

        {sortedUsers.map((usr, idx) => {
          const rank = idx + 1;
          const isCurrentUser = usr.uid === user.uid;
          const userLevelProgress = calculateExplorerLevel(usr.ecoXP);

          return (
            <div
              key={usr.uid + idx}
              className={`p-3.5 rounded-2xl border transition-all ${
                isCurrentUser
                  ? 'bg-gradient-to-r from-emerald-50 via-leaf-pale/50 to-white border-leaf shadow-sm ring-1 ring-forest/20'
                  : 'bg-white border-slate-200 hover:border-forest/40 shadow-xs'
              }`}
            >
              {/* Card Top Row: Rank, Avatar, Name, Level, College, Status */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Rank Index */}
                  <div className="w-7 text-center flex-shrink-0">
                    {rank === 1 ? (
                      <span className="text-base">🥇</span>
                    ) : rank === 2 ? (
                      <span className="text-base">🥈</span>
                    ) : rank === 3 ? (
                      <span className="text-base">🥉</span>
                    ) : (
                      <span className="text-xs font-black text-slate-400 font-mono">#{rank}</span>
                    )}
                  </div>

                  {/* 1. Avatar */}
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
                    {usr.avatar}
                  </div>

                  {/* 2. Level & 3. College */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-black text-slate-900 truncate">{usr.username}</span>
                      {isCurrentUser && (
                        <span className="px-1.5 py-0.2 rounded bg-forest text-white text-[9px] font-extrabold uppercase">
                          YOU
                        </span>
                      )}
                      <span className="px-2 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                        Lvl {userLevelProgress.level} • {userLevelProgress.title}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                      <School className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{usr.college}</span>
                    </div>
                  </div>
                </div>

                {/* Primary Metric Badge */}
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-black text-forest font-mono">
                    {getMetricDisplay(usr)}
                  </div>
                  <div className="text-[9px] text-slate-400 uppercase font-semibold">
                    {getMetricLabel(metric)}
                  </div>
                </div>
              </div>

              {/* Card Bottom Metrics Bar:
                  * Species Count
                  * Distance
                  * EcoXP
                  * Achievements
              */}
              <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-100 text-center">
                {/* 4. Species Count */}
                <div className="bg-slate-50 p-1.5 rounded-xl">
                  <div className="text-[9px] uppercase font-bold text-slate-400 flex items-center justify-center gap-0.5">
                    <BookOpen className="w-2.5 h-2.5 text-blue-500" />
                    Species
                  </div>
                  <div className="text-xs font-black text-slate-800 mt-0.5">
                    {usr.speciesFound}
                  </div>
                </div>

                {/* 5. Distance */}
                <div className="bg-slate-50 p-1.5 rounded-xl">
                  <div className="text-[9px] uppercase font-bold text-slate-400 flex items-center justify-center gap-0.5">
                    <Footprints className="w-2.5 h-2.5 text-emerald-500" />
                    Distance
                  </div>
                  <div className="text-xs font-black text-slate-800 mt-0.5">
                    {usr.totalDistance.toFixed(1)} km
                  </div>
                </div>

                {/* 6. EcoXP */}
                <div className="bg-slate-50 p-1.5 rounded-xl">
                  <div className="text-[9px] uppercase font-bold text-slate-400 flex items-center justify-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                    EcoXP
                  </div>
                  <div className="text-xs font-black text-forest mt-0.5 font-mono">
                    {usr.ecoXP.toLocaleString()}
                  </div>
                </div>

                {/* Achievements count */}
                <div className="bg-slate-50 p-1.5 rounded-xl">
                  <div className="text-[9px] uppercase font-bold text-slate-400 flex items-center justify-center gap-0.5">
                    <Award className="w-2.5 h-2.5 text-purple-500" />
                    Medals
                  </div>
                  <div className="text-xs font-black text-purple-900 mt-0.5">
                    {usr.achievementsCount}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
