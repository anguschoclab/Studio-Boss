import { describe, it, expect, vi, beforeEach } from "vitest";
import { resolveCrisis, checkAndTriggerCrisis } from "../../../engine/systems/crises";
import { Project, GameState } from "../../../engine/types";
import * as utils from "../../../engine/utils";

describe("crises system", () => {
  const mockProject = {
    id: "proj-1",
    title: "Test Blockbuster",
    format: "film",
    genre: "Action",
    budgetTier: "high",
    budget: 100000000,
    weeklyCost: 1000000,
    targetAudience: "Teens",
    flavor: "Massive action",
    state: "production",
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
  } as unknown as Project;

  const mockGameState: GameState = {
      studio: {
          internal: {
              projects: { [mockProject.id]: mockProject }
          }
      }
  } as any;

  describe("checkAndTriggerCrisis", () => {
    it("should return null if project is not in production", () => {
      const devProject = { ...mockProject, state: "marketing" as const } as unknown as Project;
      const impact = checkAndTriggerCrisis(devProject);
      expect(impact).toBeNull();
    });

    it("should trigger a crisis in production with secureRandom probability", () => {
      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.01);
      const impact = checkAndTriggerCrisis(mockProject);
      expect(impact!.projectUpdates).toHaveLength(1);
      expect(impact!.projectUpdates![0].update.activeCrisis?.resolved).toBe(false);
      vi.restoreAllMocks();
    });
  });

  describe("resolveCrisis", () => {
    it("should return correct impact for cash penalty option", () => {
      const impact = resolveCrisis(mockGameState, mockProject.id, 0);
      expect(impact.cashChange).toBe(-1000000);
      expect(impact.projectUpdates![0].update.activeCrisis?.resolved).toBe(true);
    });

    it("should return correct impact for delay option", () => {
      const impact = resolveCrisis(mockGameState, mockProject.id, 1);
      expect(impact.projectUpdates![0].update.productionWeeks).toBe(mockProject.productionWeeks + 2);
    });

    it("should return correct impact for buzz/prestige penalty option", () => {
      const impact = resolveCrisis(mockGameState, mockProject.id, 2);
      expect(impact.projectUpdates![0].update.buzz).toBe(mockProject.buzz - 20);
      expect(impact.prestigeChange).toBe(-5);
    });

    it("should return empty impact if crisis already resolved", () => {
      const resolvedProject = {
        ...mockProject,
        activeCrisis: { ...mockProject.activeCrisis!, resolved: true }
      };
      const stateWithResolved = {
          ...mockGameState,
          studio: { internal: { projects: { [resolvedProject.id]: resolvedProject } } }
      } as any;
      const impact = resolveCrisis(stateWithResolved, resolvedProject.id, 0);
      expect(impact).toEqual({});
    });
  });
});
