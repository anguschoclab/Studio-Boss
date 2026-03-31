import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  evaluateAcquisitionTarget,
  executeAcquisition,
  executeSabotage,
  executePoach
} from '../../../engine/systems/mergers';
import { GameState, RivalStudio, Talent, Project } from '../../../engine/types';

describe('Mergers and Sabotage System', () => {
  let mockState: GameState;
  let mockTarget: RivalStudio;

  beforeEach(() => {
    // Mock crypto.randomUUID for deterministic testing
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('test-uuid-1234' as `${string}-${string}-${string}-${string}-${string}`);

    mockTarget = {
      id: 'rival-1',
      name: 'Test Indie Studio',
      motto: 'We make test films',
      archetype: 'indie',
      strength: 10,
      cash: 5_000_000,
      prestige: 20,
      recentActivity: 'Testing',
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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('evaluateAcquisitionTarget', () => {
    it('calculates viable acquisition for indie target', () => {
      const result = evaluateAcquisitionTarget(mockTarget, 100_000_000);
      expect(result.viable).toBe(true);
      expect(result.price).toBe(30_000_000);
    });

    it('calculates viable acquisition for major target', () => {
      const majorTarget = { ...mockTarget, archetype: 'major' as const };
      const result = evaluateAcquisitionTarget(majorTarget, 100_000_000);
      expect(result.viable).toBe(true);
      expect(result.price).toBe(50_000_000);
    });

    it('returns not viable if buyer cash is insufficient', () => {
      const result = evaluateAcquisitionTarget(mockTarget, 10_000_000);
      expect(result.viable).toBe(false);
      expect(result.price).toBe(30_000_000);
    });
  });

  describe('executeAcquisition', () => {
    it('returns unmodified state if target ID is invalid', () => {
      const newState = executeAcquisition(mockState, 'invalid-id');
      expect(newState).toBe(mockState);
    });

    it('successfully executes acquisition and updates game state', () => {
      const newState = executeAcquisition(mockState, mockTarget.id);

      expect(newState.finance.cash).toBe(100_000_000 - 30_000_000);
      expect(newState.industry.rivals).toHaveLength(0);
      expect(newState.studio.prestige).toBe(52);
      expect(newState.market.opportunities).toHaveLength(1);
      
      const opportunity = newState.market.opportunities[0];
      expect(opportunity.title).toBe('Acquired Test Indie Studio IP Catalog');

      expect(newState.industry.newsHistory).toHaveLength(1);
      const news = newState.industry.newsHistory[0];
      expect(news.headline).toContain('acquires Test Indie Studio');
    });
  });

  describe('executeSabotage', () => {
    it('successfully executes sabotage and generates a rumor', () => {
      const newState = executeSabotage(mockState, mockTarget.id);
      expect(newState.finance.cash).toBe(99_000_000);
      expect(newState.industry.rumors).toHaveLength(1);
    });
  });

  describe('executePoach', () => {
    it('successfully executes poach, stealing strength and boosting prestige', () => {
      const newState = executePoach(mockState, mockTarget.id);
      expect(newState.finance.cash).toBe(97_000_000);
      expect(newState.industry.rivals[0].strength).toBe(5);
      expect(newState.studio.prestige).toBe(55);
      expect(newState.industry.newsHistory).toHaveLength(1);
    });
  });
});
