import { describe, it, expect } from 'vitest';
import { getFilmStats, getTvStats, getUnscriptedStats } from '@/engine/systems/stats';
import { BUDGET_TIERS } from '@/engine/data/budgetTiers';
import { TV_FORMATS } from '@/engine/data/tvFormats';
import { UNSCRIPTED_FORMATS } from '@/engine/data/unscriptedFormats';

describe('stats system', () => {
  describe('getFilmStats', () => {
    it('calculates film stats correctly for mid tier (budget < 100M)', () => {
      const tier = BUDGET_TIERS.mid;
      const stats = getFilmStats(tier);

      expect(stats.budget).toBe(tier.budget);
      expect(stats.weeklyCost).toBe(tier.weeklyCost);
      expect(stats.developmentWeeks).toBe(tier.developmentWeeks);
      expect(stats.productionWeeks).toBe(tier.productionWeeks);
      expect(stats.renewable).toBe(false);
    });

    it('applies 1.2x risk multiplier for blockbuster tier (budget >= 100M)', () => {
      const tier = BUDGET_TIERS.blockbuster;
      const stats = getFilmStats(tier);
      const riskMultiplier = 1.2;

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

    it('calculates TV stats correctly for mid tier (budget <= 50M)', () => {
      const tier = BUDGET_TIERS.mid;
      const stats = getTvStats(tier, format, episodes);

      const scaleMultiplier = 1.0;
      const expectedWeeklyCost = tier.weeklyCost * format.productionCostMultiplier * scaleMultiplier;
      const expectedProductionWeeks = Math.ceil(episodes * format.productionWeeksPerEpisode * scaleMultiplier);
      const expectedDevelopmentWeeks = Math.ceil(tier.developmentWeeks * format.developmentWeeksModifier * scaleMultiplier);
      const expectedBudget = expectedWeeklyCost * expectedProductionWeeks + (tier.budget * 0.3);

      expect(stats.weeklyCost).toBe(expectedWeeklyCost);
      expect(stats.productionWeeks).toBe(expectedProductionWeeks);
      expect(stats.developmentWeeks).toBe(expectedDevelopmentWeeks);
      expect(stats.budget).toBe(expectedBudget);
      expect(stats.renewable).toBe(format.renewable);
    });

    it('applies 1.25x scale multiplier for high tier (budget > 50M)', () => {
      const tier = BUDGET_TIERS.high;
      const stats = getTvStats(tier, format, episodes);

      const scaleMultiplier = 1.25;
      const expectedWeeklyCost = tier.weeklyCost * format.productionCostMultiplier * scaleMultiplier;
      const expectedProductionWeeks = Math.ceil(episodes * format.productionWeeksPerEpisode * scaleMultiplier);
      const expectedDevelopmentWeeks = Math.ceil(tier.developmentWeeks * format.developmentWeeksModifier * scaleMultiplier);
      const expectedBudget = expectedWeeklyCost * expectedProductionWeeks + (tier.budget * 0.3);

      expect(stats.weeklyCost).toBe(expectedWeeklyCost);
      expect(stats.productionWeeks).toBe(expectedProductionWeeks);
      expect(stats.developmentWeeks).toBe(expectedDevelopmentWeeks);
      expect(stats.budget).toBe(expectedBudget);
    });

    it('applies 1.4x scale multiplier for blockbuster tier (budget >= 100M)', () => {
      const tier = BUDGET_TIERS.blockbuster;
      const stats = getTvStats(tier, format, episodes);

      const scaleMultiplier = 1.4;
      const expectedWeeklyCost = tier.weeklyCost * format.productionCostMultiplier * scaleMultiplier;
      const expectedProductionWeeks = Math.ceil(episodes * format.productionWeeksPerEpisode * scaleMultiplier);
      const expectedDevelopmentWeeks = Math.ceil(tier.developmentWeeks * format.developmentWeeksModifier * scaleMultiplier);
      const expectedBudget = expectedWeeklyCost * expectedProductionWeeks + (tier.budget * 0.3);

      expect(stats.weeklyCost).toBe(expectedWeeklyCost);
      expect(stats.productionWeeks).toBe(expectedProductionWeeks);
      expect(stats.developmentWeeks).toBe(expectedDevelopmentWeeks);
      expect(stats.budget).toBe(expectedBudget);
    });
  });

  describe('getUnscriptedStats', () => {
    const format = UNSCRIPTED_FORMATS.competition;
    const episodes = 8;

    it('calculates unscripted stats correctly for mid tier (budget <= 50M)', () => {
      const tier = BUDGET_TIERS.mid;
      const stats = getUnscriptedStats(tier, format, episodes);

      const scaleMultiplier = 1.0;
      const expectedWeeklyCost = tier.weeklyCost * format.productionCostMultiplier * scaleMultiplier;
      const expectedProductionWeeks = Math.ceil(episodes * format.productionWeeksPerEpisode);
      const expectedDevelopmentWeeks = Math.ceil(tier.developmentWeeks * format.developmentWeeksModifier);
      const expectedBudget = expectedWeeklyCost * expectedProductionWeeks + (tier.budget * 0.15);

      expect(stats.weeklyCost).toBe(expectedWeeklyCost);
      expect(stats.productionWeeks).toBe(expectedProductionWeeks);
      expect(stats.developmentWeeks).toBe(expectedDevelopmentWeeks);
      expect(stats.budget).toBe(expectedBudget);
      expect(stats.renewable).toBe(format.renewable);
    });

    it('applies 1.15x scale multiplier for high tier (budget > 50M) for weekly cost only', () => {
      const tier = BUDGET_TIERS.high;
      const stats = getUnscriptedStats(tier, format, episodes);

      const scaleMultiplier = 1.15;
      const expectedWeeklyCost = tier.weeklyCost * format.productionCostMultiplier * scaleMultiplier;
      const expectedProductionWeeks = Math.ceil(episodes * format.productionWeeksPerEpisode);
      const expectedDevelopmentWeeks = Math.ceil(tier.developmentWeeks * format.developmentWeeksModifier);
      const expectedBudget = expectedWeeklyCost * expectedProductionWeeks + (tier.budget * 0.15);

      expect(stats.weeklyCost).toBe(expectedWeeklyCost);
      expect(stats.productionWeeks).toBe(expectedProductionWeeks);
      expect(stats.developmentWeeks).toBe(expectedDevelopmentWeeks);
      expect(stats.budget).toBe(expectedBudget);
    });

    it('applies 1.3x scale multiplier for blockbuster tier (budget >= 100M)', () => {
      const tier = BUDGET_TIERS.blockbuster;
      const stats = getUnscriptedStats(tier, format, episodes);

      const scaleMultiplier = 1.3;
      const expectedWeeklyCost = tier.weeklyCost * format.productionCostMultiplier * scaleMultiplier;
      const expectedProductionWeeks = Math.ceil(episodes * format.productionWeeksPerEpisode);
      const expectedDevelopmentWeeks = Math.ceil(tier.developmentWeeks * format.developmentWeeksModifier);
      const expectedBudget = expectedWeeklyCost * expectedProductionWeeks + (tier.budget * 0.15);

      expect(stats.weeklyCost).toBe(expectedWeeklyCost);
      expect(stats.productionWeeks).toBe(expectedProductionWeeks);
      expect(stats.developmentWeeks).toBe(expectedDevelopmentWeeks);
      expect(stats.budget).toBe(expectedBudget);
    });
  });
});
