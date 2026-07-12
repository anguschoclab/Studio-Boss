import { describe, expect } from "vitest";
import { calculateWeeklyRevenue } from "../../../engine/systems/finance/CalculatorModule";
import { GameState, Project } from "../../../engine/types";

function makeState(project: Project): GameState {
  return {
    week: 1,
    gameSeed: 1,
    tickCount: 0,
    game: { currentWeek: 1 },
    finance: {
      cash: 1_000_000,
      ledger: [],
      weeklyHistory: [],
      marketState: {
        baseRate: 0.05,
        savingsYield: 0.02,
        debtRate: 0.08,
        loanRate: 0.06,
        rateHistory: [],
      },
    },
    news: { headlines: [] },
    ip: { vault: [], franchises: {} },
    entities: { projects: { [project.id]: project }, talents: {}, contracts: {}, rivals: {} },
    studio: {
      id: "PLR-1",
      name: "Test",
      archetype: "major",
      prestige: 50,
      internal: { projectHistory: [] },
    },
    market: { opportunities: [], buyers: [], trends: [], activeMarketEvents: [] },
    industry: {
      families: [],
      agencies: [],
      agents: [],
      rivals: [],
      awards: [],
      newsHistory: [],
      rumors: [],
      scandals: [],
    },
    culture: { genrePopularity: {} },
    relationships: { discovery: {} },
    history: [],
    eventHistory: [],
  } as unknown as GameState;
}

describe("Finance: Cult Classic Revenue", () => {
  const baseProject: Project = {
    id: "p1",
    title: "Flop",
    format: "film",
    genre: "Drama",
    budgetTier: "low",
    budget: 1000000,
    weeklyCost: 10000,
    targetAudience: "General Audience",
    flavor: "A nice drama",
    state: "released",
    buzz: 50,
    weeksInPhase: 0,
    developmentWeeks: 4,
    productionWeeks: 4,
    revenue: 0,
    weeklyRevenue: 50000,
    releaseWeek: null,
    distributionStatus: "theatrical",
  } as Project;

  it("Cult Classic projects generate long-tail revenue minimums", () => {
    // Normal project: 50000 * 0.18 decay = 9000
    const normalProject = { ...baseProject, weeklyRevenue: 50000 };
    const revNormal = calculateWeeklyRevenue(makeState(normalProject));
    expect(revNormal).toBe(9000);

    // Cult classic: Math.max(9000 * 2, 50000) = 50000
    const cultProject = { ...baseProject, isCultClassic: true, weeklyRevenue: 50000 };
    const revCult = calculateWeeklyRevenue(makeState(cultProject));
    expect(revCult).toBe(50000);
  });
});
