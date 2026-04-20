import { describe, it, expect } from "vitest";
import { 
  calculateProjectROI, 
  calculateStudioNetWorth, 
  generateWeeklyFinancialReport 
} from "../../../engine/systems/finance";
import { tickFinance } from "../../../engine/systems/finance/financeTick";
import { Contract } from "../../../engine/types";
import { RandomGenerator } from "../../../engine/utils/rng";

import { createMockGameState, createMockProject } from "../../utils/mockFactories";

const mockProjectDev = createMockProject({
  id: "proj-1", title: "Test Dev", budgetTier: "low", budget: 500000, 
  state: "development", developmentWeeks: 2, productionWeeks: 2, 
  weeklyCost: 10000, buzz: 50
});

const mockProjectProd = createMockProject({ ...mockProjectDev, id: "proj-2", state: "production", weeklyCost: 20000 });
const mockProjectReleased = createMockProject({ ...mockProjectDev, id: "proj-3", state: "released", weeklyCost: 0, weeklyRevenue: 100000 });

describe("Finance System", () => {
  describe("calculateProjectROI", () => {
    it("returns correct ROI for a standard project", () => {
      const proj = createMockProject({ ...mockProjectReleased, budget: 1000000, revenue: 2000000 });
      expect(calculateProjectROI(proj)).toBe(2.0);
    });
  });

  describe("calculateStudioNetWorth", () => {
    const mockState = createMockGameState({
      finance: { 
        cash: 500000, 
        ledger: [], 
        weeklyHistory: [],
        marketState: { baseRate: 0.05, savingsYield: 0.02, debtRate: 0.1, loanRate: 0.08, rateHistory: [], sentiment: 50, cycle: 'STABLE' }
      },
      studio: {
        id: 'studio-1',
        name: "Test",
        archetype: "indie",
        prestige: 50,
        ownedPlatforms: [],
        internal: { projectHistory: [] },
        snapshotHistory: [],
        activeCampaigns: {},
      }
    });

    it("returns cash when there are no projects with catalog value", () => {
      expect(calculateStudioNetWorth(mockState)).toBe(500000);
    });

    it("adds 100% of catalogValue if rightsOwner is 'studio'", () => {
       const p1 = createMockProject({ ...mockProjectReleased, ipRights: { rightsOwner: 'studio', catalogValue: 200000 } });
       const state = { 
         ...mockState, 
         entities: { ...mockState.entities, projects: { 'p1': p1 } },
         ip: { ...mockState.ip, vault: [{ id: 'v1', baseValue: 200000, decayRate: 1.0, originalProjectId: 'p1', quality: 50, ownerStudioId: 'player-studio', rightsOwner: 'STUDIO' as const, title: 'V1', tier: 'ORIGINAL', merchandisingMultiplier: 1, syndicationStatus: 'NONE', syndicationTier: 'NONE', totalEpisodes: 0, rightsExpirationWeek: 100 }] } 
       };
       expect(calculateStudioNetWorth(state)).toBe(700000);
    });
  });

  describe("generateWeeklyFinancialReport", () => {
    const mockState = createMockGameState({
      finance: { 
        cash: 1000000, 
        ledger: [], 
        weeklyHistory: [],
        marketState: { baseRate: 0.05, savingsYield: 0.02, debtRate: 0.1, loanRate: 0.08, rateHistory: [], sentiment: 50, cycle: 'STABLE' }
      },
      studio: {
        id: 'studio-1',
        name: "Test",
        archetype: "major",
        prestige: 50,
        ownedPlatforms: [],
        internal: { projectHistory: [] },
        snapshotHistory: [],
        activeCampaigns: {},
      },
      entities: {
        projects: {
           'dev': mockProjectDev,
           'prod': mockProjectProd,
           'rel': mockProjectReleased
        },
        talents: {},
        rivals: {},
        contracts: {}
      }
    });

    it("properly calculates burns, overhead, and box office", () => {
        const releasedWithDist = createMockProject({
          ...mockProjectReleased,
          distributionStatus: 'theatrical' as const,
          weeklyRevenue: 100000
        });
        const stateWithDist = {
          ...mockState,
          entities: {
            ...mockState.entities,
            projects: {
              ...mockState.entities.projects,
              'rel': releasedWithDist
            }
          }
        };

        const contractsList = Object.values(stateWithDist.entities.contracts || {});

        const rng = new RandomGenerator(12345);
        const { report } = generateWeeklyFinancialReport(
          stateWithDist,
          'player',
          stateWithDist.entities.projects,
          stateWithDist.finance.cash,
          stateWithDist.studio.archetype,
          stateWithDist.studio.prestige,
          contractsList as Contract[],
          [],
          rng
        );
        // ExpenseProcessor.calculateStudioBurn(Level 3, 2 active [unreleased])
        // levelScale = 1.8^2 = 3.24
        // baseRent = 2,000,000
        // projectPenalty = 600,000
        // overhead = (2.0M * 3.24) + (2 * 600k) = 6,480,000 + 1,200,000 = 7,680,000
        expect(report.expenses.overhead).toBe(7680000);
        expect(report.expenses.production).toBe(20000); // Only mockProjectProd is in production
        expect(report.revenue.boxOffice).toBe(9000); // 100k * 0.15 * 0.6 (low budget penalty)
        // Net: ~9k - 7.68M - 20k + ...
        expect(report.netProfit).toBeLessThan(-1800000);
        expect(report.startingCash).toBe(1000000);
    });
  });

  describe("tickFinance", () => {
      const mockState = createMockGameState({
        finance: { 
          cash: 1000000, 
          ledger: [], 
          weeklyHistory: [],
          marketState: {
            baseRate: 0.05,
            savingsYield: 0.02,
            debtRate: 0.1,
            loanRate: 0.08,
            rateHistory: [],
            sentiment: 50,
            cycle: 'STABLE'
          }
        },
        studio: {
          id: 'studio-1',
          name: "Test",
          archetype: "major",
          prestige: 50,
          ownedPlatforms: [],
          internal: { projectHistory: [] },
          snapshotHistory: [],
          activeCampaigns: {},
        },
        entities: {
          projects: {
             'prod': mockProjectProd,
             'rel': mockProjectReleased
          },
          talents: {},
          rivals: {},
          contracts: {}
        }
      });
  
      it("returns StateImpact for funds change", () => {
         const rng = new RandomGenerator(12345);
         const releasedWithDist = createMockProject({ 
           ...mockProjectReleased, 
           distributionStatus: 'theatrical' as const,
           weeklyRevenue: 200000 
         });
         const stateWithDist = {
           ...mockState,
           entities: {
             ...mockState.entities,
             projects: {
               'prod': mockProjectProd,
               'rel': releasedWithDist
             }
           }
         };

         const impacts = tickFinance(stateWithDist, rng);
         const impact = impacts.find(i => i.type === 'FUNDS_CHANGED');
         
         // Revenue: 200k * 0.30 = 60k
         // Overhead: Level 3, 1 active unreleased = (2M * 3.24) + (1 * 600k) = 6,480,000 + 600,000 = 7,080,000
         // Production: 20k
         // Savings Yield: 1M * (0.02 / 52) = 385
         // Total Expenses: 7,080,000 + 20,000 = 7,100,000
         // Net: ...
         // Wait, the project was theatrical, 200k weekly revenue. 200k * 0.15 * 0.6 = 18000
         // Net = 18000 + 385 - 7100000 = -7081615
         expect(impact?.payload.amount).toBe(-7081615);
      });
  });
});

describe('Finance Edge Cases', () => {
    it('handles an empty project pipeline without crashing (Guild Auditor)', () => {
      const state = createMockGameState({
          studio: { 
            id: 'studio-1',
            name: 'indie studio', 
            archetype: 'indie', 
            prestige: 50,
            ownedPlatforms: [],
            internal: { projectHistory: [] },
            snapshotHistory: [],
            activeCampaigns: {},
          },
          finance: { 
            cash: 1000000, 
            ledger: [], 
            weeklyHistory: [],
            marketState: { baseRate: 0.05, savingsYield: 0.02, debtRate: 0.1, loanRate: 0.08, rateHistory: [], sentiment: 50, cycle: 'STABLE' }
          },
          entities: {
            projects: {},
            talents: {},
            rivals: {},
            contracts: {}
          }
      });

      const contractsList = Object.values(state.entities.contracts || {});

      const rng = new RandomGenerator(12345);
      const { report, snapshot } = generateWeeklyFinancialReport(
        state,
        'player',
        state.entities.projects,
        state.finance.cash,
        state.studio.archetype,
        state.studio.prestige,
        contractsList as Contract[],
        state.deals.activeDeals || [],
        rng
      );

      expect(report.expenses.production).toBe(0);
      expect(report.expenses.overhead).toBeGreaterThan(0); // Level 1 studio baseline overhead
      expect(snapshot.net).toBeLessThan(0); // Net loss due to overhead
    });

  it('handles project with a negative budget safely', () => {
    const project = createMockProject({
      id: 'p1',
      title: 'Flop',
      budget: -500000, // Negative budget
      weeklyCost: 10000,
      state: 'production',
    });

    const state = createMockGameState({
        week: 1,
        studio: { 
          id: 'studio-1',
          name: 'indie studio', 
          archetype: 'indie', 
          prestige: 50,
          ownedPlatforms: [],
          internal: { projectHistory: [] },
          snapshotHistory: [],
          activeCampaigns: {},
        },
        finance: { 
          cash: 1000000,
          ledger: [],
          weeklyHistory: [],
          marketState: { baseRate: 0.05, savingsYield: 0.02, debtRate: 0.1, loanRate: 0.08, rateHistory: [], sentiment: 50, cycle: 'STABLE' }
        },
        entities: {
          projects: { 'p1': project },
          talents: {},
          rivals: {},
          contracts: {}
        }
    });

    const contractsList = Object.values(state.entities.contracts || {});

    const rng = new RandomGenerator(12345);
    const { report } = generateWeeklyFinancialReport(
      state,
      'player',
      state.entities.projects,
      state.finance.cash,
      state.studio.archetype,
      state.studio.prestige,
      contractsList as Contract[],
      state.deals.activeDeals || [],
      rng
    );
    expect(report.expenses.production).toBe(10000); // weeklyCost is 10k, even though budget is negative
  });
});
