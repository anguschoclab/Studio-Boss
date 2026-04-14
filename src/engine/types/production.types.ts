// Production Enhancement System Types
// Screenplay modifiers, production additions, credit scenes

export type ScreenplayNoteType =
  | 'character_arc'
  | 'plot_twist'
  | 'dialogue_rewrite'
  | 'pacing_fix'
  | 'emotional_beat'
  | 'thematic_deepening';

export interface ScreenplayNote {
  id: string;
  projectId: string;
  authorId: string; // Talent ID who provided the note
  type: ScreenplayNoteType;
  description: string;
  quality: number; // 0-100, how good the note is
  implemented: boolean;
  implementedWeek?: number;
  qualityBonus: number; // Quality improvement from implementing
  cost: number; // Production cost increase
}

export type ProductionAdditionType =
  | 'stunt_sequence'
  | 'practical_effects'
  | 'musical_number'
  | 'location_shoot'
  | 'period_costumes'
  | 'cameo'
  | 'extended_runtime';

export interface ProductionAddition {
  id: string;
  projectId: string;
  type: ProductionAdditionType;
  description: string;
  addedWeek: number;
  cost: number;
  qualityBonus: number; // How much this adds to final quality
  riskIncrease: number; // May increase production risk
  marketingValue: number; // Extra buzz
}

export type CreditSceneType = 'mid_credits' | 'post_credits' | 'teaser' | 'joke' | 'emotional_button';

export interface CreditScene {
  id: string;
  projectId: string;
  type: CreditSceneType;
  description: string;
  unlockCondition: 'franchise_member' | 'boxoffice_threshold' | 'sequels' | 'standalone';
  cost: number;
  audienceBonus: number; // +satisfaction for stickering around
  franchiseValue: number; // Setup for sequels
  surpriseFactor: number; // 0-100, how unexpected
  spoiledByRumors: boolean;
}

// For storage in state
export interface ProductionEnhancementsState {
  screenplayNotes: Record<string, ScreenplayNote>;
  productionAdditions: Record<string, ProductionAddition>;
  creditScenes: Record<string, CreditScene>;
}
