/**
 * Tests for visualization selectors
 * Tests data aggregation and computation logic for visualization components
 */

import { describe, it, expect } from 'vitest';
import {
  selectCashFlowTrends,
  selectRevenueBreakdown,
  selectWeeklyRevenueHistory,
  selectBudgetBurnData,
  selectRecoupmentStatus,
  selectProjectTimelineData,
  selectBoxOfficeData,
  selectProductionSlippage,
  selectScriptQualityMetrics,
  selectGenrePerformanceMatrix,
  selectMarketShareData,
  selectStreamingViewership,
  selectTalentSatisfaction,
  selectTalentTierDistribution,
  selectDealStats,
  selectStudioHealthMetrics,
  selectCrisisRiskLevel,
  selectAwardsProbability,
} from './selectors';
import type { GameState, Project, Talent, RivalStudio } from '@/engine/types';

// Helper to create mock game state
const createMockGameState = (overrides: Partial<GameState> = {}): GameState => ({
  week: 10,
  gameSeed: 12345,
  tickCount: 100,
  rngState: 42,
  game: { currentWeek: 10 },
  entities: {
    projects: {},
    contracts: {},
    talents: {},
    rivals: {},
  },
  finance: {
    cash: 5000000,
    ledger: [],
    weeklyHistory: [],
    marketState: {
      cycle: 'STABLE',
      sentiment: 50,
      baseRate: 0.05,
      debtRate: 0.08,
      savingsYield: 0.02,
      loanRate: 0.07,
      rateHistory: [],
    },
  },
  news: { headlines: [] },
  ip: { vault: [], franchises: {} },
  studio: {
    id: 'studio-1',
    name: 'Test Studio',
    archetype: 'mid-tier',
    prestige: 75,
    internal: { projectHistory: [] },
    snapshotHistory: [],
    activeCampaigns: {},
  },
  market: {
    opportunities: [],
    trends: [],
    activeMarketEvents: [],
    buyers: [],
  },
  industry: {
    families: [],
    agencies: [],
    agents: [],
    newsHistory: [],
  },
  deals: {
    activeDeals: [],
    pendingOffers: [],
    expiredDeals: [],
  },
  eventHistory: [],
  ...overrides,
} as any); // Type assertion to avoid strict type checking in tests

describe('Phase 1: Financial Selectors', () => {
  describe('selectCashFlowTrends', () => {
    it('returns empty array for null state', () => {
      expect(selectCashFlowTrends(null)).toEqual([]);
    });

    it('returns empty array for state with no weekly history', () => {
      const state = createMockGameState();
      expect(selectCashFlowTrends(state)).toEqual([]);
    });

    it('correctly aggregates revenue and expenses from snapshots', () => {
      const state = createMockGameState({
        finance: {
          cash: 5000000,
          ledger: [],
          weeklyHistory: [
            {
              week: 1,
              revenue: { theatrical: 1000000, streaming: 500000, merch: 100000, passive: 50000 },
              expenses: { production: 800000, burn: 200000, marketing: 300000, pacts: 50000, royalties: 20000, interest: 10000 },
              net: 275000,
              cash: 5000000,
            },
            {
              week: 2,
              revenue: { theatrical: 1200000, streaming: 600000, merch: 120000, passive: 60000 },
              expenses: { production: 900000, burn: 250000, marketing: 350000, pacts: 60000, royalties: 25000, interest: 12000 },
              net: 283000,
              cash: 5275000,
            },
          ],
          marketState: {
            cycle: 'STABLE',
            sentiment: 50,
            baseRate: 0.05,
            debtRate: 0.08,
            savingsYield: 0.02,
            loanRate: 0.07,
            rateHistory: [],
          },
        },
      });

      const result = selectCashFlowTrends(state, 12);
      expect(result).toHaveLength(2);
      expect(result[0].week).toBe(1);
      expect(result[0].revenue).toBe(1650000); // 1000000 + 500000 + 100000 + 50000
      expect(result[0].expenses).toBe(1385000); // 800000 + 200000 + 300000 + 50000 + 20000 + 10000
      expect(result[0].net).toBe(275000);
    });

    it('limits results to specified weeks', () => {
      const state = createMockGameState({
        finance: {
          cash: 5000000,
          ledger: [],
          weeklyHistory: Array.from({ length: 20 }, (_, i) => ({
            week: i + 1,
            revenue: { theatrical: 1000000, streaming: 500000, merch: 100000, passive: 50000 },
            expenses: { production: 800000, burn: 200000, marketing: 300000, pacts: 50000, royalties: 20000, interest: 10000 },
            net: 275000,
            cash: 5000000,
          })),
          marketState: {
            cycle: 'STABLE',
            sentiment: 50,
            baseRate: 0.05,
            debtRate: 0.08,
            savingsYield: 0.02,
            loanRate: 0.07,
            rateHistory: [],
          },
        },
      });

      const result = selectCashFlowTrends(state, 5);
      expect(result).toHaveLength(5);
      expect(result[0].week).toBe(16); // Last 5 weeks
    });
  });

  describe('selectRevenueBreakdown', () => {
    it('returns empty array for null state', () => {
      expect(selectRevenueBreakdown(null)).toEqual([]);
    });

    it('returns empty array for state with no snapshot', () => {
      const state = createMockGameState();
      expect(selectRevenueBreakdown(state)).toEqual([]);
    });

    it('correctly breaks down revenue by source', () => {
      const state = createMockGameState({
        finance: {
          cash: 5000000,
          ledger: [],
          weeklyHistory: [
            {
              week: 1,
              revenue: { theatrical: 2000000, streaming: 1500000, merch: 500000, passive: 300000 },
              expenses: { production: 800000, burn: 200000, marketing: 300000, pacts: 50000, royalties: 20000, interest: 10000 },
              net: 3220000,
              cash: 5000000,
            },
          ],
          marketState: {
            cycle: 'STABLE',
            sentiment: 50,
            baseRate: 0.05,
            debtRate: 0.08,
            savingsYield: 0.02,
            loanRate: 0.07,
            rateHistory: [],
          },
        },
      });

      const result = selectRevenueBreakdown(state);
      expect(result).toHaveLength(4);
      expect(result[0].name).toBe('Theatrical');
      expect(result[0].value).toBe(2000000);
      expect(result[1].name).toBe('Streaming');
      expect(result[1].value).toBe(1500000);
    });

    it('filters out zero-value sources', () => {
      const state = createMockGameState({
        finance: {
          cash: 5000000,
          ledger: [],
          weeklyHistory: [
            {
              week: 1,
              revenue: { theatrical: 2000000, streaming: 0, merch: 0, passive: 0 },
              expenses: { production: 800000, burn: 200000, marketing: 300000, pacts: 50000, royalties: 20000, interest: 10000 },
              net: 930000,
              cash: 5000000,
            },
          ],
          marketState: {
            cycle: 'STABLE',
            sentiment: 50,
            baseRate: 0.05,
            debtRate: 0.08,
            savingsYield: 0.02,
            loanRate: 0.07,
            rateHistory: [],
          },
        },
      });

      const result = selectRevenueBreakdown(state);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Theatrical');
    });
  });

  describe('selectWeeklyRevenueHistory', () => {
    it('returns empty array for null state', () => {
      expect(selectWeeklyRevenueHistory(null)).toEqual([]);
    });

    it('returns net values from weekly history', () => {
      const state = createMockGameState({
        finance: {
          cash: 5000000,
          ledger: [],
          weeklyHistory: [
            { week: 1, revenue: { theatrical: 1000000, streaming: 500000, merch: 100000, passive: 50000 }, expenses: { production: 800000, burn: 200000, marketing: 300000, pacts: 50000, royalties: 20000, interest: 10000 }, net: 275000, cash: 5000000 },
            { week: 2, revenue: { theatrical: 1200000, streaming: 600000, merch: 120000, passive: 60000 }, expenses: { production: 900000, burn: 250000, marketing: 350000, pacts: 60000, royalties: 25000, interest: 12000 }, net: 283000, cash: 5275000 },
          ],
          marketState: {
            cycle: 'STABLE',
            sentiment: 50,
            baseRate: 0.05,
            debtRate: 0.08,
            savingsYield: 0.02,
            loanRate: 0.07,
            rateHistory: [],
          },
        },
      });

      const result = selectWeeklyRevenueHistory(state, 12);
      expect(result).toEqual([275000, 283000]);
    });
  });

  describe('selectRecoupmentStatus', () => {
    it('returns empty array for null state', () => {
      expect(selectRecoupmentStatus(null)).toEqual([]);
    });

    it('calculates recoupment percentage correctly', () => {
      const state = createMockGameState({
        entities: {
          projects: {
            'proj-1': {
              id: 'proj-1',
              title: 'Test Project',
              type: 'FILM',
              format: 'film',
              genre: 'Action',
              budgetTier: 'mid',
              budget: 10000000,
              weeklyCost: 100000,
              targetAudience: 'General',
              flavor: 'Action',
              state: 'released',
              buzz: 70,
              weeksInPhase: 10,
              developmentWeeks: 5,
              productionWeeks: 10,
              revenue: 0,
              weeklyRevenue: 0,
              releaseWeek: 5,
              activeCrisis: null,
              momentum: 70,
              progress: 100,
              accumulatedCost: 10000000,
            } as Project,
          },
          contracts: {},
          talents: {},
          rivals: {},
        },
        finance: {
          cash: 5000000,
          ledger: [],
          weeklyHistory: [
            {
              week: 10,
              revenue: { theatrical: 0, streaming: 0, merch: 0, passive: 0 },
              expenses: { production: 0, burn: 0, marketing: 0, pacts: 0, royalties: 0, interest: 0 },
              net: 0,
              cash: 5000000,
              projectRecoupment: { 'proj-1': 8000000 }, // 80% recouped
            },
          ],
          marketState: {
            cycle: 'STABLE',
            sentiment: 50,
            baseRate: 0.05,
            debtRate: 0.08,
            savingsYield: 0.02,
            loanRate: 0.07,
            rateHistory: [],
          },
        },
      });

      const result = selectRecoupmentStatus(state);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Test Project');
      expect(result[0].recouped).toBe(80);
      expect(result[0].status).toBe('in_progress');
    });

    it('marks project as profitable when >120% recouped', () => {
      const state = createMockGameState({
        entities: {
          projects: {
            'proj-1': {
              id: 'proj-1',
              title: 'Test Project',
              type: 'FILM',
              format: 'film',
              genre: 'Action',
              budgetTier: 'mid',
              budget: 10000000,
              weeklyCost: 100000,
              targetAudience: 'General',
              flavor: 'Action',
              state: 'released',
              buzz: 70,
              weeksInPhase: 10,
              developmentWeeks: 5,
              productionWeeks: 10,
              revenue: 0,
              weeklyRevenue: 0,
              releaseWeek: 5,
              activeCrisis: null,
              momentum: 70,
              progress: 100,
              accumulatedCost: 10000000,
            } as Project,
          },
          contracts: {},
          talents: {},
          rivals: {},
        },
        finance: {
          cash: 5000000,
          ledger: [],
          weeklyHistory: [
            {
              week: 10,
              revenue: { theatrical: 0, streaming: 0, merch: 0, passive: 0 },
              expenses: { production: 0, burn: 0, marketing: 0, pacts: 0, royalties: 0, interest: 0 },
              net: 0,
              cash: 5000000,
              projectRecoupment: { 'proj-1': 13000000 }, // 130% recouped
            },
          ],
          marketState: {
            cycle: 'STABLE',
            sentiment: 50,
            baseRate: 0.05,
            debtRate: 0.08,
            savingsYield: 0.02,
            loanRate: 0.07,
            rateHistory: [],
          },
        },
      });

      const result = selectRecoupmentStatus(state);
      expect(result[0].status).toBe('profitable');
    });
  });
});

describe('Phase 2: Project Status Selectors', () => {
  describe('selectProjectTimelineData', () => {
    it('returns timeline data with correct state counts', () => {
      const state = createMockGameState({
        entities: {
          projects: {
            'proj-1': { id: 'proj-1', title: 'Project 1', type: 'FILM', format: 'film', genre: 'Action', budgetTier: 'mid', budget: 10000000, weeklyCost: 100000, targetAudience: 'General', flavor: 'Action', state: 'development', buzz: 70, weeksInPhase: 5, developmentWeeks: 5, productionWeeks: 10, revenue: 0, weeklyRevenue: 0, releaseWeek: null, activeCrisis: null, momentum: 70, progress: 50, accumulatedCost: 5000000 } as Project,
            'proj-2': { id: 'proj-2', title: 'Project 2', type: 'FILM', format: 'film', genre: 'Drama', budgetTier: 'low', budget: 5000000, weeklyCost: 50000, targetAudience: 'General', flavor: 'Drama', state: 'production', buzz: 60, weeksInPhase: 3, developmentWeeks: 5, productionWeeks: 10, revenue: 0, weeklyRevenue: 0, releaseWeek: null, activeCrisis: null, momentum: 60, progress: 30, accumulatedCost: 1500000 } as Project,
            'proj-3': { id: 'proj-3', title: 'Project 3', type: 'FILM', format: 'film', genre: 'Comedy', budgetTier: 'high', budget: 20000000, weeklyCost: 200000, targetAudience: 'General', flavor: 'Comedy', state: 'released', buzz: 80, weeksInPhase: 10, developmentWeeks: 5, productionWeeks: 10, revenue: 25000000, weeklyRevenue: 0, releaseWeek: 8, activeCrisis: null, momentum: 80, progress: 100, accumulatedCost: 20000000 } as Project,
          },
          contracts: {},
          talents: {},
          rivals: {},
        },
      });

      const result = selectProjectTimelineData(state, 4);
      expect(result).toHaveLength(4);
      expect(result[0].development).toBe(1);
      expect(result[0].production).toBe(1);
    });
  });

  describe('selectBoxOfficeData', () => {
    it('returns empty array for no released projects with box office data', () => {
      const state = createMockGameState();
      expect(selectBoxOfficeData(state)).toEqual([]);
    });

    it('calculates trend correctly based on opening weekend', () => {
      const state = createMockGameState({
        entities: {
          projects: {
            'proj-1': {
              id: 'proj-1',
              title: 'Blockbuster',
              type: 'FILM',
              format: 'film',
              genre: 'Action',
              budgetTier: 'blockbuster',
              budget: 100000000,
              weeklyCost: 1000000,
              targetAudience: 'General',
              flavor: 'Action',
              state: 'released',
              buzz: 90,
              weeksInPhase: 20,
              developmentWeeks: 10,
              productionWeeks: 20,
              revenue: 150000000,
              weeklyRevenue: 0,
              releaseWeek: 5,
              activeCrisis: null,
              momentum: 90,
              progress: 100,
              accumulatedCost: 100000000,
              boxOffice: { openingWeekendDomestic: 60000000, openingWeekendForeign: 40000000, totalDomestic: 150000000, totalForeign: 100000000, multiplier: 2.5 },
            } as Project,
          },
          contracts: {},
          talents: {},
          rivals: {},
        },
      });

      const result = selectBoxOfficeData(state);
      expect(result).toHaveLength(1);
      expect(result[0].trend).toBe('blockbuster');
      expect(result[0].totalGross).toBe(150000000);
    });
  });
});

describe('Phase 4: Talent Selectors', () => {
  describe('selectTalentSatisfaction', () => {
    it('returns zero scores for empty talent pool', () => {
      const state = createMockGameState({
        entities: {
          projects: {},
          contracts: {},
          talents: {},
          rivals: {},
        },
      });

      const result = selectTalentSatisfaction(state);
      expect(result.overallScore).toBe(0);
      expect(result.byCategory).toEqual([]);
    });

    it('calculates average mood from talent pool', () => {
      const state = createMockGameState({
        entities: {
          projects: {},
          contracts: {},
          talents: {
            'talent-1': {
              id: 'talent-1',
              name: 'Actor 1',
              role: 'actor',
              roles: ['actor'],
              tier: 1,
              prestige: 80,
              fee: 5000000,
              draw: 3,
              accessLevel: 'legacy',
              momentum: 70,
              skills: { acting: 85, directing: 50, writing: 40, stardom: 80 },
              demographics: { age: 35, gender: 'MALE', ethnicity: 'Caucasian', country: 'USA' },
              psychology: { mood: 80, ego: 60, scandalRisk: 20, synergyAffinities: [], synergyConflicts: [] },
              commitments: [],
              fatigue: 20,
              preferredGenres: ['Action', 'Drama'],
            } as Talent,
            'talent-2': {
              id: 'talent-2',
              name: 'Actor 2',
              role: 'actor',
              roles: ['actor'],
              tier: 2,
              prestige: 60,
              fee: 2000000,
              draw: 2,
              accessLevel: 'soft-access',
              momentum: 50,
              skills: { acting: 70, directing: 40, writing: 30, stardom: 60 },
              demographics: { age: 28, gender: 'FEMALE', ethnicity: 'Asian', country: 'USA' },
              psychology: { mood: 60, ego: 50, scandalRisk: 15, synergyAffinities: [], synergyConflicts: [] },
              commitments: [],
              fatigue: 30,
              preferredGenres: ['Drama', 'Romance'],
            } as Talent,
          },
          rivals: {},
        },
      });

      const result = selectTalentSatisfaction(state);
      expect(result.overallScore).toBe(70); // (80 + 60) / 2
      expect(result.byCategory).toHaveLength(4);
    });
  });

  describe('selectTalentTierDistribution', () => {
    it('calculates distribution by tier', () => {
      const state = createMockGameState({
        entities: {
          projects: {},
          contracts: {},
          talents: {
            'talent-1': {
              id: 'talent-1',
              name: 'A-List Star',
              role: 'actor',
              roles: ['actor'],
              tier: 1,
              prestige: 90,
              fee: 10000000,
              draw: 5,
              accessLevel: 'dynasty',
              momentum: 85,
              skills: { acting: 90, directing: 60, writing: 50, stardom: 90 },
              demographics: { age: 40, gender: 'MALE', ethnicity: 'Caucasian', country: 'USA' },
              psychology: { mood: 75, ego: 70, scandalRisk: 25, synergyAffinities: [], synergyConflicts: [] },
              commitments: [],
              fatigue: 15,
              preferredGenres: ['Action', 'Drama'],
            } as Talent,
            'talent-2': {
              id: 'talent-2',
              name: 'B-List Actor',
              role: 'actor',
              roles: ['actor'],
              tier: 2,
              prestige: 60,
              fee: 2000000,
              draw: 2,
              accessLevel: 'soft-access',
              momentum: 50,
              skills: { acting: 65, directing: 40, writing: 30, stardom: 55 },
              demographics: { age: 30, gender: 'FEMALE', ethnicity: 'Asian', country: 'USA' },
              psychology: { mood: 65, ego: 45, scandalRisk: 20, synergyAffinities: [], synergyConflicts: [] },
              commitments: [],
              fatigue: 25,
              preferredGenres: ['Drama', 'Romance'],
            } as Talent,
          },
          rivals: {},
        },
      });

      const result = selectTalentTierDistribution(state);
      expect(result.data).toHaveLength(4);
      expect(result.data[0].tier).toBe('A-list');
      expect(result.data[0].count).toBe(1);
      expect(result.data[1].tier).toBe('B-list');
      expect(result.data[1].count).toBe(1);
      expect(result.totalTalent).toBe(2);
    });
  });
});

describe('Phase 5: Studio Health & Crisis Selectors', () => {
  describe('selectStudioHealthMetrics', () => {
    it('returns default scores for empty state', () => {
      const state = createMockGameState();
      const result = selectStudioHealthMetrics(state);
      
      expect(result).toHaveLength(6);
      expect(result[0].metric).toBe('Finances');
      expect(result[0].score).toBe(0); // No cash, no burn
    });

    it('calculates finance score based on cash vs burn', () => {
      const state = createMockGameState({
        finance: {
          cash: 10000000,
          ledger: [],
          weeklyHistory: [
            { week: 1, revenue: { theatrical: 0, streaming: 0, merch: 0, passive: 0 }, expenses: { production: 0, burn: 500000, marketing: 0, pacts: 0, royalties: 0, interest: 0 }, net: -500000, cash: 10000000 },
            { week: 2, revenue: { theatrical: 0, streaming: 0, merch: 0, passive: 0 }, expenses: { production: 0, burn: 500000, marketing: 0, pacts: 0, royalties: 0, interest: 0 }, net: -500000, cash: 9500000 },
            { week: 3, revenue: { theatrical: 0, streaming: 0, merch: 0, passive: 0 }, expenses: { production: 0, burn: 500000, marketing: 0, pacts: 0, royalties: 0, interest: 0 }, net: -500000, cash: 9000000 },
            { week: 4, revenue: { theatrical: 0, streaming: 0, merch: 0, passive: 0 }, expenses: { production: 0, burn: 500000, marketing: 0, pacts: 0, royalties: 0, interest: 0 }, net: -500000, cash: 8500000 },
          ],
          marketState: {
            cycle: 'STABLE',
            sentiment: 50,
            baseRate: 0.05,
            debtRate: 0.08,
            savingsYield: 0.02,
            loanRate: 0.07,
            rateHistory: [],
          },
        },
      });

      const result = selectStudioHealthMetrics(state);
      expect(result[0].metric).toBe('Finances');
      expect(result[0].score).toBeGreaterThan(0);
    });
  });

  describe('selectCrisisRiskLevel', () => {
    it('returns zero risk for no crises', () => {
      const state = createMockGameState();
      const result = selectCrisisRiskLevel(state);
      
      expect(result.riskLevel).toBe(0);
      expect(result.activeThreats).toHaveLength(0);
    });

    it('calculates risk based on crises and budget overruns', () => {
      const state = createMockGameState({
        entities: {
          projects: {
            'proj-1': {
              id: 'proj-1',
              title: 'Crisis Project',
              type: 'FILM',
              format: 'film',
              genre: 'Action',
              budgetTier: 'mid',
              budget: 10000000,
              weeklyCost: 100000,
              targetAudience: 'General',
              flavor: 'Action',
              state: 'production',
              buzz: 70,
              weeksInPhase: 5,
              developmentWeeks: 5,
              productionWeeks: 10,
              revenue: 0,
              weeklyRevenue: 0,
              releaseWeek: null,
              activeCrisis: { crisisId: 'crisis-1', triggeredWeek: 5, haltedProduction: true, description: 'Director quit', options: [], resolved: false, severity: 'high' },
              momentum: 70,
              progress: 50,
              accumulatedCost: 12000000, // Over budget
              scriptHeat: 50,
              activeRoles: ['protagonist'],
              scriptEvents: [],
            } as any, // Type assertion for test mock
          },
          contracts: {},
          talents: {},
          rivals: {},
        },
      });

      const result = selectCrisisRiskLevel(state);
      expect(result.riskLevel).toBeGreaterThan(0);
      expect(result.activeThreats.length).toBeGreaterThan(0);
    });
  });
});

describe('Phase 6: Awards Selector', () => {
  describe('selectAwardsProbability', () => {
    it('returns empty array for no projects with awards profile', () => {
      const state = createMockGameState();
      expect(selectAwardsProbability(state)).toEqual([]);
    });

    it('calculates probability from awards profile', () => {
      const state = createMockGameState({
        entities: {
          projects: {
            'proj-1': {
              id: 'proj-1',
              title: 'Awards Contender',
              type: 'FILM',
              format: 'film',
              genre: 'Drama',
              budgetTier: 'high',
              budget: 50000000,
              weeklyCost: 500000,
              targetAudience: 'General',
              flavor: 'Drama',
              state: 'released',
              buzz: 85,
              weeksInPhase: 15,
              developmentWeeks: 10,
              productionWeeks: 15,
              revenue: 80000000,
              weeklyRevenue: 0,
              releaseWeek: 5,
              activeCrisis: null,
              momentum: 85,
              progress: 100,
              accumulatedCost: 50000000,
              awardsProfile: {
                criticScore: 85,
                audienceScore: 80,
                prestigeScore: 75,
                craftScore: 90,
                culturalHeat: 70,
                campaignStrength: 65,
                controversyRisk: 20,
                festivalBuzz: 75,
                academyAppeal: 85,
                guildAppeal: 80,
                populistAppeal: 70,
                indieCredibility: 40,
                industryNarrativeScore: 75,
              },
            } as Project,
          },
          contracts: {},
          talents: {},
          rivals: {},
        },
      });

      const result = selectAwardsProbability(state);
      expect(result).toHaveLength(1);
      expect(result[0].projectTitle).toBe('Awards Contender');
      expect(result[0].probability).toBe(90);
    });
  });
});
