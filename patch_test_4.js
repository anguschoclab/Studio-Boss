import fs from 'fs';
const content = fs.readFileSync('src/engine/simulation/MetricsCollector.ts', 'utf-8');
console.log(content.includes('const platforms = state.market.buyers.filter('));
