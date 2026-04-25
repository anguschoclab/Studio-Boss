import { describe, it, expect } from 'vitest';
import { GameState, ProjectUpdateImpact } from '@/engine/types';
import { tickProduction } from '@/engine/systems/productionEngine';
import { RandomGenerator } from '@/engine/utils/rng';

describe('Production Engine (Target A2) - Symmetry', () => {
  const rng = new RandomGenerator(555);
  const mockState = {
    week: 1,
    entities: {
      projects: {
        'player-p1': {
          id: 'player-p1',
          type: 'FILM',
          state: 'production',
          weeksInPhase: 5,
          productionWeeks: 20,
          progress: 25,
          scriptHeat: 50,
          activeRoles: [],
          scriptEvents: []
        },
        'rival-p1': {
          id: 'rival-p1',
          type: 'FILM',
          state: 'production',
          weeksInPhase: 5,
          productionWeeks: 20,
          progress: 25,
          scriptHeat: 50,
          activeRoles: [],
          scriptEvents: []
        }
      }
    },
    studio: {
      name: 'Player Studio',
      internal: {
        projects: {
          'player-p1': { 
            id: 'player-p1', 
            type: 'FILM', 
            state: 'production', 
            weeksInPhase: 5, 
            productionWeeks: 20,
            progress: 25,
            scriptHeat: 50,
            activeRoles: [],
            scriptEvents: []
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
              productionWeeks: 20,
              progress: 25,
              scriptHeat: 50,
              activeRoles: [],
              scriptEvents: []
            }
          }
        }
      ],
      talentPool: {}
    }
  } as unknown as GameState;

  it('should return PROJECT_UPDATED impacts for Player and Rival', () => {
    const impacts = tickProduction(mockState, rng);
    
    const playerImpact = impacts.find(i => (i as ProjectUpdateImpact).payload.projectId === 'player-p1') as ProjectUpdateImpact | undefined;
    const rivalImpact = impacts.find(i => (i as ProjectUpdateImpact).payload.projectId === 'rival-p1') as ProjectUpdateImpact | undefined;
    
    expect(playerImpact).toBeDefined();
    expect(rivalImpact).toBeDefined();
    
    // Assert weeksInPhase increment
    expect(playerImpact?.payload.update.weeksInPhase).toBe(6);
    expect(rivalImpact?.payload.update.weeksInPhase).toBe(6);
  });

  it('should handle advancing weeks with an empty pipeline safely', () => {
    const emptyState = {
      ...mockState,
      entities: { ...mockState.entities, projects: {} },
      studio: { ...mockState.studio, internal: { projects: {}, contracts: [] } },
      industry: { rivals: [], talentPool: {} }
    } as unknown as GameState;

    const impacts = tickProduction(emptyState, rng);
    expect(impacts).toHaveLength(0);
  });
});
