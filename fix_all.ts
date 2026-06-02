import { readFileSync, writeFileSync } from 'fs';

let content: string;

// ShingleSystem.ts
content = readFileSync('src/engine/systems/deals/ShingleSystem.ts', 'utf-8');
content = content.replace(
  `    const c: any = contracts[id];`,
  `    const c = contracts[id] as unknown as Record<string, unknown>;`
);
writeFileSync('src/engine/systems/deals/ShingleSystem.ts', content);

// deals.ts
content = readFileSync('src/engine/systems/deals.ts', 'utf-8');
content = content.replace(
  `const { exclusivity, ...otherTerms } = update.terms;`,
  `// eslint-disable-next-line @typescript-eslint/no-unused-vars\n      const { exclusivity: _exclusivity, ...otherTerms } = update.terms;`
);
content = content.replace(
  `const { agency, talentIds, ...cleanAgency } = action.payload;`,
  `// eslint-disable-next-line @typescript-eslint/no-unused-vars\n      const { agency: _agency, talentIds: _talentIds, ...cleanAgency } = action.payload;`
);
writeFileSync('src/engine/systems/deals.ts', content);

// CompetitionModule.ts
content = readFileSync('src/engine/systems/ai/bidding/CompetitionModule.ts', 'utf-8');
content = content.replace(
  `      let relationshipBonus = 0;\n      if (target.agentId) {\n        const relationship = state.talentAgentRelationships[\`\${target.id}-\${target.agentId}\`];\n        if (relationship) {\n          relationshipBonus = TalentAgentInteractionEngine.getLoyaltyBonus(relationship);\n          leveragedFee = leveragedFee * (1 - (relationshipBonus / 100));\n        }\n      }`,
  `      if (target.agentId) {\n        const relationship = state.talentAgentRelationships[\`\${target.id}-\${target.agentId}\`];\n        if (relationship) {\n          const relationshipBonus = TalentAgentInteractionEngine.getLoyaltyBonus(relationship);\n          leveragedFee = leveragedFee * (1 - (relationshipBonus / 100));\n        }\n      }`
);
writeFileSync('src/engine/systems/ai/bidding/CompetitionModule.ts', content);

// BehaviorEngine.ts
content = readFileSync('src/engine/systems/ai/BehaviorEngine.ts', 'utf-8');
content = content.replace(
  `export function resolveCompetitorBehaviors(state: GameState, mind: RivalMind, rng: RandomGenerator): string[] {`,
  `// eslint-disable-next-line @typescript-eslint/no-unused-vars\nexport function resolveCompetitorBehaviors(_state: GameState, mind: RivalMind, rng: RandomGenerator): string[] {`
);
writeFileSync('src/engine/systems/ai/BehaviorEngine.ts', content);

// ReleaseStrategySystem.ts
content = readFileSync('src/engine/systems/ReleaseStrategySystem.ts', 'utf-8');
content = content.replace(
  `type: 'MODAL_TRIGGERED' as any,`,
  `type: 'MODAL_TRIGGERED' as unknown as string,`
);
writeFileSync('src/engine/systems/ReleaseStrategySystem.ts', content);

// PostProductionSystem.ts
content = readFileSync('src/engine/systems/PostProductionSystem.ts', 'utf-8');
content = content.replace(
  `type: 'MODAL_TRIGGERED' as any,`,
  `type: 'MODAL_TRIGGERED' as unknown as string,`
);
writeFileSync('src/engine/systems/PostProductionSystem.ts', content);

// AchievementsSystem.ts
content = readFileSync('src/engine/systems/AchievementsSystem.ts', 'utf-8');
content = content.replace(
  `type: 'MODAL_TRIGGERED' as any,`,
  `type: 'MODAL_TRIGGERED' as unknown as string,`
);
writeFileSync('src/engine/systems/AchievementsSystem.ts', content);
