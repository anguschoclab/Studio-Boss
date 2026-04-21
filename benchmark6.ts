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
  const numRoles = Math.floor(Math.random() * 3) + 1; // 1 to 3 roles
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

const project = { id: 'p_0' };

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

function optimized6() {
  const groups = new Map<string, { attached: TalentProfile[], available: TalentProfile[] }>();
  const rolesToTrack = ['director', 'actor', 'writer', 'producer'];

  const attachedMap = new Map<string, TalentProfile[]>();
  const availableMap = new Map<string, TalentProfile[]>();

  for (const r of rolesToTrack) {
    attachedMap.set(r, []);
    availableMap.set(r, []);
    groups.set(r, { attached: attachedMap.get(r)!, available: availableMap.get(r)! });
  }

  const projectContracts = contracts.filter(c => c.projectId === project.id);
  const projectTalentIds = new Set(projectContracts.map(c => c.talentId));

  for (const t of talentPool) {
    const isAttached = projectTalentIds.has(t.id);
    for (const r of t.roles) {
      if (isAttached) {
        const attached = attachedMap.get(r);
        if (attached) attached.push(t);
      } else {
        const available = availableMap.get(r);
        if (available) available.push(t);
      }
    }
  }
  return groups;
}

const ITERATIONS = 1000;
for (let i = 0; i < 100; i++) { original(); optimized6(); }

const startOriginal = performance.now();
for (let i = 0; i < ITERATIONS; i++) { original(); }
const endOriginal = performance.now();

const startOptimized = performance.now();
for (let i = 0; i < ITERATIONS; i++) { optimized6(); }
const endOptimized = performance.now();

console.log(`Original: ${(endOriginal - startOriginal).toFixed(2)} ms`);
console.log(`Optimized6: ${(endOptimized - startOptimized).toFixed(2)} ms`);
console.log(`Improvement: ${(((endOriginal - startOriginal) - (endOptimized - startOptimized)) / (endOriginal - startOriginal) * 100).toFixed(2)}% faster`);
