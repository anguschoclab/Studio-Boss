import { describe, it, expect, beforeEach } from "vitest";
import { calculateFranchiseEvolutionImpacts } from "@/engine/systems/ip/FranchiseEvolution";
import { createMockGameState, createMockProject } from "@/test/utils/mockFactories";
import { RandomGenerator } from "@/engine/utils/rng";
import { GameState } from "@/engine/types";

describe("FranchiseEvolution", () => {
  let state: GameState;
  let rng: RandomGenerator;

  beforeEach(() => {
    state = createMockGameState();
    rng = new RandomGenerator(42);
  });

  describe("calculateFranchiseEvolutionImpacts", () => {
    it("handles empty projects gracefully", () => {
      state.entities.projects = {};
      const impacts = calculateFranchiseEvolutionImpacts(state, rng);
      expect(impacts).toEqual([]);
    });

    it("handles undefined projects gracefully", () => {
      state.entities.projects = undefined as unknown as Record<string, import("@/engine/types").Project>;
      const impacts = calculateFranchiseEvolutionImpacts(state, rng);
      expect(impacts).toEqual([]);
    });

    it("creates franchise for breakout project (revenue > budget)", () => {
      const project = createMockProject({
        id: "proj-breakout",
        title: "Breakout Hit",
        state: "released",
        revenue: 200_000_000,
        budget: 50_000_000,
        genre: "Action",
      });
      state.entities.projects = { "proj-breakout": project };

      const impacts = calculateFranchiseEvolutionImpacts(state, rng);
      const franchiseImpact = impacts.find((i) => i.type === "FRANCHISE_UPDATED");
      expect(franchiseImpact).toBeDefined();
      const projectImpact = impacts.find(
        (i) => i.type === "PROJECT_UPDATED" &&
        (i.payload as unknown as { update: { franchiseId?: string } }).update?.franchiseId
      );
      expect(projectImpact).toBeDefined();
    });

    it("creates franchise for prestige hit (awardsProfile.prestigeScore > 50)", () => {
      const project = createMockProject({
        id: "proj-prestige",
        title: "Prestige Film",
        state: "released",
        revenue: 10_000_000,
        budget: 20_000_000,
        awardsProfile: {
          criticScore: 80,
          audienceScore: 70,
          prestigeScore: 75,
          craftScore: 80,
          culturalHeat: 60,
          campaignStrength: 50,
          controversyRisk: 10,
          festivalBuzz: 70,
          academyAppeal: 80,
          guildAppeal: 75,
          populistAppeal: 40,
          indieCredibility: 60,
          industryNarrativeScore: 70,
        },
      });
      state.entities.projects = { "proj-prestige": project };

      const impacts = calculateFranchiseEvolutionImpacts(state, rng);
      const franchiseImpact = impacts.find((i) => i.type === "FRANCHISE_UPDATED");
      expect(franchiseImpact).toBeDefined();
    });

    it("creates franchise for franchise genre (SCI-FI)", () => {
      const project = createMockProject({
        id: "proj-scifi",
        title: "Space Epic",
        state: "released",
        revenue: 5_000_000,
        budget: 50_000_000,
        genre: "SCI-FI",
        quality: 80,
      });
      state.entities.projects = { "proj-scifi": project };

      const impacts = calculateFranchiseEvolutionImpacts(state, rng);
      const franchiseImpact = impacts.find((i) => i.type === "FRANCHISE_UPDATED");
      expect(franchiseImpact).toBeDefined();
    });

    it("creates franchise for franchise genre (FANTASY)", () => {
      const project = createMockProject({
        id: "proj-fantasy",
        title: "Dragon Quest",
        state: "released",
        revenue: 5_000_000,
        budget: 50_000_000,
        genre: "FANTASY",
        quality: 80,
      });
      state.entities.projects = { "proj-fantasy": project };

      const impacts = calculateFranchiseEvolutionImpacts(state, rng);
      const franchiseImpact = impacts.find((i) => i.type === "FRANCHISE_UPDATED");
      expect(franchiseImpact).toBeDefined();
    });

    it("creates franchise for franchise genre (SUPERHERO)", () => {
      const project = createMockProject({
        id: "proj-hero",
        title: "Cape Movie",
        state: "released",
        revenue: 5_000_000,
        budget: 50_000_000,
        genre: "SUPERHERO",
        quality: 80,
      });
      state.entities.projects = { "proj-hero": project };

      const impacts = calculateFranchiseEvolutionImpacts(state, rng);
      const franchiseImpact = impacts.find((i) => i.type === "FRANCHISE_UPDATED");
      expect(franchiseImpact).toBeDefined();
    });

    it("does not create franchise for non-breakout, non-prestige, non-franchise-genre project", () => {
      const project = createMockProject({
        id: "proj-boring",
        title: "Boring Movie",
        state: "released",
        revenue: 5_000_000,
        budget: 50_000_000,
        genre: "Romance",
        quality: 50,
      });
      state.entities.projects = { "proj-boring": project };

      const impacts = calculateFranchiseEvolutionImpacts(state, rng);
      const franchiseImpact = impacts.find((i) => i.type === "FRANCHISE_UPDATED");
      expect(franchiseImpact).toBeUndefined();
    });

    it("does not create franchise for non-released projects", () => {
      const project = createMockProject({
        id: "proj-dev",
        title: "In Development",
        state: "development",
        revenue: 200_000_000,
        budget: 50_000_000,
      });
      state.entities.projects = { "proj-dev": project };

      const impacts = calculateFranchiseEvolutionImpacts(state, rng);
      const franchiseImpact = impacts.find((i) => i.type === "FRANCHISE_UPDATED");
      expect(franchiseImpact).toBeUndefined();
    });

    it("does not crash on undefined project entries in for...in loop", () => {
      state.entities.projects = { "proj-undef": undefined as unknown as typeof state.entities.projects[string] };
      const impacts = calculateFranchiseEvolutionImpacts(state, rng);
      expect(impacts).toEqual([]);
    });
  });
});
