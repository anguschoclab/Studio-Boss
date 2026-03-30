const fs = require('fs');

let content = fs.readFileSync('src/engine/systems/directors.ts', 'utf8');

const badChunk = `import { GameState, Project, TalentProfile, Contract, Crisis } from '@/engine/types';

export interface DirectorDispute {
  projectId: string;
  directorId: string;
  type: 'budget_increase' | 'marketing_control' | 'cast_rebellion';
  description: string;
  status: 'active' | 'resolved' | 'fired';
}

/**
 * Checks if the director for a given project has final cut / creative control.
 */
}`;

content = content.replace(badChunk, `import { Crisis } from '@/engine/types';`);
fs.writeFileSync('src/engine/systems/directors.ts', content);
console.log("Fixed directors.ts");
