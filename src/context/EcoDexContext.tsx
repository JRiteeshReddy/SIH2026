import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  UserProfile, 
  Species, 
  Expedition, 
  Achievement, 
  LeaderboardUser,
  DiscoveryRecord,
  DailyChallenge,
  EcoXPBreakdown,
  ExplorerLevelInfo
} from '../types';
import { 
  INITIAL_SPECIES, 
  INITIAL_LEADERBOARD 
} from '../data/speciesData';
import { INITIAL_CHALLENGES } from '../data/challengesData';
import { audio } from '../services/audioService';
import { 
  auth,
  saveUserProfileToFirestore, 
  getUserProfileFromFirestore,
  fetchUserProfileResult,
  fetchLeaderboardFromFirestore,
  logExpeditionToFirestore, 
  logDiscoveryToFirestore,
  getLocalDiscoveries,
  getPendingSyncCount,
  syncPendingWithFirebase,
  subscribeToAuthState,
  logoutUser
} from '../services/firebase';
import { 
  calculateExplorerLevel, 
  calculateEcoXPAward, 
  INITIAL_ALL_BADGES, 
  evaluateAllBadges 
} from '../services/gamificationService';

export type AuthStatus = 
  | 'AUTH_LOADING' 
  | 'UNAUTHENTICATED' 
  | 'AUTHENTICATED_PROFILE_MISSING' 
  | 'AUTHENTICATED_PROFILE_EXISTS';

interface EcoDexContextType {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  authStatus: AuthStatus;
  authError: string | null;
  retryAuthCheck: () => Promise<void>;
  species: Species[];
  achievements: Achievement[];
  leaderboard: LeaderboardUser[];
  activeTab: 'home' | 'expedition' | 'ecodex' | 'leaderboard' | 'profile';
  setActiveTab: (tab: 'home' | 'expedition' | 'ecodex' | 'leaderboard' | 'profile') => void;
  // Daily Challenges
  dailyChallenges: DailyChallenge[];
  claimChallenge: (challengeId: string) => void;
  // Expedition State
  isExpeditionActive: boolean;
  currentExpedition: Expedition | null;
  startExpedition: () => void;
  updateExpeditionProgress: (distanceDeltaKm: number) => void;
  finishExpedition: () => void;
  cancelExpedition: () => void;
  // Modal states for Tracking & Summary
  isTrackingModalOpen: boolean;
  setIsTrackingModalOpen: (open: boolean) => void;
  activeExpeditionSummary: Expedition | null;
  setActiveExpeditionSummary: (summary: Expedition | null) => void;
  saveExpeditionAndApplyStats: (summary: Expedition) => void;
  // Discovery & AI Scanner
  recordDiscovery: (speciesId: string, photoUrl?: string, confidence?: number, coords?: { lat: number; lng: number }) => { isNew: boolean; xpAwarded: number; breakdown: EcoXPBreakdown };
  activeDiscoveryModal: { species: Species; xpAwarded: number; isNew: boolean; breakdown?: EcoXPBreakdown } | null;
  closeDiscoveryModal: () => void;
  // Glassmorphic Animated Achievement Popups & Queue
  activeAchievementPopup: Achievement | null;
  achievementQueue: Achievement[];
  closeAchievementPopup: () => void;
  // Level Up Celebration Popup
  activeLevelUpPopup: ExplorerLevelInfo | null;
  closeLevelUpPopup: () => void;
  // User Management & Auth
  completeOnboarding: (data: { username: string; college: string; avatar: string; cityState: string }) => Promise<void>;
  logout: () => Promise<void>;
  // Settings & Sound
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  openScannerModal: boolean;
  setOpenScannerModal: (open: boolean) => void;
  // Offline & Firebase Sync
  isOnline: boolean;
  pendingSyncCount: number;
  syncToastMessage: string | null;
  dismissSyncToast: () => void;
  triggerManualSync: () => Promise<void>;
}

const EcoDexContext = createContext<EcoDexContextType | undefined>(undefined);

export const EcoDexProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('AUTH_LOADING');
  const [authError, setAuthError] = useState<string | null>(null);

  const [species, setSpecies] = useState<Species[]>(() => {
    const saved = localStorage.getItem('ecodex_species_catalog');
    if (!saved) return INITIAL_SPECIES;
    try {
      const parsed = JSON.parse(saved) as Species[];
      return INITIAL_SPECIES.map(initial => {
        const existing = parsed.find(p => p.id === initial.id);
        if (existing) {
          return {
            ...initial,
            discovered: existing.discovered ?? initial.discovered,
            discoveredAt: existing.discoveredAt ?? initial.discoveredAt,
            firstDiscoveredDate: existing.firstDiscoveredDate ?? initial.firstDiscoveredDate,
            discoveryPhoto: existing.discoveryPhoto ?? initial.discoveryPhoto,
            totalSightings: existing.totalSightings ?? initial.totalSightings ?? (existing.discovered ? 1 : 0)
          };
        }
        return initial;
      });
    } catch {
      return INITIAL_SPECIES;
    }
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('ecodex_achievements_v2');
    return saved ? JSON.parse(saved) : INITIAL_ALL_BADGES;
  });

  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>(() => {
    const saved = localStorage.getItem('ecodex_daily_challenges');
    return saved ? JSON.parse(saved) : INITIAL_CHALLENGES;
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>(INITIAL_LEADERBOARD);
  const [activeTab, setActiveTabState] = useState<'home' | 'expedition' | 'ecodex' | 'leaderboard' | 'profile'>('home');
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [openScannerModal, setOpenScannerModal] = useState<boolean>(false);

  // Popups & Active Tracking Modals
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState<boolean>(false);
  const [activeExpeditionSummary, setActiveExpeditionSummary] = useState<Expedition | null>(null);
  const [activeDiscoveryModal, setActiveDiscoveryModal] = useState<{ species: Species; xpAwarded: number; isNew: boolean; breakdown?: EcoXPBreakdown } | null>(null);
  
  // Achievement Popup & Queue
  const [activeAchievementPopup, setActiveAchievementPopup] = useState<Achievement | null>(null);
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);

  // Explorer Level Up Popup
  const [activeLevelUpPopup, setActiveLevelUpPopup] = useState<ExplorerLevelInfo | null>(null);

  // Live Expedition in background / tab
  const [isExpeditionActive, setIsExpeditionActive] = useState<boolean>(false);
  const [currentExpedition, setCurrentExpedition] = useState<Expedition | null>(null);

  // Offline & Firebase Sync States
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(() => getPendingSyncCount());
  const [syncToastMessage, setSyncToastMessage] = useState<string | null>(null);

  // Helper to check user profile in Firestore
  const checkUserProfileInFirestore = async (fbUser: { uid: string; email?: string | null; displayName?: string | null }) => {
    setAuthError(null);
    const result = await fetchUserProfileResult(fbUser.uid);
    if (result.status === 'exists') {
      setUser(result.profile);
      setAuthStatus('AUTHENTICATED_PROFILE_EXISTS');
    } else if (result.status === 'missing') {
      setUser(null);
      setAuthStatus('AUTHENTICATED_PROFILE_MISSING');
    } else {
      console.warn('Firestore profile check error:', result.error);
      setAuthError(result.error.message || 'Could not verify profile with Firestore.');
      // Keep loading / error state so we do not erroneously force missing-profile onboarding
      setAuthStatus('AUTH_LOADING');
    }
  };

  const retryAuthCheck = async () => {
    if (auth.currentUser) {
      setAuthStatus('AUTH_LOADING');
      await checkUserProfileInFirestore(auth.currentUser);
    } else {
      setAuthStatus('UNAUTHENTICATED');
    }
  };

  // Subscribe to Firebase Authentication state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (fbUser) => {
      if (fbUser) {
        await checkUserProfileInFirestore(fbUser);
      } else {
        setUser(null);
        setAuthStatus('UNAUTHENTICATED');
        setAuthError(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch Firestore Leaderboard whenever online or user changes
  useEffect(() => {
    fetchLeaderboardFromFirestore().then(list => {
      if (list && list.length > 0) {
        setLeaderboard(list);
      }
    });
  }, [user, isOnline]);

  // Sync user state to local storage & Firestore
  useEffect(() => {
    if (user) {
      localStorage.setItem('ecodex_current_user', JSON.stringify(user));
      saveUserProfileToFirestore(user);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('ecodex_species_catalog', JSON.stringify(species));
  }, [species]);

  useEffect(() => {
    localStorage.setItem('ecodex_achievements_v2', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem('ecodex_daily_challenges', JSON.stringify(dailyChallenges));
  }, [dailyChallenges]);

  const setActiveTab = (tab: 'home' | 'expedition' | 'ecodex' | 'leaderboard' | 'profile') => {
    audio.playChime();
    setActiveTabState(tab);
  };

  const setSoundEnabled = (enabled: boolean) => {
    audio.setSoundEnabled(enabled);
    setSoundEnabledState(enabled);
  };

  // Monitor network status & auto-sync when internet returns
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      const res = await syncPendingWithFirebase();
      setPendingSyncCount(getPendingSyncCount());
      if (res.syncedDiscoveries > 0 || res.syncedExpeditions > 0 || res.syncedProfile) {
        setSyncToastMessage(`Internet Restored: Synced ${res.syncedDiscoveries} discoveries & ${res.syncedExpeditions} expeditions to Firebase! ☁️`);
        audio.playChime();
        setTimeout(() => setSyncToastMessage(null), 4500);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncToastMessage("Offline Mode: EcoDex collection & expeditions cached safely on device 📡");
      setTimeout(() => setSyncToastMessage(null), 3500);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const triggerManualSync = async () => {
    if (!navigator.onLine) {
      setSyncToastMessage("Device is offline. Data remains safely cached in local storage.");
      setTimeout(() => setSyncToastMessage(null), 3000);
      return;
    }
    const res = await syncPendingWithFirebase();
    setPendingSyncCount(getPendingSyncCount());
    if (res.syncedDiscoveries > 0 || res.syncedExpeditions > 0 || res.syncedProfile) {
      setSyncToastMessage(`Sync Complete: Synced ${res.syncedDiscoveries} discoveries & ${res.syncedExpeditions} expeditions.`);
      audio.playChime();
    } else {
      setSyncToastMessage("All EcoDex data is currently synchronized with Firebase.");
    }
    setTimeout(() => setSyncToastMessage(null), 3000);
  };

  const dismissSyncToast = () => setSyncToastMessage(null);

  // Queue and trigger badge unlock popup
  const queueBadgesForPopup = (badges: Achievement[]) => {
    if (badges.length === 0) return;
    audio.playDiscovery();
    if (!activeAchievementPopup) {
      setActiveAchievementPopup(badges[0]);
      setAchievementQueue(badges.slice(1));
    } else {
      setAchievementQueue(prev => [...prev, ...badges]);
    }
  };

  const closeAchievementPopup = () => {
    if (achievementQueue.length > 0) {
      const nextBadge = achievementQueue[0];
      setActiveAchievementPopup(nextBadge);
      setAchievementQueue(prev => prev.slice(1));
    } else {
      setActiveAchievementPopup(null);
    }
  };

  const closeLevelUpPopup = () => {
    setActiveLevelUpPopup(null);
  };

  // Claim Daily Challenge Reward
  const claimChallenge = (challengeId: string) => {
    const target = dailyChallenges.find(c => c.id === challengeId);
    if (!target || !target.completed || target.claimed || !user) return;

    audio.playDiscovery();
    const newXP = user.ecoXP + target.xpReward;
    const oldLevel = calculateExplorerLevel(user.ecoXP);
    const newLevel = calculateExplorerLevel(newXP);

    setUser(prev => prev ? {
      ...prev,
      ecoXP: newXP,
      level: newLevel.level
    } : null);

    setDailyChallenges(prev => prev.map(c => {
      if (c.id === challengeId) {
        return { ...c, claimed: true };
      }
      return c;
    }));

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#FFD54F', '#2E7D32', '#66BB6A']
    });

    if (newLevel.level > oldLevel.level) {
      setTimeout(() => {
        audio.playDiscovery();
        setActiveLevelUpPopup(newLevel.currentInfo);
      }, 1000);
    }
  };

  // Complete User Onboarding with Firebase Auth UID
  const completeOnboarding = async (data: { username: string; college: string; avatar: string; cityState: string }) => {
    if (!auth.currentUser) {
      throw new Error('No authenticated user found. Please sign in first.');
    }

    const uid = auth.currentUser.uid;
    const email = auth.currentUser.email || '';

    const newUser: UserProfile = {
      uid, // Strictly Firebase Auth UID
      username: data.username.trim() || 'Forest Scout',
      email,
      college: data.college.trim() || 'EcoDex Academy',
      avatar: data.avatar || '🌿',
      cityState: data.cityState.trim() || 'Pune, MH',
      level: 1,
      ecoXP: 100,
      totalDistance: 0.0,
      distanceToday: 0.0,
      weeklyRank: 12,
      speciesFound: 0,
      streak: 1,
      reputation: 100,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setUser(newUser);
    setAuthStatus('AUTHENTICATED_PROFILE_EXISTS');
    await saveUserProfileToFirestore(newUser);
    audio.playXpGain();
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setAuthStatus('UNAUTHENTICATED');
    localStorage.removeItem('ecodex_current_user');
  };

  // Start Live Expedition
  const startExpedition = () => {
    audio.playRadarPing();
    const newExpedition: Expedition = {
      id: 'exp_' + Date.now(),
      userId: user?.uid || 'guest',
      startTime: Date.now(),
      distanceKm: 0.0,
      steps: 0,
      durationSeconds: 0,
      caloriesBurned: 0,
      speciesEncountered: [],
      ecoXPEarned: 0,
      path: [[18.5204, 73.8567]],
      active: true,
      createdAt: new Date().toISOString()
    };
    setCurrentExpedition(newExpedition);
    setIsExpeditionActive(true);
    setIsTrackingModalOpen(true);
  };

  // Update distance, steps, and calories during expedition
  const updateExpeditionProgress = (distanceDeltaKm: number) => {
    if (!currentExpedition) return;

    setCurrentExpedition(prev => {
      if (!prev) return null;
      const newDist = parseFloat((prev.distanceKm + distanceDeltaKm).toFixed(2));
      const newSteps = Math.round(newDist * 1350);
      const newCalories = Math.round(newDist * 65);
      const xp = Math.round(newDist * 100);

      const lastCoord = prev.path[prev.path.length - 1] || [18.5204, 73.8567];
      const nextLat = lastCoord[0] + (Math.random() - 0.5) * 0.0008;
      const nextLng = lastCoord[1] + (Math.random() - 0.5) * 0.0008;

      return {
        ...prev,
        distanceKm: newDist,
        steps: newSteps,
        caloriesBurned: newCalories,
        ecoXPEarned: xp,
        path: [...prev.path, [nextLat, nextLng]]
      };
    });
  };

  // Finish Expedition and prompt summary modal
  const finishExpedition = () => {
    if (!currentExpedition) {
      setIsExpeditionActive(false);
      setIsTrackingModalOpen(false);
      return;
    }

    const earnedXP = Math.max(80, Math.round(currentExpedition.distanceKm * 110));
    const finalExp: Expedition = {
      ...currentExpedition,
      endTime: Date.now(),
      ecoXPEarned: earnedXP,
      active: false,
      explorerRating: 5,
      ratingTitle: currentExpedition.distanceKm >= 2.0 ? 'Elite Trailblazer' : 'Seasoned Explorer',
      createdAt: new Date().toISOString()
    };

    setIsExpeditionActive(false);
    setIsTrackingModalOpen(false);
    setActiveExpeditionSummary(finalExp);
  };

  // Save Expedition and apply stats to User, Badges, & Firestore
  const saveExpeditionAndApplyStats = (summary: Expedition) => {
    if (!user) {
      setActiveExpeditionSummary(null);
      return;
    }

    const updatedDistToday = parseFloat(((user.distanceToday || 0) + summary.distanceKm).toFixed(2));
    const updatedDistTotal = parseFloat((user.totalDistance + summary.distanceKm).toFixed(2));
    const updatedXP = user.ecoXP + summary.ecoXPEarned;
    const oldLevel = calculateExplorerLevel(user.ecoXP);
    const newLevel = calculateExplorerLevel(updatedXP);

    const updatedUser: UserProfile = {
      ...user,
      distanceToday: updatedDistToday,
      totalDistance: updatedDistTotal,
      ecoXP: updatedXP,
      level: newLevel.level
    };

    setUser(updatedUser);

    // Update Daily Challenges (e.g. Walk 2 km quest)
    setDailyChallenges(prev => prev.map(ch => {
      if (ch.id === 'quest_walk_2km') {
        const currentWalked = parseFloat((ch.current + summary.distanceKm).toFixed(1));
        const isDone = currentWalked >= ch.target;
        return {
          ...ch,
          current: Math.min(ch.target, currentWalked),
          completed: isDone
        };
      }
      return ch;
    }));

    // Log to Firestore & Local Storage
    logExpeditionToFirestore(summary);
    saveUserProfileToFirestore(updatedUser);
    setActiveExpeditionSummary(null);
    setCurrentExpedition(null);
    audio.playDiscovery();

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Evaluate all Badges after expedition
    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isNightTime = hour >= 19 || hour < 6;

    const avianCount = species.filter(s => s.discovered && s.category === 'Avian').length;
    const mammalCount = species.filter(s => s.discovered && s.category === 'Mammal').length;
    const hasApex = species.some(s => s.discovered && ['Tiger', 'Lion', 'Leopard'].includes(s.name));

    const { updatedBadges, newlyUnlocked } = evaluateAllBadges(achievements, {
      discoveredSpeciesCount: user.speciesFound,
      avianCount,
      mammalCount,
      totalDistanceKm: updatedDistTotal,
      currentStreak: user.streak,
      totalEcoXP: updatedXP,
      currentLevel: newLevel.level,
      isWeekend,
      isNightTime,
      hasApexDiscovered: hasApex
    });

    if (newlyUnlocked.length > 0) {
      setAchievements(updatedBadges);
      queueBadgesForPopup(newlyUnlocked);
    }

    if (newLevel.level > oldLevel.level) {
      setTimeout(() => {
        audio.playDiscovery();
        setActiveLevelUpPopup(newLevel.currentInfo);
      }, 1200);
    }
  };

  const cancelExpedition = () => {
    setIsExpeditionActive(false);
    setIsTrackingModalOpen(false);
    setCurrentExpedition(null);
  };

  // Record Species Discovery with Full Gamification Engine & Persisted GPS
  const recordDiscovery = (
    speciesId: string, 
    photoUrl?: string, 
    confidence: number = 0.96,
    coords?: { lat: number; lng: number }
  ) => {
    const target = species.find(s => s.id === speciesId || s.name.toLowerCase() === speciesId.toLowerCase());
    if (!target || !user) {
      return { 
        isNew: false, 
        xpAwarded: 0, 
        breakdown: { baseXP: 0, bonuses: [], totalXP: 0 } 
      };
    }

    const localHistory = getLocalDiscoveries();
    const threeMinAgo = Date.now() - 3 * 60 * 1000;
    const isRapidDuplicate = localHistory.some((d: DiscoveryRecord) => 
      d.userId === user.uid && 
      d.speciesId === target.id && 
      new Date(d.timestamp).getTime() > threeMinAgo
    );

    const isExpeditionDuplicate = isExpeditionActive && currentExpedition?.speciesEncountered?.some((s: string | Species) => 
      typeof s === 'string' ? s === target.id || s.toLowerCase() === target.name.toLowerCase() : s.id === target.id
    );
    const isNew = !target.discovered && !isRapidDuplicate && !isExpeditionDuplicate;

    const today = new Date().toISOString().split('T')[0];
    const lastDiscDate = localStorage.getItem('ecodex_last_discovery_date');
    const isFirstDiscoveryOfDay = lastDiscDate !== today;
    if (isNew) {
      localStorage.setItem('ecodex_last_discovery_date', today);
    }

    const locationName = target.discoveryLocation || user.cityState || 'Field Nature Reserve';
    const visitedLocations = JSON.parse(localStorage.getItem('ecodex_visited_locations') || '[]') as string[];
    const isNewLocation = !visitedLocations.includes(locationName);
    if (isNewLocation && isNew) {
      localStorage.setItem('ecodex_visited_locations', JSON.stringify([...visitedLocations, locationName]));
    }

    const breakdown = calculateEcoXPAward({
      species: target,
      isNew,
      confidence,
      userStreak: user.streak || 1,
      isFirstDiscoveryOfDay: isFirstDiscoveryOfDay && isNew,
      isNewLocation: isNewLocation && isNew
    });

    const xpAwarded = (isRapidDuplicate || isExpeditionDuplicate) ? 0 : breakdown.totalXP;

    const updatedSpecies = species.map(s => {
      if (s.id === target.id) {
        const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return {
          ...s,
          discovered: true,
          discoveredAt: s.discoveredAt || new Date().toISOString().split('T')[0],
          firstDiscoveredDate: s.firstDiscoveredDate || todayStr,
          discoveryPhoto: photoUrl || s.discoveryPhoto || s.image,
          totalSightings: (s.totalSightings || 0) + 1
        };
      }
      return s;
    });
    setSpecies(updatedSpecies);

    const newSpeciesCount = isNew ? user.speciesFound + 1 : user.speciesFound;
    const newXP = user.ecoXP + xpAwarded;
    const oldLevel = calculateExplorerLevel(user.ecoXP);
    const newLevel = calculateExplorerLevel(newXP);

    const updatedUser: UserProfile = {
      ...user,
      speciesFound: newSpeciesCount,
      ecoXP: newXP,
      level: newLevel.level
    };

    setUser(updatedUser);
    saveUserProfileToFirestore(updatedUser);

    if (isNew) {
      setDailyChallenges(prev => prev.map(ch => {
        if (ch.id === 'quest_discover_species') {
          return { ...ch, current: 1, completed: true };
        }
        if (ch.id === 'quest_find_bird' && target.category === 'Avian') {
          return { ...ch, current: 1, completed: true };
        }
        return ch;
      }));
    }

    const latVal = coords?.lat ?? target.discoveryCoordinates?.lat ?? 18.5204;
    const lngVal = coords?.lng ?? target.discoveryCoordinates?.lng ?? 73.8567;
    const timestampMs = Date.now();
    const minuteBucket = Math.floor(timestampMs / (60 * 1000));
    const deterministicId = `disc_${user.uid}_${target.id}_${minuteBucket}`;

    const record: DiscoveryRecord = {
      id: deterministicId,
      userId: user.uid,
      speciesId: target.id,
      animalName: target.name,
      rarity: target.rarity,
      confidence,
      latitude: latVal,
      longitude: lngVal,
      timestamp: new Date(timestampMs).toISOString(),
      ecoXP: xpAwarded,
      expeditionId: currentExpedition?.id || null,
      createdAt: new Date(timestampMs).toISOString(),
      localImageUri: photoUrl || target.image,
      locationName,
      coordinates: { lat: latVal, lng: lngVal },
      xpAwarded
    };
    logDiscoveryToFirestore(record);

    audio.playDiscovery();
    setActiveDiscoveryModal({
      species: target,
      xpAwarded,
      isNew,
      breakdown
    });

    confetti({
      particleCount: isNew ? 100 : 40,
      spread: 75,
      origin: { y: 0.55 },
      colors: ['#2E7D32', '#66BB6A', '#FFD54F', '#4CAF50']
    });

    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isNightTime = hour >= 19 || hour < 6;

    const avianCount = updatedSpecies.filter(s => s.discovered && s.category === 'Avian').length;
    const mammalCount = updatedSpecies.filter(s => s.discovered && s.category === 'Mammal').length;
    const hasApex = updatedSpecies.some(s => s.discovered && ['Tiger', 'Lion', 'Leopard'].includes(s.name));

    const { updatedBadges, newlyUnlocked } = evaluateAllBadges(achievements, {
      discoveredSpeciesCount: newSpeciesCount,
      totalDistanceKm: user.totalDistance,
      avianCount,
      mammalCount,
      isNightTime,
      isWeekend,
      hasApexDiscovered: hasApex,
      currentStreak: user.streak || 1,
      totalEcoXP: newXP,
      currentLevel: newLevel.level
    });

    if (newlyUnlocked.length > 0) {
      setAchievements(updatedBadges);
      queueBadgesForPopup(newlyUnlocked);
    }

    if (newLevel.level > oldLevel.level) {
      setTimeout(() => {
        audio.playDiscovery();
        setActiveLevelUpPopup(newLevel.currentInfo);
      }, 1200);
    }

    return { isNew, xpAwarded, breakdown };
  };

  const closeDiscoveryModal = () => {
    setActiveDiscoveryModal(null);
  };

  return (
    <EcoDexContext.Provider
      value={{
        user,
        setUser,
        authStatus,
        authError,
        retryAuthCheck,
        species,
        achievements,
        dailyChallenges,
        claimChallenge,
        leaderboard,
        activeTab,
        setActiveTab: setActiveTabState,
        isExpeditionActive,
        currentExpedition,
        startExpedition,
        updateExpeditionProgress,
        finishExpedition,
        cancelExpedition,
        isTrackingModalOpen,
        setIsTrackingModalOpen,
        activeExpeditionSummary,
        setActiveExpeditionSummary,
        saveExpeditionAndApplyStats,
        recordDiscovery,
        activeDiscoveryModal,
        closeDiscoveryModal,
        activeAchievementPopup,
        achievementQueue,
        closeAchievementPopup,
        activeLevelUpPopup,
        closeLevelUpPopup,
        completeOnboarding,
        logout,
        soundEnabled,
        setSoundEnabled,
        openScannerModal,
        setOpenScannerModal,
        isOnline,
        pendingSyncCount,
        syncToastMessage,
        dismissSyncToast,
        triggerManualSync
      }}
    >
      {children}
    </EcoDexContext.Provider>
  );
};

export const useEcoDex = () => {
  const context = useContext(EcoDexContext);
  if (!context) {
    throw new Error('useEcoDex must be used within an EcoDexProvider');
  }
  return context;
};
