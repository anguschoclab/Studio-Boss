const fs = require('fs');

let code = fs.readFileSync('src/engine/core/weekAdvance.ts', 'utf-8');

// Add buyer imports
code = code.replace(
  "import { updateRival } from '../systems/rivals';",
  "import { updateRival } from '../systems/rivals';\nimport { updateBuyers } from '../systems/buyers';"
);

// Add buyers processing and merge headlines
const processBuyers = `
  // Update buyers and mandates
  const { updatedBuyers, newHeadlines: buyerHeadlines } = updateBuyers(state.buyers || [], nextWeek);

  // Merge buyer headlines into normal headlines
  const formattedBuyerHeadlines = buyerHeadlines.map(text => ({
    id: \`bh-\${crypto.randomUUID()}\`,
    text,
    week: nextWeek,
    category: 'market' as const,
  }));
`;

code = code.replace(
  "  // Generate headlines\n  const newHeadlines = generateHeadlines(nextWeek, updatedRivals);",
  processBuyers + "\n  // Generate headlines\n  const newHeadlines = generateHeadlines(nextWeek, updatedRivals);"
);

// Apply to newState
code = code.replace(
  "    projects: updatedProjects,",
  "    projects: updatedProjects,\n    buyers: updatedBuyers,"
);

// Apply combined headlines
code = code.replace(
  "    headlines: [...newHeadlines, ...state.headlines].slice(0, 50),",
  "    headlines: [...formattedBuyerHeadlines, ...newHeadlines, ...state.headlines].slice(0, 50),"
);

fs.writeFileSync('src/engine/core/weekAdvance.ts', code);
