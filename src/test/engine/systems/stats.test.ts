import { describe, it, expect } from "vitest";
import { getFilmStats, getTvStats, getUnscriptedStats } from "../../../engine/systems/stats";
import { BUDGET_TIERS } from "../../../engine/data/budgetTiers";
import { TV_FORMATS } from "../../../engine/data/tvFormats";
import { UNSCRIPTED_FORMATS } from "../../../engine/data/unscriptedFormats";

describe("stats calculations", () => {
  describe("getFilmStats", () => {
    it("applies 1.0x multiplier to standard budgets (< 100M)", () => {
      const midTier = BUDGET_TIERS["mid"];
      const stats = getFilmStats(midTier);

      expect(stats.budget).toBe(midTier.budget);
      expect(stats.weeklyCost).toBe(midTier.weeklyCost);
      expect(stats.developmentWeeks).toBe(midTier.developmentWeeks);
      expect(stats.productionWeeks).toBe(midTier.productionWeeks);
      expect(stats.renewable).toBe(false);
    });

    it("applies 1.2x risk multiplier to blockbuster budgets (>= 100M)", () => {
      const hugeTier = { ...BUDGET_TIERS["blockbuster"], budget: 150000000 };
      const stats = getFilmStats(hugeTier);

      expect(stats.weeklyCost).toBe(hugeTier.weeklyCost * 1.2);
      expect(stats.developmentWeeks).toBe(Math.ceil(hugeTier.developmentWeeks * 1.2));
      expect(stats.productionWeeks).toBe(Math.ceil(hugeTier.productionWeeks * 1.2));
    });
  });

  describe("getTvStats", () => {
    it("applies 1.0x multiplier for TV budgets <= 50M", () => {
      const lowTier = BUDGET_TIERS["low"]; // Budget < 5M
      const sitcom = TV_FORMATS["sitcom"];
      const eps = 10;

      const stats = getTvStats(lowTier, sitcom, eps);

      const expectedWeeklyCost = lowTier.weeklyCost * sitcom.productionCostMultiplier;
      const expectedProdWeeks = Math.ceil(eps * sitcom.productionWeeksPerEpisode);

      expect(stats.weeklyCost).toBeCloseTo(expectedWeeklyCost);
      expect(stats.productionWeeks).toBe(expectedProdWeeks);
      expect(stats.developmentWeeks).toBe(Math.ceil(lowTier.developmentWeeks * sitcom.developmentWeeksModifier));

      // Checking overhead multiplier (0.3)
      const expectedBudget = (expectedWeeklyCost * expectedProdWeeks) + (lowTier.budget * 0.3);
      expect(stats.budget).toBeCloseTo(expectedBudget);
    });

    it("applies 1.25x scaling multiplier for large TV budgets (> 50M)", () => {
      const highTier = { ...BUDGET_TIERS["high"], budget: 60000000 };
      const prestigeDrama = TV_FORMATS["prestige_drama"];
      const eps = 10;

      const stats = getTvStats(highTier, prestigeDrama, eps);

      const scaleMultiplier = 1.25;
      const expectedWeeklyCost = highTier.weeklyCost * prestigeDrama.productionCostMultiplier * scaleMultiplier;
      const expectedProdWeeks = Math.ceil(eps * prestigeDrama.productionWeeksPerEpisode * scaleMultiplier);
      const expectedDevWeeks = Math.ceil(highTier.developmentWeeks * prestigeDrama.developmentWeeksModifier * scaleMultiplier);

      expect(stats.weeklyCost).toBeCloseTo(expectedWeeklyCost);
      expect(stats.productionWeeks).toBe(expectedProdWeeks);
      expect(stats.developmentWeeks).toBe(expectedDevWeeks);
    });
  });

  describe("getUnscriptedStats", () => {
    it("applies 1.0x multiplier for Unscripted budgets <= 50M", () => {
      const midTier = BUDGET_TIERS["mid"]; // Budget < 50M
      const reality = UNSCRIPTED_FORMATS["reality_ensemble"];
      const eps = 12;

      const stats = getUnscriptedStats(midTier, reality, eps);

      const expectedWeeklyCost = midTier.weeklyCost * reality.productionCostMultiplier;
      const expectedProdWeeks = Math.ceil(eps * reality.productionWeeksPerEpisode);

      expect(stats.weeklyCost).toBeCloseTo(expectedWeeklyCost);
      expect(stats.productionWeeks).toBe(expectedProdWeeks);
      expect(stats.developmentWeeks).toBe(Math.ceil(midTier.developmentWeeks * reality.developmentWeeksModifier));

      // Checking overhead multiplier (0.15)
      const expectedBudget = (expectedWeeklyCost * expectedProdWeeks) + (midTier.budget * 0.15);
      expect(stats.budget).toBeCloseTo(expectedBudget);
    });

    it("applies 1.15x scaling multiplier for large Unscripted budgets (> 50M)", () => {
      const highTier = { ...BUDGET_TIERS["high"], budget: 55000000 };
      const competition = UNSCRIPTED_FORMATS["competition"];
      const eps = 10;

      const stats = getUnscriptedStats(highTier, competition, eps);

      const scaleMultiplier = 1.15;
      const expectedWeeklyCost = highTier.weeklyCost * competition.productionCostMultiplier * scaleMultiplier;
      const expectedProdWeeks = Math.ceil(eps * competition.productionWeeksPerEpisode); // unscripted does not apply multiplier to prod weeks
      const expectedDevWeeks = Math.ceil(highTier.developmentWeeks * competition.developmentWeeksModifier); // dev weeks also unaffected

      expect(stats.weeklyCost).toBeCloseTo(expectedWeeklyCost);
      expect(stats.productionWeeks).toBe(expectedProdWeeks);
      expect(stats.developmentWeeks).toBe(expectedDevWeeks);
    });
  });
});
