/**
 * Types for the Shared Universe and Franchise management system.
 */

export interface Franchise {
  id: string;
  name: string;
  description?: string;
  
  // State 
  relevanceScore: number; // 0-100 (Overall brand equity)
  fatigueLevel: number; // 0-1.0 (Saturation risk)
  audienceLoyalty: number; // 0-100 (Reduces decay and fatigue risk)
  
  // Statistics
  totalEquity: number; // Global Enterprise Value
  synergyMultiplier: number; // 1.0 - 2.5 (Bonus for multi-format presence)
  
  // Lineage Links
  assetIds: string[]; // IDs of IPAssets in the Vault
  activeProjectIds: string[]; // IDs of active projects (to calculate fatigue)
  
  // History
  lastReleaseWeeks: number[]; // History of release weeks (to calculate gaps)
  creationWeek: number;
}

export interface FranchiseImpact {
  buzzBonus: number;
  revenueMultiplier: number;
  decayModifier: number;
  fatiguePenalty: number;
}
