import { describe, it, expect } from 'vitest';
import { GameState, StateImpact } from '@/engine/types';
import { tickProduction } from '@/engine/systems/productionEngine';

describe('Production Engine (Target A2) - Symmetry', () => {
  const mockState = {
    week: 1,
    studio: {
      internal: {
        projects: {
          'player-p1': { 
            id: 'player-p1', 
            type: 'FILM', 
            state: 'production', 
            weeksInPhase: 5, 
            productionWeeks: 20 
          }
        },
        contracts: []
      }
    },
    industry: {
      rivals: [
        {
          id: 'rival-s1',
          name: 'Rival Studio',
          projects: {
            'rival-p1': { 
              id: 'rival-p1', 
              type: 'FILM', 
              state: 'production', 
              weeksInPhase: 5, 
              productionWeeks: 20 
            }
          }
        }
      ],
      talentPool: {}
    }
  } as unknown as GameState;

  it('should return identical PROJECT_UPDATED impacts for Player and Rival with identical stats', () => {
    const impacts = tickProduction(mockState);
    
    const playerImpact = impacts.find(i => i.payload.projectId === 'player-p1');
    const rivalImpact = impacts.find(i => i.payload.projectId === 'rival-p1');
    
    expect(playerImpact).toBeDefined();
    expect(rivalImpact).toBeDefined();
    
    // Assert symmetry in weeksInPhase increment
    expect(playerImpact?.payload.update.weeksInPhase).toBe(6);
    expect(rivalImpact?.payload.update.weeksInPhase).toBe(6);
  });
});
