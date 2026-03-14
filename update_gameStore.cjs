const fs = require('fs');

let code = fs.readFileSync('src/store/gameStore.ts', 'utf-8');

// Imports
code = code.replace(
  "import { GameState, WeekSummary, ProjectFormat, BudgetTierKey, ArchetypeKey } from '@/engine/types';",
  "import { GameState, WeekSummary, ProjectFormat, BudgetTierKey, ArchetypeKey, ProjectContractType } from '@/engine/types';\nimport { negotiateContract } from '@/engine/systems/buyers';"
);

// Interface
code = code.replace(
  "  signContract: (talentId: string, projectId: string) => void;",
  "  signContract: (talentId: string, projectId: string) => void;\n  pitchProject: (projectId: string, buyerId: string, contractType: ProjectContractType) => boolean;"
);

// Implementation
const pitchProjectImpl = `
  pitchProject: (projectId, buyerId, contractType) => {
    const state = get().gameState;
    if (!state) return false;

    const projectIndex = state.projects.findIndex(p => p.id === projectId);
    const buyer = state.buyers.find(b => b.id === buyerId);

    if (projectIndex === -1 || !buyer) return false;

    const project = state.projects[projectIndex];
    const success = negotiateContract(project, buyer, contractType);

    if (success) {
      const updatedProjects = [...state.projects];
      updatedProjects[projectIndex] = {
        ...project,
        status: 'production',
        weeksInPhase: 0,
        buyerId,
        contractType
      };

      const headlineText = \`\${buyer.name} officially picks up "\${project.title}" on a \${contractType} deal.\`;

      set({
        gameState: {
          ...state,
          projects: updatedProjects,
          headlines: [{ id: \`ph-\${crypto.randomUUID()}\`, text: headlineText, week: state.week, category: 'market' as const }, ...state.headlines].slice(0, 50)
        }
      });
    }

    return success;
  },
`;

code = code.replace(
  "  signContract: (talentId, projectId) => {",
  pitchProjectImpl + "\n  signContract: (talentId, projectId) => {"
);

fs.writeFileSync('src/store/gameStore.ts', code);
