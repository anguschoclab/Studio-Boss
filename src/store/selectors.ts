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
export const selectRumors = (state: GameState | null) => state?.industry.rumors || [];
export const selectScandals = (state: GameState | null) => state?.industry.scandals || [];

// --- Market Selectors ---
export const selectOpportunities = (state: GameState | null) => state?.market.opportunities || [];
export const selectTrends = (state: GameState | null) => state?.market.trends || EMPTY_TRENDS;
export const selectBuyers = (state: GameState | null) => state?.market.buyers || EMPTY_BUYERS;

// --- Transformation Selectors ---
export const selectActiveProjectsCount = (state: GameState | null) => {
  if (!state) return 0;
  const projects = selectProjects(state);
  let count = 0;
  for (let i = 0; i < projects.length; i++) {
    const s = projects[i].status;
    if (s === 'development' || s === 'production' || s === 'marketing') count++;
  }
  return count;
};

let lastProjectsRefForReleased: Project[] | null = null;
let lastReleasedProjects: Project[] = EMPTY_PROJECTS;

export const selectReleasedProjects = (state: GameState | null) => {
  if (!state) return EMPTY_PROJECTS;
  const projects = selectProjects(state);

  if (projects === lastProjectsRefForReleased) {
    return lastReleasedProjects;
  }

  const released: Project[] = [];
  for (let i = 0; i < projects.length; i++) {
    const s = projects[i].status;
    if (s === 'released' || s === 'post_release' || s === 'archived') {
      released.push(projects[i]);
    }
  }

  lastProjectsRefForReleased = projects;
  lastReleasedProjects = released;

  return released;
};

export const selectRecentFinance = (state: GameState | null) => {
  const history = selectFinanceHistory(state);
  return history.length > 0 ? history[history.length - 1] : null;
};
// --- Epic 4 Selectors ---
export const selectCulture = (state: GameState | null) => state?.culture || { genrePopularity: {} };
export const selectFinance = (state: GameState | null) => state?.finance || { bankBalance: 0, yearToDateRevenue: 0, yearToDateExpenses: 0 };
export const selectHistory = (state: GameState | null) => state?.history || [];
