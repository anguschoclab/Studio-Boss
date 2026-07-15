import { describe, it, expect } from "vitest";
import {
  ACTOR_ARCHETYPES,
  WRITER_ARCHETYPES,
  PRODUCER_ARCHETYPES,
  PERSONALITY_ARCHETYPES,
  generateArchetypeForRole,
} from "@/engine/data/talentArchetypes";
import type { TalentTier } from "@/engine/types/talent.types";

const VALID_TIERS: TalentTier[] = ["A_LIST", "B_LIST", "C_LIST", "RISING_STAR", "NEWCOMER"];

function makeMockRng(nextValue: number = 0.5) {
  return {
    next: () => nextValue,
  };
}

describe("talentArchetypes", () => {
  describe("tierBias arrays contain valid TalentTier strings", () => {
    it("all ACTOR_ARCHETYPES tierBias values are valid TalentTier strings", () => {
      for (const archetype of Object.values(ACTOR_ARCHETYPES)) {
        for (const tier of archetype.tierBias) {
          expect(VALID_TIERS).toContain(tier);
        }
      }
    });

    it("all WRITER_ARCHETYPES tierBias values are valid TalentTier strings", () => {
      for (const archetype of Object.values(WRITER_ARCHETYPES)) {
        for (const tier of archetype.tierBias) {
          expect(VALID_TIERS).toContain(tier);
        }
      }
    });

    it("all PRODUCER_ARCHETYPES tierBias values are valid TalentTier strings", () => {
      for (const archetype of Object.values(PRODUCER_ARCHETYPES)) {
        for (const tier of archetype.tierBias) {
          expect(VALID_TIERS).toContain(tier);
        }
      }
    });

    it("all PERSONALITY_ARCHETYPES tierBias values are valid TalentTier strings", () => {
      for (const archetype of Object.values(PERSONALITY_ARCHETYPES)) {
        for (const tier of archetype.tierBias) {
          expect(VALID_TIERS).toContain(tier);
        }
      }
    });
  });

  describe("generateArchetypeForRole", () => {
    it("returns archetypes matching A_LIST tier for actors", () => {
      const rng = makeMockRng(0.5);
      const result = generateArchetypeForRole("actor", "A_LIST", rng);
      // Should return an archetype whose tierBias includes 'A_LIST'
      expect(result).toBeDefined();
      const archetype = ACTOR_ARCHETYPES[result as keyof typeof ACTOR_ARCHETYPES];
      expect(archetype).toBeDefined();
      expect(archetype.tierBias).toContain("A_LIST");
    });

    it("returns archetypes matching NEWCOMER tier for actors", () => {
      const rng = makeMockRng(0.5);
      const result = generateArchetypeForRole("actor", "NEWCOMER", rng);
      expect(result).toBeDefined();
      const archetype = ACTOR_ARCHETYPES[result as keyof typeof ACTOR_ARCHETYPES];
      expect(archetype).toBeDefined();
      expect(archetype.tierBias).toContain("NEWCOMER");
    });

    it("returns archetypes matching B_LIST tier for writers", () => {
      const rng = makeMockRng(0.5);
      const result = generateArchetypeForRole("writer", "B_LIST", rng);
      expect(result).toBeDefined();
      const archetype = WRITER_ARCHETYPES[result as keyof typeof WRITER_ARCHETYPES];
      expect(archetype).toBeDefined();
      expect(archetype.tierBias).toContain("B_LIST");
    });

    it("falls back to all archetypes if no tier match (RISING_STAR)", () => {
      const rng = makeMockRng(0.5);
      const result = generateArchetypeForRole("actor", "RISING_STAR", rng);
      // RISING_STAR is not in any tierBias, so should fall back to all actor archetypes
      expect(result).toBeDefined();
      expect(Object.keys(ACTOR_ARCHETYPES)).toContain(result);
    });
  });
});
