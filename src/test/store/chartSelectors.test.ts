import {describe, it, expect} from "vitest";
import {selectGenrePerformanceMatrix, selectTalentSatisfaction} from "@/store/chartSelectors";
import {GameState} from "@/engine/types";
import {createMockGameState, createMockProject} from "@/test/utils/mockFactories";

describe("selectGenrePerformanceMatrix", () => {
  it("returns empty array for null state", () => {
    const result = selectGenrePerformanceMatrix(null);
    expect(result).toEqual([]);
  });

  it("returns entry per unique genre in trends", () => {
    const state = createMockGameState({
      market: {
        trends: [
          { genre: "Action", heat: 80, direction: "hot", weeksRemaining: 10 },
          { genre: "Comedy", heat: 30, direction: "cooling", weeksRemaining: 5 },
        ],
        buyers: [],
        opportunities: [],
      },
    } as Partial<GameState>);

    const result = selectGenrePerformanceMatrix(state);
    expect(result).toHaveLength(2);
    expect(result[0].genre).toBe("Action");
    expect(result[1].genre).toBe("Comedy");
  });

  it("marketTrend field matches trend heat for that genre", () => {
    const state = createMockGameState({
      market: {
        trends: [
          { genre: "Horror", heat: 75, direction: "rising", weeksRemaining: 8 },
        ],
        buyers: [],
        opportunities: [],
      },
    } as Partial<GameState>);

    const result = selectGenrePerformanceMatrix(state);
    expect(result[0].marketTrend).toBe(75);
  });

  it("isHot is true when trend direction is 'hot'", () => {
    const state = createMockGameState({
      market: {
        trends: [
          { genre: "Action", heat: 90, direction: "hot", weeksRemaining: 10 },
        ],
        buyers: [],
        opportunities: [],
      },
    } as Partial<GameState>);

    const result = selectGenrePerformanceMatrix(state);
    expect(result[0].isHot).toBe(true);
  });

  it("isHot is true when trend direction is 'rising'", () => {
    const state = createMockGameState({
      market: {
        trends: [
          { genre: "Action", heat: 60, direction: "rising", weeksRemaining: 10 },
        ],
        buyers: [],
        opportunities: [],
      },
    } as Partial<GameState>);

    const result = selectGenrePerformanceMatrix(state);
    expect(result[0].isHot).toBe(true);
  });

  it("isHot is false when trend direction is 'stable' or 'cooling'", () => {
    const state = createMockGameState({
      market: {
        trends: [
          { genre: "Drama", heat: 50, direction: "stable", weeksRemaining: 10 },
          { genre: "Horror", heat: 20, direction: "cooling", weeksRemaining: 5 },
        ],
        buyers: [],
        opportunities: [],
      },
    } as Partial<GameState>);

    const result = selectGenrePerformanceMatrix(state);
    expect(result.find((r) => r.genre === "Drama")?.isHot).toBe(false);
    expect(result.find((r) => r.genre === "Horror")?.isHot).toBe(false);
  });

  it("genre with no released projects has avgRevenue=0 and projectCount=0", () => {
    const state = createMockGameState({
      market: {
        trends: [
          { genre: "Action", heat: 80, direction: "hot", weeksRemaining: 10 },
        ],
        buyers: [],
        opportunities: [],
      },
    } as Partial<GameState>);

    const result = selectGenrePerformanceMatrix(state);
    expect(result[0].avgRevenue).toBe(0);
    expect(result[0].projectCount).toBe(0);
  });

  it("genre with released projects has correct avgRevenue and projectCount", () => {
    const proj1 = createMockProject({
      id: "p1",
      genre: "Action",
      state: "released",
      revenue: 100_000_000,
    });
    const proj2 = createMockProject({
      id: "p2",
      genre: "Action",
      state: "released",
      revenue: 50_000_000,
    });

    const state = createMockGameState({
      market: {
        trends: [
          { genre: "Action", heat: 80, direction: "hot", weeksRemaining: 10 },
        ],
        buyers: [],
        opportunities: [],
      },
      entities: {
        projects: { p1: proj1, p2: proj2 },
        releasedProjectIds: ["p1", "p2"],
        rivals: {},
        talents: {},
        contracts: {},
        contractsByProjectId: {},
        contractsByTalentId: {},
      },
    } as Partial<GameState>);

    const result = selectGenrePerformanceMatrix(state);
    expect(result[0].projectCount).toBe(2);
    expect(result[0].avgRevenue).toBe(75_000_000);
  });
});

describe("selectTalentSatisfaction", () => {
  const makeTalent = (id: string, tier: string, mood?: number) =>
    ({ id, tier, psychology: mood === undefined ? undefined : { mood } }) as never;

  const stateWithTalents = (talents: Record<string, unknown>) =>
    createMockGameState({ entities: { talents } } as unknown as Partial<GameState>);

  it("returns zeroed data for null state", () => {
    expect(selectTalentSatisfaction(null)).toEqual({ overallScore: 0, byCategory: [] });
  });

  it("returns zeroed data for an empty talent pool", () => {
    expect(selectTalentSatisfaction(stateWithTalents({}))).toEqual({
      overallScore: 0,
      byCategory: [],
    });
  });

  it("computes overallScore as the mean mood across all talents", () => {
    const state = stateWithTalents({
      a: makeTalent("a", "A_LIST", 80),
      b: makeTalent("b", "B_LIST", 60),
    });
    expect(selectTalentSatisfaction(state).overallScore).toBe(70);
  });

  it("defaults missing mood to 70 and missing tier to Emerging", () => {
    const state = stateWithTalents({
      a: makeTalent("a", "A_LIST", undefined),
      u: makeTalent("u", "UNKNOWN_TIER", 40),
    });
    const result = selectTalentSatisfaction(state);
    // (70 + 40) / 2
    expect(result.overallScore).toBe(55);
    expect(result.byCategory[0]).toEqual({ category: "A-list", score: 70 });
    expect(result.byCategory[3]).toEqual({ category: "Emerging", score: 40 });
  });

  it("buckets tiers into the four display categories correctly", () => {
    const state = stateWithTalents({
      a: makeTalent("a", "A_LIST", 90),
      b: makeTalent("b", "B_LIST", 80),
      c: makeTalent("c", "C_LIST", 60),
      d: makeTalent("d", "RISING_STAR", 40),
      e: makeTalent("e", "NEWCOMER", 60),
    });
    const result = selectTalentSatisfaction(state);
    expect(result.byCategory).toEqual([
      { category: "A-list", score: 90 },
      { category: "B-list", score: 80 },
      { category: "C-list", score: 60 },
      { category: "Emerging", score: 50 }, // mean of RISING_STAR(40) + NEWCOMER(60)
    ]);
    // overall mean: (90+80+60+40+60)/5 = 66
    expect(result.overallScore).toBe(66);
  });
});
