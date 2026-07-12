import { GameState } from "@/engine/types";

/**
 * Creates a mock GameState for testing purposes, aligning with the Phase 7 Record-based Schema.
 */
export const createMockGameState = (overrides: Partial<GameState> = {}): GameState =>
  ({
    week: 10,
    gameSeed: 12345,
    tickCount: 100,
    game: { currentWeek: 10 },
    entities: {
      projects: {},
      releasedProjectIds: [],
      contracts: {},
      talents: {},
      rivals: {},
      contractsByProjectId: {},
      contractsByTalentId: {},
    },
    finance: {
      cash: 5000000,
      ledger: [],
      weeklyHistory: [],
      marketState: {
        baseRate: 0.05,
        debtRate: 0.08,
        savingsYield: 0.02,
        loanRate: 0.07,
        rateHistory: [],
      },
    },
    news: { headlines: [] },
    ip: { vault: [], franchises: {} },
    studio: {
      id: "studio-1",
      name: "Test Studio",
      archetype: "mid-tier",
      prestige: 75,
      internal: { projectHistory: [], projects: {}, contracts: [] },
    },
    market: {
      opportunities: [],
      trends: [],
      activeMarketEvents: [],
      buyers: [],
    },
    industry: {
      families: [],
      agencies: [],
      agents: [],
      newsHistory: [],
    },
    culture: {
      genrePopularity: {},
    },
    history: [],
    eventHistory: [],
    ...overrides,
  }) as GameState;
