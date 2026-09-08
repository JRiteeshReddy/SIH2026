import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Flame, 
  Footprints, 
  BookOpen, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  School, 
  MapPin, 
  Mail, 
  Calendar, 
  Database, 
  ExternalLink, 
  ChevronRight, 
  Check, 
  Moon, 
  Sun, 
  Bell, 
  BellOff, 
  Navigation, 
  Eye, 
  Lock, 
  HelpCircle, 
  Share2, 
  Compass, 
  RefreshCw,
  AlertTriangle,
  Radio
} from 'lucide-react';
import { useEcoDex } from '../context/EcoDexContext';
import { audio } from '../services/audioService';
import { getLocalExpeditions } from '../services/firebase';
import { calculateExplorerLevel } from '../services/gamificationService';
import { ExpeditionHistoryCard } from './ExpeditionHistoryCard';
import { Expedition } from '../types';

// Default realistic sample expeditions if user has no saved history yet
const DEFAULT_EXPEDITIONS: Expedition[] = [
  {
    id: 'exp_sample_1',
    userId: 'demo_user',
    startTime: Date.now() - 24 * 3600 * 1000,
    endTime: Date.now() - 24 * 3600 * 1000 + 45 * 60 * 1000,
    distanceKm: 3.2,
    steps: 4320,
    durationSeconds: 2720,
    caloriesBurned: 210,
    speciesEncountered: ['Squirrel', 'Crow', 'Pigeon'],
    ecoXPEarned: 350,
    path: [
      [18.5204, 73.8567],
      [18.5220, 73.8580],
      [18.5235, 73.8610],
      [18.5260, 73.8625],
      [18.5280, 73.8600],
      [18.5300, 73.8630]
    ],
    active: false,
    explorerRating: 5,
    ratingTitle: 'Master Trailblazer'
  },
  {
    id: 'exp_sample_2',
    userId: 'demo_user',
    startTime: Date.now() - 3 * 24 * 3600 * 1000,
    endTime: Date.now() - 3 * 24 * 3600 * 1000 + 38 * 60 * 1000,
    distanceKm: 2.8,
    steps: 3780,
    durationSeconds: 2280,
    caloriesBurned: 180,
    speciesEncountered: ['Butterfly', 'Frog'],
    ecoXPEarned: 310,
    path: [
      [18.5358, 73.7877],
      [18.5370, 73.7890],
      [18.5390, 73.7910],
      [18.5410, 73.7885],
      [18.5430, 73.7920]
    ],
    active: false,
    explorerRating: 5,
    ratingTitle: 'Wetlands Scout'
  },
  {
    id: 'exp_sample_3',
    userId: 'demo_user',
    startTime: Date.now() - 5 * 24 * 3600 * 1000,
    endTime: Date.now() - 5 * 24 * 3600 * 1000 + 22 * 60 * 1000,
    distanceKm: 1.5,
    steps: 2025,
    durationSeconds: 1320,
    caloriesBurned: 95,
    speciesEncountered: ['Dog', 'Owl'],
    ecoXPEarned: 165,
    path: [
      [18.5284, 73.8188],
      [18.5295, 73.8205],
      [18.5310, 73.8220],
      [18.5330, 73.8240]
    ],
    active: false,
    explorerRating: 4,
    ratingTitle: 'Curious Scout'
  }
];

export const ProfileTab: React.FC = () => {
  const { 
    user, 
    achievements, 
    species, 
    soundEnabled, 
    setSoundEnabled, 
    logout 
  } = useEcoDex();

  // Settings states
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('ecodex_theme') === 'dark';
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('ecodex_notifications');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [locationStatus, setLocationStatus] = useState<'granted' | 'prompt' | 'testing'>('granted');
  const [publicProfile, setPublicProfile] = useState<boolean>(true);
  const [shareResearchTelemetry, setShareResearchTelemetry] = useState<boolean>(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Expedition history state
  const [expeditions, setExpeditions] = useState<Expedition[]>(() => {
    const local = getLocalExpeditions();
    return local.length > 0 ? local : DEFAULT_EXPEDITIONS;
  });

  // Badge category filtering
  const [selectedBadgeCategory, setSelectedBadgeCategory] = useState<string>('All');

  // Sync theme to document body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  if (!user) return null;

  const levelProgress = calculateExplorerLevel(user.ecoXP);
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const discoveredSpecies = species.filter(s => s.discovered);

  const handleToggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem('ecodex_theme', next ? 'dark' : 'light');
    audio.playChime();
  };

  const handleToggleNotifications = () => {
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    localStorage.setItem('ecodex_notifications', JSON.stringify(next));
    audio.playChime();
  };

  const handleTestLocationPermission = () => {
    setLocationStatus('testing');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationStatus('granted');
          audio.playDiscovery();
        },
        () => {
          setLocationStatus('prompt');
        }
      );
    } else {
      setLocationStatus('prompt');
    }
  };

  return (
    <div className="space-y-4 pb-28 pt-1">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-forest">
            Field Explorer Dossier
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
            Explorer Profile
            <span className="text-sm">🪪</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer shadow-xs"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ================= 1. HEADER (AVATAR, USERNAME, COLLEGE, LEVEL) ================= */}
      <div className="rounded-3xl bg-gradient-forest text-white p-5 shadow-nature relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-leaf opacity-20 blur-3xl pointer-events-none"></div>

        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3.5">
            {/* 1. Avatar */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-leaf-pale border-2 border-leaf flex items-center justify-center text-3xl shadow-md">
                {user.avatar}
              </div>
              <span className="absolute -bottom-1 -right-1 text-sm bg-white rounded-full p-0.5 shadow-sm">
                {levelProgress.currentInfo.icon}
              </span>
            </div>

            {/* 2. Username, 3. College, 4. Level */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black tracking-tight text-white">{user.username}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-widest text-golden flex items-center gap-1 shadow-2xs">
                  <span>Level {levelProgress.level}</span>
                  <span>•</span>
                  <span>{levelProgress.title}</span>
                </span>
              </div>

              {user.email && (
                <p className="text-[11px] text-emerald-200/90 font-mono flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3 text-leaf-pale flex-shrink-0" />
                  <span>{user.email}</span>
                </p>
              )}

              <p className="text-xs text-emerald-100 font-medium flex items-center gap-1 mt-0.5">
                <School className="w-3.5 h-3.5 text-leaf-pale flex-shrink-0" />
                <span>{user.college || 'EcoDex Academy'}</span>
              </p>

              <p className="text-[11px] text-emerald-200/90 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-leaf-pale flex-shrink-0" />
                <span>{user.cityState || 'Pune, Maharashtra'}</span>
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[9px] uppercase font-black text-leaf-pale tracking-wider">Standing</div>
            <div className="text-base font-black text-golden font-mono">Top 5%</div>
          </div>
        </div>

        {/* Level XP Progress Bar inside Header */}
        <div className="pt-3 border-t border-white/15 space-y-1.5">
          <div className="flex justify-between text-[11px] text-emerald-100 font-medium">
            <span>Progress to Level {levelProgress.level + 1}</span>
            <span className="font-bold text-golden font-mono">
              {user.ecoXP} / {levelProgress.maxXP} XP ({levelProgress.progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/15 shadow-inner">
            <div
              className="h-full bg-gradient-golden rounded-full transition-all duration-1000 ease-out shadow-gold-glow relative"
              style={{ width: `${levelProgress.progressPercent}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/70 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 2. STATS (ECOXP, SPECIES FOUND, DISTANCE WALKED, ACHIEVEMENTS, REPUTATION) ================= */}
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
          Explorer Key Statistics
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {/* Stat 1: EcoXP */}
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 font-mono">
                {user.ecoXP.toLocaleString()} XP
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Total EcoXP</div>
            </div>
          </div>

          {/* Stat 2: Species Found */}
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 font-mono">
                {user.speciesFound} / 23
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Species Found</div>
            </div>
          </div>

          {/* Stat 3: Distance Walked */}
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest/10 text-forest flex items-center justify-center flex-shrink-0">
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 font-mono">
                {user.totalDistance.toFixed(1)} km
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Distance Walked</div>
            </div>
          </div>

          {/* Stat 4: Achievements */}
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 font-mono">
                {unlockedAchievements.length} / {achievements.length}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Achievements</div>
            </div>
          </div>

          {/* Stat 5: Reputation */}
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3 col-span-2 sm:col-span-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-golden-dark flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 font-mono">
                {user.reputation} / 100
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Guild Reputation</div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3. EXPEDITION HISTORY ================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-forest" />
            <h2 className="text-sm font-bold text-slate-900">
              Expedition History ({expeditions.length})
            </h2>
          </div>
          <span className="text-[11px] text-forest font-bold">
            GPS Verified Treks
          </span>
        </div>

        {/* List of Previous Expeditions */}
        <div className="space-y-3">
          {expeditions.map(exp => (
            <ExpeditionHistoryCard key={exp.id} expedition={exp} />
          ))}
        </div>
      </div>

      {/* ================= BADGES SHOWCASE SECTION ================= */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-nature space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-golden-dark" />
            <h2 className="text-sm font-bold text-slate-800">
              Explorer Field Medals ({unlockedAchievements.length} / {achievements.length})
            </h2>
          </div>
          <span className="text-[11px] text-forest font-bold font-mono">
            {Math.round((unlockedAchievements.length / achievements.length) * 100)}%
          </span>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[11px]">
          {['All', 'Discovery', 'Fitness', 'Streaks', 'Rank', 'Exploration'].map(cat => {
            const count = cat === 'All' 
              ? achievements.length 
              : achievements.filter(a => a.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedBadgeCategory(cat);
                  audio.playChime();
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedBadgeCategory === cat
                    ? 'bg-forest text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {achievements
            .filter(ach => selectedBadgeCategory === 'All' || ach.category === selectedBadgeCategory)
            .map(ach => (
              <div
                key={ach.id}
                className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                  ach.unlocked
                    ? 'bg-amber-50/40 border-amber-200 shadow-xs'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-inner flex-shrink-0 border ${
                  ach.unlocked 
                    ? 'bg-white border-amber-300 shadow-gold-glow' 
                    : 'bg-slate-100 border-slate-200 grayscale'
                }`}>
                  {ach.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-xs font-bold text-slate-800 truncate">{ach.title}</h3>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                      ach.tier === 'Emerald' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                      ach.tier === 'Gold' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                      ach.tier === 'Silver' ? 'bg-slate-200 text-slate-800 border border-slate-300' :
                      'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {ach.tier}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{ach.description}</p>
                  
                  <div className="mt-1 flex items-center justify-between text-[10px]">
                    <span className="text-forest font-bold font-mono">+{ach.xpReward} XP</span>
                    <span className="font-semibold text-slate-500">
                      {ach.unlocked ? '✓ Unlocked' : `${ach.progress} / ${ach.maxProgress}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* ================= 4. SETTINGS ================= */}
      {/*
        Settings:
        * Theme toggle
        * Notifications
        * Location permission
        * Privacy settings
        * Logout
      */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-nature space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-forest" />
          <h2 className="text-sm font-bold text-slate-900">Application Settings</h2>
        </div>

        {/* 1. Theme Toggle */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              {isDarkMode ? <Moon className="w-4 h-4 text-indigo-500" /> : <Sun className="w-4 h-4 text-amber-500" />}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Visual Theme</div>
              <div className="text-[10px] text-slate-500">
                {isDarkMode ? 'Forest Dark Mode' : 'Nature Light Theme'}
              </div>
            </div>
          </div>

          <button
            onClick={handleToggleTheme}
            className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
              isDarkMode ? 'bg-indigo-600' : 'bg-forest'
            }`}
          >
            <span
              className={`block w-4.5 h-4.5 bg-white rounded-full shadow-md transform transition-transform absolute top-1 ${
                isDarkMode ? 'left-6.5' : 'left-1'
              }`}
            ></span>
          </button>
        </div>

        {/* 2. Notifications Toggle */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              {notificationsEnabled ? <Bell className="w-4 h-4 text-forest" /> : <BellOff className="w-4 h-4 text-slate-400" />}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Wildlife & Streak Alerts</div>
              <div className="text-[10px] text-slate-500">
                Proximity alerts & expedition reminders
              </div>
            </div>
          </div>

          <button
            onClick={handleToggleNotifications}
            className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
              notificationsEnabled ? 'bg-forest' : 'bg-slate-300'
            }`}
          >
            <span
              className={`block w-4.5 h-4.5 bg-white rounded-full shadow-md transform transition-transform absolute top-1 ${
                notificationsEnabled ? 'left-6.5' : 'left-1'
              }`}
            ></span>
          </button>
        </div>

        {/* 3. Location Permission */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Navigation className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>Location Permission</span>
                <span className={`text-[9px] px-2 py-0.2 rounded-full font-bold ${
                  locationStatus === 'granted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {locationStatus === 'granted' ? '📡 Active High Accuracy' : 'Prompt / Required'}
                </span>
              </div>
              <div className="text-[10px] text-slate-500">
                Used for GPS trail mapping & biosphere coords
              </div>
            </div>
          </div>

          <button
            onClick={handleTestLocationPermission}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            {locationStatus === 'testing' ? 'Verifying...' : 'Check GPS'}
          </button>
        </div>

        {/* 4. Privacy Settings */}
        <div className="space-y-2 py-2 border-b border-slate-100">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-forest" />
            <span>Privacy & Sharing Controls</span>
          </div>

          <div className="flex items-center justify-between pl-6 py-1">
            <span className="text-[11px] text-slate-600">Display Profile on Global Leaderboards</span>
            <input
              type="checkbox"
              checked={publicProfile}
              onChange={e => setPublicProfile(e.target.checked)}
              className="w-4 h-4 text-forest rounded cursor-pointer accent-forest"
            />
          </div>

          <div className="flex items-center justify-between pl-6 py-1">
            <span className="text-[11px] text-slate-600">Share Anonymized Sightings with Researchers</span>
            <input
              type="checkbox"
              checked={shareResearchTelemetry}
              onChange={e => setShareResearchTelemetry(e.target.checked)}
              className="w-4 h-4 text-forest rounded cursor-pointer accent-forest"
            />
          </div>
        </div>

        {/* 5. Logout */}
        <div className="pt-2">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Field Dossier</span>
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 text-center shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Confirm Sign Out</h3>
            <p className="text-xs text-slate-500 mb-5">
              Your local discoveries and active streak are cached safely on this device. You can log back in anytime.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs cursor-pointer hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
