import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  evaluateAcquisitionTarget,
  executeAcquisition,
  executeSabotage,
  executePoach
} from '../../../engine/systems/mergers';
import { GameState, RivalStudio, Talent } from '../../../engine/types';
import { RandomGenerator } from '../../../engine/utils/rng';

describe('Mergers and Sabotage System', () => {
  let mockState: GameState;
  let mockTarget: RivalStudio;
  const rng = new RandomGenerator(333);

  beforeEach(() => {
    mockTarget = {
      id: 'rival-1',
      name: 'Test Indie Studio',
      motto: 'We make test films',
      archetype: 'indie',
      strength: 10,
      cash: 5_000_000,
      prestige: 20,
      recentActivity: 'Testing',
      foundedWeek: 1,
      projectCount: 2,
      strategy: 'genre_specialist',
      genreFocus: 'Horror',
      motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 },
      currentMotivation: 'STABILITY',
      projects: {},
      contracts: []
    };

    mockState = {
      week: 10,
      gameSeed: 12345,
      tickCount: 0,
      projects: { active: [] },
      game: { currentWeek: 10 },
      finance: { cash: 100_000_000, ledger: [] },
      news: { headlines: [] },
      ip: { vault: [], franchises: {} },
      studio: {
        name: 'Player Studio',
        archetype: 'major',
        prestige: 50,
        internal: {
          projects: {},
          contracts: []
        }
      },
      market: {
        opportunities: [],
        buyers: [],
        trends: [],
        activeMarketEvents: []
      },
      industry: {
        rivals: [mockTarget],
        families: [],
        agencies: [],
        agents: [],
        talentPool: {} as Record<string, Talent>,
        newsHistory: [],
        rumors: []
      },
      culture: {
        genrePopularity: {}
      },
      history: [],
      eventHistory: []
    } as unknown as GameState;
  });

  describe('evaluateAcquisitionTarget', () => {
    it('calculates viable acquisition for indie target', () => {
      const result = evaluateAcquisitionTarget(mockTarget, 100_000_000);
      expect(result.viable).toBe(true);
      // Indie price = basePrice * 1.2. basePrice = (10*2m) + 5m = 25m. 25m * 1.2 = 30m.
      expect(result.price).toBe(30_000_000);
    });

    it('calculates viable acquisition for major target', () => {
      const majorTarget = { ...mockTarget, archetype: 'major' as const };
      const result = evaluateAcquisitionTarget(majorTarget, 100_000_000);
      expect(result.viable).toBe(true);
      // Major price = basePrice * 2.0. basePrice = 25m. 25m * 2 = 50m.
      expect(result.price).toBe(50_000_000);
    });

    it('returns not viable if buyer cash is insufficient', () => {
      const result = evaluateAcquisitionTarget(mockTarget, 10_000_000);
      expect(result.viable).toBe(false);
      expect(result.price).toBe(30_000_000);
    });
  });

  describe('executeAcquisition', () => {
    it('returns null if target ID is invalid', () => {
      const impact = executeAcquisition(mockState, 'invalid-id', rng);
      expect(impact).toBeNull();
    });

    it('successfully executes acquisition impact', () => {
      const impact = executeAcquisition(mockState, mockTarget.id, rng);

      // Price 30m, but we get target's 5m cash. Net -25m
      expect(impact!.cashChange).toBe(-25000000);
      expect(impact!.prestigeChange).toBeGreaterThan(0);

      expect(impact!.newHeadlines).toHaveLength(1);
      const headline = impact!.newHeadlines![0];
      expect(headline.text).toContain('absorbs Test Indie Studio');
    });
  });

  describe('executeSabotage', () => {
    it('successfully executes sabotage impact and generates a rumor', () => {
      const impact = executeSabotage(mockState, mockTarget.id, rng);
      expect(impact!.cashChange).toBe(-1_000_000);
      expect(impact!.newRumors).toHaveLength(1);
    });
  });

  describe('executePoach', () => {
    it('successfully executes poach impact, stealing strength', () => {
      const impact = executePoach(mockState, mockTarget.id, rng);
      expect(impact!.cashChange).toBe(-3_000_000);
      expect(impact!.prestigeChange).toBe(5);
      expect(impact!.rivalUpdates![0].update.strength).toBe(5); // 10 - 5
    });
  });
});
