// Mock implementations to test OrganicEventEnhancer performance
const { performance } = require('perf_hooks');

const NUM_PROJECTS = 500;
const NUM_CONTRACTS = 5000;
const NUM_RELATIONSHIPS = 1000;

// Mock state
const state = {
  week: 100,
  entities: {
    projects: {},
    contracts: {},
    talents: {}
  },
  relationships: {
    relationships: {},
    cliques: {
      cliques: {},
      memberCliqueMap: {}
    }
  }
};

// Populate state
for (let i = 0; i < NUM_PROJECTS; i++) {
  state.entities.projects[`proj${i}`] = {
    id: `proj${i}`,
    title: `Project ${i}`,
    state: i % 2 === 0 ? 'production' : 'released'
  };
}

for (let i = 0; i < NUM_CONTRACTS; i++) {
  state.entities.contracts[`cont${i}`] = {
    id: `cont${i}`,
    projectId: `proj${i % NUM_PROJECTS}`,
    talentId: `tal${i % 1000}`
  };
}

for (let i = 0; i < 1000; i++) {
  state.entities.talents[`tal${i}`] = {
    id: `tal${i}`,
    name: `Talent ${i}`
  };
}

for (let i = 0; i < NUM_RELATIONSHIPS; i++) {
  state.relationships.relationships[`rel${i}`] = {
    id: `rel${i}`,
    talentAId: `tal${i % 1000}`,
    talentBId: `tal${(i + 1) % 1000}`,
    type: i % 10 === 0 ? 'rival' : 'friend',
    strength: i % 100,
    isPublic: i % 2 === 0,
    history: []
  };
}

// Implement mock checkRelationshipCrises and checkCliqueCrises mimicking current implementation
function checkRelationshipCrises(project, state, rng) {
  const contracts = Object.values(state.entities.contracts || {})
    .filter(c => c.projectId === project.id);
  const talentIds = contracts.map(c => c.talentId);

  if (talentIds.length < 2) return null;

  const relationships = Object.values(state.relationships.relationships || {})
    .filter((r) =>
      talentIds.includes(r.talentAId) && talentIds.includes(r.talentBId)
    );

  const feuds = relationships.filter(r => r.type === 'rival' || r.type === 'enemy');

  if (feuds.length > 0 && Math.random() < 0.15) {
    return { type: 'CRISIS' };
  }
  return null;
}

function checkCliqueCrises(project, state, rng) {
  const contracts = Object.values(state.entities.contracts || {})
    .filter(c => c.projectId === project.id);
  const talentIds = contracts.map(c => c.talentId);

  if (talentIds.length < 3) return null;
  return null;
}

function generateRelationshipScandals(state, rng) {
  const relationships = Object.values(state.relationships.relationships || {});
  return [];
}

function tickOrganicEvents(state, rng) {
  const impacts = [];
  const projects = Object.values(state.entities.projects || {});
  for (const project of projects) {
    const projectState = project.state;
    if (['IN_PRODUCTION', 'production', 'filming'].some(s =>
      projectState?.toLowerCase().includes(s.toLowerCase())
    )) {
      const relationshipCrisis = checkRelationshipCrises(project, state, rng);
      if (relationshipCrisis) {
        impacts.push(relationshipCrisis);
      }

      const cliqueCrisis = checkCliqueCrises(project, state, rng);
      if (cliqueCrisis) {
        impacts.push(cliqueCrisis);
      }
    }
  }

  const relationshipScandals = generateRelationshipScandals(state, rng);
  impacts.push(...relationshipScandals);

  return impacts;
}


const start = performance.now();
for (let i = 0; i < 5; i++) {
  tickOrganicEvents(state, {});
}
const end = performance.now();

console.log(`Original Time: ${end - start} ms`);


// OPTIMIZED VERSION

function optimizedTickOrganicEvents(state, rng) {
  const impacts = [];

  // Pre-group contracts by project to avoid O(Projects * Contracts) loop
  const contractsByProject = {};
  const contracts = state.entities.contracts || {};
  for (const id in contracts) {
    const c = contracts[id];
    if (!contractsByProject[c.projectId]) {
      contractsByProject[c.projectId] = [];
    }
    contractsByProject[c.projectId].push(c);
  }

  // Optimize relationships lookup
  const relationshipsObj = state.relationships?.relationships || {};

  const projects = state.entities.projects || {};
  for (const projectId in projects) {
    const project = projects[projectId];
    const projectState = project.state;
    if (projectState && ['IN_PRODUCTION', 'production', 'filming'].some(s =>
      projectState.toLowerCase().includes(s.toLowerCase())
    )) {
      // Inline checkRelationshipCrises optimized
      const projectContracts = contractsByProject[project.id] || [];
      const talentIds = projectContracts.map(c => c.talentId);

      if (talentIds.length >= 2) {
         // Create set for O(1) lookup
         const talentSet = new Set(talentIds);

         const feuds = [];
         for (const relId in relationshipsObj) {
           const r = relationshipsObj[relId];
           if (talentSet.has(r.talentAId) && talentSet.has(r.talentBId)) {
             if (r.type === 'rival' || r.type === 'enemy') {
               feuds.push(r);
             }
           }
         }

         if (feuds.length > 0 && Math.random() < 0.15) {
           impacts.push({ type: 'CRISIS' });
         }
      }
    }
  }

  return impacts;
}


const start2 = performance.now();
for (let i = 0; i < 5; i++) {
  optimizedTickOrganicEvents(state, {});
}
const end2 = performance.now();

console.log(`Optimized Time: ${end2 - start2} ms`);
