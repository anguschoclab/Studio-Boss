import { GameState, Project, Contract, RivalStudio, TalentProfile, Buyer, GenreTrend } from '../engine/types';

export const EMPTY_PROJECTS: Project[] = [];
export const EMPTY_CONTRACTS: Contract[] = [];
export const EMPTY_RIVALS: RivalStudio[] = [];
export const EMPTY_TALENT: TalentProfile[] = [];
export const EMPTY_BUYERS: Buyer[] = [];
export const EMPTY_TRENDS: GenreTrend[] = [];

// --- Root Selectors ---
export const selectStudio = (state: GameState | null) => state?.studio || null;
export const selectMarket = (state: GameState | null) => state?.market || null;
export const selectIndustry = (state: GameState | null) => state?.industry || null;

// --- Studio / Internal Selectors ---
export const selectInternal = (state: GameState | null) => state?.studio.internal || null;
export const selectProjects = (state: GameState | null) => state?.studio.internal.projects || EMPTY_PROJECTS;
export const selectContracts = (state: GameState | null) => state?.studio.internal.contracts || EMPTY_CONTRACTS;
export const selectFinanceHistory = (state: GameState | null) => state?.studio.internal.financeHistory || [];
export const selectTotalCash = (state: GameState | null) => state?.cash || 0;
export const selectStudioName = (state: GameState | null) => state?.studio.name || 'Unknown Studio';
export const selectStudioArchetype = (state: GameState | null) => state?.studio.archetype || 'major';
export const selectStudioPrestige = (state: GameState | null) => state?.studio.prestige || 0;

// --- Industry Selectors ---
export const selectRivals = (state: GameState | null) => state?.industry.rivals || EMPTY_RIVALS;
export const selectTalentPool = (state: GameState | null) => state?.industry.talentPool || EMPTY_TALENT;
export const selectHeadlines = (state: GameState | null) => state?.industry.headlines || [];
export const selectAwards = (state: GameState | null) => state?.industry.awards || [];

// --- Market Selectors ---
export const selectOpportunities = (state: GameState | null) => state?.market.opportunities || [];
export const selectTrends = (state: GameState | null) => state?.market.trends || EMPTY_TRENDS;
export const selectBuyers = (state: GameState | null) => state?.market.buyers || EMPTY_BUYERS;

// --- Transformation Selectors ---
export const selectActiveProjectsCount = (state: GameState | null) => {
  if (!state) return 0;
  return selectProjects(state).filter(p => p.status === 'development' || p.status === 'production' || p.status === 'marketing').length;
};

export const selectReleasedProjects = (state: GameState | null) => {
  if (!state) return EMPTY_PROJECTS;
  return selectProjects(state).filter(p => p.status === 'released' || p.status === 'post_release' || p.status === 'archived');
};

export const selectRecentFinance = (state: GameState | null) => {
  const history = selectFinanceHistory(state);
  return history.length > 0 ? history[history.length - 1] : null;
};
