const fs = require('fs');

let gameInitContent = fs.readFileSync('src/engine/core/gameInit.ts', 'utf8');

// Add imports
gameInitContent = gameInitContent.replace("import { pick, randRange } from '../utils';", "import { generateFamilies, generateTalentPool } from '../generators/talent';\nimport { pick, randRange } from '../utils';");

// Update initialization logic
const newInitLogic = `  const families = generateFamilies(5);
  const talentPool = generateTalentPool(50, families);

  return {
    studio: { name: studioName, archetype, prestige: arch.startingPrestige },
    projects: [],
    rivals,
    headlines: [
      {
        id: 'h-init',
        text: \`\${studioName} launches operations \u2014 the industry takes notice.\`,
        week: 1,
        category: 'general',
      },
    ],
    week: 1,
    cash: arch.startingCash,
    financeHistory: [{ week: 1, cash: arch.startingCash, revenue: 0, costs: 0 }],
    families,
    talentPool,
    contracts: [],
    awards: [],
  };`;

gameInitContent = gameInitContent.replace(/return \{[\s\S]*?\};/, newInitLogic);

fs.writeFileSync('src/engine/core/gameInit.ts', gameInitContent);
