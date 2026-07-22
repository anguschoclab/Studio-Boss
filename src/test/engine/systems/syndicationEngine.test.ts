import { describe, it, expect } from "vitest";
import {
  determineSyndicationTier,
  getSyndicationImpact,
  calculateSyndicationProgress,
} from "@/engine/systems/ip/syndicationEngine";

describe("Syndication Engine — determineSyndicationTier", () => {
  it("returns NONE for 0 episodes", () => {
    expect(determineSyndicationTier(0, "Drama")).toBe("NONE");
  });

  it("returns NONE for 64 episodes Drama (just below Bronze)", () => {
    expect(determineSyndicationTier(64, "Drama")).toBe("NONE");
  });

  it("returns BRONZE for 65 episodes Drama", () => {
    expect(determineSyndicationTier(65, "Drama")).toBe("BRONZE");
  });

  it("returns BRONZE for 87 episodes Drama", () => {
    expect(determineSyndicationTier(87, "Drama")).toBe("BRONZE");
  });

  it("returns SILVER for 88 episodes Drama", () => {
    expect(determineSyndicationTier(88, "Drama")).toBe("SILVER");
  });

  it("returns SILVER for 99 episodes Drama", () => {
    expect(determineSyndicationTier(99, "Drama")).toBe("SILVER");
  });

  it("returns GOLD for 100 episodes Drama", () => {
    expect(determineSyndicationTier(100, "Drama")).toBe("GOLD");
  });

  it("returns NONE for 51 episodes Animation (0.8x modifier, Bronze at 52)", () => {
    expect(determineSyndicationTier(51, "Animation")).toBe("NONE");
  });

  it("returns BRONZE for 52 episodes Animation (0.8x modifier)", () => {
    expect(determineSyndicationTier(52, "Animation")).toBe("BRONZE");
  });

  it("returns BRONZE for 70 episodes Animation (Silver at ceil(70.4)=71)", () => {
    expect(determineSyndicationTier(70, "Animation")).toBe("BRONZE");
  });

  it("returns SILVER for 71 episodes Animation", () => {
    expect(determineSyndicationTier(71, "Animation")).toBe("SILVER");
  });

  it("returns SILVER for 79 episodes Animation (Gold at ceil(80)=80)", () => {
    expect(determineSyndicationTier(79, "Animation")).toBe("SILVER");
  });

  it("returns GOLD for 80 episodes Animation", () => {
    expect(determineSyndicationTier(80, "Animation")).toBe("GOLD");
  });

  it("uses 1.0x modifier for unknown genres", () => {
    expect(determineSyndicationTier(65, "UnknownGenre")).toBe("BRONZE");
    expect(determineSyndicationTier(64, "UnknownGenre")).toBe("NONE");
  });

  it("defaults to Drama genre when not specified", () => {
    expect(determineSyndicationTier(65)).toBe("BRONZE");
    expect(determineSyndicationTier(100)).toBe("GOLD");
  });
});

describe("Syndication Engine — getSyndicationImpact", () => {
  it("returns correct values for NONE tier", () => {
    const impact = getSyndicationImpact("NONE");
    expect(impact.revenueMultiplier).toBe(1.0);
    expect(impact.decayShield).toBe(0);
  });

  it("returns correct values for BRONZE tier", () => {
    const impact = getSyndicationImpact("BRONZE");
    expect(impact.revenueMultiplier).toBe(1.4);
    expect(impact.decayShield).toBe(0.5);
  });

  it("returns correct values for SILVER tier", () => {
    const impact = getSyndicationImpact("SILVER");
    expect(impact.revenueMultiplier).toBe(2.2);
    expect(impact.decayShield).toBe(0.9);
  });

  it("returns correct values for GOLD tier", () => {
    const impact = getSyndicationImpact("GOLD");
    expect(impact.revenueMultiplier).toBe(3.5);
    expect(impact.decayShield).toBe(1.0);
  });
});

describe("Syndication Engine — calculateSyndicationProgress", () => {
  it("returns 0 progress for 0 episodes Drama", () => {
    const result = calculateSyndicationProgress(0, "Drama");
    expect(result.progress).toBe(0);
    expect(result.episodesNeeded).toBe(65);
  });

  it("returns ~77% progress for 50 episodes Drama (target 65)", () => {
    const result = calculateSyndicationProgress(50, "Drama");
    expect(result.progress).toBeCloseTo((50 / 65) * 100, 1);
    expect(result.episodesNeeded).toBe(15);
  });

  it("returns progress toward Silver for 65 episodes Drama (next target 88)", () => {
    const result = calculateSyndicationProgress(65, "Drama");
    expect(result.progress).toBeCloseTo((65 / 88) * 100, 1);
    expect(result.episodesNeeded).toBe(23);
  });

  it("returns ~91% progress for 80 episodes Drama (target 88)", () => {
    const result = calculateSyndicationProgress(80, "Drama");
    expect(result.progress).toBeCloseTo((80 / 88) * 100, 1);
    expect(result.episodesNeeded).toBe(8);
  });

  it("returns progress toward Silver for 52 episodes Animation (next target 70.4)", () => {
    const result = calculateSyndicationProgress(52, "Animation");
    expect(result.progress).toBeCloseTo((52 / 70.4) * 100, 1);
    expect(result.episodesNeeded).toBe(19);
  });

  it("caps progress at 100 for episodes beyond Gold threshold", () => {
    const result = calculateSyndicationProgress(150, "Drama");
    expect(result.progress).toBe(100);
    expect(result.episodesNeeded).toBe(0);
  });
});
