import { performance } from 'perf_hooks';

interface TalentProfile {
  id: string;
  name: string;
  roles: string[];
}

interface Contract {
  id: string;
  projectId: string;
  talentId: string;
}

const talentPool: TalentProfile[] = [];
const rolesList = ['director', 'actor', 'writer', 'producer', 'editor', 'cinematographer'];
for (let i = 0; i < 5000; i++) {
  const numRoles = Math.floor(Math.random() * 3) + 1;
  const roles = [];
  for (let j = 0; j < numRoles; j++) {
    roles.push(rolesList[Math.floor(Math.random() * rolesList.length)]);
  }
  talentPool.push({ id: `t_${i}`, name: `Talent ${i}`, roles: [...new Set(roles)] });
}

const contracts: Contract[] = [];
for (let i = 0; i < 1000; i++) {
  contracts.push({ id: `c_${i}`, projectId: `p_${Math.floor(i / 5)}`, talentId: `t_${Math.floor(Math.random() * 5000)}` });
}

let project = { id: 'p_0' };

function original() {
  const groups = new Map<string, { attached: TalentProfile[], available: TalentProfile[] }>();
  const rolesToTrack = ['director', 'actor', 'writer', 'producer'];
  for (const r of rolesToTrack) {
    groups.set(r, { attached: [], available: [] });
  }

  const projectContracts = contracts.filter(c => c.projectId === project.id);
  const projectTalentIds = new Set(projectContracts.map(c => c.talentId));
  for (const t of talentPool) {
    for (const r of t.roles) {
      const group = groups.get(r);
      if (group) {
        if (projectTalentIds.has(t.id)) {
          group.attached.push(t);
        } else {
          group.available.push(t);
        }
      }
    }
  }
  return groups;
}

function computeTalentByRole(pool: TalentProfile[]) {
  const map = new Map<string, TalentProfile[]>();
  const rolesToTrack = ['director', 'actor', 'writer', 'producer'];
  for (const r of rolesToTrack) {
    map.set(r, []);
  }
  for (const t of pool) {
    for (const r of t.roles) {
      const arr = map.get(r);
      if (arr) {
        arr.push(t);
      }
    }
  }
  return map;
}

let cachedPool: TalentProfile[] = [];
let cachedTalentByRole = new Map<string, TalentProfile[]>();

function getTalentByRole(pool: TalentProfile[]) {
    if (pool !== cachedPool) {
        cachedPool = pool;
        cachedTalentByRole = computeTalentByRole(pool);
    }
    return cachedTalentByRole;
}

function optimized() {
  const groups = new Map<string, { attached: TalentProfile[], available: TalentProfile[] }>();
  const rolesToTrack = ['director', 'actor', 'writer', 'producer'];

  const projectContracts = contracts.filter(c => c.projectId === project.id);
  const projectTalentIds = new Set(projectContracts.map(c => c.talentId));

  const talentByRole = getTalentByRole(talentPool);

  for (const r of rolesToTrack) {
    const allInRole = talentByRole.get(r) || [];
    const attached: TalentProfile[] = [];
    const available: TalentProfile[] = [];

    // Iterate over allInRole and split into attached/available
    for (const t of allInRole) {
        if (projectTalentIds.has(t.id)) {
            attached.push(t);
        } else {
            available.push(t);
        }
    }

    groups.set(r, { attached, available });
  }
  return groups;
}

const ITERATIONS = 1000;
for (let i = 0; i < 100; i++) { original(); optimized(); }

const startOriginal = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    project = { id: `p_${Math.floor(i / 5)}` };
    original();
}
const endOriginal = performance.now();

const startOptimized = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    project = { id: `p_${Math.floor(i / 5)}` };
    optimized();
}
const endOptimized = performance.now();

console.log(`Original: ${(endOriginal - startOriginal).toFixed(2)} ms`);
console.log(`Optimized: ${(endOptimized - startOptimized).toFixed(2)} ms`);
console.log(`Improvement: ${(((endOriginal - startOriginal) - (endOptimized - startOptimized)) / (endOriginal - startOriginal) * 100).toFixed(2)}% faster`);
