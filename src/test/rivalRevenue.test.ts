import { describe, it, expect } from "vitest";
import { RivalRevenueCalculator } from "@/engine/systems/rivals/RivalRevenueCalculator";
import { RivalStudio, GameState } from "@/engine/types";

const RIVAL_ID = "rival-1";

function makeState(projects: Record<string, any>): GameState {
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
    entities: {
      projects,
      talents: {},
      contracts: {},
      rivals: { [RIVAL_ID]: { id: RIVAL_ID } as any },
    },
    studio: {
      id: "PLR-1",
      name: "Test",
      archetype: "major",
      prestige: 50,
      internal: { projectHistory: [] },
    },
    market: { opportunities: [], buyers: [] },
    industry: { families: [], agencies: [], agents: [], rivals: [], awards: [] },
    culture: { genrePopularity: {} },
    relationships: { discovery: {} },
    history: [],
    eventHistory: [],
  } as unknown as GameState;
}

const MOCK_RNG = { next: () => 0.5, rangeInt: () => 10, uuid: () => "id", range: () => 1.0 } as any;

describe("RivalRevenueCalculator", () => {
  it("calculates zero revenue for studio with no projects", () => {
    const rival = { id: RIVAL_ID } as RivalStudio;
    const revenue = RivalRevenueCalculator.calculateWeeklyRevenue(
      rival,
      1,
      MOCK_RNG,
      makeState({})
    );
    expect(revenue.total).toBe(0);
    expect(revenue.boxOffice).toBe(0);
    expect(revenue.streaming).toBe(0);
    expect(revenue.merch).toBe(0);
  });

  it("calculates annual revenue from history", () => {
    const rival = {
      revenueHistory: [
        { week: 1, revenue: 1000000, boxOffice: 500000, streaming: 300000, merch: 200000 },
        { week: 10, revenue: 2000000, boxOffice: 1000000, streaming: 600000, merch: 400000 },
        { week: 60, revenue: 1500000, boxOffice: 750000, streaming: 450000, merch: 300000 },
      ],
    } as unknown as RivalStudio;

    const annual = RivalRevenueCalculator.calculateAnnualRevenue(rival, 53);

    expect(annual.annualRevenue).toBe(3000000); // Only weeks 1 and 10
    expect(annual.boxOfficeTotal).toBe(1500000); // Only weeks 1 and 10
  });

  it("calculates zero annual revenue for studio with no history", () => {
    const rival = { revenueHistory: [] } as unknown as RivalStudio;
    const annual = RivalRevenueCalculator.calculateAnnualRevenue(rival, 10);

    expect(annual.annualRevenue).toBe(0);
    expect(annual.boxOfficeTotal).toBe(0);
  });

  it("calculates theatrical revenue with decay", () => {
    const rival = { id: RIVAL_ID } as RivalStudio;
    const state = makeState({
      p1: {
        id: "p1",
        ownerId: RIVAL_ID,
        state: "released",
        distributionStatus: "theatrical",
        releaseWeek: 1,
        boxOffice: {
          openingWeekendDomestic: 10000000,
          openingWeekendForeign: 5000000,
          totalDomestic: 50000000,
          totalForeign: 25000000,
          multiplier: 1.5,
        },
        reviewScore: 75,
      } as any,
    });
    const revenue = RivalRevenueCalculator.calculateWeeklyRevenue(rival, 2, MOCK_RNG, state);
    expect(revenue.boxOffice).toBeGreaterThan(0);
    expect(revenue.boxOffice).toBeLessThan(10000000);
  });

  it("calculates streaming revenue for streaming projects", () => {
    const rival = { id: RIVAL_ID } as RivalStudio;
    const state = makeState({
      p1: {
        id: "p1",
        ownerId: RIVAL_ID,
        state: "released",
        distributionStatus: "streaming",
        reviewScore: 80,
        rating: "TV-MA",
      } as any,
    });
    const revenue = RivalRevenueCalculator.calculateWeeklyRevenue(rival, 1, MOCK_RNG, state);
    expect(revenue.streaming).toBeGreaterThan(0);
    expect(revenue.boxOffice).toBe(0);
  });

  it("calculates merch revenue for high-buzz projects", () => {
    const rival = { id: RIVAL_ID } as RivalStudio;
    const state = makeState({
      p1: {
        id: "p1",
        ownerId: RIVAL_ID,
        state: "released",
        buzz: 85,
        franchiseId: "franchise1",
        rating: "PG",
      } as any,
    });
    const revenue = RivalRevenueCalculator.calculateWeeklyRevenue(rival, 1, MOCK_RNG, state);
    expect(revenue.merch).toBeGreaterThan(0);
  });

  it("calculates zero merch revenue for low-buzz projects", () => {
    const rival = { id: RIVAL_ID } as RivalStudio;
    const state = makeState({
      p1: { id: "p1", ownerId: RIVAL_ID, state: "released", buzz: 50, rating: "PG-13" } as any,
    });
    const revenue = RivalRevenueCalculator.calculateWeeklyRevenue(rival, 1, MOCK_RNG, state);
    expect(revenue.merch).toBe(0);
  });

  it("returns zeros when called without game state", () => {
    const rival = { id: RIVAL_ID } as RivalStudio;
    const revenue = RivalRevenueCalculator.calculateWeeklyRevenue(rival, 1, MOCK_RNG);
    expect(revenue).toEqual({ boxOffice: 0, streaming: 0, merch: 0, total: 0 });
  });

  it("returns zero theatrical revenue before the release week", () => {
    const future = {
      id: "p1",
      releaseWeek: 10,
      boxOffice: { openingWeekendDomestic: 10_000_000 },
      reviewScore: 80,
    } as any;
    expect(RivalRevenueCalculator.calculateTheatricalRevenue(future, 5)).toBe(0);
  });

  it("floors cult classics at 100k weekly regardless of decay", () => {
    const cult = {
      id: "p1",
      releaseWeek: 1,
      boxOffice: { openingWeekendDomestic: 10_000 },
      reviewScore: 10,
      isCultClassic: true,
    } as any;
    // 10_000 * 0.2^4 * 2 = 32 → floored at 100_000
    expect(RivalRevenueCalculator.calculateTheatricalRevenue(cult, 5)).toBe(100_000);
  });

  it("picks the theatrical decay factor from review-score bands", () => {
    const base = { id: "p1", releaseWeek: 1, boxOffice: { openingWeekendDomestic: 1_000_000 } };
    const acclaimed = RivalRevenueCalculator.calculateTheatricalRevenue(
      { ...base, reviewScore: 90 } as any,
      2
    );
    const middling = RivalRevenueCalculator.calculateTheatricalRevenue(
      { ...base, reviewScore: 50 } as any,
      2
    );
    const panned = RivalRevenueCalculator.calculateTheatricalRevenue(
      { ...base, reviewScore: 30 } as any,
      2
    );
    expect(acclaimed).toBe(350_000); // 0.35 decay
    expect(middling).toBe(280_000); // 0.28 default
    expect(panned).toBe(200_000); // 0.20 for <40
  });

  it("maps streaming rating premiums case-insensitively and defaults to zero", () => {
    expect(RivalRevenueCalculator.getRatingStreamingPremium("TV-MA")).toBe(0.15);
    expect(RivalRevenueCalculator.getRatingStreamingPremium("r")).toBe(0.1);
    expect(RivalRevenueCalculator.getRatingStreamingPremium("G")).toBe(0);
    expect(RivalRevenueCalculator.getRatingStreamingPremium(undefined)).toBe(0);
    expect(RivalRevenueCalculator.getRatingStreamingPremium("BOGUS")).toBe(0);
  });

  it("maps merch rating multipliers with UNRATED at zero and unknown at 1.0", () => {
    expect(RivalRevenueCalculator.getRatingMerchMultiplier("UNRATED")).toBe(0);
    expect(RivalRevenueCalculator.getRatingMerchMultiplier("G")).toBe(1.3);
    expect(RivalRevenueCalculator.getRatingMerchMultiplier("NC-17")).toBe(0.3);
    expect(RivalRevenueCalculator.getRatingMerchMultiplier("BOGUS")).toBe(1.0);
  });

  it("includes revenue history exactly 52 weeks back but not 53", () => {
    const rival = {
      revenueHistory: [
        { week: 1, revenue: 100, boxOffice: 10, streaming: 0, merch: 0 },
        { week: 2, revenue: 200, boxOffice: 20, streaming: 0, merch: 0 },
      ],
    } as unknown as RivalStudio;
    // currentWeek 53: week 1 is 52 back (in), week 2 is 51 back (in)
    const at53 = RivalRevenueCalculator.calculateAnnualRevenue(rival, 53);
    expect(at53.annualRevenue).toBe(300);
    // currentWeek 54: week 1 is 53 back (out), week 2 is 52 back (in)
    const at54 = RivalRevenueCalculator.calculateAnnualRevenue(rival, 54);
    expect(at54.annualRevenue).toBe(200);
  });

  it("applies rating premium to streaming revenue", () => {
    const rivalTVMA = { id: RIVAL_ID } as RivalStudio;
    const stateTVMA = makeState({
      p1: {
        id: "p1",
        ownerId: RIVAL_ID,
        state: "released",
        distributionStatus: "streaming",
        reviewScore: 70,
        rating: "TV-MA",
      } as any,
    });
    const rivalPG13 = { id: RIVAL_ID } as RivalStudio;
    const statePG13 = makeState({
      p1: {
        id: "p1",
        ownerId: RIVAL_ID,
        state: "released",
        distributionStatus: "streaming",
        reviewScore: 70,
        rating: "PG-13",
      } as any,
    });
    const revenueTVMA = RivalRevenueCalculator.calculateWeeklyRevenue(
      rivalTVMA,
      1,
      MOCK_RNG,
      stateTVMA
    );
    const revenuePG13 = RivalRevenueCalculator.calculateWeeklyRevenue(
      rivalPG13,
      1,
      MOCK_RNG,
      statePG13
    );
    expect(revenueTVMA.streaming).toBeGreaterThan(revenuePG13.streaming);
  });
});
