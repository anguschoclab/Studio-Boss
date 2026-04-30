import { describe, it, expect } from 'vitest';
import { GameState, ProjectUpdateImpact } from '@/engine/types';
import { tickProduction } from '@/engine/systems/productionEngine';
import { RandomGenerator } from '@/engine/utils/rng';

describe('Production Engine (Target A2) - Symmetry', () => {
  const rng = new RandomGenerator(555);
  const mockState = {
    week: 1,
    gameSeed: 1,
    tickCount: 0,
    game: { currentWeek: 1 },
    studio: { id: 'PLR-1', name: 'Player Studio', archetype: 'major', prestige: 50, internal: { projectHistory: [] } },
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
      },
      talents: {},
      contracts: {},
      rivals: {}
    },
    finance: { cash: 1_000_000, ledger: [], weeklyHistory: [], marketState: { baseRate: 0.05, savingsYield: 0.02, debtRate: 0.08, loanRate: 0.06, rateHistory: [] } },
    news: { headlines: [] },
    ip: { vault: [], franchises: {} },
    market: { opportunities: [], buyers: [] },
    industry: { families: [], agencies: [], agents: [], rivals: [], awards: [], newsHistory: [], rumors: [], scandals: [] },
    culture: { genrePopularity: {} },
    relationships: { discovery: {} },
    history: [],
    eventHistory: []
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
});
