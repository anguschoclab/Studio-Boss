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
        return [{
          type: 'SCANDAL_ADDED',
          payload: { scandal: { id: 'sc-1' } }
        }, {
          type: 'PROJECT_UPDATED',
          payload: {
            projectId: project.id,
            update: { state: 'production', progress: 50 }
          }
        }];
      }
      return actual.advanceProject(project, currentWeek, studioPrestige, projectContracts, talentPoolMap, rng);
    })
  };
});

describe('Production Engine - Normalization', () => {
  const rng = new RandomGenerator(555);

  it('should return INDUSTRY_UPDATE impact for Player and Rival projects', () => {
    const playerProject = createMockProject({ id: 'player-p1', state: 'production', weeksInPhase: 5, productionWeeks: 20, progress: 25, ownerId: 'player' });
    const rivalProject = createMockProject({ id: 'rival-p1', state: 'production', weeksInPhase: 5, productionWeeks: 20, progress: 25, ownerId: 'rival-s1' });
    const rival = createMockRival({ id: 'rival-s1', prestige: 50 });

    const state = createMockGameState();
    state.entities.projects['player-p1'] = playerProject;
    state.entities.projects['rival-p1'] = rivalProject;
    state.entities.rivals['rival-s1'] = rival;

    const impacts = tickProduction(state, rng);

    const industryUpdate = impacts.find(i => i.type === 'INDUSTRY_UPDATE') as any;
    expect(industryUpdate).toBeDefined();
    
    // Verify both projects were updated
    const updatedProjects = industryUpdate.payload.update['entities.projects'];
    expect(updatedProjects['player-p1']).toBeDefined();
    expect(updatedProjects['rival-p1']).toBeDefined();
  });

  it('handles advancing weeks with an empty pipeline (Guild Auditor)', () => {
    const state = createMockGameState();
    state.entities.projects = {};
    state.entities.rivals = {
      'empty-rival': createMockRival({ id: 'empty-rival' })
    };

    const impacts = tickProduction(state, rng);

    const industryUpdate = impacts.find(i => i.type === 'INDUSTRY_UPDATE') as any;
    expect(industryUpdate).toBeUndefined(); // Should not emit update if empty

    // Verify no crashes occurred
    expect(impacts.length).toBeGreaterThanOrEqual(0); // Should just return an array, likely empty or with resting talent fatigue
  });

  it('handles a project with a negative budget without crashing (Guild Auditor)', () => {
    const project = createMockProject({ id: 'neg-budget-p1', state: 'production', budget: -5000000, productionWeeks: 10, progress: 10 });
    const state = createMockGameState();
    state.entities.projects['neg-budget-p1'] = project;

    const impacts = tickProduction(state, rng);

    // Test that tickProduction safely handles and produces standard impacts despite negative budget
    const industryUpdate = impacts.find(i => i.type === 'INDUSTRY_UPDATE') as any;
    expect(industryUpdate).toBeDefined();

    const updatedProject = industryUpdate.payload.update['entities.projects']['neg-budget-p1'];
    expect(updatedProject).toBeDefined();
    expect(updatedProject.progress).toBeGreaterThan(10);
  });

  it('handles a project with a talent who has 0 skill but 100 ego (Guild Auditor)', () => {
    const project = createMockProject({ id: 'ego-p1', state: 'production', productionWeeks: 10, progress: 10 });
    const egoTalent = createMockTalent({
      id: 'ego-t1',
      skills: { acting: 0, directing: 0, writing: 0, stardom: 0 },
      psychology: { ego: 100, mood: 10, scandalRisk: 90, synergyAffinities: [], synergyConflicts: [] }
    });

    const contract = createMockContract({ id: 'c1', projectId: 'ego-p1', talentId: 'ego-t1' });

    const state = createMockGameState();
    state.entities.projects['ego-p1'] = project;
    state.entities.talents['ego-t1'] = egoTalent;
    state.entities.contracts['c1'] = contract;

    const impacts = tickProduction(state, rng);

    // Verify progress happened, though potentially slower due to low mood (checked by TalentMoraleSystem)
    const industryUpdate = impacts.find(i => i.type === 'INDUSTRY_UPDATE') as any;
    expect(industryUpdate).toBeDefined();

    const talentUpdate = impacts.find(i => i.type === 'TALENT_UPDATED' && i.payload.talentId === 'ego-t1') as any;
    expect(talentUpdate).toBeDefined();
    expect(talentUpdate.payload.update.fatigue).toBeDefined();
  });

  it('handles a project with extremely long production weeks bounding to max allowed (Guild Auditor)', () => {
    const project = createMockProject({ id: 'long-p1', state: 'production', productionWeeks: 9999, progress: 10 });
    const state = createMockGameState();
    state.entities.projects['long-p1'] = project;

    const impacts = tickProduction(state, rng);
    const industryUpdate = impacts.find(i => i.type === 'INDUSTRY_UPDATE') as any;

    // Progress should be based on targetWeeks bounded to 30 as defined in tickProject
    const updatedProject = industryUpdate.payload.update['entities.projects']['long-p1'];
    const expectedBaseProgressIncrement = (1 / 30) * 100;

    // With variance (0.8 to 1.2), progress should be somewhat close to 10 + 3.33
    expect(updatedProject.progress).toBeGreaterThan(10);
    expect(updatedProject.progress).toBeLessThan(10 + expectedBaseProgressIncrement * 1.5);
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

    it('should NOT resolve merger before activeUntilWeek is reached (Guild Auditor)', () => {
        const state = createMockGameState({ week: 5 }); // current week 5
        state.industry.activeMergers = [
            {
                id: 'm1',
                buyerId: 'rival-1',
                targetId: 'rival-2',
                status: 'pending',
                valuation: 100_000_000,
                activeUntilWeek: 10 // target week 10
            }
        ];

        state.entities.rivals['rival-1'] = createMockRival({ id: 'rival-1', cash: 500_000_000 });
        state.entities.rivals['rival-2'] = createMockRival({ id: 'rival-2', cash: 10_000_000 });

        const impacts = evaluateActiveMergers(state, rng);
        expect(impacts.some(i => i.type === 'MERGER_RESOLVED')).toBe(false);
    });

});
