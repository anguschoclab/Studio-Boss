import { describe, bench } from 'vitest';
import { SchedulingEngine } from '../../engine/systems/schedulingEngine';
import { GameState, Project, Talent, Contract } from '../../engine/types';

const PROJECT_COUNT = 200;
const TOTAL_CONTRACTS = 2000;

function createMockState(): GameState {
  const projects: Record<string, Project> = {};
  const contracts: Record<string, Contract> = {};
  const talents: Record<string, Talent> = {};

  for (let i = 0; i < PROJECT_COUNT; i++) {
    const projectId = `p${i}`;
    projects[projectId] = {
      id: projectId,
      title: `Project ${i}`,
      state: 'production',
      weeksInPhase: 1,
    } as any;
  }

  for (let i = 0; i < TOTAL_CONTRACTS; i++) {
    const contractId = `c${i}`;
    const projectId = `p${Math.floor(Math.random() * PROJECT_COUNT)}`;
    const talentId = `t${i}`;
    contracts[contractId] = {
      id: contractId,
      projectId,
      talentId,
    } as any;

    talents[talentId] = {
      id: talentId,
      name: `Talent ${i}`,
      commitments: []
    } as any;
  }

  return {
    week: 10,
    entities: {
      projects,
      contracts,
      talents,
    }
  } as any;
}

const state = createMockState();
const rng = { uuid: (prefix: string) => `${prefix}-${Math.random()}` } as any;

describe('SchedulingEngine Performance', () => {
  bench('SchedulingEngine.tick', () => {
    SchedulingEngine.tick(state, rng);
  });
});
