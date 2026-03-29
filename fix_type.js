import fs from 'fs';

let content = fs.readFileSync('src/engine/systems/processors/processProduction.ts', 'utf8');

content = content.replace(
  /const awardsByProject = new Map<string, typeof state\.industry\.awards\[0\]>\(\);/g,
  'const awardsByProject = new Map<string, typeof state.industry.awards>();'
);

fs.writeFileSync('src/engine/systems/processors/processProduction.ts', content, 'utf8');
