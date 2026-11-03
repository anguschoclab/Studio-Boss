import { describe, it, expect } from "vitest";
import {
  getRelationshipKey,
  calculateCompatibility,
  calculatePowerCoupleRating,
} from "@/engine/systems/talent/relationshipCompatibility";
import { createMockTalent } from "../../../utils/mockFactories";

// Compatibility is a sum of five signals — age proximity, shared country,
// the personality matrix, archetype match/clash, and tier distance — all in
// multiples of 5 (see relationshipCompatibility.ts). Fixture comments below
// spell out each contribution so tuning changes break these tests loudly.

describe("getRelationshipKey", () => {
  it("orders ids so the key is direction-independent", () => {
    expect(getRelationshipKey("b", "a")).toBe("a-b");
    expect(getRelationshipKey("a", "b")).toBe("a-b");
  });
});

describe("calculateCompatibility", () => {
  it("scores exactly zero for a deliberately neutral pair", () => {
    // age 18yr apart (0) + different country (0) + difficult x artistic (-5)
    // + different non-clashing archetypes (0) + adjacent tiers (+5) = 0
    const a = createMockTalent({
      demographics: { age: 30, gender: "MALE", ethnicity: "Caucasian", country: "USA" },
      personality: "difficult",
      actorArchetype: "movie_star",
      tier: "C_LIST",
    });
    const b = createMockTalent({
      demographics: { age: 48, gender: "FEMALE", ethnicity: "Caucasian", country: "UK" },
      personality: "artistic",
      actorArchetype: "character_actor",
      tier: "B_LIST",
    });
    expect(calculateCompatibility(a, b)).toBe(0);
  });

  it("rewards proximity: same-age, same-country, same-tier pair scores high", () => {
    // age <=5 (+15) + same country (+10) + same archetype (+5) + same tier (+10) = 40
    const base = {
      demographics: {
        age: 30,
        gender: "MALE" as const,
        ethnicity: "Caucasian",
        country: "USA",
      },
      actorArchetype: "movie_star" as const,
      tier: "A_LIST" as const,
    };
    const a = createMockTalent({ ...base, id: "a" });
    const b = createMockTalent({ ...base, id: "b" });
    expect(calculateCompatibility(a, b)).toBe(40);
  });

  it("penalizes distant pairs: large age gap, clashing archetypes, tier gap >= 2", () => {
    // ageDiff >20 (-10) + different country (0) + movie_star x prestige_actor (-10)
    // + A_LIST vs NEWCOMER (-15) = -35
    const a = createMockTalent({
      demographics: { age: 55, gender: "MALE", ethnicity: "Caucasian", country: "USA" },
      actorArchetype: "movie_star",
      tier: "A_LIST",
    });
    const b = createMockTalent({
      demographics: { age: 22, gender: "FEMALE", ethnicity: "Caucasian", country: "UK" },
      actorArchetype: "prestige_actor",
      tier: "NEWCOMER",
    });
    expect(calculateCompatibility(a, b)).toBe(-35);
  });

  it("applies the personality matrix in both directions", () => {
    // same age (+15) + same country (+10) + same tier (+10)
    // + collaborative x charismatic (+15 forward, no reverse entry) = 50
    const a = createMockTalent({ personality: "collaborative", tier: "C_LIST" });
    const b = createMockTalent({ personality: "charismatic", tier: "C_LIST" });
    expect(calculateCompatibility(a, b)).toBe(50);
  });

  it("ignores missing personality/archetype fields without throwing", () => {
    const a = createMockTalent({ personality: undefined, actorArchetype: undefined });
    const b = createMockTalent({ personality: undefined, actorArchetype: undefined });
    // age 0-diff (+15) + same country (+10) + same tier (+10) = 35
    expect(calculateCompatibility(a, b)).toBe(35);
  });
});

describe("calculatePowerCoupleRating", () => {
  it("sums prestige, draw, and starMeter for both talents", () => {
    const a = createMockTalent({ prestige: 80, draw: 60, starMeter: 70 });
    const b = createMockTalent({ prestige: 50, draw: 50, starMeter: 50 });
    expect(calculatePowerCoupleRating(a, b)).toBe(360);
  });

  it("returns 0 when either talent is missing", () => {
    expect(calculatePowerCoupleRating(undefined, createMockTalent())).toBe(0);
    expect(calculatePowerCoupleRating(createMockTalent(), undefined)).toBe(0);
  });
});
