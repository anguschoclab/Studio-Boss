import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  evaluateAcquisitionTarget,
  executeAcquisition,
  executeSabotage,
  executePoach
} from '../../../engine/systems/mergers';
import { GameState, RivalStudio, Talent, Project } from '../../../engine/types';
import { RandomGenerator } from '../../../engine/utils/rng';
import { 
  createMockGameState, 
  createMockRival, 
  createMockProject, 
  createMockIPAsset 
} from '../../utils/mockFactories';

describe('Mergers and Sabotage System', () => {
  let mockState: GameState;
  let mockTarget: RivalStudio;
  const rng = new RandomGenerator(333);

  beforeEach(() => {
    mockTarget = createMockRival({
      id: 'rival-1',
      name: 'Test Indie Studio',
      strength: 10,
      cash: 5_000_000,
      prestige: 20,
      archetype: 'indie',
    });

    mockState = createMockGameState({
      week: 10,
      finance: { 
        cash: 100_000_000, 
        ledger: [], 
        weeklyHistory: [], 
        marketState: { baseRate: 0.05, savingsYield: 0.02, debtRate: 0.1, loanRate: 0.08, rateHistory: [], sentiment: 50, cycle: 'STABLE' } 
      },
    });
    mockState.entities.rivals = { [mockTarget.id]: mockTarget };
  });

  describe('evaluateAcquisitionTarget', () => {
    it('calculates viable acquisition for indie target', () => {
      const result = evaluateAcquisitionTarget(mockTarget, 100_000_000);
      expect(result.viable).toBe(true);
      // Indie price = basePrice * 1.2. basePrice = (10*2m) + 5m = 25m. 25m * 1.2 = 30m.
      expect(result.price).toBe(30_000_000);
    });

    it('calculates viable acquisition for major target', () => {
      const majorTarget = createMockRival({ ...mockTarget, archetype: 'major' });
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

    it('successfully executes acquisition impact with project and IP transfer', () => {
      // Add a project to the state, owned by target
      const rivalProject = createMockProject({ 
        id: 'p-1', 
        title: 'Rival Hit', 
        state: 'production', 
        budget: 50_000_000, 
        ownerId: 'rival-1' 
      });
      mockState.entities.projects['p-1'] = rivalProject;
      
      // Add a rival IP to the state
      mockState.ip.vault = [
        createMockIPAsset({ 
          id: 'ip-1', 
          title: 'Rival IP', 
          rightsOwner: 'STUDIO', // In the system, IP transfer usually means setting it to STUDIO
          ownerId: 'rival-1', 
          originalProjectId: 'p-1', 
          baseValue: 10_000_000, 
          decayRate: 1,
          quality: 50,
        })
      ];


      const impact = executeAcquisition(mockState, mockTarget.id, rng);

      // Price 30m, but we get target's 5m cash. Net -25m
      expect(impact!.cashChange).toBe(-25000000);
      
      // Verify Project Transfer
      expect(impact!.newProjects).toHaveLength(1);
      expect(impact!.newProjects![0].id).toBe('p-1');
      expect(impact!.newProjects![0].state).toBe('turnaround'); // Stuck in turnaround
      expect(impact!.newProjects![0].isAcquired).toBe(true);

      // Verify IP Transfer
      expect(impact!.newIPAssets).toHaveLength(1);
      expect(impact!.newIPAssets![0].id).toBe('ip-1');
      expect(impact!.newIPAssets![0].rightsOwner).toBe('STUDIO');

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
