import { describe, it, expect, beforeEach } from "vitest";
import { resolveFestivals, submitToFestival } from "../../../engine/systems/festivals";
import { GameState, Project, FestivalSubmission } from "../../../engine/types";
import { createMockGameState, createMockProject } from "../../utils/mockFactories";
import { RandomGenerator } from "../../../engine/utils/rng";

describe("festivals system", () => {
  const rng = new RandomGenerator(42);

  describe("submitToFestival", () => {
    it("deducts cash and records submission", () => {
      const state = createMockGameState({ 
        finance: { cash: 1_000_000, ledger: [] } as any 
      });
      state.entities.projects["p1"] = createMockProject({ id: "p1" });
      
      const impacts = submitToFestival(state, "p1", "Sundance Film Festival", rng);
      
      expect(impacts).not.toBeNull();
      expect(impacts).toHaveLength(3); // FUNDS_DEDUCTED, INDUSTRY_UPDATE, NEWS_ADDED
      expect(impacts?.find(i => i.type === 'FUNDS_DEDUCTED')).toBeDefined();
      expect(impacts?.find(i => i.type === 'INDUSTRY_UPDATE')).toBeDefined();
    });
  });

  describe("resolveFestivals", () => {
    it("resolves festivals and updates state", () => {
      const state = createMockGameState({ week: 3 }); // Sundance is weeks [3, 4]
      state.studio.prestige = 90; // Ensure player prestige is high enough for Sundance acceptance
      state.entities.projects["p1"] = createMockProject({ 
        id: "p1", 
        ownerId: "PLAYER",
        state: "released",
        format: "film",
        buzz: 10,
        reviewScore: 90
      });
      
      const submission: FestivalSubmission = {
        id: "sub-1",
        projectId: "p1",
        festivalBody: "Sundance Film Festival",
        status: "submitted",
        week: 1,
        buzzGain: 0
      };
      state.industry.festivalSubmissions = [submission];

      const impacts = resolveFestivals(state, rng);
      
      // Should have PROJECT_UPDATED (buzz), PRESTIGE_CHANGED, NEWS_ADDED, and INDUSTRY_UPDATE (submissions update)
      expect(impacts.some(i => i.type === 'PRESTIGE_CHANGED')).toBe(true);
      expect(impacts.some(i => i.type === 'PROJECT_UPDATED')).toBe(true);
      
      const prestigeImpact = impacts.find(i => i.type === 'PRESTIGE_CHANGED');
      expect((prestigeImpact as any).payload).toBe(2);
    });
  });
});
