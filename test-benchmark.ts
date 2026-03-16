import { advanceProject } from './src/engine/systems/projects.ts';
import { Project, Contract, TalentProfile } from './src/engine/types.ts';

const mockProject: any = {
  id: "proj-1",
  title: "Test Project",
  budgetTier: "low",
  budget: 500000,
  genre: "Comedy",
  status: "development",
  developmentWeeks: 10,
  productionWeeks: 10,
  weeksInPhase: 0,
  format: "film",
  targetAudience: "General",
  flavor: "Quirky",
  releaseWeek: null,
  weeklyCost: 10000,
  buzz: 50,
  revenue: 0,
  weeklyRevenue: 0,
};

const numTalent = 1000;
const talentPoolMap = new Map<string, any>();
const talentPoolArr: any[] = [];
for (let i = 0; i < numTalent; i++) {
  const t = { id: `t-${i}`, name: `Talent ${i}`, draw: 50, prestige: 50, fee: 10000 };
  talentPoolMap.set(t.id, t);
  talentPoolArr.push(t);
}

const numContracts = 5;
const contracts: any[] = [];
for (let i = 0; i < numContracts; i++) {
  contracts.push({ id: `c-${i}`, projectId: mockProject.id, talentId: `t-${i}`, type: 'upfront', role: 'actor' });
}

// Function simulating the unoptimized approach
function advanceProjectUnoptimized(
  project: any,
  projectContracts: any[],
  talentPool: any[]
) {
  const p = { ...project };
  const attachedTalent = projectContracts.map(c => talentPool.find(t => t.id === c.talentId)).filter(t => t !== undefined);
  const talentBuzzBonus = attachedTalent.reduce((sum, t) => sum + (t.draw / 50), 0);
  p.buzz = p.buzz + talentBuzzBonus;
  return p;
}

const ITERS = 100000;

const startFind = performance.now();
for (let i = 0; i < ITERS; i++) {
  advanceProjectUnoptimized(mockProject, contracts, talentPoolArr);
}
const endFind = performance.now();
console.log(`Unoptimized (O(N*M)): ${endFind - startFind}ms`);

const startMap = performance.now();
for (let i = 0; i < ITERS; i++) {
  advanceProject(mockProject, 1, 10, contracts, talentPoolMap);
}
const endMap = performance.now();
console.log(`Optimized (O(N+M)): ${endMap - startMap}ms`);
