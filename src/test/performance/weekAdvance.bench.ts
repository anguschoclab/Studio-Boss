import { advanceWeek } from '../../engine/core/weekAdvance';
import { GameState, Project, Contract } from '../../engine/types';

function createMockState(projectCount: number, contractsPerProject: number): GameState {
  const projects: Record<string, Project> = {};
  const contracts: Contract[] = [];

  for (let i = 0; i < projectCount; i++) {
    const projectId = `p${i}`;
    projects[projectId] = {
      id: projectId,
      title: `Project ${i}`,
      state: 'production',
      weeklyCost: 100,
      budget: 1000,
      weeksInPhase: 0,
      developmentWeeks: 10,
      productionWeeks: 10,
      revenue: 0,
      weeklyRevenue: 0,
      releaseWeek: null,
      buzz: 0,
      format: 'film',
      genre: 'Drama',
      budgetTier: 'mid',
      targetAudience: 'General',
      flavor: '',
    } as unknown as Project;

    for (let j = 0; j < contractsPerProject; j++) {
      contracts.push({
        id: `c${i}-${j}`,
        projectId: projectId,
        talentId: `t${j}`,
        fee: 100,
        backendPercent: 1,
      } as Contract);
    }
  }

  return {
    week: 1,
    studio: {
        name: 'Test Studio',
        archetype: 'indie',
        prestige: 50,
        internal: {
            projects,
            contracts,
        }
    },
    market: {
        opportunities: [],
        buyers: [],
    },
    industry: {
        rivals: [],
        newsHistory: [],
        families: [],
        agencies: [],
        agents: [],
        talentPool: {},
        awards: [],
    },
    culture: { genrePopularity: {} },
    finance: { cash: 1000000, ledger: [] },
    history: []
  } as unknown as GameState;
}

const PROJECT_COUNT = 100;
const CONTRACTS_PER_PROJECT = 50;
const state = createMockState(PROJECT_COUNT, CONTRACTS_PER_PROJECT);

console.log(`Benchmarking advanceWeek with ${PROJECT_COUNT} projects and ${PROJECT_COUNT * CONTRACTS_PER_PROJECT} total contracts...`);

const start = performance.now();
for (let i = 0; i < 100; i++) {
  advanceWeek(state);
}
const end = performance.now();

console.log(`Average time: ${(end - start) / 100}ms`);
