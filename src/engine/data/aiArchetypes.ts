import { RivalStrategy } from '../types/talent.types';
import { StudioMotivation } from '../types/studio.types';
import { ProjectFormat, BudgetTierKey } from '../types/project.types';

/**
 * Unified Studio Archetype System
 */
export interface StudioArchetype {
  id: string;
  name: string;
  strategy: RivalStrategy;
  motivation: StudioMotivation;
  biddingAggression: number; // 0-100
  talentLoyalty: number;    // 0-100
  riskAppetite: number;     // 0-100
  awardObsession: number;   // 0-100
  genreFocus: string[];
  greenlight_bias: ProjectFormat[];
  budget_tier_weights: Record<BudgetTierKey, number>;
  pact_aggression: number;      // 0-1
  ma_willingness: number;       // 0-1
  festivalParticipation: number; // 0-1
  preferredGenres: string[];
}

export type AIArchetype = StudioArchetype;

export const STUDIO_ARCHETYPES: Record<string, StudioArchetype> = {
  BLOCKBUSTER_BULL: {
    id: 'BLOCKBUSTER_BULL',
    name: 'Blockbuster Bull',
    strategy: 'blockbuster_focused',
    motivation: 'CASH_CRUNCH',
    biddingAggression: 90,
    talentLoyalty: 40,
    riskAppetite: 80,
    awardObsession: 10,
    genreFocus: ['Action', 'Sci-Fi', 'Superhero'],
    greenlight_bias: ['film'],
    budget_tier_weights: { indie: 0.0, low: 0.05, mid: 0.20, high: 0.40, blockbuster: 0.35 },
    pact_aggression: 0.3,
    ma_willingness: 0.6,
    festivalParticipation: 0.2,
    preferredGenres: ['Action', 'Sci-Fi', 'Superhero']
  },
  PRESTIGE_PURIST: {
    id: 'PRESTIGE_PURIST',
    name: 'Prestige Purist',
    strategy: 'prestige_chaser',
    motivation: 'AWARD_CHASE',
    biddingAggression: 60,
    talentLoyalty: 80,
    riskAppetite: 30,
    awardObsession: 95,
    genreFocus: ['Drama', 'Art House', 'Historical'],
    greenlight_bias: ['film'],
    budget_tier_weights: { indie: 0.10, low: 0.20, mid: 0.45, high: 0.20, blockbuster: 0.05 },
    pact_aggression: 0.4,
    ma_willingness: 0.2,
    festivalParticipation: 0.9,
    preferredGenres: ['Drama', 'Art House', 'Historical']
  },
  GENRE_KING: {
    id: 'GENRE_KING',
    name: 'Genre King',
    strategy: 'genre_specialist',
    motivation: 'STABILITY',
    biddingAggression: 50,
    talentLoyalty: 70,
    riskAppetite: 40,
    awardObsession: 30,
    genreFocus: ['Horror', 'Comedy', 'Thriller'],
    greenlight_bias: ['film'],
    budget_tier_weights: { indie: 0.10, low: 0.30, mid: 0.40, high: 0.15, blockbuster: 0.05 },
    pact_aggression: 0.2,
    ma_willingness: 0.2,
    festivalParticipation: 0.3,
    preferredGenres: ['Horror', 'Comedy', 'Thriller']
  },
  THE_ACQUIRER: {
    id: 'THE_ACQUIRER',
    name: 'The Acquirer',
    strategy: 'acquirer',
    motivation: 'FRANCHISE_BUILDING',
    biddingAggression: 75,
    talentLoyalty: 50,
    riskAppetite: 60,
    awardObsession: 40,
    genreFocus: ['Any'],
    greenlight_bias: ['film', 'tv'],
    budget_tier_weights: { indie: 0.0, low: 0.05, mid: 0.25, high: 0.45, blockbuster: 0.25 },
    pact_aggression: 0.5,
    ma_willingness: 0.7,
    festivalParticipation: 0.1,
    preferredGenres: ['Any']
  },
  SILENT_POACHER: {
    id: 'SILENT_POACHER',
    name: 'Silent Poacher',
    strategy: 'poacher',
    motivation: 'MARKET_DISRUPTION',
    biddingAggression: 85,
    talentLoyalty: 20,
    riskAppetite: 70,
    awardObsession: 50,
    genreFocus: ['Any'],
    greenlight_bias: ['film', 'tv'],
    budget_tier_weights: { indie: 0.10, low: 0.15, mid: 0.50, high: 0.20, blockbuster: 0.05 },
    pact_aggression: 0.6,
    ma_willingness: 0.3,
    festivalParticipation: 0.8,
    preferredGenres: ['Any']
  },
  BALANCED_GIANT: {
    id: 'BALANCED_GIANT',
    name: 'Balanced Giant',
    strategy: 'balanced',
    motivation: 'STABILITY',
    biddingAggression: 40,
    talentLoyalty: 60,
    riskAppetite: 50,
    awardObsession: 60,
    genreFocus: ['Any'],
    greenlight_bias: ['film', 'tv'],
    budget_tier_weights: { indie: 0.0, low: 0.10, mid: 0.25, high: 0.40, blockbuster: 0.25 },
    pact_aggression: 0.3,
    ma_willingness: 0.5,
    festivalParticipation: 0.5,
    preferredGenres: ['Any']
  },
  STREAMING_TITAN: {
    id: 'STREAMING_TITAN',
    name: 'Streaming Titan',
    strategy: 'blockbuster_focused',
    motivation: 'MARKET_DISRUPTION',
    biddingAggression: 95,
    talentLoyalty: 30,
    riskAppetite: 90,
    awardObsession: 40,
    genreFocus: ['Sci-Fi', 'Fantasy', 'Crime'],
    greenlight_bias: ['film', 'tv'],
    budget_tier_weights: { indie: 0.0, low: 0.15, mid: 0.35, high: 0.35, blockbuster: 0.15 },
    pact_aggression: 0.5,
    ma_willingness: 0.9,
    festivalParticipation: 0.4,
    preferredGenres: ['Sci-Fi', 'Fantasy', 'Crime']
  },
  INDIE_DARLING: {
    id: 'INDIE_DARLING',
    name: 'Indie Darling',
    strategy: 'prestige_chaser',
    motivation: 'AWARD_CHASE',
    biddingAggression: 30,
    talentLoyalty: 90,
    riskAppetite: 70,
    awardObsession: 85,
    genreFocus: ['Art House', 'Documentary', 'Animation'],
    greenlight_bias: ['film'],
    budget_tier_weights: { indie: 0.10, low: 0.20, mid: 0.45, high: 0.20, blockbuster: 0.05 },
    pact_aggression: 0.4,
    ma_willingness: 0.2,
    festivalParticipation: 0.9,
    preferredGenres: ['Art House', 'Documentary', 'Animation']
  },
  CASH_COW: {
    id: 'CASH_COW',
    name: 'Cash Cow',
    strategy: 'genre_specialist',
    motivation: 'CASH_CRUNCH',
    biddingAggression: 40,
    talentLoyalty: 50,
    riskAppetite: 20,
    awardObsession: 5,
    genreFocus: ['Family', 'Comedy', 'Unscripted'],
    greenlight_bias: ['film', 'tv'],
    budget_tier_weights: { indie: 0.10, low: 0.60, mid: 0.25, high: 0.05, blockbuster: 0.00 },
    pact_aggression: 0.05,
    ma_willingness: 0.1,
    festivalParticipation: 0.05,
    preferredGenres: ['Family', 'Comedy', 'Unscripted']
  },
  RETRO_REVOLUTIONARY: {
    id: 'RETRO_REVOLUTIONARY',
    name: 'Retro Revolutionary',
    strategy: 'acquirer',
    motivation: 'FRANCHISE_BUILDING',
    biddingAggression: 65,
    talentLoyalty: 60,
    riskAppetite: 55,
    awardObsession: 35,
    genreFocus: ['Historical', 'Legacy', 'Musical'],
    greenlight_bias: ['film', 'tv'],
    budget_tier_weights: { indie: 0.0, low: 0.10, mid: 0.30, high: 0.40, blockbuster: 0.20 },
    pact_aggression: 0.4,
    ma_willingness: 0.5,
    festivalParticipation: 0.4,
    preferredGenres: ['Historical', 'Legacy', 'Musical']
  }
};

export const AI_ARCHETYPES = Object.values(STUDIO_ARCHETYPES);
export function getStudioArchetype(id: string): StudioArchetype {
  return STUDIO_ARCHETYPES[id] || STUDIO_ARCHETYPES.BALANCED_GIANT;
}
