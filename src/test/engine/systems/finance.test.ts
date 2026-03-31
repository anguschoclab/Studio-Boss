import { describe, it, expect, vi } from "vitest";
import * as utils from "../../../engine/utils";
import { 
  calculateProjectROI, 
  calculateStudioNetWorth, 
  generateWeeklyFinancialReport 
} from "../../../engine/systems/finance";
import { processFinance } from "../../../engine/systems/processors/processFinance";
import { Project, Contract, GameState } from "../../../engine/types";

const mockProjectDev: Project = {
  id: "proj-1", title: "Test Dev", budgetTier: "low", budget: 500000, genre: "Comedy",
  state: "development", developmentWeeks: 2, productionWeeks: 2, weeksInPhase: 0,
  revenue: 0, weeklyRevenue: 0, weeklyCost: 10000, buzz: 50, format: "film", targetAudience: "general", flavor: "indie", releaseWeek: 0,
  contractType: "standard",
  isCultClassic: false,
  marketingBudget: 0,
  ipRights: { rightsOwner: 'studio', catalogValue: 0 }
} as any;

const mockProjectProd: Project = { ...mockProjectDev, id: "proj-2", state: "production", weeklyCost: 20000 } as any;
const mockProjectReleased: Project = { ...mockProjectDev, id: "proj-3", state: "released", weeklyCost: 0, weeklyRevenue: 100000 } as any;
const mockProjectArchived: Project = { ...mockProjectDev, id: "proj-4", state: "archived", weeklyCost: 0, weeklyRevenue: 0 } as any;

describe("Finance Phase 2 System", () => {
  describe("calculateProjectROI", () => {
    it("returns correct ROI for a standard project", () => {
      const proj = { ...mockProjectReleased, budget: 1000000, revenue: 2000000 } as any;
      expect(calculateProjectROI(proj)).toBe(2.0);
    });
  });

  describe("calculateStudioNetWorth", () => {
    const mockState: GameState = {
      week: 1,
      finance: { cash: 500000, ledger: [] },
      studio: {
        name: "Test",
        archetype: "indie",
        prestige: 50,
        internal: { projects: {}, contracts: [] }
      },
      market: { opportunities: [], buyers: [] },
      industry: { rivals: [], headlines: [], talentPool: {} }
    } as unknown as GameState;

    it("returns cash when there are no projects with catalog value", () => {
      expect(calculateStudioNetWorth(mockState)).toBe(500000);
    });

    it("adds 100% of catalogValue if rightsOwner is 'studio'", () => {
       const p1: Project = { ...mockProjectReleased, ipRights: { rightsOwner: 'studio', catalogValue: 200000 } } as any;
       const state = { ...mockState, studio: { ...mockState.studio, internal: { ...mockState.studio.internal, projects: { 'p1': p1 } } } };
       expect(calculateStudioNetWorth(state)).toBe(700000);
    });
  });

  describe("generateWeeklyFinancialReport", () => {
    const mockState: GameState = {
      week: 1,
      finance: { cash: 1000000, ledger: [] },
      studio: {
        name: "Test",
        archetype: "major",
        prestige: 50,
        internal: {
          projects: {
             'dev': mockProjectDev,
             'prod': mockProjectProd,
             'rel': mockProjectReleased
          },
          contracts: []
        }
      },
      market: { opportunities: [], buyers: [], activeMarketEvents: [] },
      industry: { rivals: [], headlines: [], families: [], agencies: [], agents: [], talentPool: {}, newsHistory: [] },
    } as unknown as GameState;

    it("properly calculates burns, overhead, and box office", () => {
       const report = generateWeeklyFinancialReport(mockState);
       // Overhead is hardcoded to 500,000 right now. Dev costs are ignored. Prod costs are 20000!
       expect(report.expenses.overhead).toBe(500000);
       expect(report.expenses.production).toBe(20000);
       expect(report.revenue.boxOffice).toBe(100000);
       expect(report.netProfit).toBe(100000 - 520000);
       expect(report.startingCash).toBe(1000000);
    });

    it("calculates multi-layer contract reductions and multipliers", () => {
       const stateWithContracts = { ...mockState, studio: { ...mockState.studio, internal: { ...mockState.studio.internal, contracts: [
          { id: 'c1', projectId: mockProjectReleased.id, talentId: 't', fee: 0, backendPercent: 10 }
       ] } } } as any;
       const report = generateWeeklyFinancialReport(stateWithContracts);
       // Revenue: 100,000 - 10% backend (10,000) = 90000
       expect(report.revenue.boxOffice).toBe(90000);
    });
  });

  describe("processFinance", () => {
      const mockState: GameState = {
        week: 1,
        finance: { cash: 1000000, ledger: [] },
        studio: {
          name: "Test",
          archetype: "major",
          prestige: 50,
          internal: {
            projects: {
               'prod': mockProjectProd,
               'rel': mockProjectReleased
            },
            contracts: []
          }
        },
        market: { opportunities: [], buyers: [], activeMarketEvents: [] },
        industry: { rivals: [], headlines: [], talentPool: {} }
      } as unknown as GameState;
  
      it("advances and pushes the correct ledger entry while mutating state", () => {
         const newState = processFinance(mockState);
         const lastLedger = newState.finance.ledger[0];
         // Net profit = 100k - (20k + 500k) = -420k
         expect(newState.finance.cash).toBe(580000); 
         expect(lastLedger.endingCash).toBe(580000);
         expect(lastLedger.week).toBe(1);
      });
  });
});