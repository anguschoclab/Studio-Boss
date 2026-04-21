import { describe, it, expect, beforeEach } from 'vitest';
import { GameState, StateImpact } from '@/engine/types';
import { applyImpacts } from '@/engine/core/impactReducer';
import { createMockGameState } from '../generators/mockFactory';

describe('Impact Reducer (Target A1)', () => {
  let mockState: GameState;

  beforeEach(() => {
    mockState = createMockGameState({
        cash: 1000000,
        studioName: 'Alpha Studios'
    });
    // Manually add a project for testing PROJECT_UPDATED
    mockState.entities.projects['p1'] = { 
        id: 'p1', 
        title: 'Movie A', 
        type: 'film', 
        status: 'production',
        buzz: 50,
        ownerId: mockState.studio.id
    } as any;
  });

  it('should accurately process FUNDS_CHANGED impact', () => {
    const impacts: StateImpact[] = [
      { type: 'FUNDS_CHANGED', payload: { amount: 500000 } }
    ];
    
    const nextState = applyImpacts(mockState, impacts);
    expect(nextState.finance.cash).toBe(1500000);
    expect(nextState).not.toBe(mockState);
  });

  it('should accurately process PROJECT_UPDATED impact', () => {
    const impacts: StateImpact[] = [
      { type: 'PROJECT_UPDATED', payload: { projectId: 'p1', update: { buzz: 80 } } }
    ];
    
    const nextState = applyImpacts(mockState, impacts);
    expect(nextState.entities.projects['p1'].buzz).toBe(80);
    expect(nextState.entities.projects['p1']).not.toBe(mockState.entities.projects['p1']);
  });

  it('should accurately process NEWS_ADDED impact', () => {
    const impacts: StateImpact[] = [
      { type: 'NEWS_ADDED', payload: { headline: 'New Hit!', description: 'Great movie' } }
    ];
    
    const nextState = applyImpacts(mockState, impacts);
    expect(nextState.industry.newsHistory.length).toBe(1);
    expect(nextState.industry.newsHistory[0].headline).toBe('New Hit!');
  });
});
