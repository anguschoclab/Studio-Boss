import { readFileSync, writeFileSync } from 'fs';

let content: string;
content = readFileSync('src/engine/systems/AchievementsSystem.ts', 'utf-8');
content = content.replace(
  `type: 'SYSTEM_TICK' as any,`,
  `type: 'SYSTEM_TICK' as unknown as string,`
);
writeFileSync('src/engine/systems/AchievementsSystem.ts', content);
