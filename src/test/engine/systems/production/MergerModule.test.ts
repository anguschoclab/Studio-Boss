import { describe, it, expect } from 'vitest';
import { evaluateActiveMergers } from '@/engine/systems/production/MergerModule';
import { createMockGameState } from '@/test/utils/mockFactories';
import { RandomGenerator } from '@/engine/utils/rng';

describe('MergerModule', () => {
  describe('evaluateActiveMergers', () => {
    it('returns empty array when there are no active mergers', () => {
      const state = createMockGameState();
      state.industry.activeMergers = []; // Empty array
      const rng = new RandomGenerator(42);

      const impacts = evaluateActiveMergers(state, rng);
      expect(impacts).toHaveLength(0);
    });

    it('returns empty array when active mergers is undefined', () => {
      const state = createMockGameState();
      state.industry.activeMergers = undefined as any;
      const rng = new RandomGenerator(42);

      const impacts = evaluateActiveMergers(state, rng);
      expect(impacts).toHaveLength(0);
    });

    it('does not resolve mergers in the future', () => {
      const state = createMockGameState({ week: 10 });
      state.industry.activeMergers = [
        { id: 'merger-1', activeUntilWeek: 15, acquirerId: 'acq1', targetId: 'tar1' }
      ];
      const rng = new RandomGenerator(42);

      const impacts = evaluateActiveMergers(state, rng);
      expect(impacts).toHaveLength(0);
    });

    it('resolves mergers on the exact week they become active (currentWeek >= activeUntilWeek)', () => {
      const state = createMockGameState({ week: 10 });
      state.industry.activeMergers = [
        { id: 'merger-1', activeUntilWeek: 10, acquirerId: 'acq1', targetId: 'tar1' }
      ];
      const rng = new RandomGenerator(42);

      const impacts = evaluateActiveMergers(state, rng);

      expect(impacts).toHaveLength(2);

      const resolvedImpact = impacts.find(i => i.type === 'MERGER_RESOLVED');
      expect(resolvedImpact).toBeDefined();
      expect(resolvedImpact?.payload).toEqual({ mergerId: 'merger-1', status: 'completed' });

      const newsImpact = impacts.find(i => i.type === 'NEWS_ADDED');
      expect(newsImpact).toBeDefined();
      expect((newsImpact?.payload as any).headline).toBe('MERGER FINALIZED: merger-1');
      expect((newsImpact?.payload as any).category).toBe('market');
    });

    it('resolves mergers past their active week', () => {
      const state = createMockGameState({ week: 12 });
      state.industry.activeMergers = [
        { id: 'merger-1', activeUntilWeek: 10, acquirerId: 'acq1', targetId: 'tar1' }
      ];
      const rng = new RandomGenerator(42);

      const impacts = evaluateActiveMergers(state, rng);

      expect(impacts).toHaveLength(2);
      expect(impacts.find(i => i.type === 'MERGER_RESOLVED')).toBeDefined();
    });

    it('resolves multiple mergers in the same tick and ignores future ones', () => {
      const state = createMockGameState({ week: 20 });
      state.industry.activeMergers = [
        { id: 'merger-1', activeUntilWeek: 15, acquirerId: 'acq1', targetId: 'tar1' },
        { id: 'merger-2', activeUntilWeek: 20, acquirerId: 'acq2', targetId: 'tar2' },
        { id: 'merger-3', activeUntilWeek: 25, acquirerId: 'acq3', targetId: 'tar3' },
        { id: 'merger-no-week', acquirerId: 'acq4', targetId: 'tar4' } as any // Undefined activeUntilWeek defaults to 0
      ];
      const rng = new RandomGenerator(42);

      const impacts = evaluateActiveMergers(state, rng);

      // Should resolve merger-1, merger-2, and merger-no-week
      // 3 mergers resolved * 2 impacts per merger = 6 impacts
      expect(impacts).toHaveLength(6);

      const resolvedIds = impacts.filter(i => i.type === 'MERGER_RESOLVED').map(i => (i.payload as any).mergerId);
      expect(resolvedIds).toContain('merger-1');
      expect(resolvedIds).toContain('merger-2');
      expect(resolvedIds).toContain('merger-no-week');
      expect(resolvedIds).not.toContain('merger-3');
    });
  });
});
