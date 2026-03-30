import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  evaluateAcquisitionTarget,
  executeAcquisition,
  executeSabotage,
  executePoach
} from '../../../engine/systems/mergers';
import { GameState, RivalStudio } from '../../../engine/types';

describe('Mergers and Sabotage System', () => {
  let mockState: GameState;
  let mockTarget: RivalStudio;

  beforeEach(() => {
    // Mock crypto.randomUUID for deterministic testing of generated headlines/opportunities
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('test-uuid-1234' as `${string}-${string}-${string}-${string}-${string}`);

    mockTarget = {
      id: 'rival-1',
      name: 'Test Indie Studio',
      motto: 'We make test films',
      archetype: 'indie',
      strength: 10,
      cash: 5_000_000, // Base value: Math.max(10_000_000, 10 * 2M + 5M) = 25M
      prestige: 20,
      recentActivity: 'Testing',
      projectCount: 2,
      genreFocus: 'Horror',
      strategy: 'genre_specialist'
    };

    mockState = {
      week: 10,
      cash: 100_000_000,
      studio: {
        name: 'Player Studio',
        archetype: 'major',
        prestige: 50,
        internal: {
          projects: [],
          contracts: [],
          financeHistory: []
        }
      },
      market: {
        opportunities: [],
        buyers: []
      },
      industry: {
        rivals: [mockTarget],
        headlines: [],
        families: [],
        agencies: [],
        agents: [],
        talentPool: [],
        newsHistory: [],
        rumors: []
      },
      culture: {
        genrePopularity: {}
      },
      finance: {
        bankBalance: 0,
        yearToDateRevenue: 0,
        yearToDateExpenses: 0
      },
      history: []
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('evaluateAcquisitionTarget', () => {
    it('calculates viable acquisition for indie target', () => {
      // strength 10 * 2M = 20M + 5M cash = 25M base price.
      // indie archetype multiplier = 1.2 -> 25M * 1.2 = 30M
      const result = evaluateAcquisitionTarget(mockTarget, 100_000_000);
      expect(result.viable).toBe(true);
      expect(result.price).toBe(30_000_000);
    });

    it('calculates viable acquisition for major target', () => {
      const majorTarget = { ...mockTarget, archetype: 'major' as const };
      // base price 25M. major multiplier 2.0 -> 50M
      const result = evaluateAcquisitionTarget(majorTarget, 100_000_000);
      expect(result.viable).toBe(true);
      expect(result.price).toBe(50_000_000);
    });

    it('returns not viable if buyer cash is insufficient', () => {
      const result = evaluateAcquisitionTarget(mockTarget, 10_000_000);
      expect(result.viable).toBe(false);
      expect(result.price).toBe(30_000_000);
      expect(result.reason).toBe('Insufficient funds for acquisition.');
    });

    it('applies minimum base price of 10M before archetype multiplier', () => {
      const weakTarget = { ...mockTarget, strength: 1, cash: 1_000_000 };
      // strength 1 * 2M + 1M = 3M. Math.max(10M, 3M) = 10M base price.
      // indie multiplier 1.2 -> 12M
      const result = evaluateAcquisitionTarget(weakTarget, 100_000_000);
      expect(result.viable).toBe(true);
      expect(result.price).toBe(12_000_000);
    });

    it('calculates viable acquisition for mid-tier target without archetype multiplier', () => {
      const midTierTarget = { ...mockTarget, archetype: 'mid-tier' as const };
      // base price 25M. mid-tier has no multiplier -> 25M
      const result = evaluateAcquisitionTarget(midTierTarget, 100_000_000);
      expect(result.viable).toBe(true);
      expect(result.price).toBe(25_000_000);
    });
  });

  describe('executeAcquisition', () => {
    it('returns unmodified state if target ID is invalid', () => {
      const newState = executeAcquisition(mockState, 'invalid-id');
      expect(newState).toBe(mockState);
    });

    it('returns unmodified state if target is not viable due to low cash', () => {
      mockState.cash = 10_000_000; // Not enough for 30M price
      const newState = executeAcquisition(mockState, mockTarget.id);
      expect(newState).toBe(mockState);
    });

    it('successfully executes acquisition and updates game state', () => {
      const newState = executeAcquisition(mockState, mockTarget.id);

      // Cash reduced
      expect(newState.cash).toBe(100_000_000 - 30_000_000);

      // Target removed from rivals
      expect(newState.industry.rivals).toHaveLength(0);

      // Studio prestige boosted (50 + target.strength 10 * 0.2 = 52)
      expect(newState.studio.prestige).toBe(52);

      // New opportunity created
      expect(newState.market.opportunities).toHaveLength(1);
      const opportunity = newState.market.opportunities[0];
      expect(opportunity.id).toBe('test-uuid-1234');
      expect(opportunity.title).toBe('Acquired Test Indie Studio IP Catalog');
      expect(opportunity.genre).toBe('Horror');

      // New headline generated
      expect(newState.industry.headlines).toHaveLength(1);
      const headline = newState.industry.headlines[0];
      expect(headline.category).toBe('market');
      expect(headline.text).toBe('INDUSTRY SHOCKER: Player Studio acquires Test Indie Studio in a historic $30.0M buyout!');
    });

    it('caps studio prestige at 100 after acquisition', () => {
      mockState.studio.prestige = 99;
      const newState = executeAcquisition(mockState, mockTarget.id);
      expect(newState.studio.prestige).toBe(100);
    });
  });

  describe('executeSabotage', () => {
    it('returns unmodified state if target ID is invalid', () => {
      const newState = executeSabotage(mockState, 'invalid-id');
      expect(newState).toBe(mockState);
    });

    it('returns unmodified state if buyer cash is less than 1M', () => {
      mockState.cash = 500_000;
      const newState = executeSabotage(mockState, mockTarget.id);
      expect(newState).toBe(mockState);
    });

    it('successfully executes sabotage and generates a rumor', () => {
      const newState = executeSabotage(mockState, mockTarget.id);

      // Cash reduced by 1M
      expect(newState.cash).toBe(99_000_000);

      // New rumor generated
      expect(newState.industry.rumors).toHaveLength(1);
      const rumor = newState.industry.rumors![0];
      expect(rumor.id).toBe('test-uuid-1234');
      expect(rumor.text).toBe(`Rumors swirl that Test Indie Studio's upcoming blockbuster is facing massive reshoots.`);
      expect(rumor.category).toBe('rival');
      expect(rumor.truthful).toBe(false);
      expect(rumor.resolved).toBe(false);
    });
  });

  describe('executePoach', () => {
    it('returns unmodified state if target ID is invalid', () => {
      const newState = executePoach(mockState, 'invalid-id');
      expect(newState).toBe(mockState);
    });

    it('returns unmodified state if buyer cash is less than 3M', () => {
      mockState.cash = 2_000_000;
      const newState = executePoach(mockState, mockTarget.id);
      expect(newState).toBe(mockState);
    });

    it('successfully executes poach, stealing strength and boosting prestige', () => {
      const newState = executePoach(mockState, mockTarget.id);

      // Cash reduced by 3M
      expect(newState.cash).toBe(97_000_000);

      // Target strength reduced (steal amount is min(5, target.strength) = 5)
      expect(newState.industry.rivals[0].strength).toBe(5);

      // Studio prestige increased by steal amount
      expect(newState.studio.prestige).toBe(55);

      // New headline generated
      expect(newState.industry.headlines).toHaveLength(1);
      const headline = newState.industry.headlines[0];
      expect(headline.category).toBe('talent');
      expect(headline.text).toBe('Player Studio poaches top executive from Test Indie Studio!');
    });

    it('caps stolen strength if target strength is low', () => {
      mockTarget.strength = 3;
      const newState = executePoach(mockState, mockTarget.id);

      expect(newState.industry.rivals[0].strength).toBe(0); // 3 - 3 = 0
      expect(newState.studio.prestige).toBe(53); // 50 + 3 = 53
    });

    it('caps studio prestige at 100 after poaching', () => {
      mockState.studio.prestige = 98;
      const newState = executePoach(mockState, mockTarget.id);
      expect(newState.studio.prestige).toBe(100);
    });
  });
});
