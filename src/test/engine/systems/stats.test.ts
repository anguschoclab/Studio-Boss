import { describe, it, expect } from 'vitest';
import { getFilmStats, getTvStats, getUnscriptedStats } from '@/engine/systems/stats';
import { BUDGET_TIERS } from '@/engine/data/budgetTiers';
import { TV_FORMATS } from '@/engine/data/tvFormats';
import { UNSCRIPTED_FORMATS } from '@/engine/data/unscriptedFormats';

describe('stats system', () => {
  describe('getFilmStats', () => {
    it('calculates film stats correctly for mid tier (budget < 50M)', () => {
      const tier = BUDGET_TIERS.mid; // budget is 30M
      const stats = getFilmStats(tier);
      const riskMultiplier = 1.5; // budget < 50M

      expect(stats.budget).toBe(tier.budget);
      expect(stats.weeklyCost).toBe(tier.weeklyCost * riskMultiplier);
      expect(stats.developmentWeeks).toBe(Math.ceil(tier.developmentWeeks * riskMultiplier));
      expect(stats.productionWeeks).toBe(Math.ceil(tier.productionWeeks * riskMultiplier));
      expect(stats.renewable).toBe(false);
    });

    it('applies 3.0x risk multiplier for mid-high tier (budget >= 50M)', () => {
        const tier: typeof BUDGET_TIERS.high = { ...BUDGET_TIERS.high, budget: 50_000_000 };
        const stats = getFilmStats(tier);
        const riskMultiplier = 3.0;
  
        expect(stats.budget).toBe(tier.budget);
        expect(stats.weeklyCost).toBe(tier.weeklyCost * riskMultiplier);
    });

    it('applies 6.0x risk multiplier for high tier (budget >= 100M)', () => {
      const tier: typeof BUDGET_TIERS.high = { ...BUDGET_TIERS.high, budget: 100_000_000 };
      const stats = getFilmStats(tier);
      const riskMultiplier = 6.0;

      expect(stats.budget).toBe(tier.budget);
      expect(stats.weeklyCost).toBe(tier.weeklyCost * riskMultiplier);
      expect(stats.developmentWeeks).toBe(Math.ceil(tier.developmentWeeks * riskMultiplier));
      expect(stats.productionWeeks).toBe(Math.ceil(tier.productionWeeks * riskMultiplier));
      expect(stats.renewable).toBe(false);
    });

    it('applies 12.0x risk multiplier for blockbuster tier (budget >= 200M)', () => {
      const tier = BUDGET_TIERS.blockbuster;
      const stats = getFilmStats(tier);
      const riskMultiplier = 12.0;

      expect(stats.budget).toBe(tier.budget);
      expect(stats.weeklyCost).toBe(tier.weeklyCost * riskMultiplier);
      expect(stats.developmentWeeks).toBe(Math.ceil(tier.developmentWeeks * riskMultiplier));
      expect(stats.productionWeeks).toBe(Math.ceil(tier.productionWeeks * riskMultiplier));
      expect(stats.renewable).toBe(false);
    });
  });

  describe('getTvStats', () => {
    const format = TV_FORMATS.sitcom;
    const episodes = 10;

    it('calculates TV stats correctly for low-mid tier (budget <= 50M)', () => {
      const tier = BUDGET_TIERS.mid; // budget is 30M
      const stats = getTvStats(tier, format, episodes);

      const scaleMultiplier = 1.5; // budget <= 50M
      const expectedWeeklyCost = tier.weeklyCost * format.productionCostMultiplier * scaleMultiplier;
      const expectedProductionWeeks = Math.ceil(episodes * format.productionWeeksPerEpisode * scaleMultiplier);
      const expectedDevelopmentWeeks = Math.ceil(tier.developmentWeeks * format.developmentWeeksModifier * scaleMultiplier);
      const expectedBudget = expectedWeeklyCost * expectedProductionWeeks + (tier.budget * 0.4);

      expect(stats.weeklyCost).toBe(expectedWeeklyCost);
      expect(stats.productionWeeks).toBe(expectedProductionWeeks);
      expect(stats.developmentWeeks).toBe(expectedDevelopmentWeeks);
      expect(stats.budget).toBe(expectedBudget);
      expect(stats.renewable).toBe(format.renewable);
    });

    it('applies 4.0x scale multiplier for mid-high tier (budget > 50M)', () => {
        const tier: typeof BUDGET_TIERS.high = { ...BUDGET_TIERS.high, budget: 60_000_000 };
        const stats = getTvStats(tier, format, episodes);
  
        const scaleMultiplier = 4.0;
        expect(stats.weeklyCost).toBe(tier.weeklyCost * format.productionCostMultiplier * scaleMultiplier);
    });

    it('applies 5.0x scale multiplier for high tier (budget >= 100M)', () => {
      const tier: typeof BUDGET_TIERS.high = { ...BUDGET_TIERS.high, budget: 100_000_000 };
      const stats = getTvStats(tier, format, episodes);

      const scaleMultiplier = 5.0;
      const expectedWeeklyCost = tier.weeklyCost * format.productionCostMultiplier * scaleMultiplier;
      const expectedProductionWeeks = Math.ceil(episodes * format.productionWeeksPerEpisode * scaleMultiplier);
      const expectedDevelopmentWeeks = Math.ceil(tier.developmentWeeks * format.developmentWeeksModifier * scaleMultiplier);
      const expectedBudget = expectedWeeklyCost * expectedProductionWeeks + (tier.budget * 0.4);

      expect(stats.weeklyCost).toBe(expectedWeeklyCost);
      expect(stats.productionWeeks).toBe(expectedProductionWeeks);
      expect(stats.developmentWeeks).toBe(expectedDevelopmentWeeks);
      expect(stats.budget).toBe(expectedBudget);
    });

    it('applies 8.0x scale multiplier for blockbuster tier (budget >= 150M)', () => {
      const tier = BUDGET_TIERS.blockbuster;
      const stats = getTvStats(tier, format, episodes);

      const scaleMultiplier = 8.0;
      const expectedWeeklyCost = tier.weeklyCost * format.productionCostMultiplier * scaleMultiplier;
      const expectedProductionWeeks = Math.ceil(episodes * format.productionWeeksPerEpisode * scaleMultiplier);
      const expectedDevelopmentWeeks = Math.ceil(tier.developmentWeeks * format.developmentWeeksModifier * scaleMultiplier);
      const expectedBudget = expectedWeeklyCost * expectedProductionWeeks + (tier.budget * 0.4);

      expect(stats.weeklyCost).toBe(expectedWeeklyCost);
      expect(stats.productionWeeks).toBe(expectedProductionWeeks);
      expect(stats.developmentWeeks).toBe(expectedDevelopmentWeeks);
      expect(stats.budget).toBe(expectedBudget);
    });
  });

  describe('getUnscriptedStats', () => {
    const format = UNSCRIPTED_FORMATS.competition;
    const episodes = 8;

    it('calculates unscripted stats correctly for low-mid tier (budget <= 50M)', () => {
      const tier = BUDGET_TIERS.mid; // 30M
      const stats = getUnscriptedStats(tier, format, episodes);

      const scaleMultiplier = 1.5; // budget <= 50M
      const expectedWeeklyCost = tier.weeklyCost * format.productionCostMultiplier * scaleMultiplier;
      const expectedProductionWeeks = Math.ceil(episodes * format.productionWeeksPerEpisode);
      const expectedDevelopmentWeeks = Math.ceil(tier.developmentWeeks * format.developmentWeeksModifier);
      const expectedBudget = expectedWeeklyCost * expectedProductionWeeks + (tier.budget * 0.20);

      expect(stats.weeklyCost).toBe(expectedWeeklyCost);
      expect(stats.productionWeeks).toBe(expectedProductionWeeks);
      expect(stats.developmentWeeks).toBe(expectedDevelopmentWeeks);
      expect(stats.budget).toBe(expectedBudget);
      expect(stats.renewable).toBe(format.renewable);
    });

    it('applies 4.0x scale multiplier for mid-high tier (budget > 50M)', () => {
        const tier: typeof BUDGET_TIERS.high = { ...BUDGET_TIERS.high, budget: 60_000_000 };
        const stats = getUnscriptedStats(tier, format, episodes);
  
        const scaleMultiplier = 4.0;
        expect(stats.weeklyCost).toBe(tier.weeklyCost * format.productionCostMultiplier * scaleMultiplier);
    });

    it('applies 6.0x scale multiplier for high tier (budget >= 100M)', () => {
      const tier: typeof BUDGET_TIERS.high = { ...BUDGET_TIERS.high, budget: 100_000_000 };
      const stats = getUnscriptedStats(tier, format, episodes);

      const scaleMultiplier = 6.0;
      const expectedWeeklyCost = tier.weeklyCost * format.productionCostMultiplier * scaleMultiplier;
      const expectedProductionWeeks = Math.ceil(episodes * format.productionWeeksPerEpisode);
      const expectedDevelopmentWeeks = Math.ceil(tier.developmentWeeks * format.developmentWeeksModifier);
      const expectedBudget = expectedWeeklyCost * expectedProductionWeeks + (tier.budget * 0.20);

      expect(stats.weeklyCost).toBe(expectedWeeklyCost);
      expect(stats.productionWeeks).toBe(expectedProductionWeeks);
      expect(stats.developmentWeeks).toBe(expectedDevelopmentWeeks);
      expect(stats.budget).toBe(expectedBudget);
    });
  });

  describe('Extreme Edge Cases (Guild Auditor)', () => {
    it('handles negative budget safely by using base multiplier', () => {
      const negativeTier = { ...BUDGET_TIERS.mid, budget: -10_000_000 };
      const stats = getFilmStats(negativeTier as any);
      const riskMultiplier = 1.5;

      expect(stats.budget).toBe(-10_000_000);
      expect(stats.weeklyCost).toBe(negativeTier.weeklyCost * riskMultiplier);
    });

    it('handles 0 budget safely', () => {
      const zeroTier = { ...BUDGET_TIERS.low, budget: 0 };
      const stats = getFilmStats(zeroTier as any);
      const riskMultiplier = 1.5;

      expect(stats.budget).toBe(0);
      expect(stats.weeklyCost).toBe(zeroTier.weeklyCost * riskMultiplier);
    });
  });
});
