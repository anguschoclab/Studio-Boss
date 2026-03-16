const fs = require('fs');

const file = 'src/engine/core/weekAdvance.ts';
let code = fs.readFileSync(file, 'utf-8');

code = code.replace(
  `  // Merge buyer headlines into normal headlines
  const _formattedBuyerHeadlines = buyerHeadlines.map(text => ({
    id: \`bh-\${crypto.randomUUID()}\`,
    text,
    week: nextWeek,
    category: 'market' as const,
  }));

  // Generate headlines
  const newHeadlines = generateHeadlines(nextWeek, updatedRivals);`,
  `  // Merge buyer headlines into normal headlines
  const formattedBuyerHeadlines = buyerHeadlines.map(text => ({
    id: \`bh-\${crypto.randomUUID()}\`,
    text,
    week: nextWeek,
    category: 'market' as const,
  }));

  // Generate headlines
  const newHeadlines = generateHeadlines(nextWeek, updatedRivals);
  newHeadlines.push(...formattedBuyerHeadlines);`
);

fs.writeFileSync(file, code);
