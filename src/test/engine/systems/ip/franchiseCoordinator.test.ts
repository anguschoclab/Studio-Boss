import { describe, it, expect, beforeEach } from "vitest";
import { updateFranchiseHub, updateFranchiseHubs } from "@/engine/systems/ip/franchiseCoordinator";
import { createMockGameState, createMockProject, createMockIPAsset } from "@/test/utils/mockFactories";
import { GameState, Project, Franchise, IPAsset } from "@/engine/types";

describe("franchiseCoordinator", () => {
  let state: GameState;

  beforeEach(() => {
    state = createMockGameState();
  });

  describe("updateFranchiseHubs", () => {
    it("returns state unchanged for empty projects array", () => {
      const result = updateFranchiseHubs(state, []);
      expect(result).toBe(state);
    });

    it("creates new franchise for breakout project (revenue > budget * 1.6)", () => {
      const project = createMockProject({
        id: "proj-breakout",
        title: "Breakout Hit",
        state: "released",
        revenue: 100_000_000,
        budget: 50_000_000,
        franchiseId: undefined,
      });
      state.entities.projects = { "proj-breakout": project };

      const result = updateFranchiseHubs(state, [project]);
      const franchises = Object.values(result.ip.franchises);
      expect(franchises.length).toBe(1);

      const franchise = franchises[0];
      expect(franchise.name).toBe("Breakout Hit");
      expect(franchise.relevanceScore).toBe(100);
      expect(franchise.fatigueLevel).toBe(0);
      expect(franchise.audienceLoyalty).toBe(50);
      expect(franchise.synergyMultiplier).toBe(1.0);
      expect(franchise.assetIds).toContain("ip-proj-breakout");
    });

    it("creates new franchise for prestige hit (prestigeScore > 80)", () => {
      const project = createMockProject({
        id: "proj-prestige",
        title: "Prestige Film",
        state: "released",
        revenue: 10_000_000,
        budget: 50_000_000,
        awardsProfile: {
          criticScore: 0,
          audienceScore: 0,
          prestigeScore: 85,
          craftScore: 0,
          culturalHeat: 0,
          campaignStrength: 0,
          controversyRisk: 0,
          festivalBuzz: 0,
          academyAppeal: 0,
          guildAppeal: 0,
          populistAppeal: 0,
          indieCredibility: 0,
          industryNarrativeScore: 0,
        },
        franchiseId: undefined,
      });
      state.entities.projects = { "proj-prestige": project };

      const result = updateFranchiseHubs(state, [project]);
      const franchises = Object.values(result.ip.franchises);
      expect(franchises.length).toBe(1);
      expect(franchises[0].name).toBe("Prestige Film");
    });

    it("does not create franchise for non-breakout non-prestige project", () => {
      const project = createMockProject({
        id: "proj-boring",
        title: "Boring Movie",
        state: "released",
        revenue: 10_000_000,
        budget: 50_000_000,
        franchiseId: undefined,
      });
      state.entities.projects = { "proj-boring": project };

      const result = updateFranchiseHubs(state, [project]);
      expect(Object.keys(result.ip.franchises).length).toBe(0);
    });

    it("assigns franchiseId to project after hub creation", () => {
      const project = createMockProject({
        id: "proj-assign",
        title: "Assigned Project",
        state: "released",
        revenue: 100_000_000,
        budget: 50_000_000,
        franchiseId: undefined,
      });
      state.entities.projects = { "proj-assign": project };

      const result = updateFranchiseHubs(state, [project]);
      const updatedProject = result.entities.projects["proj-assign"];
      expect(updatedProject.franchiseId).toBeDefined();
      expect(result.ip.franchises[updatedProject.franchiseId!]).toBeDefined();
    });

    it("maintains existing franchise by adding new asset and updating equity", () => {
      const existingFranchise: Franchise = {
        id: "hub-existing",
        name: "Existing Universe",
        relevanceScore: 80,
        fatigueLevel: 0.2,
        audienceLoyalty: 60,
        totalEquity: 5_000_000,
        synergyMultiplier: 1.2,
        assetIds: ["ip-proj-old"],
        activeProjectIds: [],
        lastReleaseWeeks: [50],
        creationWeek: 10,
      };

      const oldAsset = createMockIPAsset({
        id: "ip-proj-old",
        originalProjectId: "proj-old",
        baseValue: 2_000_000,
        decayRate: 0.5,
      });

      const newAsset = createMockIPAsset({
        id: "ip-proj-new",
        originalProjectId: "proj-new",
        baseValue: 3_000_000,
        decayRate: 0.4,
      });

      const newProject = createMockProject({
        id: "proj-new",
        title: "New Sequel",
        state: "released",
        revenue: 80_000_000,
        budget: 50_000_000,
        franchiseId: "hub-existing",
        releaseWeek: 100,
      });

      state.ip.franchises = { "hub-existing": existingFranchise };
      state.ip.vault = [oldAsset, newAsset];
      state.entities.projects = { "proj-new": newProject };

      const result = updateFranchiseHubs(state, [newProject]);
      const updatedFranchise = result.ip.franchises["hub-existing"];
      expect(updatedFranchise.assetIds).toContain("ip-proj-new");
      expect(updatedFranchise.assetIds).toContain("ip-proj-old");
      expect(updatedFranchise.synergyMultiplier).toBeGreaterThan(1.2);
      expect(updatedFranchise.totalEquity).toBeGreaterThan(0);
    });

    it("skips re-adding duplicate asset to existing franchise", () => {
      const existingFranchise: Franchise = {
        id: "hub-dup",
        name: "Dup Universe",
        relevanceScore: 80,
        fatigueLevel: 0.1,
        audienceLoyalty: 55,
        totalEquity: 3_000_000,
        synergyMultiplier: 1.1,
        assetIds: ["ip-proj-dup"],
        activeProjectIds: [],
        lastReleaseWeeks: [50],
        creationWeek: 10,
      };

      const project = createMockProject({
        id: "proj-dup",
        title: "Dup Project",
        state: "released",
        revenue: 80_000_000,
        budget: 50_000_000,
        franchiseId: "hub-dup",
        releaseWeek: 100,
      });

      state.ip.franchises = { "hub-dup": existingFranchise };
      state.ip.vault = [createMockIPAsset({ id: "ip-proj-dup", originalProjectId: "proj-dup" })];
      state.entities.projects = { "proj-dup": project };

      const result = updateFranchiseHubs(state, [project]);
      const updatedFranchise = result.ip.franchises["hub-dup"];
      expect(updatedFranchise.assetIds).toEqual(["ip-proj-dup"]);
      expect(updatedFranchise.synergyMultiplier).toBe(1.1);
    });
  });

  describe("updateFranchiseHub (single project)", () => {
    it("delegates to updateFranchiseHubs with single-element array", () => {
      const project = createMockProject({
        id: "proj-single",
        title: "Single Project",
        state: "released",
        revenue: 100_000_000,
        budget: 50_000_000,
        franchiseId: undefined,
      });
      state.entities.projects = { "proj-single": project };

      const result = updateFranchiseHub(state, project);
      expect(Object.keys(result.ip.franchises).length).toBe(1);
    });
  });
});
