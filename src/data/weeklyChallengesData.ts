import { WeeklyChallenge } from '../types';

// Countdown helper set for ~3 days from now
const THREE_DAYS_MS = (3 * 24 * 60 * 60 + 14 * 3600 + 25 * 60) * 1000;

export const INITIAL_WEEKLY_CHALLENGES: WeeklyChallenge[] = [
  {
    id: 'wc_bird_week',
    title: 'Bird Week',
    subtitle: 'Avian Migration Census',
    description: 'Spot and catalog 3 native avian species during the spring migration corridor.',
    icon: '🦅',
    target: 3,
    current: 2,
    unit: 'Birds Logged',
    endsAt: Date.now() + THREE_DAYS_MS,
    exclusiveBadge: {
      id: 'badge_avian_sentinel',
      title: 'Avian Sentinel',
      icon: '🪶',
      tier: 'Gold',
      description: 'Champion finisher of the National Bird Week Biodiversity Rally.',
      xpReward: 350
    },
    rewardXP: 350,
    completed: false,
    claimed: false,
    topPlayers: [
      { rank: 1, username: 'Aarav Sharma', avatar: '🦊', college: 'IIT Bombay', score: '3/3 Complete' },
      { rank: 2, username: 'Rohan Iyer', avatar: '🐯', college: 'IISc Bengaluru', score: '3/3 Complete' },
      { rank: 3, username: 'NatureExplorer', avatar: '🌿', college: 'EcoDex Academy', score: '2/3 Birds' }
    ]
  },
  {
    id: 'wc_butterfly_hunt',
    title: 'Butterfly Hunt',
    subtitle: 'Floral Pollinator Quest',
    description: 'Document 2 vibrant butterfly or pollinator species around flowering shrubs and wetlands.',
    icon: '🦋',
    target: 2,
    current: 1,
    unit: 'Pollinators',
    endsAt: Date.now() + (4 * 24 * 3600 + 8 * 3600) * 1000,
    exclusiveBadge: {
      id: 'badge_lepidoptera_champion',
      title: 'Lepidoptera Champion',
      icon: '✨',
      tier: 'Gold',
      description: 'Top-tier pollinator tracker during the Butterfly Biodiversity Hunt.',
      xpReward: 300
    },
    rewardXP: 300,
    completed: false,
    claimed: false,
    topPlayers: [
      { rank: 1, username: 'Sneha Patel', avatar: '🦋', college: 'Delhi University', score: '2/2 Complete' },
      { rank: 2, username: 'Ananya Verma', avatar: '🦉', college: 'BITS Pilani', score: '2/2 Complete' },
      { rank: 3, username: 'Kabir Das', avatar: '🐘', college: 'IIT Kharagpur', score: '1/2 Found' }
    ]
  },
  {
    id: 'wc_5k_challenge',
    title: '5 km Challenge',
    subtitle: 'Nature Trek Endurance',
    description: 'Log 5.0 total kilometers on outdoor fitness expeditions through natural trails.',
    icon: '🥾',
    target: 5.0,
    current: 5.4,
    unit: 'km Walked',
    endsAt: Date.now() + (2 * 24 * 3600 + 18 * 3600) * 1000,
    exclusiveBadge: {
      id: 'badge_5k_pacesetter',
      title: '5K Pacesetter',
      icon: '⚡',
      tier: 'Emerald',
      description: 'Completed 5.0+ km on active GPS wilderness fitness expeditions.',
      xpReward: 400
    },
    rewardXP: 400,
    completed: true,
    claimed: false,
    topPlayers: [
      { rank: 1, username: 'Aarav Sharma', avatar: '🦊', college: 'IIT Bombay', score: '12.4 km' },
      { rank: 2, username: 'NatureExplorer', avatar: '🌿', college: 'EcoDex Academy', score: '8.6 km' },
      { rank: 3, username: 'Rohan Iyer', avatar: '🐯', college: 'IISc Bengaluru', score: '7.8 km' }
    ]
  },
  {
    id: 'wc_campus_bioblitz',
    title: 'Campus BioBlitz',
    subtitle: 'Collegiate Biodiversity Sprint',
    description: 'Collaborate with campus explorers to catalog 6 distinct flora and fauna species.',
    icon: '🏫',
    target: 6,
    current: 6,
    unit: 'Species Logged',
    endsAt: Date.now() + (5 * 24 * 3600 + 4 * 3600) * 1000,
    exclusiveBadge: {
      id: 'badge_campus_bioblitz_master',
      title: 'Campus BioBlitz Master',
      icon: '👑',
      tier: 'Emerald',
      description: 'First place collegiate natural historian in the Campus BioBlitz Sprint.',
      xpReward: 500
    },
    rewardXP: 500,
    completed: true,
    claimed: false,
    topPlayers: [
      { rank: 1, username: 'NatureExplorer', avatar: '🌿', college: 'EcoDex Academy', score: '6/6 Species' },
      { rank: 2, username: 'Pooja Nair', avatar: '🦚', college: 'NIT Calicut', score: '5/6 Species' },
      { rank: 3, username: 'Ananya Verma', avatar: '🦉', college: 'BITS Pilani', score: '5/6 Species' }
    ]
  }
];
