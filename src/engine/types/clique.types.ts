// Clique/Group System Types
// Defines talent cliques (Rat Pack style groups) that form and gain fame together

export type CliqueStatus = 'active' | 'dormant' | 'disbanded';
export type CliqueReputation = 'cool' | 'elitist' | 'scandalous' | 'prestigious' | 'toxic';

export interface Clique {
  id: string;
  name: string;
  members: string[]; // Talent IDs
  formedWeek: number;
  disbandedWeek?: number;
  status: CliqueStatus;
  fameBonus: number; // Percentage bonus (0-50)
  reputation: CliqueReputation;
  exclusivity: number; // 0-100, how hard to join
  combinedStarPower: number; // Sum of all member star meters
  reunionPotential: number; // 0-100, chance of reunion after disband
  internalConflicts: string[]; // List of member pairs with tension
}

// For storage in state
export interface CliquesState {
  cliques: Record<string, Clique>;
  memberCliqueMap: Record<string, string[]>; // talentId -> cliqueIds
}

// Clique formation event
export interface CliqueFormation {
  founderIds: string[];
  initialMembers: string[];
  name: string;
  reason: string;
}

// Famous clique name patterns
export const CLIQUE_NAME_PATTERNS = {
  eraBased: [
    "The {decade}s Brat Pack",
    "The New Hollywood",
    "The {decade}s Rat Pack",
    "The Millennium Crew",
  ],
  locationBased: [
    "The {location} Mafia",
    "{location} Royalty",
    "The {location} Circle",
  ],
  personalityBased: [
    "The Bad Boys",
    "The It Girls",
    "The Drama Club",
    "The Golden Circle",
  ],
  movieBased: [
    "The {movieTitle} Gang",
    "The {movieTitle} Collective",
  ],
};
