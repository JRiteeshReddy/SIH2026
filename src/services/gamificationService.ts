import { 
  Species, 
  UserProfile, 
  Achievement, 
  BonusItem, 
  EcoXPBreakdown, 
  ExplorerLevelInfo, 
  ExplorerLevelRank, 
  RarityType 
} from '../types';

// ==========================================
// 1. EXPLORER LEVELS (1 to 8)
// ==========================================

export const EXPLORER_LEVELS: ExplorerLevelInfo[] = [
  {
    level: 1,
    title: 'Seedling',
    minXP: 0,
    maxXP: 300,
    icon: '🌱',
    badgeName: 'Sprout Pioneer',
    badgeIcon: '🌱',
    perks: ['Basic AI Wildlife Scanner', 'Standard Field Journal']
  },
  {
    level: 2,
    title: 'Scout',
    minXP: 300,
    maxXP: 700,
    icon: '🧭',
    badgeName: 'Field Scout',
    badgeIcon: '🧭',
    perks: ['GPS Expedition Tracker', '+5% Streak EcoXP Multiplier']
  },
  {
    level: 3,
    title: 'Tracker',
    minXP: 700,
    maxXP: 1300,
    icon: '🐾',
    badgeName: 'Pathfinder',
    badgeIcon: '🐾',
    perks: ['Wildlife Sound Audio Library', 'Proximity Radar Alerts']
  },
  {
    level: 4,
    title: 'Ranger',
    minXP: 1300,
    maxXP: 2100,
    icon: '🌲',
    badgeName: 'Forest Ranger',
    badgeIcon: '🌲',
    perks: ['Epic Species Tracking Radar', 'Sanctuary Field Reports']
  },
  {
    level: 5,
    title: 'Naturalist',
    minXP: 2100,
    maxXP: 3200,
    icon: '🔬',
    badgeName: 'Wild Botanist',
    badgeIcon: '🔬',
    perks: ['Taxonomic Fact Archive', '+10% Expedition EcoXP Boost']
  },
  {
    level: 6,
    title: 'Explorer',
    minXP: 3200,
    maxXP: 4600,
    icon: '🗺️',
    badgeName: 'Expedition Master',
    badgeIcon: '🗺️',
    perks: ['Topographic Heatmaps', 'Elite Scout Leaderboard Flair']
  },
  {
    level: 7,
    title: 'Guardian',
    minXP: 4600,
    maxXP: 6300,
    icon: '🛡️',
    badgeName: 'Ecosystem Guardian',
    badgeIcon: '🛡️',
    perks: ['Legendary Apex Beacon', 'Reserve Conservation Ambassador']
  },
  {
    level: 8,
    title: 'Biodiversity Master',
    minXP: 6300,
    maxXP: 10000,
    icon: '👑',
    badgeName: 'Biodiversity Sovereign',
    badgeIcon: '👑',
    perks: ['Grand Master Golden Halo', 'Maximized XP Yield across all biomes']
  }
];

export interface LevelProgress {
  level: number;
  title: ExplorerLevelRank;
  minXP: number;
  maxXP: number;
  xpInLevel: number;
  xpNeededForNext: number;
  progressPercent: number;
  isMaxLevel: boolean;
  currentInfo: ExplorerLevelInfo;
  nextInfo: ExplorerLevelInfo | null;
}

export const calculateExplorerLevel = (ecoXP: number): LevelProgress => {
  const currentXP = Math.max(0, ecoXP);
  let levelInfo = EXPLORER_LEVELS[0];

  for (let i = 0; i < EXPLORER_LEVELS.length; i++) {
    if (currentXP >= EXPLORER_LEVELS[i].minXP) {
      levelInfo = EXPLORER_LEVELS[i];
    } else {
      break;
    }
  }

  const isMaxLevel = levelInfo.level === EXPLORER_LEVELS.length;
  const nextInfo = isMaxLevel ? null : EXPLORER_LEVELS[levelInfo.level];
  const levelMin = levelInfo.minXP;
  const levelMax = nextInfo ? nextInfo.minXP : levelInfo.maxXP;
  const xpInLevel = Math.max(0, currentXP - levelMin);
  const xpNeededForNext = Math.max(1, levelMax - levelMin);
  const progressPercent = isMaxLevel ? 100 : Math.min(100, Math.round((xpInLevel / xpNeededForNext) * 100));

  return {
    level: levelInfo.level,
    title: levelInfo.title,
    minXP: levelMin,
    maxXP: levelMax,
    xpInLevel,
    xpNeededForNext,
    progressPercent,
    isMaxLevel,
    currentInfo: levelInfo,
    nextInfo
  };
};

// ==========================================
// 2. ECOXP REWARDS & BONUSES
// ==========================================

export const BASE_REWARDS_BY_RARITY: Record<RarityType, { min: number; max: number; base: number }> = {
  Common: { min: 20, max: 40, base: 30 },
  Rare: { min: 80, max: 120, base: 100 },
  Epic: { min: 150, max: 250, base: 200 },
  Legendary: { min: 350, max: 600, base: 450 },
  Uncommon: { min: 40, max: 70, base: 55 } // backward compatibility
};

export interface EcoXPCalculationParams {
  species: Species;
  isNew: boolean;
  confidence?: number;
  userStreak?: number;
  isFirstDiscoveryOfDay?: boolean;
  isNewLocation?: boolean;
}

export const calculateEcoXPAward = ({
  species,
  isNew,
  confidence = 0.95,
  userStreak = 1,
  isFirstDiscoveryOfDay = false,
  isNewLocation = false
}: EcoXPCalculationParams): EcoXPBreakdown => {
  // 1. Base Rarity XP
  const rarityConfig = BASE_REWARDS_BY_RARITY[species.rarity] || BASE_REWARDS_BY_RARITY.Common;
  const baseXP = isNew ? rarityConfig.base : Math.round(rarityConfig.base * 0.4);

  const bonuses: BonusItem[] = [];

  // 2. Bonus: New species (+75 XP)
  if (isNew) {
    bonuses.push({
      id: 'bonus_new_species',
      label: 'New Species Discovery',
      xp: 75,
      icon: '✨'
    });
  }

  // 3. Bonus: First discovery of the day (+50 XP)
  if (isFirstDiscoveryOfDay) {
    bonuses.push({
      id: 'bonus_first_of_day',
      label: 'First Discovery of the Day',
      xp: 50,
      icon: '🌅'
    });
  }

  // 4. Bonus: Walking streak (+10 XP per streak day, max 70 XP)
  if (userStreak > 0) {
    const streakXP = Math.min(70, userStreak * 10);
    bonuses.push({
      id: 'bonus_walking_streak',
      label: `${userStreak}-Day Walking Streak`,
      xp: streakXP,
      icon: '🔥'
    });
  }

  // 5. Bonus: New location (+40 XP)
  if (isNewLocation) {
    bonuses.push({
      id: 'bonus_new_location',
      label: 'New Reserve Location',
      xp: 40,
      icon: '📍'
    });
  }

  // 6. Bonus: Perfect confidence scan (>= 0.95 -> +50 XP)
  if (confidence >= 0.95) {
    const percentStr = Math.round(confidence * 100);
    bonuses.push({
      id: 'bonus_perfect_scan',
      label: `Perfect AI Scan (${percentStr}%)`,
      xp: 50,
      icon: '🎯'
    });
  }

  const bonusSum = bonuses.reduce((acc, b) => acc + b.xp, 0);
  const totalXP = baseXP + bonusSum;

  return {
    baseXP,
    bonuses,
    totalXP
  };
};

// ==========================================
// 3. BADGES DEFINITIONS & EVALUATOR
// ==========================================

export const INITIAL_ALL_BADGES: Achievement[] = [
  // Prompt requested examples:
  {
    id: 'ach_first_discovery',
    title: 'First Discovery',
    description: 'Log your very first wild species into your EcoDex field journal.',
    icon: '🌱',
    tier: 'Bronze',
    category: 'Discovery',
    xpReward: 100,
    unlocked: true,
    progress: 1,
    maxProgress: 1,
    unlockedAt: '2026-03-01'
  },
  {
    id: 'ach_bird_watcher',
    title: 'Bird Watcher',
    description: 'Identify and record at least 3 bird species.',
    icon: '🦅',
    tier: 'Silver',
    category: 'Discovery',
    xpReward: 250,
    unlocked: true,
    progress: 3,
    maxProgress: 3,
    unlockedAt: '2026-03-05'
  },
  {
    id: 'ach_mammal_hunter',
    title: 'Mammal Hunter',
    description: 'Track and document at least 3 mammal species.',
    icon: '🐾',
    tier: 'Silver',
    category: 'Discovery',
    xpReward: 250,
    unlocked: false,
    progress: 2,
    maxProgress: 3
  },
  {
    id: 'ach_weekend_explorer',
    title: 'Weekend Explorer',
    description: 'Log an expedition or wildlife sighting on a Saturday or Sunday.',
    icon: '⛺',
    tier: 'Bronze',
    category: 'Exploration',
    xpReward: 150,
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'ach_5km_walker',
    title: '5 km Walker',
    description: 'Walk a total of 5.0 km on nature exploration expeditions.',
    icon: '🥾',
    tier: 'Silver',
    category: 'Fitness',
    xpReward: 300,
    unlocked: true,
    progress: 8.6,
    maxProgress: 5.0,
    unlockedAt: '2026-03-06'
  },
  {
    id: 'ach_10_species',
    title: '10 Species Collected',
    description: 'Discover and document 10 unique wildlife species.',
    icon: '📖',
    tier: 'Gold',
    category: 'Discovery',
    xpReward: 500,
    unlocked: false,
    progress: 6,
    maxProgress: 10
  },
  {
    id: 'ach_1000_ecoxp',
    title: '1000 EcoXP',
    description: 'Accumulate 1,000 total lifetime EcoXP.',
    icon: '⭐',
    tier: 'Gold',
    category: 'Milestones',
    xpReward: 400,
    unlocked: true,
    progress: 1240,
    maxProgress: 1000,
    unlockedAt: '2026-03-06'
  },
  {
    id: 'ach_7_day_streak',
    title: '7 Day Streak',
    description: 'Maintain an uninterrupted 7-day outdoor nature streak.',
    icon: '🔥',
    tier: 'Gold',
    category: 'Streaks',
    xpReward: 450,
    unlocked: false,
    progress: 5,
    maxProgress: 7
  },
  {
    id: 'ach_night_explorer',
    title: 'Night Explorer',
    description: 'Log a discovery or expedition during night hours (after 7 PM or before 6 AM).',
    icon: '🌙',
    tier: 'Silver',
    category: 'Exploration',
    xpReward: 200,
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'ach_forest_ranger',
    title: 'Forest Ranger',
    description: 'Reach Level 4 Ranger status in the Explorer Guild.',
    icon: '🌲',
    tier: 'Emerald',
    category: 'Rank',
    xpReward: 600,
    unlocked: false,
    progress: 3,
    maxProgress: 4,
    levelRequired: 4
  },
  // Elite Apex & Full Catalog achievements
  {
    id: 'ach_apex_spotter',
    title: 'Apex Sovereign',
    description: 'Encounter any Legendary apex predator (Tiger, Lion, or Leopard).',
    icon: '👑',
    tier: 'Emerald',
    category: 'Discovery',
    xpReward: 600,
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'ach_complete_dex',
    title: 'Eco Master',
    description: 'Document all 23 native species across all biodiversity classes.',
    icon: '🏆',
    tier: 'Emerald',
    category: 'Milestones',
    xpReward: 1500,
    unlocked: false,
    progress: 6,
    maxProgress: 23
  }
];

export interface BadgeEvaluationContext {
  discoveredSpeciesCount: number;
  avianCount: number;
  mammalCount: number;
  totalDistanceKm: number;
  currentStreak: number;
  totalEcoXP: number;
  currentLevel: number;
  isWeekend?: boolean;
  isNightTime?: boolean;
  hasApexDiscovered?: boolean;
}

export const evaluateAllBadges = (
  currentBadges: Achievement[],
  context: BadgeEvaluationContext
): { updatedBadges: Achievement[]; newlyUnlocked: Achievement[] } => {
  const newlyUnlocked: Achievement[] = [];

  const updatedBadges = currentBadges.map(badge => {
    if (badge.unlocked) return badge;

    let currentProgress = badge.progress;
    let shouldUnlock = false;

    switch (badge.id) {
      case 'ach_first_discovery':
        currentProgress = context.discoveredSpeciesCount;
        shouldUnlock = currentProgress >= 1;
        break;

      case 'ach_bird_watcher':
        currentProgress = context.avianCount;
        shouldUnlock = currentProgress >= 3;
        break;

      case 'ach_mammal_hunter':
        currentProgress = context.mammalCount;
        shouldUnlock = currentProgress >= 3;
        break;

      case 'ach_weekend_explorer':
        if (context.isWeekend) {
          currentProgress = 1;
          shouldUnlock = true;
        }
        break;

      case 'ach_5km_walker':
        currentProgress = parseFloat(context.totalDistanceKm.toFixed(1));
        shouldUnlock = currentProgress >= 5.0;
        break;

      case 'ach_10_species':
        currentProgress = context.discoveredSpeciesCount;
        shouldUnlock = currentProgress >= 10;
        break;

      case 'ach_1000_ecoxp':
        currentProgress = context.totalEcoXP;
        shouldUnlock = currentProgress >= 1000;
        break;

      case 'ach_7_day_streak':
        currentProgress = context.currentStreak;
        shouldUnlock = currentProgress >= 7;
        break;

      case 'ach_night_explorer':
        if (context.isNightTime) {
          currentProgress = 1;
          shouldUnlock = true;
        }
        break;

      case 'ach_forest_ranger':
        currentProgress = context.currentLevel;
        shouldUnlock = currentProgress >= 4;
        break;

      case 'ach_apex_spotter':
        if (context.hasApexDiscovered) {
          currentProgress = 1;
          shouldUnlock = true;
        }
        break;

      case 'ach_complete_dex':
        currentProgress = context.discoveredSpeciesCount;
        shouldUnlock = currentProgress >= 23;
        break;

      default:
        break;
    }

    if (shouldUnlock && !badge.unlocked) {
      const unlockedBadge: Achievement = {
        ...badge,
        unlocked: true,
        progress: badge.maxProgress,
        unlockedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
      newlyUnlocked.push(unlockedBadge);
      return unlockedBadge;
    }

    return {
      ...badge,
      progress: Math.min(badge.maxProgress, currentProgress)
    };
  });

  return { updatedBadges, newlyUnlocked };
};
