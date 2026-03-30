import { describe, it, expect, vi } from "vitest";
import { resolveCrisis, checkAndTriggerCrisis } from "../../../engine/systems/crises";
import { Project } from "../../../engine/types";

describe("crises system", () => {
  const mockProject: Project = {
    id: "proj-1",
    title: "Test Blockbuster",
    format: "film",
    genre: "Action",
    budgetTier: "high",
    budget: 100000000,
    weeklyCost: 1000000,
    targetAudience: "Teens",
    flavor: "Massive action",
    status: "production",
    buzz: 50,
    weeksInPhase: 5,
    developmentWeeks: 10,
    productionWeeks: 20,
    revenue: 0,
    weeklyRevenue: 0,
    releaseWeek: null,
    activeCrisis: {
      description: "Test Crisis",
      options: [
        {
          text: "Pay up",
          effectDescription: "Lose money",
          cashPenalty: 1000000
        },
        {
          text: "Delay",
          effectDescription: "Delay production",
          weeksDelay: 2
        },
        {
          text: "Scandal",
          effectDescription: "Lose buzz",
          buzzPenalty: 20,
          reputationPenalty: 5
        }
      ],
      resolved: false,
      severity: "medium"
    }
  };

  describe("checkAndTriggerCrisis", () => {
    it("should return undefined if project is not in production", () => {
      const devProject = { ...mockProject, status: "development" as const };
      const crisis = checkAndTriggerCrisis(devProject);
      expect(crisis).toBeUndefined();
    });

    it("should have a 5% chance to trigger a crisis in production", () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.04);
      const crisis = checkAndTriggerCrisis(mockProject);
      expect(crisis).toBeDefined();
      expect(crisis?.resolved).toBe(false);
      vi.restoreAllMocks();
    });
  });

  describe("resolveCrisis", () => {
    it("should return correct impact for cash penalty option", () => {
      const impact = resolveCrisis(mockProject, 0);
      expect(impact.cashChange).toBe(-1000000);
      expect(impact.projectUpdates![0].update.activeCrisis?.resolved).toBe(true);
    });

    it("should return correct impact for delay option", () => {
      const impact = resolveCrisis(mockProject, 1);
      expect(impact.projectUpdates![0].update.productionWeeks).toBe(mockProject.productionWeeks + 2);
    });

    it("should return correct impact for buzz/prestige penalty option", () => {
      const impact = resolveCrisis(mockProject, 2);
      expect(impact.projectUpdates![0].update.buzz).toBe(mockProject.buzz - 20);
      expect(impact.prestigeChange).toBe(-5);
    });

    it("should return empty impact if crisis already resolved", () => {
      const resolvedProject = {
        ...mockProject,
        activeCrisis: { ...mockProject.activeCrisis!, resolved: true }
      };
      const impact = resolveCrisis(resolvedProject, 0);
      expect(impact).toEqual({});
    });
  });
});
