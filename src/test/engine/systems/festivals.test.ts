import { describe, it, expect } from "vitest";
import { resolveFestivals, submitToFestival } from "../../../engine/systems/festivals";
import { FestivalSubmission } from "../../../engine/types";
import { createMockGameState, createMockProject } from "../../utils/mockFactories";
import { RandomGenerator } from "../../../engine/utils/rng";

describe("festivals system", () => {
  const rng = new RandomGenerator(42);

  describe("submitToFestival", () => {
    it("deducts cash and records submission", () => {
      const state = createMockGameState({ 
        finance: { cash: 1_000_000, ledger: [] } as never
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
      state.studio.prestige = 100;
      state.entities.projects["p1"] = createMockProject({ 
        id: "p1", 
        state: "released",
        format: "film",
        buzz: 10,
        reviewScore: 100,
        ownerId: 'PLAYER'
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

      const rng = new RandomGenerator(42);
      // Force acceptance
      rng.range = () => -20;

      const impacts = resolveFestivals(state, rng);
      
      // Should have PROJECT_UPDATED (buzz), PRESTIGE_CHANGED, NEWS_ADDED, and INDUSTRY_UPDATE (submissions update)
      expect(impacts.some(i => i.type === 'PRESTIGE_CHANGED')).toBe(true);
      expect(impacts.some(i => i.type === 'PROJECT_UPDATED')).toBe(true);
      
      const prestigeImpact = impacts.find(i => i.type === 'PRESTIGE_CHANGED');
      expect((prestigeImpact as never).payload).toBe(2);
    });
  });
});
