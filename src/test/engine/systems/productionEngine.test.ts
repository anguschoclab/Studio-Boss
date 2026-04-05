import { describe, it, expect } from 'vitest';
import { tickProduction } from '@/engine/systems/productionEngine';
import { RandomGenerator } from '@/engine/utils/rng';
import { createMockGameState, createMockProject, createMockTalent, createMockContract, createMockRival } from '../../utils/mockFactories';

describe('Production Engine (Target A2) - Symmetry', () => {
  const rng = new RandomGenerator(555);

  it('should return INDUSTRY_UPDATE and RIVAL_UPDATED impacts for Player and Rival', () => {
    const playerProject = createMockProject({ 
      id: 'player-p1', 
      state: 'production', 
      weeksInPhase: 5, 
      productionWeeks: 20,
      progress: 25
    });

    const rivalProject = createMockProject({ 
      id: 'rival-p1', 
      state: 'production', 
      weeksInPhase: 5, 
      productionWeeks: 20,
      progress: 25
    });

    const rival = createMockRival({
      id: 'rival-s1',
      name: 'Rival Studio',
      projects: { 'rival-p1': rivalProject }
    });

    const state = createMockGameState();
    state.studio.internal.projects['player-p1'] = playerProject;
    state.industry.rivals = [rival];

    const impacts = tickProduction(state, rng);

    // Player projects are batched into INDUSTRY_UPDATE
    const industryUpdate = impacts.find(i => i.type === 'INDUSTRY_UPDATE') as any;
    expect(industryUpdate).toBeDefined();
    const updatedPlayerProject = industryUpdate?.payload?.['studio.internal.projects']?.['player-p1'];
    expect(updatedPlayerProject).toBeDefined();
    expect(updatedPlayerProject?.weeksInPhase).toBe(6);

    // Rival projects are batched into RIVAL_UPDATED
    const rivalUpdate = impacts.find(i => i.type === 'RIVAL_UPDATED') as any;
    expect(rivalUpdate).toBeDefined();
    const updatedRivalProject = rivalUpdate?.payload?.update?.projects?.['rival-p1'];
    expect(updatedRivalProject).toBeDefined();
    expect(updatedRivalProject?.weeksInPhase).toBe(6);
  });
});

describe('Production Engine (Target A2) - Edge Cases', () => {
  const rng = new RandomGenerator(555);

  it('should handle empty projects pipeline safely', () => {
    const emptyState = createMockGameState();
    emptyState.studio.internal.projects = {};
    emptyState.industry.rivals = [];
    const impacts = tickProduction(emptyState, rng);
    expect(impacts).toHaveLength(0);
  });

  it('should process projects with 0 targetWeeks without Infinity progress', () => {
     const project = createMockProject({
       id: 'p1',
       state: 'production',
       productionWeeks: 0,
       progress: 0
     });
     const state = createMockGameState();
     state.studio.internal.projects['p1'] = project;

     const impacts = tickProduction(state, rng);
     const industryUpdate = impacts.find(i => i.type === 'INDUSTRY_UPDATE') as any;
     const updatedProject = industryUpdate?.payload?.['studio.internal.projects']?.['p1'];
     expect(updatedProject).toBeDefined();
     expect(updatedProject?.progress).toBeGreaterThan(0);
     expect(updatedProject?.progress).toBeLessThanOrEqual(100);
  });

  it('should apply maximum morale multiplier if talents are fully motivated', () => {
      const project = createMockProject({
          id: 'p1',
          state: 'production',
          productionWeeks: 10,
          progress: 0
      });
      const talent = createMockTalent({
          id: 't1',
          role: 'actor',
          roles: ['actor'],
          psychology: { ego: 50, mood: 100, scandalRisk: 0, synergyAffinities: [], synergyConflicts: [] }
      });
      const contract = createMockContract({ id: 'c1', projectId: 'p1', talentId: 't1', role: 'actor' });
      
      const state = createMockGameState();
      state.studio.internal.projects['p1'] = project;
      state.studio.internal.contracts.push(contract);
      state.industry.talentPool['t1'] = talent;

      const impacts = tickProduction(state, rng);
      const industryUpdate = impacts.find(i => i.type === 'INDUSTRY_UPDATE') as any;
      const updatedProject = industryUpdate?.payload?.['studio.internal.projects']?.['p1'];
      expect(updatedProject?.progress).toBeGreaterThan(0);
  });

  it('should process project with a highly negative budget without throwing (Guild Auditor)', () => {
      const project = createMockProject({
          id: 'p1',
          budget: -100_000_000,
          state: 'production',
          productionWeeks: 10,
          progress: 0
      });
      const state = createMockGameState();
      state.studio.internal.projects['p1'] = project;

      const impacts = tickProduction(state, rng);
      const industryUpdate = impacts.find(i => i.type === 'INDUSTRY_UPDATE') as any;
      const updatedProject = industryUpdate?.payload?.['studio.internal.projects']?.['p1'];
      expect(updatedProject).toBeDefined();
      expect(updatedProject?.progress).toBeGreaterThan(0);
  });
});
