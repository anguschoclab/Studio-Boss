import { describe, it, expect, beforeEach } from 'vitest';
import { WeekCoordinator } from '@/engine/services/WeekCoordinator';
import { GameState } from '@/engine/types';
import { RandomGenerator } from '@/engine/utils/rng';
import { createMockGameState } from '@/test/utils/mockFactories';

describe('WeekCoordinator', () => {
  let state: GameState;
  let rng: RandomGenerator;

  beforeEach(() => {
    state = createMockGameState();
    rng = new RandomGenerator(42);
  });

  it('should execute all filters and return new state', () => {
    const result = WeekCoordinator.execute(state, rng);
    
    expect(result).toHaveProperty('newState');
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('impacts');
    expect(result.impacts).toBeInstanceOf(Array);
  });

  it('should increment week and tick count', () => {
    const initialWeek = state.week;
    const initialTickCount = state.tickCount || 0;
    
    const result = WeekCoordinator.execute(state, rng);
    
    expect(result.newState.week).toBe(initialWeek + 1);
    expect(result.newState.tickCount).toBe(initialTickCount + 1);
  });

  it('should generate impacts from all filters', () => {
    const result = WeekCoordinator.execute(state, rng);
    
    // Should have impacts from at least some filters
    expect(result.impacts.length).toBeGreaterThan(0);
  });

  it('should include summary modal trigger in impacts', () => {
    const result = WeekCoordinator.execute(state, rng);
    
    const summaryImpact = result.impacts.find(i => i.type === 'MODAL_TRIGGERED');
    expect(summaryImpact).toBeDefined();
    expect(summaryImpact?.payload.modalType).toBe('SUMMARY');
  });

  it('should update market state based on RNG', () => {
    const result = WeekCoordinator.execute(state, rng);
    
    expect(result.newState.finance.marketState).toBeDefined();
    expect(result.newState.finance.marketState?.cycle).toBeDefined();
  });

  it('should maintain RNG state', () => {
    const result = WeekCoordinator.execute(state, rng);
    
    expect(result.newState.rngState).toBeDefined();
    expect(typeof result.newState.rngState).toBe('number');
  });

  it('should preserve event history', () => {
    state.eventHistory = [{
      id: 'test-event',
      week: 1,
      type: 'GENERAL' as const,
      title: 'Test Event',
      description: 'Test event',
      data: undefined
    }];
    
    const result = WeekCoordinator.execute(state, rng);
    
    expect(result.newState.eventHistory).toBeDefined();
    expect(result.newState.eventHistory?.length).toBeGreaterThan(0);
  });

  it('should produce a valid week summary', () => {
    const result = WeekCoordinator.execute(state, rng);
    
    expect(result.summary).toBeDefined();
    expect(typeof result.summary).toBe('object');
  });
});
