import { WeekCoordinator } from "@/engine/services/WeekCoordinator";
import { initializeGame } from "@/engine/core/gameInit";

import { describe, expect, beforeEach, test } from "vitest";
import { GameState, Project, IPAsset } from "@/engine/types";
import { type ProjectId, type AssetId } from "@/engine/types/shared.types";

describe("System Connectivity - Phase 3 Integration", () => {
  let state: GameState;

  beforeEach(() => {
    state = initializeGame("Test Studio", "major", 12345);
  });

  test("WeekCoordinator annual tick triggers IP scan", () => {
    const projId = "proj-seed" as ProjectId;
    state.studio.internal.projectHistory = [projId];
    state.entities.projects = {
      [projId]: {
        id: projId,
        title: "Cult Movie",
        releaseWeek: -300,
        reviewScore: 85,
        budget: 100000000,
        revenue: 200000000,
        genre: "HORROR",
        state: "archived",
        isCultClassic: false,
        ownerId: state.studio.id,
      } as any,
    };
    (state.studio.internal as any).projects = {
      [projId]: state.entities.projects[projId],
    };

    state.ip.vault = [
      {
        id: "asset-1" as AssetId,
        originalProjectId: projId,
        title: "Cult Movie",
        tier: "ORIGINAL",
        decayRate: 1.0,
        rightsOwner: "STUDIO",
        baseValue: 0,
        merchandisingMultiplier: 1.0,
        syndicationStatus: "NONE",
        syndicationTier: "NONE",
        totalEpisodes: 0,
        rightsExpirationWeek: 999,
        ownerId: state.studio.id,
      } as unknown as IPAsset,
    ];

    state.week = 52;
    const result = WeekCoordinator.execute(state);

    const hasCultImpact = result.impacts.some(
      (i) =>
        (i as any).type === "VAULT_ASSET_UPDATED" &&
        ((i as any).payload as any).update?.tier === "CULT_CLASSIC"
    );
    expect(hasCultImpact).toBe(true);
  });

  test("RevenueProcessor applies demographic resonance", () => {
    // Mock a released project
    const project = {
      id: "p1" as ProjectId,
      title: "Action Movie",
      type: "FILM",
      format: "film",
      state: "released",
      weeklyRevenue: 1000000,
      targetDemographic: "male_under_25",
      genre: "ACTION",
      budget: 50000000,
      revenue: 0,
      buzz: 80,
      distributionStatus: "theatrical",
      ownerId: state.studio.id,
      budgetTier: "mid",
      releaseWeek: 0,
      quality: 70,
    } as unknown as Project;

    state.entities.projects = { ["p1" as ProjectId]: project };
    (state.studio.internal as any).projects = { ["p1"]: project };

    const result = WeekCoordinator.execute(state);
    expect(result.summary.totalRevenue).toBeGreaterThan(0);
  });
});
