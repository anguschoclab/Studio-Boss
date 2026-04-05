import { RivalStrategy } from '../types/talent.types';
import { StudioMotivation } from '../types/studio.types';

export interface AIArchetype {
  id: string;
  name: string;
  strategy: RivalStrategy;
  motivation: StudioMotivation;
  biddingAggression: number; // 0-100
  talentLoyalty: number;    // 0-100 (chance to keep talent vs poach)
  riskAppetite: number;     // 0-100
  awardObsession: number;   // 0-100
  genreFocus: string[];
}

export const AI_ARCHETYPES: AIArchetype[] = [
  {
    id: 'BLOCKBUSTER_BULL',
    name: 'Blockbuster Bull',
    strategy: 'blockbuster_focused',
    motivation: 'CASH_CRUNCH',
    biddingAggression: 90,
    talentLoyalty: 40,
    riskAppetite: 80,
    awardObsession: 10,
    genreFocus: ['Action', 'Sci-Fi', 'Superhero']
  },
  {
    id: 'PRESTIGE_PURIST',
    name: 'Prestige Purist',
    strategy: 'prestige_chaser',
    motivation: 'AWARD_CHASE',
    biddingAggression: 60,
    talentLoyalty: 80,
    riskAppetite: 30,
    awardObsession: 95,
    genreFocus: ['Drama', 'Art House', 'Historical']
  },
  {
    id: 'GENRE_KING',
    name: 'Genre King',
    strategy: 'genre_specialist',
    motivation: 'STABILITY',
    biddingAggression: 50,
    talentLoyalty: 70,
    riskAppetite: 40,
    awardObsession: 30,
    genreFocus: ['Horror', 'Comedy', 'Thriller']
  },
  {
    id: 'THE_ACQUIRER',
    name: 'The Acquirer',
    strategy: 'acquirer',
    motivation: 'FRANCHISE_BUILDING',
    biddingAggression: 75,
    talentLoyalty: 50,
    riskAppetite: 60,
    awardObsession: 40,
    genreFocus: ['Any']
  },
  {
    id: 'SILENT_POACHER',
    name: 'Silent Poacher',
    strategy: 'poacher',
    motivation: 'MARKET_DISRUPTION',
    biddingAggression: 85,
    talentLoyalty: 20,
    riskAppetite: 70,
    awardObsession: 50,
    genreFocus: ['Any']
  },
  {
    id: 'BALANCED_GIANT',
    name: 'Balanced Giant',
    strategy: 'balanced',
    motivation: 'STABILITY',
    biddingAggression: 40,
    talentLoyalty: 60,
    riskAppetite: 50,
    awardObsession: 60,
    genreFocus: ['Any']
  },
  {
    id: 'STREAMING_TITAN',
    name: 'Streaming Titan',
    strategy: 'blockbuster_focused',
    motivation: 'MARKET_DISRUPTION',
    biddingAggression: 95,
    talentLoyalty: 30,
    riskAppetite: 90,
    awardObsession: 40,
    genreFocus: ['Sci-Fi', 'Fantasy', 'Crime']
  },
  {
    id: 'INDIE_DARLING',
    name: 'Indie Darling',
    strategy: 'prestige_chaser',
    motivation: 'AWARD_CHASE',
    biddingAggression: 30,
    talentLoyalty: 90,
    riskAppetite: 70,
    awardObsession: 85,
    genreFocus: ['Art House', 'Documentary', 'Animation']
  },
  {
    id: 'CASH_COW',
    name: 'Cash Cow',
    strategy: 'genre_specialist',
    motivation: 'CASH_CRUNCH',
    biddingAggression: 40,
    talentLoyalty: 50,
    riskAppetite: 20,
    awardObsession: 5,
    genreFocus: ['Family', 'Comedy', 'Unscripted']
  },
  {
    id: 'RETRO_REVOLUTIONARY',
    name: 'Retro Revolutionary',
    strategy: 'acquirer',
    motivation: 'FRANCHISE_BUILDING',
    biddingAggression: 65,
    talentLoyalty: 60,
    riskAppetite: 55,
    awardObsession: 35,
    genreFocus: ['Historical', 'Legacy', 'Musical']
  }
];
