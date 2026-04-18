import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tickProduction } from '@/engine/systems/production/TickModule';
import { createMockGameState, createMockProject, createMockTalent, createMockContract, createMockRival } from '@/test/utils/mockFactories';
import { RandomGenerator } from '@/engine/utils/rng';
import * as directorsMod from '@/engine/systems/directors';
import * as projectsMod from '@/engine/systems/projects';

// Mocking dependencies to isolate tickProduction logic
vi.mock('@/engine/systems/directors', () => ({
  processDirectorDisputes: vi.fn(() => null)
}));

vi.mock('@/engine/systems/projects', () => ({
  advanceProject: vi.fn(() => [])
}));

describe('TickModule - tickProduction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('processes a project in production correctly', () => {
    const state = createMockGameState({ week: 10 });
    const project = createMockProject({ id: 'p1', state: 'production', progress: 50, productionWeeks: 10, reviewScore: 50 });
    const talent = createMockTalent({ id: 't1', fatigue: 0 });
    const contract = createMockContract({ projectId: 'p1', talentId: 't1' });

    state.entities.projects['p1'] = project;
    state.entities.talents['t1'] = talent;
    state.entities.contracts['c1'] = contract;

    const rng = new RandomGenerator(42);

    const impacts = tickProduction(state, rng);

    const industryUpdate = impacts.find(i => i.type === 'INDUSTRY_UPDATE');
    expect(industryUpdate).toBeDefined();

    const updatedProject = (industryUpdate?.payload as any).update['entities.projects']['p1'];
    expect(updatedProject.progress).toBeGreaterThan(50);

    // We should also see TALENT_UPDATED because fatigue increases
    const talentUpdate = impacts.find(i => i.type === 'TALENT_UPDATED' && (i.payload as any).talentId === 't1');
    expect(talentUpdate).toBeDefined();
  });

  it('skips archived projects entirely', () => {
    const state = createMockGameState({ week: 10 });
    const project = createMockProject({ id: 'p1', state: 'archived' });
    state.entities.projects['p1'] = project;

    const rng = new RandomGenerator(42);

    const impacts = tickProduction(state, rng);

    expect(projectsMod.advanceProject).not.toHaveBeenCalled();
    const industryUpdate = impacts.find(i => i.type === 'INDUSTRY_UPDATE');
    // It shouldn't emit an INDUSTRY_UPDATE if projects haven't changed.
    expect(industryUpdate).toBeUndefined();
  });

  it('reduces fatigue for inactive talent', () => {
    const state = createMockGameState({ week: 10 });
    // Talent with no active contract attached to an active project
    const talent = createMockTalent({ id: 't1', fatigue: 50 });
    state.entities.talents['t1'] = talent;

    const rng = new RandomGenerator(42);
    const impacts = tickProduction(state, rng);

    const talentUpdate = impacts.find(i => i.type === 'TALENT_UPDATED' && (i.payload as any).talentId === 't1');
    expect(talentUpdate).toBeDefined();
    expect((talentUpdate?.payload as any).update.fatigue).toBeLessThan(50);
  });

  it('handles rival projects correctly', () => {
    const state = createMockGameState({ week: 10 });
    const rival = createMockRival({ id: 'r1', prestige: 80 });
    state.entities.rivals['r1'] = rival;

    const project = createMockProject({ id: 'p1', state: 'development', ownerId: 'r1' });
    state.entities.projects['p1'] = project;

    // Mock advanceProject to return a dummy impact to verify it's called with rival prestige
    vi.mocked(projectsMod.advanceProject).mockReturnValueOnce([{ type: 'DUMMY' as any, payload: {} }]);

    const rng = new RandomGenerator(42);
    const impacts = tickProduction(state, rng);

    expect(projectsMod.advanceProject).toHaveBeenCalledWith(
      expect.anything(),
      10,
      80, // rival prestige
      expect.anything(),
      expect.anything(),
      expect.anything()
    );

    expect(impacts.find(i => i.type === 'DUMMY' as any)).toBeDefined();
  });

  it('processes director disputes if they occur', () => {
    const state = createMockGameState({ week: 10 });
    const project = createMockProject({ id: 'p1', state: 'production' });
    state.entities.projects['p1'] = project;

    // Mock the dispute system to return an impact
    const mockDisputeImpact = {
      type: 'DISPUTE_HAPPENED' as any,
      projectUpdates: [{}], // simulate content
      uiNotifications: []
    };
    vi.mocked(directorsMod.processDirectorDisputes).mockReturnValueOnce(mockDisputeImpact);

    const rng = new RandomGenerator(42);
    const impacts = tickProduction(state, rng);

    expect(directorsMod.processDirectorDisputes).toHaveBeenCalled();
    expect(impacts).toContainEqual(mockDisputeImpact);
  });

  it('handles empty states gracefully', () => {
    const state = createMockGameState();
    const rng = new RandomGenerator(42);
    const impacts = tickProduction(state, rng);
    expect(impacts).toHaveLength(0); // No projects, no talent
  });
});
