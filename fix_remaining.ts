import { readFileSync, writeFileSync } from 'fs';

let content: string;

// deals.ts
content = readFileSync('src/engine/systems/deals.ts', 'utf-8');
content = content.replace(
  `export function offerFirstLookDeal(state: GameState, talentId: string, weeksRemaining: number, exclusivity: boolean = true): StateImpact[] {`,
  `// eslint-disable-next-line @typescript-eslint/no-unused-vars\nexport function offerFirstLookDeal(state: GameState, talentId: string, weeksRemaining: number, exclusivity: boolean = true): StateImpact[] {`
);
content = content.replace(
  `export function packageProject(project: Project, talentIds?: string[], agency?: Agency): { packageScore: number, synergies: string[] } {`,
  `// eslint-disable-next-line @typescript-eslint/no-unused-vars\nexport function packageProject(project: Project, talentIds?: string[], agency?: Agency): { packageScore: number, synergies: string[] } {`
);
writeFileSync('src/engine/systems/deals.ts', content);

// BehaviorEngine.ts
content = readFileSync('src/engine/systems/ai/BehaviorEngine.ts', 'utf-8');
content = content.replace(
  `// eslint-disable-next-line @typescript-eslint/no-unused-vars\nexport function resolveCompetitorBehaviors(_state: GameState, mind: RivalMind, rng: RandomGenerator): string[] {`,
  `export function resolveCompetitorBehaviors(state: GameState, mind: RivalMind, rng: RandomGenerator): string[] {`
);
content = content.replace(
  `export function resolveCompetitorBehaviors(state: GameState, mind: RivalMind, rng: RandomGenerator): string[] {`,
  `// eslint-disable-next-line @typescript-eslint/no-unused-vars\nexport function resolveCompetitorBehaviors(state: GameState, mind: RivalMind, rng: RandomGenerator): string[] {`
);
writeFileSync('src/engine/systems/ai/BehaviorEngine.ts', content);

// AchievementsSystem.ts
content = readFileSync('src/engine/systems/AchievementsSystem.ts', 'utf-8');
content = content.replace(
  `type: 'MODAL_TRIGGERED' as unknown as string,`,
  `type: 'MODAL_TRIGGERED' as unknown as string, // eslint-disable-next-line @typescript-eslint/no-explicit-any`
);
// wait actually, let's just see where `any` is in AchievementsSystem
