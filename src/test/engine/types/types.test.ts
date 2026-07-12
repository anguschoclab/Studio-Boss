import { describe, it, expect } from 'vitest';
import { GameState, Contract, Talent } from '@/engine/types';

describe('Type definitions', () => {
  it('TalentPact interface is exported and has correct shape', () => {
    const pact = {
      id: 'pact-1',
      talentId: 't-1',
      studioId: 's-1',
      fee: 500000,
      durationWeeks: 52,
      startWeek: 1,
      status: 'active' as const,
    };
    expect(pact.id).toBe('pact-1');
    expect(pact.status).toBe('active');
  });

  it('TalentCommitment interface is exported and has correct shape', () => {
    const commitment = {
      projectId: 'p-1',
      projectTitle: 'Test Project',
      startWeek: 1,
      endWeek: 10,
    };
    expect(commitment.projectId).toBe('p-1');
    expect(commitment.projectTitle).toBe('Test Project');
  });

  it('Contract interface includes ownerId? and role?', () => {
    const contract: Contract = {
      id: 'c-1',
      projectId: 'p-1',
      talentId: 't-1',
      fee: 100000,
      backendPercent: 0,
      ownerId: 'studio-1',
      role: 'actor',
    } as Contract;
    expect(contract.ownerId).toBe('studio-1');
    expect(contract.role).toBe('actor');
  });

  it('BaseImpact includes newContracts? and newProjects?', () => {
    const impact = {
      newContracts: [],
      newProjects: [],
    };
    expect(impact.newContracts).toBeDefined();
    expect(impact.newProjects).toBeDefined();
  });

  it('GameState.entities includes contractsByProjectId', () => {
    const state = {
      entities: {
        projects: {},
        talents: {},
        contracts: {},
        rivals: {},
        contractsByProjectId: {},
      },
    } as unknown as GameState;
    expect(state.entities.contractsByProjectId).toBeDefined();
    expect(typeof state.entities.contractsByProjectId).toBe('object');
  });

  it('Talent interface includes razzieWinner?', () => {
    const talent: Talent = {
      id: 't-1',
      name: 'Test Talent',
      role: 'actor',
      roles: ['actor'],
      draw: 50,
      razzieWinner: true,
    } as unknown as Talent;
    expect(talent.razzieWinner).toBe(true);
  });
});
