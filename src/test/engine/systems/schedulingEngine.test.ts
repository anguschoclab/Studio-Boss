import { describe, it, expect } from 'vitest';
import { SchedulingEngine } from '@/engine/systems/schedulingEngine';
import { GameState, Project, Talent, Contract, ProjectUpdateImpact } from '@/engine/types';

describe('SchedulingEngine Hardening Tests', () => {
  const mockTalent: Talent = {
    id: 't1',
    name: 'Star Actor',
    type: 'actor',
    roles: ['actor'],
    tier: 'A_LIST',
    prestige: 80,
    draw: 80,
    fee: 1000000,
    commitments: [
      {
        projectId: 'p-other',
        projectTitle: 'Other Big Movie',
        startWeek: 5,
        endWeek: 15,
        role: 'Lead'
      }
    ]
  } as any;

  const mockProject: Project = {
    id: 'p-current',
    title: 'Current Movie',
    state: 'production',
    productionWeeks: 10,
    weeksInPhase: 1,
    budget: 50000000
  } as any;

  const mockContracts: Contract[] = [
    {
      id: 'c1',
      talentId: 't1',
      projectId: 'p-current',
      fee: 1000000,
      role: 'actor',
      backendPercent: 0,
      ownerId: 'player'
    }
  ];

  const mockState: GameState = {
    week: 10,
    entities: {
      projects: { 'p-current': mockProject },
      contracts: { 'c1': mockContracts[0] },
      talents: { 't1': mockTalent },
      rivals: {}
    }
  } as any;

  it('should detect a conflict when the current week overlaps with another commitment', () => {
    // Week 10 is inside [5, 15]
    const { hasConflict, conflicts } = SchedulingEngine.evaluateSchedulingConflicts(
      mockProject,
      mockContracts,
      { 't1': mockTalent },
      10
    );

    expect(hasConflict).toBe(true);
    expect(conflicts[0]).toContain('currently filming "Other Big Movie"');
  });

  it('should NOT detect a conflict when the current week is outside other commitments', () => {
    // Week 20 is outside [5, 15]
    const { hasConflict, conflicts } = SchedulingEngine.evaluateSchedulingConflicts(
      mockProject,
      mockContracts,
      { 't1': mockTalent },
      20
    );

    expect(hasConflict).toBe(false);
    expect(conflicts).toHaveLength(0);
  });

  it('should reduce project progress (weeksInPhase) on tick when conflict exists', () => {
    const rng = { uuid: () => 'news-id' } as any;
    const impacts = SchedulingEngine.tick(mockState, rng);

    const projectUpdate = impacts.find(i => i.type === 'PROJECT_UPDATED') as ProjectUpdateImpact;
    expect(projectUpdate).toBeDefined();
    expect(projectUpdate.payload.update.weeksInPhase).toBe(0); // 1 - 1 = 0
  });
});
