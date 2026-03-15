const fs = require('fs');

const path = 'src/store/gameStore.ts';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('greenlightProject: (projectId: string) => void;')) {
  code = code.replace(
    /pitchProject: \(projectId: string, buyerId: string, contractType: ProjectContractType\) => boolean;/,
    `pitchProject: (projectId: string, buyerId: string, contractType: ProjectContractType) => boolean;\n  greenlightProject: (projectId: string) => void;`
  );
}

if (!code.includes('greenlightProject: (projectId) => {')) {
  const implementation = `
  greenlightProject: (projectId) => {
    const state = get().gameState;
    if (!state) return;

    const projectIndex = state.projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return;

    const project = state.projects[projectIndex];
    if (project.status !== 'needs_greenlight') return;

    const updatedProjects = [...state.projects];
    updatedProjects[projectIndex] = {
      ...project,
      status: 'production',
      weeksInPhase: 0,
    };

    const headlineText = \`"\${project.title}" receives full greenlight and enters production.\`;

    set({
      gameState: {
        ...state,
        projects: updatedProjects,
        headlines: [{ id: \`gh-\${crypto.randomUUID()}\`, text: headlineText, week: state.week, category: 'market' as const }, ...state.headlines].slice(0, 50)
      }
    });
  },`;

  code = code.replace(
    /pitchProject: \(projectId, buyerId, contractType\) => \{/,
    `${implementation}\n\n  pitchProject: (projectId, buyerId, contractType) => {`
  );
}

fs.writeFileSync(path, code);
