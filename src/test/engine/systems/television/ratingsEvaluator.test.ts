import { describe, it, expect } from "vitest";
import { SeriesProject } from "../../../../engine/types";
import { calculateWeeklyRating } from "../../../../engine/systems/television/ratingsEvaluator";
import { RandomGenerator } from "../../../../engine/utils/rng";

describe("Ratings Evaluator (Target B2)", () => {
  const rng = new RandomGenerator(12345);

  const mockSeries: SeriesProject = {
    id: "tv1",
    title: "The Bear",
    type: "SERIES",
    format: "tv",
    genre: "Drama",
    budgetTier: "mid",
    budget: 10_000_000,
    weeklyCost: 1_000_000,
    targetAudience: "Prestige",
    flavor: "Cooking stress",
    state: "released",
    buzz: 80,
    weeksInPhase: 1,
    developmentWeeks: 10,
    productionWeeks: 10,
    revenue: 0,
    weeklyRevenue: 0,
    releaseWeek: 1,
    activeCrisis: null,
    momentum: 50,
    progress: 100,
    accumulatedCost: 10_000_000,
    contentFlags: [],
    reviewScore: 90,
    scriptHeat: 50,
    scriptEvents: [],
    activeRoles: [],
    tvDetails: {
      currentSeason: 1,
      episodesOrdered: 8,
      episodesCompleted: 8,
      episodesAired: 2,
      averageRating: 0,
      status: "ON_AIR",
    },
  };

  it("should calculate viewership based on buzz and quality (0-10 scale)", () => {
    const rating = calculateWeeklyRating(mockSeries, 80, rng);
    expect(rating).toBeGreaterThan(0.1);
    expect(rating).toBeLessThanOrEqual(10);
  });

  it("should apply higher decay if the review score is low", () => {
    const badSeries = { ...mockSeries, reviewScore: 20 } as SeriesProject;
    const rating1 = calculateWeeklyRating(mockSeries, 80, rng);
    const rating2 = calculateWeeklyRating(badSeries, 80, rng);

    expect(rating2).toBeLessThan(rating1);
  });

  // Stub rng.next() = 0.5 → variance factor is exactly 1.0, making the
  // deterministic parts of the formula directly assertable.
  const flatRng = { next: () => 0.5 } as unknown as RandomGenerator;

  it("floors the rating at 0.1 when buzz collapses to zero", () => {
    expect(calculateWeeklyRating(mockSeries, 0, flatRng)).toBe(0.1);
  });

  it("caps the rating at 10 for maximum buzz and quality", () => {
    const hit = { ...mockSeries, reviewScore: 100 } as SeriesProject;
    expect(calculateWeeklyRating(hit, 100, flatRng)).toBe(10);
  });

  it("applies the water-cooler bonus only above buzz 85", () => {
    const neutralQuality = {
      ...mockSeries,
      reviewScore: 50,
      tvDetails: { ...mockSeries.tvDetails, episodesAired: 1 },
    } as SeriesProject;
    // buzz 85: 8.5 * 1.0 * 1.0 * 1.0 * 1.0 = 8.5
    expect(calculateWeeklyRating(neutralQuality, 85, flatRng)).toBe(8.5);
    // buzz 86: 8.6 * 1.0 * 1.0 * 1.2 * 1.0 = 10.32 → capped at 10
    expect(calculateWeeklyRating(neutralQuality, 86, flatRng)).toBe(10);
  });

  it("decays steeply by the 20th aired episode", () => {
    const lateSeries = {
      ...mockSeries,
      reviewScore: 50,
      tvDetails: { ...mockSeries.tvDetails, episodesAired: 20 },
    } as SeriesProject;
    const earlySeries = {
      ...mockSeries,
      reviewScore: 50,
      tvDetails: { ...mockSeries.tvDetails, episodesAired: 1 },
    } as SeriesProject;

    const late = calculateWeeklyRating(lateSeries, 50, flatRng);
    const early = calculateWeeklyRating(earlySeries, 50, flatRng);

    // ep1: 5 * 1.0 = 5.0; ep20: 5 * 0.95^19 ≈ 1.9
    expect(early).toBe(5);
    expect(late).toBeLessThan(early / 2);
  });

  it("treats a missing tvDetails block as episode 1 without decay", () => {
    const series = {
      ...mockSeries,
      reviewScore: 50,
      tvDetails: undefined,
    } as unknown as SeriesProject;
    expect(calculateWeeklyRating(series, 50, flatRng)).toBe(5);
  });
});
