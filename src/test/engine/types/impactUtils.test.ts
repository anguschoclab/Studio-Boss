import { describe, it, expect } from 'vitest';
import { GameState, StateImpact } from '@/engine/types';
import { applyImpacts } from '@/engine/core/impactReducer';

describe('Impact Reducer (Target A1)', () => {
  const initialState: GameState = {
    week: 1,
    finance: {
      cash: 1000000,
      ledger: []
    },
    studio: {
      name: 'Alpha Studios',
      prestige: 50,
      internal: {
        projects: {
          'p1': { id: 'p1', title: 'Movie A', type: 'FILM', buzz: 50 } as any
        },
        contracts: []
      }
    },
    industry: {
       talentPool: {},
       rivals: [],
       awards: [],
       scandals: [],
       newsHistory: []
    },
    market: {
       buyers: [],
       trends: [],
       activeMarketEvents: [],
       opportunities: []
    }
  } as unknown as GameState;

  it('should accurately process FUNDS_CHANGED impact', () => {
    const impacts: StateImpact[] = [
      { type: 'FUNDS_CHANGED', payload: { amount: 500000 } }
    ];
    
    const nextState = applyImpacts(initialState, impacts);
    expect(nextState.finance.cash).toBe(1500000);
    expect(nextState).not.toBe(initialState);
  });

  it('should accurately process PROJECT_UPDATED impact', () => {
    const impacts: StateImpact[] = [
      { type: 'PROJECT_UPDATED', payload: { projectId: 'p1', update: { buzz: 80 } } }
    ];
    
    const nextState = applyImpacts(initialState, impacts);
    expect(nextState.studio.internal.projects['p1'].buzz).toBe(80);
    expect(nextState.studio.internal.projects['p1']).not.toBe(initialState.studio.internal.projects['p1']);
  });

  it('should accurately process NEWS_ADDED impact', () => {
    const impacts: StateImpact[] = [
      { type: 'NEWS_ADDED', payload: { headline: 'New Hit!', description: 'Great movie' } }
    ];
    
    const nextState = applyImpacts(initialState, impacts);
    expect(nextState.industry.newsHistory.length).toBe(1);
    expect(nextState.industry.newsHistory[0].headline).toBe('New Hit!');
  });
});
