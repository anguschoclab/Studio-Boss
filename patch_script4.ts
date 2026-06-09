import * as fs from 'fs';

let content = fs.readFileSync('src/engine/systems/deals/ShingleSystem.ts', 'utf-8');

// remove redundant getStudioDealCounts call in wantsFallback
content = content.replace(
  `  if (wantsFallback) {
    const dealCounts = getStudioDealCounts(state);
    for (const b of bidders) {
      if (b.cash < 20_000_000) continue;
      if ((dealCounts[b.id] || 0) >= 4) continue;`,
  `  if (wantsFallback) {
    for (const b of bidders) {
      if (b.cash < 20_000_000) continue;
      if ((dealCounts[b.id] || 0) >= 4) continue;`
);

fs.writeFileSync('src/engine/systems/deals/ShingleSystem.ts', content);
