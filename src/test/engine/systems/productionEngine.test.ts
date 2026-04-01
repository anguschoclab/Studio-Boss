import { describe, it, expect } from 'vitest';
import { GameState } from '@/engine/types';
import { tickProduction } from '@/engine/systems/productionEngine';
import { RandomGenerator } from '@/engine/utils/rng';

describe('Production Engine (Target A2) - Symmetry', () => {
  const rng = new RandomGenerator(555);
  const mockState = {
    week: 1,
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
            progress: 25
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
              progress: 25
            }
          }
        }
      ],
      talentPool: {}
    }
  } as Partial<GameState> as GameState;

  it('should return PROJECT_UPDATED impacts for Player and Rival', () => {
    const impacts = tickProduction(mockState, rng);
    
    const playerImpact = impacts.find(i => i.payload.projectId === 'player-p1');
    const rivalImpact = impacts.find(i => i.payload.projectId === 'rival-p1');
    
    expect(playerImpact).toBeDefined();
    expect(rivalImpact).toBeDefined();
    
    // Assert weeksInPhase increment
    expect(playerImpact?.payload.update.weeksInPhase).toBe(6);
    expect(rivalImpact?.payload.update.weeksInPhase).toBe(6);
  });


  describe("Extreme Edge Cases (Guild Auditor)", () => {
    it("handles an empty state with no projects gracefully", () => {
      const emptyState = {
        week: 1,
        studio: {
          internal: {
            projects: {}
          }
        },
        industry: {
          rivals: []
        }
      } as Partial<GameState> as GameState;

      const impacts = tickProduction(emptyState, rng);
      expect(impacts.length).toBe(0);
    });

    it("prevents division by zero or NaN when productionWeeks is zero or negative", () => {
      const weirdState = {
        week: 1,
        studio: {
          internal: {
            projects: {
              'p_zero': {
                id: 'p_zero',
                type: 'FILM',
                state: 'production',
                weeksInPhase: 0,
                productionWeeks: 0, // Evil edge case
                progress: 0
              },
              'p_neg': {
                id: 'p_neg',
                type: 'FILM',
                state: 'production',
                weeksInPhase: 0,
                productionWeeks: -10, // Evil edge case
                progress: 0
              }
            }
          }
        },
        industry: {
          rivals: []
        }
      } as Partial<GameState> as GameState;

      const impacts = tickProduction(weirdState, rng);
      expect(impacts.length).toBeGreaterThan(0);

      const zeroImpact = impacts.find(i => i.payload.projectId === 'p_zero');
      const negImpact = impacts.find(i => i.payload.projectId === 'p_neg');

      // As long as it doesn't crash and progress is a number (not NaN or Infinity)
      expect(Number.isFinite(zeroImpact?.payload.update.progress)).toBe(true);
      expect(Number.isFinite(negImpact?.payload.update.progress)).toBe(true);
    });
  });
});
