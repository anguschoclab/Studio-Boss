import { describe, it, expect, vi } from 'vitest';
import { tickProduction, evaluateActiveMergers } from '@/engine/systems/productionEngine';
import { RandomGenerator } from '@/engine/utils/rng';
import { createMockGameState, createMockProject, createMockTalent, createMockContract, createMockRival } from '../../utils/mockFactories';
import * as projectsModule from '@/engine/systems/projects';

vi.mock('@/engine/systems/projects', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    advanceProject: vi.fn((project, currentWeek, studioPrestige, projectContracts, talentPoolMap, rng) => {
      if (project.id === 'scandal-project') {
        return {
          project: { ...project, state: 'production', progress: 50 },
          newScandals: [{ id: 'sc-1' }]
        };
      }
      return actual.advanceProject(project, currentWeek, studioPrestige, projectContracts, talentPoolMap, rng);
    })
  };
});

describe('Production Engine - Normalization', () => {
  const rng = new RandomGenerator(555);

  it('should return INDUSTRY_UPDATE and RIVAL_UPDATED impacts for Player and Rival', () => {
    const playerProject = createMockProject({ id: 'player-p1', state: 'production', weeksInPhase: 5, productionWeeks: 20, progress: 25 });
    const rivalProject = createMockProject({ id: 'rival-p1', state: 'production', weeksInPhase: 5, productionWeeks: 20, progress: 25 });
    const rival = createMockRival({ id: 'rival-s1', name: 'Rival Studio', projects: { 'rival-p1': rivalProject }, prestige: 50 });

    const state = createMockGameState();
    state.entities.projects['player-p1'] = playerProject;
    state.entities.rivals['rival-s1'] = rival;

    const impacts = tickProduction(state, rng);

    const industryUpdate = impacts.find(i => i.type === 'INDUSTRY_UPDATE') as any;
    expect(industryUpdate).toBeDefined();

    const rivalUpdate = impacts.find(i => i.type === 'RIVAL_UPDATED') as any;
    expect(rivalUpdate).toBeDefined();
  });

  it('handles advancing weeks with an empty pipeline (Guild Auditor)', () => {
    const state = createMockGameState();
    state.entities.projects = {};
    state.entities.rivals = {
      'empty-rival': createMockRival({ id: 'empty-rival', projects: {} })
    };

    const impacts = tickProduction(state, rng);

    const industryUpdate = impacts.find(i => i.type === 'INDUSTRY_UPDATE') as any;
    expect(industryUpdate).toBeUndefined(); // Should not emit update if empty

    // Verify no crashes occurred
    expect(impacts.length).toBeGreaterThanOrEqual(0); // Should just return an array, likely empty or with resting talent fatigue
  });
});

describe('Merger Resolution', () => {
    const rng = new RandomGenerator(1);

    it('should resolve merger when activeUntilWeek is reached', () => {
        const state = createMockGameState({ week: 10 });
        state.industry.activeMergers = [
            { 
                id: 'm1', 
                buyerId: 'rival-1', 
                targetId: 'rival-2', 
                status: 'pending', 
                valuation: 100_000_000, 
                activeUntilWeek: 10 
            }
        ];
        
        state.entities.rivals['rival-1'] = createMockRival({ id: 'rival-1', cash: 500_000_000 });
        state.entities.rivals['rival-2'] = createMockRival({ id: 'rival-2', cash: 10_000_000 });

        const impacts = evaluateActiveMergers(state, rng);
        expect(impacts.some(i => i.type === 'MERGER_RESOLVED')).toBe(true);
    });
});
