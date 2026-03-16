import { test, expect } from 'vitest';
import { GameState } from './src/engine/types';
import { advanceWeek } from './src/engine/core/weekAdvance';

function generateLargeState(): GameState {
  const projects = Array.from({ length: 1000 }).map((_, i) => ({
    id: `p-${i}`,
    title: `Project ${i}`,
    genre: 'Action',
    budget: 10000000,
    marketingBudget: 5000000,
    status: i % 2 === 0 ? 'development' : 'production',
    quality: 50,
    progress: 0,
    weeksInCurrentStatus: 0,
    buzz: 20,
    archetypeId: 'four-quadrant',
    audienceAppeal: { general: 50, indie: 50, critical: 50 },
    revenue: 0,
    totalCosts: 0,
    log: []
  }));

  const contracts = Array.from({ length: 5000 }).map((_, i) => ({
    id: `c-${i}`,
    projectId: `p-${i % 1000}`,
    talentId: `t-${i}`,
    cost: 100000,
    role: 'actor',
    status: 'active',
    weeksRemaining: 10,
    signedWeek: 1
  }));

  const talentPool = Array.from({ length: 10000 }).map((_, i) => ({
    id: `t-${i}`,
    name: `Talent ${i}`,
    skill: 50,
    fee: 100000,
    roles: ['actor']
  }));

  return {
    week: 1,
    cash: 100000000,
    studio: { name: 'Benchmark Studio', prestige: 50, archetype: 'major', activeProjects: [] },
    projects: projects,
    contracts: contracts,
    talentPool: talentPool,
    rivals: [],
    headlines: [],
    events: [],
    financeHistory: []
  };
}

test('weekAdvance benchmark', () => {
  const state = generateLargeState();
  const start = performance.now();

  const { newState, summary } = advanceWeek(state);

  const end = performance.now();
  const duration = end - start;

  console.log(`weekAdvance took ${duration.toFixed(2)}ms`);

  expect(duration).toBeLessThan(100); // Expect it to run under 100ms
  expect(newState.week).toBe(2);
  expect(summary.totalCosts).toBeGreaterThan(0);
});
