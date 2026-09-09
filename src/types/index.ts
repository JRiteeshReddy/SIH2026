export type CategoryType = 'All' | 'Avian' | 'Mammal' | 'Reptile' | 'Amphibian' | 'Insect';

export type RarityType = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export interface UserProfile {
  uid: string;
  username: string;
  email?: string;
  college: string;
  avatar: string;
  cityState: string;
  level: number;
  ecoXP: number;
  totalDistance: number; // in kilometers
  speciesFound: number;
  streak: number; // in days
  achievements?: string[]; // Array of unlocked achievement IDs
  achievementsCount?: number;
  distanceToday?: number;
  weeklyRank?: number;
  reputation: number;
  joinedDate: string;
  updatedAt?: string;
}

export type EcoDexRarityTab = 'All' | 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface Species {
  id: string;
  labelIndex: number;
  name: string;
  scientificName: string;
  category: 'Avian' | 'Mammal' | 'Reptile' | 'Amphibian' | 'Insect';
  rarity: RarityType;
  xp: number;
  habitat: string;
  diet: string;
  conservationStatus: 'Least Concern' | 'Near Threatened' | 'Vulnerable' | 'Endangered' | 'Critically Endangered';
  description: string;
  funFact: string;
  wildlifeFacts?: string[];
  icon: string;
  image: string;
  discovered?: boolean;
  discoveredAt?: string;
  firstDiscoveredDate?: string;
  discoveryPhoto?: string;
  discoveryLocation?: string;
  discoveryCoordinates?: { lat: number; lng: number };
  totalSightings?: number;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  unit: string;
  xpReward: number;
  completed: boolean;
  claimed: boolean;
}

export interface Expedition {
  id: string;
  userId: string;
  startTime: number;
  endTime?: number;
  distanceKm: number;
  steps: number;
  durationSeconds: number;
  caloriesBurned: number;
  speciesEncountered: string[];
  ecoXPEarned: number;
  path: [number, number][];
  active: boolean;
  isPaused?: boolean;
  explorerRating?: number; // 1 to 5 stars
  ratingTitle?: string;
  createdAt?: string;
}

export interface DiscoveryRecord {
  id: string;
  userId: string;
  speciesId: string;
  animalName: string;
  rarity: RarityType;
  confidence: number;
  latitude: number;
  longitude: number;
  timestamp: string;
  ecoXP: number;
  expeditionId?: string | null;
  createdAt: string;
  localImageUri?: string;
  photoUrl?: string; // Optional future cloud URL field
  locationName?: string;
  coordinates?: { lat: number; lng: number };
  xpAwarded?: number;
  speciesName?: string;
  notes?: string;
}

export interface ConservationReport {
  id: string;
  reporterUserId: string;
  discoveryId?: string;
  speciesName?: string;
  reason: string;
  evidence: string;
  location?: string;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

export interface BonusItem {
  id: string;
  label: string;
  xp: number;
  icon: string;
}

export interface EcoXPBreakdown {
  baseXP: number;
  bonuses: BonusItem[];
  totalXP: number;
}

export type ExplorerLevelRank = 
  | 'Seedling' 
  | 'Scout' 
  | 'Tracker' 
  | 'Ranger' 
  | 'Naturalist' 
  | 'Explorer' 
  | 'Guardian' 
  | 'Biodiversity Master';

export interface ExplorerLevelInfo {
  level: number;
  title: ExplorerLevelRank;
  minXP: number;
  maxXP: number;
  icon: string;
  badgeName: string;
  badgeIcon: string;
  perks: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Emerald';
  category?: 'Discovery' | 'Fitness' | 'Streaks' | 'Rank' | 'Special' | 'Exploration' | 'Milestones';
  xpReward: number;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedAt?: string;
  levelRequired?: number;
}

export type LeaderboardTabScope = 'Global' | 'College' | 'Friends' | 'Weekly' | 'Monthly';
export type LeaderboardMetric = 'ecoXP' | 'totalDistance' | 'speciesFound' | 'achievementsCount';

export interface LeaderboardUser {
  uid: string;
  username: string;
  college: string;
  avatar: string;
  cityState: string;
  rank?: number;
  level: number;
  ecoXP: number;
  totalDistance: number;
  speciesFound: number;
  streak: number;
  achievementsCount: number;
  isFriend?: boolean;
  weeklyXP?: number;
  weeklyDistance?: number;
  weeklySpecies?: number;
  monthlyXP?: number;
  monthlyDistance?: number;
  monthlySpecies?: number;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  unit: string;
  endsAt: number; // timestamp in ms
  exclusiveBadge: {
    id: string;
    title: string;
    icon: string;
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Emerald';
    description: string;
    xpReward: number;
  };
  rewardXP: number;
  completed: boolean;
  claimed: boolean;
  topPlayers: {
    rank: number;
    username: string;
    avatar: string;
    college: string;
    score: string;
  }[];
}
