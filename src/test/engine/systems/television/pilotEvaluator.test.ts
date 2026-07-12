import { describe, it, expect, vi } from "vitest";
import { tickPilots } from "../../../../engine/systems/television/pilotEvaluator";
import { GameState, SeriesProject } from "../../../../engine/types";
import { RandomGenerator } from "../../../../engine/utils/rng";

describe("Pilot Evaluator (Guild Auditor)", () => {
  const getMockState = (): GameState =>
    ({
      week: 1,
      entities: {
        projects: {},
        releasedProjectIds: [],
        talents: {},
        contracts: {},
        rivals: {},
      },
      studio: {
        name: "Player",
        prestige: 50,
        archetype: "major",
        internal: { projects: {}, contracts: [] },
      },
      industry: {
        rivals: [],
        families: [],
        agencies: [],
        agents: [],
        talentPool: {},
        newsHistory: [],
        rumors: [],
      },
      market: { opportunities: [], buyers: [], activeMarketEvents: [] },
      culture: { genrePopularity: {} },
      finance: {
        cash: 100,
        ledger: [],
        weeklyHistory: [],
        marketState: {
          baseRate: 0.04,
          savingsYield: 0.02,
          debtRate: 0.08,
          loanRate: 0.06,
          rateHistory: [],
        },
      },
      news: { headlines: [] },
      ip: { vault: [], franchises: {} },
      game: { currentWeek: 1 },
      history: [],
      eventHistory: [],
    }) as unknown as GameState;

  const baseProject: SeriesProject = {
    id: "tv-1",
    title: "Pilot Show",
    type: "SERIES",
    format: "tv",
    genre: "Drama",
    budgetTier: "mid",
    budget: 1000000,
    weeklyCost: 100000,
    targetAudience: "General",
    flavor: "Cool",
    state: "development",
    stage: "pilot",
    buzz: 50,
    scriptHeat: 50,
    momentum: 50,
    weeksInPhase: 0,
    developmentWeeks: 10,
    productionWeeks: 10,
    revenue: 0,
    weeklyRevenue: 0,
    releaseWeek: 1,
    activeCrisis: null,
    progress: 100,
    accumulatedCost: 1000000,
    contentFlags: [],
    reviewScore: 50,
    scriptEvents: [],
    activeRoles: [],
    tvDetails: {
      episodesAired: 0,
      episodesOrdered: 0,
      status: "IN_DEVELOPMENT",
      averageRating: 0,
      currentSeason: 1,
      episodesCompleted: 0,
    },
  } as SeriesProject;

  it("handles empty state with no projects gracefully", () => {
    const state = getMockState();
    const rng = new RandomGenerator(42);
    const impacts = tickPilots(state, rng);
    expect(impacts.length).toBe(0);
  });

  it("updates project state and calculates weekly cost if under max pilot weeks", () => {
    const state = getMockState();
    state.entities.projects["tv-1"] = { ...baseProject, weeksInPhase: 0 } as SeriesProject;

    const rng = new RandomGenerator(42);
    const impacts = tickPilots(state, rng);

    expect(impacts.length).toBe(1);
    const update = (impacts[0].payload as any).update;
    expect(update.weeksInPhase).toBe(1);
    expect(update.weeklyCost).toBe(30000); // 100k * 0.30
  });

  it("graduates pilot to series if quality is high enough", () => {
    const state = getMockState();
    // Weeks in phase = 1, so weeksInPilot = 2, which skips the < PILOT_MAX_WEEKS check (PILOT_MAX_WEEKS = 2)
    state.entities.projects["tv-1"] = {
      ...baseProject,
      weeksInPhase: 1,
      scriptHeat: 100,
      momentum: 100,
    } as SeriesProject;

    const rng = new RandomGenerator(42);
    vi.spyOn(rng, "next").mockReturnValue(0.9); // ensure rng fallback doesn't auto-pass

    const impacts = tickPilots(state, rng);

    expect(impacts.length).toBe(2);
    const graduationImpact = impacts.find((i) => i.type === "PILOT_GRADUATED");
    expect(graduationImpact).toBeDefined();

    const newsImpact = impacts.find((i) => i.type === "NEWS_ADDED");
    expect(newsImpact).toBeDefined();
    expect((newsImpact!.payload as any).category).toBe("development");
  });

  it("passes on pilot if quality is low and rng fails", () => {
    const state = getMockState();
    state.entities.projects["tv-1"] = {
      ...baseProject,
      weeksInPhase: 1,
      scriptHeat: 0,
      momentum: 0,
    } as SeriesProject;

    const rng = new RandomGenerator(42);
    vi.spyOn(rng, "next").mockReturnValue(0.9); // quality = 0, rng 0.9 > 0.3, so fails

    const impacts = tickPilots(state, rng);

    expect(impacts.length).toBe(2);
    const archiveImpact = impacts.find((i) => i.type === "PROJECT_UPDATED");
    expect(archiveImpact).toBeDefined();
    expect((archiveImpact!.payload as any).update.state).toBe("archived");

    const newsImpact = impacts.find((i) => i.type === "NEWS_ADDED");
    expect(newsImpact).toBeDefined();
    expect((newsImpact!.payload as any).category).toBe("cancellation");
  });

  it("handles negative cost safely for weekly calculation (Guild Auditor)", () => {
    const state = getMockState();
    state.entities.projects["tv-1"] = {
      ...baseProject,
      weeksInPhase: 0,
      weeklyCost: -10000, // weird negative data
    } as SeriesProject;

    const rng = new RandomGenerator(42);
    const impacts = tickPilots(state, rng);

    const update = (impacts[0].payload as any).update;
    expect(update.weeklyCost).toBe(-3000); // Should properly multiply negative
  });

  it("handles massive negative quality properly (Guild Auditor)", () => {
    const state = getMockState();
    state.entities.projects["tv-1"] = {
      ...baseProject,
      weeksInPhase: 1,
      scriptHeat: -500,
      momentum: -500,
    } as SeriesProject;

    const rng = new RandomGenerator(42);
    vi.spyOn(rng, "next").mockReturnValue(0.9); // guaranteed fail

    const impacts = tickPilots(state, rng);
    const archiveImpact = impacts.find((i) => i.type === "PROJECT_UPDATED");
    expect(archiveImpact).toBeDefined();
    expect((archiveImpact!.payload as any).update.state).toBe("archived");
  });
});
