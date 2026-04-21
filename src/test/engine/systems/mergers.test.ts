import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  evaluateAcquisitionTarget,
  executeAcquisition,
  executeSabotage,
  executePoach
} from '../../../engine/systems/mergers';
import { GameState, RivalStudio } from '../../../engine/types';
import { createMockGameState, createMockRival } from '../generators/mockFactory';

describe('Mergers and Sabotage System', () => {
  let mockState: GameState;
  let mockTarget: RivalStudio;

  beforeEach(() => {
    mockTarget = createMockRival({
      id: 'RIV-1',
      name: 'Test Indie Studio',
      archetype: 'indie',
      cash: 5_000_000,
      prestige: 20,
      strength: 10
    });

    mockState = createMockGameState({
      week: 10,
      studio: {
        id: 'PLR-1',
        name: 'Player Studio',
        archetype: 'major',
        prestige: 50,
        internal: { projectHistory: [] }
      },
      entities: {
        projects: {},
        talents: {},
        contracts: {},
        rivals: { [mockTarget.id]: mockTarget }
      }
    });
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
      const majorTarget = createMockRival({ ...mockTarget, archetype: 'major' });
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

      expect(newState.finance.cash).toBe(100_000_000 - 30_000_000 + 5_000_000);
      expect(Object.keys(newState.entities.rivals)).not.toContain(mockTarget.id);
      expect(newState.studio.prestige).toBe(52);
      
      expect(newState.industry.newsHistory).toHaveLength(1);
      const news = newState.industry.newsHistory[0];
      expect(news.headline).toContain('absorbs Test Indie Studio');
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
      expect(newState.entities.rivals[mockTarget.id].strength).toBe(5);
      expect(newState.studio.prestige).toBe(55);
      expect(newState.industry.newsHistory).toHaveLength(1);
    });
  });
});
