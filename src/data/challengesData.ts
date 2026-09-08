import { DailyChallenge } from '../types';

export const INITIAL_CHALLENGES: DailyChallenge[] = [
  {
    id: 'quest_walk_2km',
    title: 'Walk 2 km',
    description: 'Explore local nature trails, parks, or campus grounds.',
    icon: '🥾',
    target: 2.0,
    current: 1.2,
    unit: 'km',
    xpReward: 150,
    completed: false,
    claimed: false
  },
  {
    id: 'quest_find_bird',
    title: 'Find one bird',
    description: 'Spot and identify an avian species (e.g. Crow, Pigeon, Peafowl, Parakeet).',
    icon: '🪶',
    target: 1,
    current: 1,
    unit: 'bird',
    xpReward: 120,
    completed: true,
    claimed: false
  },
  {
    id: 'quest_discover_species',
    title: 'Discover a new species',
    description: 'Log an undiscovered wildlife creature into your EcoDex journal.',
    icon: '🔍',
    target: 1,
    current: 0,
    unit: 'species',
    xpReward: 200,
    completed: false,
    claimed: false
  },
  {
    id: 'quest_explore_location',
    title: 'Explore a new location',
    description: 'Trek into a new biodiversity hotspot or nature reserve coordinate.',
    icon: '📍',
    target: 1,
    current: 1,
    unit: 'location',
    xpReward: 180,
    completed: true,
    claimed: false
  }
];
