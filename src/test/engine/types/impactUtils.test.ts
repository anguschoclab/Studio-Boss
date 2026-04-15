import { describe, it, expect } from 'vitest';
import { GameState, StateImpact } from '@/engine/types';
import { applyImpacts } from '@/engine/core/impactReducer';

describe('Impact Reducer (Target A1)', () => {
  const initialState: GameState = {
    week: 1,
    entities: {
      projects: {
        'p1': { id: 'p1', title: 'Movie A', type: 'FILM', buzz: 50 } as any
      },
      talents: {},
      contracts: {},
      rivals: {}
    },
    finance: {
      cash: 1000000,
      ledger: []
    },
    studio: {
      name: 'Alpha Studios',
      prestige: 50,
      internal: {
        projectHistory: [],
      }
    },
    industry: {
       newsHistory: []
    },
    market: {
       opportunities: [],
       trends: []
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
    expect(nextState.entities.projects['p1'].buzz).toBe(80);
    expect(nextState.entities.projects['p1']).not.toBe(initialState.entities.projects['p1']);
  });

  it('should accurately process NEWS_ADDED impact', () => {
    const impacts: StateImpact[] = [
      { type: 'NEWS_ADDED', payload: { headline: 'New Hit!', description: 'Great movie' } }
    ];
    
    const nextState = applyImpacts(initialState, impacts);
    expect(nextState.industry.newsHistory.length).toBe(1);
    expect(nextState.industry.newsHistory[0].headline).toBe('New Hit!');
  });

  it('should clamp extreme FUNDS_CHANGED amounts to 10B before adding', () => {
    const impacts: StateImpact[] = [
      { type: 'FUNDS_CHANGED', payload: { amount: 20_000_000_000 } }
    ];
    
    const nextState = applyImpacts(initialState, impacts);
    expect(nextState.finance.cash).toBe(10_001_000_000); // 1M + 10B (clamped)
  });

  it('should handle NaN/null FUNDS_CHANGED amounts gracefully', () => {
    const impacts: StateImpact[] = [
      { type: 'FUNDS_CHANGED', payload: { amount: NaN } }
    ];
    
    const nextState = applyImpacts(initialState, impacts);
    expect(nextState.finance.cash).toBe(1000000); // Should remain unchanged
  });

  it('should process PRESTIGE_CHANGED impact', () => {
    const impacts: StateImpact[] = [
      { type: 'PRESTIGE_CHANGED', payload: { amount: 10 } }
    ];
    
    const nextState = applyImpacts(initialState, impacts);
    expect(nextState.studio.prestige).toBe(60);
  });

  it('should prevent negative prestige', () => {
    const impacts: StateImpact[] = [
      { type: 'PRESTIGE_CHANGED', payload: { amount: -100 } }
    ];
    
    const nextState = applyImpacts(initialState, impacts);
    expect(nextState.studio.prestige).toBe(0);
  });

  it('should process TALENT_ADDED impact', () => {
    const impacts: StateImpact[] = [
      { type: 'TALENT_ADDED', payload: { talent: { id: 't1', name: 'John Doe' } as any } }
    ];
    
    const nextState = applyImpacts(initialState, impacts);
    expect(nextState.entities.talents['t1']).toBeDefined();
    expect(nextState.entities.talents['t1'].name).toBe('John Doe');
  });

  it('should process TALENT_REMOVED impact', () => {
    const stateWithTalent: GameState = {
      ...initialState,
      entities: {
        ...initialState.entities,
        talents: { 't1': { id: 't1', name: 'John Doe' } as any }
      }
    };
    
    const impacts: StateImpact[] = [
      { type: 'TALENT_REMOVED', payload: { talentId: 't1' } }
    ];
    
    const nextState = applyImpacts(stateWithTalent, impacts);
    expect(nextState.entities.talents['t1']).toBeUndefined();
  });

  it('should process PROJECT_REMOVED impact', () => {
    const impacts: StateImpact[] = [
      { type: 'PROJECT_REMOVED', payload: { projectId: 'p1' } }
    ];
    
    const nextState = applyImpacts(initialState, impacts);
    expect(nextState.entities.projects['p1']).toBeUndefined();
  });

  it('should process LEDGER_UPDATED impact with slice limit', () => {
    const stateWithLedger: GameState = {
      ...initialState,
      finance: {
        ...initialState.finance,
        ledger: Array.from({ length: 100 }, (_, i) => ({ id: `r${i}`, week: i } as any))
      }
    };
    
    const impacts: StateImpact[] = [
      { type: 'LEDGER_UPDATED', payload: { report: { id: 'r101', week: 101 } as any } }
    ];
    
    const nextState = applyImpacts(stateWithLedger, impacts);
    expect(nextState.finance.ledger.length).toBe(100);
    expect(nextState.finance.ledger[0].id).toBe('r101');
  });

  it('should process SCANDAL_ADDED impact with prestige hit', () => {
    const impacts: StateImpact[] = [
      { type: 'SCANDAL_ADDED', payload: { scandal: { id: 's1', severity: 50, talentId: 't1' } as any } }
    ];
    
    const nextState = applyImpacts(initialState, impacts);
    expect(nextState.studio.prestige).toBeLessThan(50); // Should decrease
    expect(nextState.industry.scandals).toBeDefined();
    expect(nextState.industry.scandals?.length).toBeGreaterThan(0);
  });

  it('should process SCANDAL_REMOVED impact', () => {
    const stateWithScandal: GameState = {
      ...initialState,
      industry: {
        ...initialState.industry,
        scandals: [{ id: 's1', severity: 50, talentId: 't1' } as any]
      }
    };
    
    const impacts: StateImpact[] = [
      { type: 'SCANDAL_REMOVED', payload: { scandalId: 's1' } }
    ];
    
    const nextState = applyImpacts(stateWithScandal, impacts);
    expect(nextState.industry.scandals?.find(s => s.id === 's1')).toBeUndefined();
  });

  it('should process SYSTEM_TICK impact', () => {
    const impacts: StateImpact[] = [
      { type: 'SYSTEM_TICK', payload: { week: 5, tickCount: 10 } }
    ];
    
    const nextState = applyImpacts(initialState, impacts);
    expect(nextState.week).toBe(5);
    expect(nextState.tickCount).toBe(10);
  });

  it('should process RELATIONSHIP_FORMED impact', () => {
    const impacts: StateImpact[] = [
      { type: 'RELATIONSHIP_FORMED', payload: { key: 't1-t2', relationship: { id: 'r1', type: 'friend' } as any } }
    ];
    
    const nextState = applyImpacts(initialState, impacts);
    expect(nextState.relationships?.relationships?.['t1-t2']).toBeDefined();
  });

  it('should process multiple impacts in sequence', () => {
    const impacts: StateImpact[] = [
      { type: 'FUNDS_CHANGED', payload: { amount: 100000 } },
      { type: 'PRESTIGE_CHANGED', payload: { amount: 5 } },
      { type: 'PROJECT_UPDATED', payload: { projectId: 'p1', update: { buzz: 75 } } }
    ];
    
    const nextState = applyImpacts(initialState, impacts);
    expect(nextState.finance.cash).toBe(1100000);
    expect(nextState.studio.prestige).toBe(55);
    expect(nextState.entities.projects['p1'].buzz).toBe(75);
  });

  it('should process root-level cashChange field', () => {
    const impacts: StateImpact[] = [
      { cashChange: 500000 }
    ];
    
    const nextState = applyImpacts(initialState, impacts);
    expect(nextState.finance.cash).toBe(1500000);
  });

  it('should process root-level prestigeChange field', () => {
    const impacts: StateImpact[] = [
      { prestigeChange: 10 }
    ];
    
    const nextState = applyImpacts(initialState, impacts);
    expect(nextState.studio.prestige).toBe(60);
  });

  it('should process root-level projectUpdates field', () => {
    const impacts: StateImpact[] = [
      { projectUpdates: [{ projectId: 'p1', update: { buzz: 90 } }] }
    ];
    
    const nextState = applyImpacts(initialState, impacts);
    expect(nextState.entities.projects['p1'].buzz).toBe(90);
  });

  it('should handle empty impacts array', () => {
    const impacts: StateImpact[] = [];
    
    const nextState = applyImpacts(initialState, impacts);
    expect(nextState.finance.cash).toBe(initialState.finance.cash);
    expect(nextState.studio.prestige).toBe(initialState.studio.prestige);
  });
});
