// Relationship System Types
// Defines talent-talent relationships: friendships, rivalries, romance, mentorship

export type RelationshipType =
  | 'friend'
  | 'rival'
  | 'romantic'
  | 'ex'
  | 'mentor'
  | 'enemy'
  | 'frenemy';

export interface RelationshipEvent {
  week: number;
  type: 'project_together' | 'scandal_shared' | 'award_competition' | 'breakup' | 'reconciliation' | 'betrayal' | 'formed' | 'strengthened' | 'weakened';
  impact: number; // How much this changed the relationship (-20 to +20)
  description: string;
}

export interface TalentRelationship {
  id: string;
  talentAId: string;
  talentBId: string;
  type: RelationshipType;
  strength: number; // -100 to +100, 0 is neutral
  isPublic: boolean;
  history: RelationshipEvent[];
  formedWeek: number;
  lastUpdatedWeek: number;
}

// For storage in state
export interface RelationshipsState {
  relationships: Record<string, TalentRelationship>; // key: "talentA-talentB" (sorted alphabetically)
  cliques?: {
    cliques: Record<string, import('./clique.types').Clique>;
    memberCliqueMap: Record<string, string[]>; // talentId -> cliqueIds
  };
  productionEnhancements?: {
    screenplayNotes: Record<string, import('./production.types').ScreenplayNote>;
    productionAdditions: Record<string, import('./production.types').ProductionAddition>;
    creditScenes: Record<string, import('./production.types').CreditScene>;
  };
  marketingPromotions?: {
    talkShowAppearances: Record<string, import('./marketing.types').TalkShowAppearance>;
    photoshoots: Record<string, import('./marketing.types').MagazinePhotoshoot>;
    activePressTours: Record<string, import('./marketing.types').PressTour>;
  };
}

// Helper type for relationship formation
export interface RelationshipFormation {
  talentAId: string;
  talentBId: string;
  type: RelationshipType;
  strength: number;
  reason: string;
}

// Romance-specific data
export interface RomanceData {
  isMarried: boolean;
  weddingWeek?: number;
  isSecret: boolean;
  stability: number; // 0-100, higher = less likely to break up
  powerCoupleRating: number; // Calculated from combined fame
}

// Extended relationship with romance details
export interface RomanticRelationship extends TalentRelationship {
  romanceData: RomanceData;
}
