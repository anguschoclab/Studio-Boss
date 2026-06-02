import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/engine/simulation/HeadlessController.ts', 'utf-8');

// Replace Object.values(state.entities.contracts || {})
content = content.replace(
  `    const contractsList = Object.values(state.entities.contracts || {});\n\n    const contractsByProject = new Map<string, Contract[]>();\n    contractsList.forEach((c: Contract) => {\n      if (c.projectId) {\n        let list = contractsByProject.get(c.projectId);\n        if (!list) {\n          list = [];\n          contractsByProject.set(c.projectId, list);\n        }\n        list.push(c);\n      }\n    });`,
  `    // ⚡ Bolt: Replaced Object.values() with a single-pass for...in loop\n    const contractsByProject = new Map<string, Contract[]>();\n    for (const id in state.entities.contracts) {\n      const c = state.entities.contracts[id] as Contract;\n      if (c.projectId) {\n        let list = contractsByProject.get(c.projectId);\n        if (!list) {\n          list = [];\n          contractsByProject.set(c.projectId, list);\n        }\n        list.push(c);\n      }\n    }`
);

// Replace activePlayerProjects
content = content.replace(
  `    const activePlayerProjects = Object.values(state.entities.projects).filter(p => isPlayerOwner(state, p.ownerId) && p.state !== 'archived');`,
  `    // ⚡ Bolt: Avoided intermediate array allocations with a targeted for...in counter\n    let activePlayerProjectsCount = 0;\n    for (const id in state.entities.projects) {\n      const p = state.entities.projects[id];\n      if (isPlayerOwner(state, p.ownerId) && p.state !== 'archived') {\n        activePlayerProjectsCount++;\n      }\n    }`
);

content = content.replace(
  `if (activePlayerProjects.length < 10 && rng.next() < 0.8)`,
  `if (activePlayerProjectsCount < 10 && rng.next() < 0.8)`
);

// We need to keep allProjects because it's used in playerGenreCounts below.
// Let's optimize the playerGenreCounts loop AND avoid the array creation.
content = content.replace(
  `    // Process projects from current state (including newly pitched ones)\n    const allProjects = Object.values(state.entities.projects);\n    if (newlyPitchedProject) {\n      allProjects.push(newlyPitchedProject);\n    }\n    allProjects.forEach(project => {`,
  `    // Process projects from current state (including newly pitched ones)\n    // ⚡ Bolt: Replaced Object.values() array creation with direct iteration\n    const processProject = (project: any) => {`
);

content = content.replace(
  `      // Archive released player projects so the pitch gate isn't permanently saturated\n      if (isPlayerOwner(state, project.ownerId) && project.state === 'released' && project.releaseWeek && (state.week - project.releaseWeek) > 1) {\n        impacts.push({\n          type: 'PROJECT_UPDATED',\n          payload: { projectId: project.id, update: { state: 'archived' } }\n        });\n      }\n    });\n\n    // Pre-calculate genre counts to avoid O(N) inside the loop\n    const playerGenreCounts: Record<string, number> = {};\n    for (let i = 0; i < allProjects.length; i++) {\n      const g = allProjects[i].genre;\n      if (g) {\n        playerGenreCounts[g] = (playerGenreCounts[g] || 0) + 1;\n      }\n    }`,
  `      // Archive released player projects so the pitch gate isn't permanently saturated\n      if (isPlayerOwner(state, project.ownerId) && project.state === 'released' && project.releaseWeek && (state.week - project.releaseWeek) > 1) {\n        impacts.push({\n          type: 'PROJECT_UPDATED',\n          payload: { projectId: project.id, update: { state: 'archived' } }\n        });\n      }\n    };\n\n    const playerGenreCounts: Record<string, number> = {};\n    for (const id in state.entities.projects) {\n      const p = state.entities.projects[id];\n      processProject(p);\n      if (p.genre) {\n        playerGenreCounts[p.genre] = (playerGenreCounts[p.genre] || 0) + 1;\n      }\n    }\n    if (newlyPitchedProject) {\n      processProject(newlyPitchedProject);\n      const genre = (newlyPitchedProject as any).genre;\n      if (genre) {\n        playerGenreCounts[genre] = (playerGenreCounts[genre] || 0) + 1;\n      }\n    }`
);


// Replace rivals
content = content.replace(
  `    Object.values(state.entities.rivals || {}).forEach(r => {`,
  `    // ⚡ Bolt: Replaced Object.values().forEach() with a direct for...in loop\n    for (const id in state.entities.rivals) {\n      const r = state.entities.rivals[id];`
);

content = content.replace(
  `        cashStreaks.set(r.id, 0);\n      }\n    });`,
  `        cashStreaks.set(r.id, 0);\n      }\n    }`
);

// Replace attributeTalent pool
content = content.replace(
  `    const pool = Object.values(state.entities.talents || {});\n    if (pool.length === 0) return impacts;`,
  `    // ⚡ Bolt: Replaced Object.values() with a direct for...in loop to construct pool\n    const pool = [];\n    for (const id in state.entities.talents) {\n      pool.push(state.entities.talents[id]);\n    }\n    if (pool.length === 0) return impacts;`
);

writeFileSync('src/engine/simulation/HeadlessController.ts', content);
