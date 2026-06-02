import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/engine/simulation/HeadlessController.ts', 'utf-8');

content = content.replace(
  `    const processProject = (project: any) => {`,
  `    const processProject = (project: Record<string, unknown> & { id: string, ownerId: string, state: string, genre?: string, budget?: number, releaseWeek?: number, title?: string, weeksInPhase?: number, productionWeeks?: number, buzz?: number, type?: string }) => {`
);

content = content.replace(
  `      const genre = (newlyPitchedProject as any).genre;`,
  `      const genre = (newlyPitchedProject as Record<string, unknown>).genre as string | undefined;`
);

writeFileSync('src/engine/simulation/HeadlessController.ts', content);
