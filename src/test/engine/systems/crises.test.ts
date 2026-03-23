import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkAndTriggerCrisis, resolveCrisis } from "../../../engine/systems/crises";
import { Project, GameState, ActiveCrisis } from "../../../engine/types";

const mockProject: Project = {
  id: "proj-1",
  title: "Crisis Project",
  format: "film",
  genre: "Action",
  budgetTier: "mid",
  budget: 50000000,
  weeklyCost: 100000,
  targetAudience: "General",
  flavor: "Explosive action",
  status: "production",
  buzz: 50,
  weeksInPhase: 1,
  developmentWeeks: 10,
  productionWeeks: 10,
  revenue: 0,
  weeklyRevenue: 0,
  releaseWeek: null,
};

const mockGameState: GameState = {
  week: 5,
  cash: 10000000,
  studio: { 
    name: "Test Studio", 
    archetype: "major", 
    prestige: 50,
    internal: {
      projects: [mockProject],
      contracts: [],
      financeHistory: [],
    }
  },
  market: {
    opportunities: [],
    buyers: [],
  },
  industry: {
    rivals: [],
    headlines: [],
    families: [],
    agencies: [],
    agents: [],
    talentPool: [],
    awards: [],
  }
} as any;

describe("crises system", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("checkAndTriggerCrisis", () => {
    it("returns undefined if project is not in production", () => {
      const nonProdProject = { ...mockProject, status: "development" as const };
      vi.spyOn(Math, 'random').mockReturnValue(0.01); // Force crisis if it were prod
      const result = checkAndTriggerCrisis(nonProdProject);
      expect(result).toBeUndefined();
    });

    it("returns undefined if random check fails (>= 0.05)", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.06);
      const result = checkAndTriggerCrisis(mockProject);
      expect(result).toBeUndefined();
    });

    it("returns an ActiveCrisis if random check passes (< 0.05)", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.04);
      const result = checkAndTriggerCrisis(mockProject);
      expect(result).toBeDefined();
      expect(result?.description).toBeTypeOf("string");
      expect(result?.options.length).toBeGreaterThan(0);
      expect(result?.resolved).toBe(false);
    });
  });

  describe("resolveCrisis", () => {
    const activeCrisis: ActiveCrisis = {
      description: "Test Crisis",
      options: [
        { text: "Option A", effectDescription: "Lose 1M", cashPenalty: 1000000 },
        { text: "Option B", effectDescription: "Delay 2 weeks, lose 50 buzz", weeksDelay: 2, buzzPenalty: 50 },
        { text: "Option C", effectDescription: "Negative penalty (gain cash)", cashPenalty: -500000 },
      ],
      resolved: false
    };

    const stateWithCrisis: GameState = {
      ...mockGameState,
      studio: {
        ...mockGameState.studio,
        internal: {
          ...mockGameState.studio.internal,
          projects: [{ ...mockProject, activeCrisis }]
        }
      }
    };

    it("returns unchanged state if project not found", () => {
      const result = resolveCrisis(stateWithCrisis, "non-existent-id", 0);
      expect(result).toEqual(stateWithCrisis); // strictly the same or equivalent
    });

    it("returns unchanged state if project has no active crisis", () => {
      const result = resolveCrisis(mockGameState, "proj-1", 0);
      expect(result).toEqual(mockGameState);
    });

    it("returns unchanged state if crisis is already resolved", () => {
      const resolvedState = {
        ...mockGameState,
        studio: {
          ...mockGameState.studio,
          internal: {
            ...mockGameState.studio.internal,
            projects: [{ ...mockProject, activeCrisis: { ...activeCrisis, resolved: true } }]
          }
        }
      };
      const result = resolveCrisis(resolvedState, "proj-1", 0);
      expect(result).toEqual(resolvedState);
    });

    it("returns unchanged state if optionIndex is invalid", () => {
      const result = resolveCrisis(stateWithCrisis, "proj-1", 99);
      expect(result).toEqual(stateWithCrisis);
    });

    it("applies cash penalty correctly", () => {
      const result = resolveCrisis(stateWithCrisis, "proj-1", 0);
      expect(result.cash).toBe(9000000); // 10M - 1M
      expect(result.studio.internal.projects[0].activeCrisis?.resolved).toBe(true);
      expect(result.industry.headlines[0].text).toContain("Option A");
    });

    it("applies weeks delay and buzz penalty correctly, clamping buzz at 0", () => {
      const lowBuzzProject = { ...mockProject, buzz: 30, activeCrisis };
      const lowBuzzState = { 
        ...mockGameState, 
        studio: {
          ...mockGameState.studio,
          internal: {
            ...mockGameState.studio.internal,
            projects: [lowBuzzProject]
          }
        }
      };
      const result = resolveCrisis(lowBuzzState, "proj-1", 1);

      expect(result.studio.internal.projects[0].productionWeeks).toBe(12); // 10 + 2
      expect(result.studio.internal.projects[0].buzz).toBe(0); // 30 - 50 = -20 clamped to 0
      expect(result.studio.internal.projects[0].activeCrisis?.resolved).toBe(true);
    });

    it("handles extreme negative cash penalty (edge case for data error / intentional gain)", () => {
      const result = resolveCrisis(stateWithCrisis, "proj-1", 2);
      expect(result.cash).toBe(10500000); // 10M - (-500k) = 10.5M
      expect(result.studio.internal.projects[0].activeCrisis?.resolved).toBe(true);
    });
  });
});
