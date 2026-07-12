import { describe, it, expect, beforeEach, vi } from "vitest";
import { useGameStore } from "@/store/gameStore";
import { Opportunity } from "@/engine/types";

vi.mock("@/engine/utils/rng", () => ({
  RandomGenerator: vi.fn().mockImplementation(() => ({
    next: vi.fn(() => 0.5),
    getState: vi.fn(() => ({ seed: 12345 })),
  })),
}));

vi.mock("@/engine/systems/ai/biddingEngine", () => ({
  calculateLiveCounterBid: vi.fn(() => null),
}));

vi.mock("@/store/storeUtils", () => ({
  buildProjectAndContracts: vi.fn(() => ({
    project: {
      id: "new-proj-1",
      title: "Test",
      genre: "Action",
      state: "development",
      budget: 10_000_000,
      spent: 0,
      type: "FILM",
    },
    newContracts: [],
    talentFees: 0,
  })),
  applyStateImpact: vi.fn((state: any) => state),
  CreateProjectParams: {} as any,
}));

function makeOpp(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: "opp-1",
    title: "Test Script",
    type: "script",
    format: "film",
    genre: "Action",
    budgetTier: "blockbuster",
    targetAudience: "General",
    flavor: "Cool",
    origin: "open_spec",
    costToAcquire: 0,
    weeksUntilExpiry: 10,
    expirationWeek: 10,
    bids: {},
    bidHistory: [],
    ...overrides,
  } as Opportunity;
}

describe("talentMarketplaceSlice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGameStore.setState({
      gameState: {
        week: 5,
        finance: { cash: 100_000_000, ledger: [], weeklyHistory: [] },
        studio: {
          id: "PLR-1",
          name: "Player Studio",
          archetype: "major",
          prestige: 50,
          internal: { projectHistory: [], firstLookDeals: [], projects: {}, contracts: [] },
        },
        entities: { projects: {}, releasedProjectIds: [], talents: {}, contracts: {}, rivals: {} },
        market: { opportunities: [], trends: [], activeMarketEvents: [], buyers: [] },
        industry: {
          families: [],
          agencies: [],
          agents: [],
          awards: [],
          newsHistory: [],
          rumors: [],
          scandals: [],
        },
        culture: { genrePopularity: {} },
        news: { headlines: [] },
        ip: { vault: [], franchises: {} },
        history: [],
        eventHistory: [],
        game: { currentWeek: 5 },
        gameSeed: 12345,
        tickCount: 0,
        rngState: { seed: 12345 },
      } as any,
    } as any);
  });

  describe("acquireOpportunity", () => {
    it("returns unchanged state when opportunity not found", () => {
      const store = useGameStore.getState() as any;
      const before = useGameStore.getState().gameState?.finance.cash!;
      store.acquireOpportunity("nonexistent");
      expect(useGameStore.getState().gameState?.finance.cash).toBe(before);
    });

    it("computes currentHighest correctly from bids dict", () => {
      const opp = makeOpp({
        id: "opp-1",
        costToAcquire: 0,
        highestBidderId: "PLAYER",
        expirationWeek: 5,
        bids: {
          "rival-1": { amount: 8_000_000, terms: "standard" },
          "rival-2": { amount: 12_000_000, terms: "standard" },
        },
      });
      useGameStore.setState({
        gameState: {
          ...(useGameStore.getState().gameState as any),
          market: { opportunities: [opp], trends: [], activeMarketEvents: [], buyers: [] },
        },
      } as any);

      const store = useGameStore.getState() as any;
      const before = useGameStore.getState().gameState?.finance.cash!;
      store.acquireOpportunity("opp-1");
      const after = useGameStore.getState().gameState?.finance.cash!;
      expect(after).toBeLessThan(before);
      expect(before - after).toBeGreaterThanOrEqual(12_000_000);
    });

    it("returns unchanged state when player not winner and not expired", () => {
      const opp = makeOpp({
        id: "opp-1",
        costToAcquire: 0,
        highestBidderId: "rival-1",
        expirationWeek: 20,
        bids: { "rival-1": { amount: 5_000_000, terms: "standard" } },
      });
      useGameStore.setState({
        gameState: {
          ...(useGameStore.getState().gameState as any),
          week: 5,
          market: { opportunities: [opp], trends: [], activeMarketEvents: [], buyers: [] },
        },
      } as any);

      const store = useGameStore.getState() as any;
      const before = useGameStore.getState().gameState?.finance.cash!;
      store.acquireOpportunity("opp-1");
      expect(useGameStore.getState().gameState?.finance.cash).toBe(before);
    });
  });

  describe("placeBid", () => {
    it("adds player bid to bids dict", () => {
      const opp = makeOpp({ id: "opp-1", bids: {} });
      useGameStore.setState({
        gameState: {
          ...(useGameStore.getState().gameState as any),
          market: { opportunities: [opp], trends: [], activeMarketEvents: [], buyers: [] },
        },
      } as any);

      const store = useGameStore.getState() as any;
      store.placeBid("opp-1", 5_000_000);

      const opps = useGameStore.getState().gameState?.market.opportunities!;
      expect(opps[0].bids["PLR-1"]).toEqual({ amount: 5_000_000, terms: "standard" });
      expect(opps[0].highestBidderId).toBe("PLR-1");
    });

    it("returns unchanged state when insufficient cash", () => {
      const opp = makeOpp({ id: "opp-1", bids: {} });
      useGameStore.setState({
        gameState: {
          ...(useGameStore.getState().gameState as any),
          finance: { cash: 1_000_000, ledger: [], weeklyHistory: [] },
          market: { opportunities: [opp], trends: [], activeMarketEvents: [], buyers: [] },
        },
      } as any);

      const store = useGameStore.getState() as any;
      store.placeBid("opp-1", 50_000_000);

      const opps = useGameStore.getState().gameState?.market.opportunities!;
      expect(opps[0].bids["PLR-1"]).toBeUndefined();
    });
  });
});
