import { performance } from 'perf_hooks';

// Mock types
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

// Generate data
const talentPool: TalentProfile[] = [];
const rolesList = ['director', 'actor', 'writer', 'producer'];
for (let i = 0; i < 5000; i++) {
  const numRoles = Math.floor(Math.random() * 2) + 1; // 1 or 2 roles
  const roles = [];
  for (let j = 0; j < numRoles; j++) {
    roles.push(rolesList[Math.floor(Math.random() * rolesList.length)]);
  }
  talentPool.push({ id: `t_${i}`, name: `Talent ${i}`, roles: [...new Set(roles)] });
}

const talentMap = new Map(talentPool.map(t => [t.id, t]));

const contracts: Contract[] = [];
for (let i = 0; i < 1000; i++) {
  contracts.push({ id: `c_${i}`, projectId: `p_${Math.floor(i / 5)}`, talentId: `t_${Math.floor(Math.random() * 5000)}` });
}

const project = { id: 'p_0' }; // 5 contracts for this project

// Original
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

// Pre-compute
const talentByRole = new Map<string, TalentProfile[]>();
for (const role of rolesList) talentByRole.set(role, []);
for (const t of talentPool) {
  for (const r of t.roles) {
    if (talentByRole.has(r)) {
      talentByRole.get(r)!.push(t);
    }
  }
}

function optimized() {
  const groups = new Map<string, { attached: TalentProfile[], available: TalentProfile[] }>();
  const rolesToTrack = ['director', 'actor', 'writer', 'producer'];

  const projectContracts = contracts.filter(c => c.projectId === project.id);
  const projectTalentIds = new Set(projectContracts.map(c => c.talentId));

  for (const r of rolesToTrack) {
    const allInRole = talentByRole.get(r) || [];
    const attached: TalentProfile[] = [];

    for (const talentId of projectTalentIds) {
      const t = talentMap.get(talentId);
      if (t && t.roles.includes(r as any)) {
        attached.push(t);
      }
    }

    let available: TalentProfile[];
    if (projectTalentIds.size === 0) {
      available = allInRole;
    } else {
      available = allInRole.filter(t => !projectTalentIds.has(t.id));
    }

    groups.set(r, { attached, available });
  }

  return groups;
}

const ITERATIONS = 1000;

// Warm up
for (let i = 0; i < 100; i++) {
  original();
  optimized();
}

const startOriginal = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  original();
}
const endOriginal = performance.now();

const startOptimized = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  optimized();
}
const endOptimized = performance.now();

console.log(`Original: ${(endOriginal - startOriginal).toFixed(2)} ms`);
console.log(`Optimized: ${(endOptimized - startOptimized).toFixed(2)} ms`);
console.log(`Improvement: ${(((endOriginal - startOriginal) - (endOptimized - startOptimized)) / (endOriginal - startOriginal) * 100).toFixed(2)}% faster`);
