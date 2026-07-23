import { describe, it, expect, beforeEach, vi } from "vitest";
import { useGameStore } from "@/store/gameStore";
import { IPAsset } from "@/engine/types";

function applySingleImpact(state: any, impact: any): any {
  if (impact.type === "NEWS_ADDED") {
    return {
      ...state,
      news: {
        ...state.news,
        headlines: [...(state.news?.headlines || []), impact.payload],
      },
    };
  }
  if (impact.type === "FUNDS_DEDUCTED") {
    return {
      ...state,
      finance: { ...state.finance, cash: state.finance.cash - impact.payload.amount },
    };
  }
  return state;
}

vi.mock("@/engine/utils/rng", () => ({
  RandomGenerator: vi.fn().mockImplementation(() => ({
    next: vi.fn(() => 0.5),
    uuid: vi.fn(() => "mock-uuid"),
    pick: vi.fn((arr: any[]) => arr[0]),
    getState: vi.fn(() => 12345),
  })),
}));

vi.mock("@/engine/systems/ip/fatigueEngine", () => ({
  calculateFranchiseFatigue: vi.fn(() => 0.5),
}));

vi.mock("@/engine/systems/ip/spinoffFactory", () => ({
  generateSpinoffProposal: vi.fn(),
}));

vi.mock("@/engine/systems/culture", () => ({
  updateCultureFromProject: vi.fn(),
}));

vi.mock("@/engine/systems/projects", () => ({
  releaseProject: vi.fn(),
}));

vi.mock("@/engine/systems/buyers", () => ({
  negotiateContract: vi.fn(),
}));

vi.mock("@/engine/systems/crises", () => ({
  resolveCrisis: vi.fn(),
}));

vi.mock("@/engine/systems/festivals", () => ({
  submitToFestival: vi.fn(),
}));

vi.mock("@/engine/systems/awards", () => ({
  submitForAward: vi.fn(),
}));

vi.mock("@/store/storeUtils", () => ({
  buildProjectAndContracts: vi.fn(() => ({
    project: {
      id: "new-proj-1",
      title: "Test IP (Revival)",
      genre: "DRAMA",
      state: "development",
      budget: 50_000_000,
      type: "FILM",
    },
    newContracts: [],
    talentFees: 0,
  })),
  applyStateImpact: vi.fn((state: any, impact: any) => {
    if (Array.isArray(impact)) {
      let s = state;
      for (const imp of impact) {
        s = applySingleImpact(s, imp);
      }
      return s;
    }
    return applySingleImpact(state, impact);
  }),
  CreateProjectParams: {} as any,
}));

function makeAsset(overrides: Partial<IPAsset> = {}): IPAsset {
  return {
    id: "ip-1",
    originalProjectId: "prj-orig",
    title: "Test IP",
    franchiseId: "FR-1",
    baseValue: 50_000_000,
    decayRate: 0.8,
    merchandisingMultiplier: 1.0,
    syndicationStatus: "NONE",
    syndicationTier: "NONE",
    totalEpisodes: 0,
    rightsExpirationWeek: 999,
    rightsOwner: "STUDIO",
    ...overrides,
  };
}

function makeState(overrides: any = {}) {
  return {
    week: 100,
    gameSeed: 12345,
    tickCount: 0,
    rngState: 12345,
    game: { currentWeek: 100 },
    finance: { cash: 100_000_000, ledger: [], weeklyHistory: [] },
    studio: {
      id: "PLR-1",
      name: "Player Studio",
      archetype: "major",
      prestige: 50,
      internal: { projectHistory: [], firstLookDeals: [], projects: {}, contracts: [] },
    },
    entities: {
      projects: {},
      releasedProjectIds: [],
      talents: {},
      contracts: {},
      rivals: {},
      contractsByProjectId: {},
      contractsByTalentId: {},
    },
    market: { opportunities: [], trends: [], activeMarketEvents: [], buyers: [] },
    industry: { families: [], agencies: [], agents: [], awards: [], newsHistory: [], rumors: [], scandals: [] },
    culture: { genrePopularity: {} },
    news: { headlines: [] },
    ip: {
      vault: [makeAsset()],
      franchises: {
        "FR-1": {
          id: "FR-1",
          name: "Test Universe",
          relevanceScore: 80,
          fatigueLevel: 0.2,
          audienceLoyalty: 50,
          totalEquity: 500_000_000,
          synergyMultiplier: 1.0,
          assetIds: ["ip-1"],
          activeProjectIds: [],
          lastReleaseWeeks: [10],
          creationWeek: 1,
        },
      },
    },
    history: [],
    eventHistory: [],
    ...overrides,
  } as any;
}

describe("developFromOwnedIP", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a project in entities.projects for STUDIO-owned asset", () => {
    useGameStore.setState({ gameState: makeState() } as any);
    const store = useGameStore.getState() as any;
    store.developFromOwnedIP("ip-1");
    const state = useGameStore.getState().gameState as any;
    expect(state.entities.projects["new-proj-1"]).toBeDefined();
  });

  it("creates a project in studio.internal.projects", () => {
    useGameStore.setState({ gameState: makeState() } as any);
    const store = useGameStore.getState() as any;
    store.developFromOwnedIP("ip-1");
    const state = useGameStore.getState().gameState as any;
    expect(state.studio.internal.projects["new-proj-1"]).toBeDefined();
  });

  it("adds a news headline containing the asset title", () => {
    useGameStore.setState({ gameState: makeState() } as any);
    const store = useGameStore.getState() as any;
    store.developFromOwnedIP("ip-1");
    const state = useGameStore.getState().gameState as any;
    const headlines = state.news.headlines;
    expect(headlines.length).toBeGreaterThan(0);
    expect(headlines.some((h: any) => h.headline.includes("Test IP"))).toBe(true);
  });

  it("does NOT deduct funds (cash unchanged)", () => {
    const state = makeState();
    const cashBefore = state.finance.cash;
    useGameStore.setState({ gameState: state } as any);
    const store = useGameStore.getState() as any;
    store.developFromOwnedIP("ip-1");
    const cashAfter = (useGameStore.getState().gameState as any).finance.cash;
    expect(cashAfter).toBe(cashBefore);
  });

  it("does NOT change rightsOwner (stays STUDIO)", () => {
    useGameStore.setState({ gameState: makeState() } as any);
    const store = useGameStore.getState() as any;
    store.developFromOwnedIP("ip-1");
    const state = useGameStore.getState().gameState as any;
    const asset = state.ip.vault.find((a: any) => a.id === "ip-1");
    expect(asset.rightsOwner).toBe("STUDIO");
  });

  it("no-op for MARKET asset (no project created)", () => {
    const state = makeState({
      ip: {
        vault: [makeAsset({ rightsOwner: "MARKET" })],
        franchises: makeState().ip.franchises,
      },
    });
    useGameStore.setState({ gameState: state } as any);
    const store = useGameStore.getState() as any;
    store.developFromOwnedIP("ip-1");
    const gs = useGameStore.getState().gameState as any;
    expect(Object.keys(gs.entities.projects).length).toBe(0);
  });

  it("no-op for RIVAL asset (no project created)", () => {
    const state = makeState({
      ip: {
        vault: [makeAsset({ rightsOwner: "RIVAL" })],
        franchises: makeState().ip.franchises,
      },
    });
    useGameStore.setState({ gameState: state } as any);
    const store = useGameStore.getState() as any;
    store.developFromOwnedIP("ip-1");
    const gs = useGameStore.getState().gameState as any;
    expect(Object.keys(gs.entities.projects).length).toBe(0);
  });

  it("no-op for unknown asset ID (no project created)", () => {
    useGameStore.setState({ gameState: makeState() } as any);
    const store = useGameStore.getState() as any;
    store.developFromOwnedIP("nonexistent");
    const gs = useGameStore.getState().gameState as any;
    expect(Object.keys(gs.entities.projects).length).toBe(0);
  });

  it("updates contractsByProjectId index", () => {
    useGameStore.setState({ gameState: makeState() } as any);
    const store = useGameStore.getState() as any;
    store.developFromOwnedIP("ip-1");
    const state = useGameStore.getState().gameState as any;
    expect(state.entities.contractsByProjectId).toBeDefined();
  });

  it("updates rngState", () => {
    useGameStore.setState({ gameState: makeState() } as any);
    const store = useGameStore.getState() as any;
    store.developFromOwnedIP("ip-1");
    const state = useGameStore.getState().gameState as any;
    expect(state.rngState).toBeDefined();
  });
});
