import { describe, it, expect, vi } from "vitest";
import { 
  calculateProjectROI, 
  calculateStudioNetWorth, 
  generateWeeklyFinancialReport 
} from "../../../engine/systems/finance";
import { tickFinance } from "../../../engine/systems/finance/financeTick";
import { Project, GameState, Contract } from "../../../engine/types";
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
      const proj = { ...mockProjectReleased, budget: 1000000, revenue: 2000000 } as any;
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
        name: "Test",
        archetype: "indie",
        prestige: 50,
        internal: { firstLookDeals: [], projectHistory: [] }
      } as any
    });

    it("returns cash when there are no projects with catalog value", () => {
      expect(calculateStudioNetWorth(mockState)).toBe(500000);
    });

    it("adds 100% of catalogValue if rightsOwner is 'studio'", () => {
       const p1: Project = { ...mockProjectReleased, ipRights: { rightsOwner: 'studio', catalogValue: 200000 } } as any;
       const state = { 
         ...mockState, 
         entities: { ...mockState.entities, projects: { 'p1': p1 } },
         ip: { ...mockState.ip, vault: [{ id: 'v1', baseValue: 200000, decayRate: 1.0, projectId: 'p1', quality: 50, type: 'original' }] } 
       } as any;
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
        name: "Test",
        archetype: "major",
        prestige: 50,
        internal: {
          projectHistory: [],
          firstLookDeals: []
        }
      } as any,
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
        const releasedWithDist = {
          ...mockProjectReleased,
          distributionStatus: 'theatrical' as const,
          weeklyRevenue: 100000
        };
        const stateWithDist = {
          ...mockState,
          entities: {
            ...mockState.entities,
            projects: {
              ...mockState.entities.projects,
              'rel': releasedWithDist
            }
          }
        } as any;

        const contractsList = Object.values(stateWithDist.entities.contracts || {});

        const { report } = generateWeeklyFinancialReport(
          stateWithDist,
          'player',
          stateWithDist.entities.projects,
          stateWithDist.finance.cash,
          stateWithDist.studio.archetype,
          stateWithDist.studio.prestige,
          contractsList,
          [],
          new RandomGenerator(1)
        );
        // ExpenseProcessor.calculateStudioBurn(Level 3, 2 active [unreleased])
        // levelScale = 1.5^2 = 2.25
        // overhead = (1M * 2.25) + (2 * 300k) = 2,250,000 + 600,000 = 2,850,000
        expect(report.expenses.overhead).toBe(2850000);
        expect(report.expenses.production).toBe(20000); // Only mockProjectProd is in production
        expect(report.revenue.boxOffice).toBe(30000); // 100k * 0.30
        // Net: 30k - 2,850,000 (overhead) - 20k (prod) + savings yield = ~-2,839,615
        expect(report.netProfit).toBeLessThan(-2800000);
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
          name: "Test",
          archetype: "major",
          prestige: 50,
          internal: {
            projectHistory: [],
            firstLookDeals: []
          }
        } as any,
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
         const releasedWithDist = { 
           ...mockProjectReleased, 
           distributionStatus: 'theatrical' as const,
           weeklyRevenue: 200000 
         };
         const stateWithDist = {
           ...mockState,
           entities: {
             ...mockState.entities,
             projects: {
               'prod': mockProjectProd,
               'rel': releasedWithDist
             }
           }
         } as any;

         const impacts = tickFinance(stateWithDist, rng);
         const impact = impacts.find(i => i.type === 'FUNDS_CHANGED');
         
         // Revenue: 200k * 0.30 = 60k
         // Overhead: Level 3, 1 active unreleased = (1M * 2.25) + (1 * 300k) = 2,250,000 + 300,000 = 2,550,000
         // Production: 20k
         // Savings Yield: 1M * (0.02 / 52) = 385
         // Total Expenses: 2,550,000 + 20,000 - 385 = 2,569,615
         // Net: 60k - 2,569,615 = -2,509,615
         // Wait, the project was theatrical, 200k weekly revenue. 200k * 0.30 = 60k
         // amount received was -2509615
         expect(impact?.payload.amount).toBe(-2509615);
      });
  });
});

describe('Finance Edge Cases', () => {
    it('handles an empty project pipeline without crashing (Guild Auditor)', () => {
      const state = createMockGameState({
          studio: { 
            name: 'indie studio', 
            internal: { projectHistory: [], firstLookDeals: [] }, 
            archetype: 'indie', 
            prestige: 50 
          } as any,
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

      const { report, snapshot } = generateWeeklyFinancialReport(
        state,
        'player',
        state.entities.projects,
        state.finance.cash,
        state.studio.archetype,
        state.studio.prestige,
        contractsList,
        state.studio.internal.firstLookDeals || [],
        new RandomGenerator(1)
      );

      expect(report.expenses.production).toBe(0);
      expect(report.expenses.overhead).toBeGreaterThan(0); // Level 1 studio baseline overhead
      expect(snapshot.net).toBeLessThan(0); // Net loss due to overhead
    });

  it('handles project with a negative budget safely', () => {
    const project = {
      id: 'p1',
      title: 'Flop',
      format: 'film',
      genre: 'Drama',
      budgetTier: 'low',
      budget: -500000, // Negative budget
      weeklyCost: 10000,
      targetAudience: 'General Audience',
      flavor: 'A nice drama',
      state: 'production',
      buzz: 50,
      weeksInPhase: 0,
      developmentWeeks: 4,
      productionWeeks: 4,
      revenue: 0,
      weeklyRevenue: 0,
      releaseWeek: null,
      accumulatedCost: 0,
      momentum: 50,
      progress: 0,
      activeCrisis: null,
      contentFlags: [],
      scriptHeat: 50,
      activeRoles: [],
      scriptEvents: []
    } as any;

    const state = createMockGameState({
        week: 1,
        studio: { internal: { projectHistory: [], firstLookDeals: [] }, archetype: 'indie', prestige: 50 } as any,
        finance: { cash: 1000000 } as any,
        entities: {
          projects: { 'p1': project },
          talents: {},
          rivals: {},
          contracts: {}
        }
    });

    const contractsList = Object.values(state.entities.contracts || {});

    const { report } = generateWeeklyFinancialReport(
      state,
      'player',
      state.entities.projects,
      state.finance.cash,
      state.studio.archetype,
      state.studio.prestige,
      contractsList,
      state.studio.internal.firstLookDeals || [],
      new RandomGenerator(1)
    );
    expect(report.expenses.production).toBe(10000); // weeklyCost is 10k, even though budget is negative
  });
});
