import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/engine/systems/ai/BehaviorEngine.ts', 'utf-8');
content = content.replace(
  `// eslint-disable-next-line @typescript-eslint/no-unused-vars\nexport function shouldAttemptHostileTakeover(\n  attacker: RivalStudio,\n  target: RivalStudio,\n  state: GameState\n): boolean {`,
  `export function shouldAttemptHostileTakeover(\n  attacker: RivalStudio,\n  target: RivalStudio,\n  // eslint-disable-next-line @typescript-eslint/no-unused-vars\n  state: GameState\n): boolean {`
);
writeFileSync('src/engine/systems/ai/BehaviorEngine.ts', content);
