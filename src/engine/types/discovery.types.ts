// Talent Discovery System Types
// Breakout stars, guest stars, hidden gems

export type BreakoutTrigger =
  | 'indie_hit'
  | 'viral_scene'
  | 'cameo_steal'
  | 'tv_performance'
  | 'award_nomination'
  | 'critical_praise';

export interface BreakoutStar {
  id: string;
  talentId: string;
  trigger: BreakoutTrigger;
  projectId: string;
  week: number;
  // Pre-breakout stats (for comparison)
  previousStarMeter: number;
  previousTier: number;
  // Post-breakout stats
  starMeterJump: number;
  newTier: number;
  feeMultiplier: number; // 2x, 3x, etc.
  // Duration of breakout hype
  hypeWeeksRemaining: number;
  // Whether they've been signed by a studio
  signedByStudioId?: string;
  biddingWarActive: boolean;
  // Career trajectory after breakout
  sustainedSuccess: boolean;
  oneHitWonder: boolean;
}

export interface GuestStarBooking {
  id: string;
  talentId: string;
  seriesId: string;
  episodeNumber: number;
  seasonNumber: number;
  roleType: 'cameo' | 'recurring_guest' | 'special_guest' | 'crossover';
  impact: number; // Rating boost
  cost: number;
  chemistryWithCast: number; // 0-100
  fanReaction: 'positive' | 'mixed' | 'negative' | 'viral';
}

// Hidden talent pool (undiscovered gems)
export interface HiddenTalent {
  id: string;
  name: string;
  age: number;
  potential: number; // 0-100, ceiling of their career
  currentSkill: number; // 0-100, actual current ability
  discoveryMethod: 'audition' | 'recommendation' | 'scouting' | 'viral_discovery';
  discoveredBy?: string; // Studio ID
  discoveryWeek?: number;
  askingPrice: number;
  // Stats (hidden until discovered)
  charisma: number;
  prestige: number;
  draw: number;
  // Viral potential (some unknowns go viral on social media)
  viralChance: number;
}

// Talent discovery state
export interface DiscoveryState {
  breakoutStars: Record<string, BreakoutStar>;
  guestStarBookings: Record<string, GuestStarBooking>;
  hiddenTalentPool: Record<string, HiddenTalent>;
  discoveryLog: string[]; // Talent IDs discovered this week
}

// Discovery events
export interface DiscoveryEvent {
  week: number;
  talentId: string;
  method: string;
  studioId?: string;
}
