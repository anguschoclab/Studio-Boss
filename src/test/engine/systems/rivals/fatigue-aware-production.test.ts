import { describe, it, expect } from "vitest";
import { RandomGenerator } from "@/engine/utils/rng";
import { createMockGameState, createMockRival } from "../../generators/mockFactory";
import { buildFatigueAwareGenreWeights } from "@/engine/systems/rivals/rivalProduction";
import type { RivalStudio, Franchise, IPAsset, Project, GameState } from "@/engine/types";

function createFranchise(
  id: string,
  ownerId: string,
  fatigueLevel: number = 0,
  assetIds: string[] = []
): Franchise {
  return {
    id,
    name: `Franchise ${id}`,
    ownerId,
    fatigueLevel,
    audienceLoyalty: 50,
    activeProjectIds: [],
    lastReleaseWeeks: [],
    assetIds,
  } as unknown as Franchise;
}

function createIPAsset(id: string, ownerId: string, originalProjectId: string): IPAsset {
  return {
    id,
    ownerStudioId: ownerId,
    originalProjectId,
    title: `Asset ${id}`,
    franchiseId: "",
    baseValue: 100_000_000,
    decayRate: 0.01,
  } as unknown as IPAsset;
}

function createProject(id: string, genre: string, ownerId: string): Project {
  return {
    id,
    genre,
    ownerId,
    title: `Project ${id}`,
    state: "development",
  } as unknown as Project;
}

function setupState(
  rival: RivalStudio,
  franchises: Franchise[] = [],
  vaultAssets: IPAsset[] = [],
  projects: Project[] = []
): GameState {
  const state = createMockGameState({ week: 100 });
  state.entities.rivals = { [rival.id]: rival };

  state.entities.projects = {};
  for (const p of projects) {
    state.entities.projects[p.id] = p;
  }

  state.ip = state.ip || { franchises: {}, vault: [] };
  state.ip.franchises = {};
  for (const f of franchises) {
    state.ip.franchises[f.id] = f;
  }
  state.ip.vault = vaultAssets;

  return state;
}

describe("buildFatigueAwareGenreWeights", () => {
  it("returns equal weights when no franchises or saturation exist", () => {
    const rival = createMockRival({ id: "r1", archetypeId: "BALANCED_GIANT" });
    const state = setupState(rival);

    const weights = buildFatigueAwareGenreWeights(state, rival);

    const allEqual = Object.values(weights).every((w) => w === 1);
    expect(allEqual).toBe(true);
  });

  it("boosts weights for archetype preferredGenres", () => {
    // GENRE_KING preferredGenres: ["Horror", "Comedy", "Thriller"]
    const rival = createMockRival({ id: "r1", archetypeId: "GENRE_KING" });
    const state = setupState(rival);

    const weights = buildFatigueAwareGenreWeights(state, rival);

    expect(weights["Horror"]).toBeGreaterThan(weights["Action"]);
    expect(weights["Comedy"]).toBeGreaterThan(weights["Action"]);
    expect(weights["Thriller"]).toBeGreaterThan(weights["Action"]);
  });

  it("reduces weights for saturated genres (>5 active projects)", () => {
    const rival = createMockRival({ id: "r1", archetypeId: "BALANCED_GIANT" });
    const projects: Project[] = [];
    for (let i = 0; i < 7; i++) {
      projects.push(createProject(`p-${i}`, "Action", "r1"));
    }
    const state = setupState(rival, [], [], projects);

    const weights = buildFatigueAwareGenreWeights(state, rival);

    expect(weights["Action"]).toBeLessThan(weights["Drama"]);
  });

  it("reduces weights for fatigued franchise genres", () => {
    const rival = createMockRival({ id: "r1", archetypeId: "BALANCED_GIANT" });
    const projectId = "proj-f1";
    const assetId = "asset-f1";
    const franchise = createFranchise("f1", rival.id, 0.7, [assetId]);
    const asset = createIPAsset(assetId, rival.id, projectId);
    const project = createProject(projectId, "Horror", rival.id);

    const state = setupState(rival, [franchise], [asset], [project]);

    const weights = buildFatigueAwareGenreWeights(state, rival);

    // Horror weight should be reduced due to franchise fatigue
    expect(weights["Horror"]).toBeLessThan(1);
  });

  it("does not reduce weight for low-fatigue franchise", () => {
    const rival = createMockRival({ id: "r1", archetypeId: "BALANCED_GIANT" });
    const projectId = "proj-f1";
    const assetId = "asset-f1";
    const franchise = createFranchise("f1", rival.id, 0.1, [assetId]);
    const asset = createIPAsset(assetId, rival.id, projectId);
    const project = createProject(projectId, "Horror", rival.id);

    const state = setupState(rival, [franchise], [asset], [project]);

    const weights = buildFatigueAwareGenreWeights(state, rival);

    // Low fatigue (0.1) should not meaningfully reduce weight
    expect(weights["Horror"]).toBeGreaterThan(0.8);
  });

  it("only considers franchises owned by the rival", () => {
    const rival = createMockRival({ id: "r1", archetypeId: "BALANCED_GIANT" });
    const projectId = "proj-f1";
    const assetId = "asset-f1";
    // Franchise owned by a different rival
    const franchise = createFranchise("f1", "other-rival", 0.9, [assetId]);
    const asset = createIPAsset(assetId, "other-rival", projectId);
    const project = createProject(projectId, "Horror", "other-rival");

    const state = setupState(rival, [franchise], [asset], [project]);

    const weights = buildFatigueAwareGenreWeights(state, rival);

    // Horror weight should NOT be reduced — franchise belongs to another rival
    expect(weights["Horror"]).toBe(1);
  });

  it("handles missing franchise assetIds gracefully", () => {
    const rival = createMockRival({ id: "r1", archetypeId: "BALANCED_GIANT" });
    const franchise = createFranchise("f1", rival.id, 0.9, []);

    const state = setupState(rival, [franchise], [], []);

    const weights = buildFatigueAwareGenreWeights(state, rival);

    // Should not crash, weights should be normal
    expect(weights["Action"]).toBeDefined();
  });

  it("falls back to Action when franchise genre lookup fails", () => {
    const rival = createMockRival({ id: "r1", archetypeId: "BALANCED_GIANT" });
    const assetId = "asset-f1";
    const franchise = createFranchise("f1", rival.id, 0.9, [assetId]);
    // Asset exists but project doesn't — genre lookup fails
    const asset = createIPAsset(assetId, rival.id, "nonexistent-project");

    const state = setupState(rival, [franchise], [asset], []);

    const weights = buildFatigueAwareGenreWeights(state, rival);

    // Action should be reduced (fallback genre), Horror should be unaffected
    expect(weights["Action"]).toBeLessThan(1);
  });
});
