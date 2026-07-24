import { describe, it, expect } from "vitest";
import { RandomGenerator } from "@/engine/utils/rng";
import { createMockGameState, createMockRival } from "../generators/mockFactory";
import { selectStrategicBuyer } from "@/engine/systems/industry/DistressCascade";
import type { RivalStudio, Franchise, IPAsset, Project } from "@/engine/types";

function createBuyer(overrides: Partial<RivalStudio> = {}): RivalStudio {
  return createMockRival({
    cash: 600_000_000,
    prestige: 50,
    archetypeId: "BALANCED_GIANT",
    currentMotivation: "STABILITY",
    motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 },
    ...overrides,
  });
}

function createFranchise(id: string, ownerId: string, genre: string = "Action"): Franchise {
  return {
    id,
    name: `Franchise ${id}`,
    ownerId,
    fatigueLevel: 0,
    audienceLoyalty: 50,
    activeProjectIds: [],
    lastReleaseWeeks: [],
    assetIds: [`asset-${id}`],
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
    state: "released",
  } as unknown as Project;
}

function setupStateWithAsset(
  buyers: RivalStudio[],
  assetKind: "franchise" | "vault",
  assetId: string,
  assetGenre: string = "Action"
) {
  const state = createMockGameState({ week: 100 });

  state.entities.rivals = {};
  for (const b of buyers) {
    state.entities.rivals[b.id] = b;
  }

  // Set up franchise + vault + project for genre inference
  const sellerId = "seller";
  const projectId = `proj-${assetId}`;
  state.entities.projects = {
    [projectId]: createProject(projectId, assetGenre, sellerId),
  };

  state.ip = state.ip || { franchises: {}, vault: [] };
  state.ip.franchises = {
    [assetId]: createFranchise(assetId, sellerId, assetGenre),
  };
  state.ip.vault = [
    createIPAsset(`asset-${assetId}`, sellerId, projectId),
  ];

  return state;
}

describe("selectStrategicBuyer", () => {
  it("prefers FRANCHISE_BUILDING buyer for franchise asset", () => {
    const buyer1 = createBuyer({
      id: "b1",
      cash: 600_000_000,
      currentMotivation: "FRANCHISE_BUILDING",
      archetypeId: "THE_ACQUIRER",
    });
    const buyer2 = createBuyer({
      id: "b2",
      cash: 600_000_000,
      currentMotivation: "STABILITY",
      archetypeId: "BALANCED_GIANT",
    });

    const state = setupStateWithAsset([buyer1, buyer2], "franchise", "f1", "Action");

    const selected = selectStrategicBuyer(state, [buyer1, buyer2], "franchise", "f1");
    expect(selected?.id).toBe("b1");
  });

  it("disqualifies CASH_CRUNCH buyer even with high cash", () => {
    const buyer1 = createBuyer({
      id: "b1",
      cash: 1_000_000_000,
      currentMotivation: "CASH_CRUNCH",
      archetypeId: "CASH_COW",
    });
    const buyer2 = createBuyer({
      id: "b2",
      cash: 600_000_000,
      currentMotivation: "FRANCHISE_BUILDING",
      archetypeId: "THE_ACQUIRER",
    });

    const state = setupStateWithAsset([buyer1, buyer2], "franchise", "f1", "Action");

    const selected = selectStrategicBuyer(state, [buyer1, buyer2], "franchise", "f1");
    expect(selected?.id).toBe("b2");
  });

  it("prefers buyer with matching genre focus", () => {
    const buyer1 = createBuyer({
      id: "b1",
      cash: 600_000_000,
      currentMotivation: "STABILITY",
      archetypeId: "GENRE_KING",
    });
    const buyer2 = createBuyer({
      id: "b2",
      cash: 600_000_000,
      currentMotivation: "STABILITY",
      archetypeId: "BALANCED_GIANT",
    });

    // GENRE_KING preferredGenres: ["Horror", "Comedy", "Thriller"]
    const state = setupStateWithAsset([buyer1, buyer2], "franchise", "f1", "Horror");

    const selected = selectStrategicBuyer(state, [buyer1, buyer2], "franchise", "f1");
    expect(selected?.id).toBe("b1");
  });

  it("disqualifies antitrust-blocked buyer", () => {
    const buyer1 = createBuyer({
      id: "b1",
      cash: 1_000_000_000,
      currentMotivation: "FRANCHISE_BUILDING",
      archetypeId: "THE_ACQUIRER",
    });
    const buyer2 = createBuyer({
      id: "b2",
      cash: 600_000_000,
      currentMotivation: "FRANCHISE_BUILDING",
      archetypeId: "THE_ACQUIRER",
    });

    const state = setupStateWithAsset([buyer1, buyer2], "franchise", "f1", "Action");
    // Block buyer1 via antitrust
    state.simMemory = {
      ...state.simMemory!,
      antitrustBlockList: [
        { acquirerId: "b1", untilWeek: 200 },
      ],
    };

    const selected = selectStrategicBuyer(state, [buyer1, buyer2], "franchise", "f1");
    expect(selected?.id).toBe("b2");
  });

  it("returns undefined when all buyers are disqualified", () => {
    const buyer1 = createBuyer({
      id: "b1",
      cash: 550_000_000,
      currentMotivation: "CASH_CRUNCH",
      archetypeId: "CASH_COW",
    });

    const state = setupStateWithAsset([buyer1], "franchise", "f1", "Action");

    const selected = selectStrategicBuyer(state, [buyer1], "franchise", "f1");
    expect(selected).toBeUndefined();
  });

  it("prefers higher ma_willingness archetype", () => {
    // STREAMING_TITAN has ma_willingness 0.9, BALANCED_GIANT has 0.5
    const buyer1 = createBuyer({
      id: "b1",
      cash: 600_000_000,
      currentMotivation: "STABILITY",
      archetypeId: "STREAMING_TITAN",
    });
    const buyer2 = createBuyer({
      id: "b2",
      cash: 600_000_000,
      currentMotivation: "STABILITY",
      archetypeId: "BALANCED_GIANT",
    });

    const state = setupStateWithAsset([buyer1, buyer2], "vault", "f1", "Action");

    const selected = selectStrategicBuyer(state, [buyer1, buyer2], "vault", "f1");
    expect(selected?.id).toBe("b1");
  });
});
