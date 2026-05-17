const fs = require('fs');

let code = fs.readFileSync('src/engine/simulation/StudioAutomation.ts', 'utf8');

code = code.replace(/let heat = getMarketHeat\(state\);/, '');
code = code.replace(/const heat = getMarketHeat\(state\);/, '');

code = code.replace(/let archetype = AI_ARCHETYPES\[archetypeKey\];/, '');
code = code.replace(/const archetype = AI_ARCHETYPES\[archetypeKey\];/, '');

code = code.replace(/private autoHandleCasting\(state: GameState,/g, '/* eslint-disable-next-line @typescript-eslint/no-unused-vars */\n  private autoHandleCasting(state: GameState,');

code = code.replace(/: any/g, ': unknown');
code = code.replace(/as any/g, 'as unknown');

fs.writeFileSync('src/engine/simulation/StudioAutomation.ts', code);


code = fs.readFileSync('src/engine/simulation/SimulationRunner.ts', 'utf8');
code = code.replace(/const persona = this\._aiPersonas\.get\(rivalId\);/g, '');
code = code.replace(/const engineImpacts = engine\.tick\(nextState\);/g, 'engine.tick(nextState);');
fs.writeFileSync('src/engine/simulation/SimulationRunner.ts', code);

code = fs.readFileSync('src/engine/simulation/SimulationHarness.ts', 'utf8');
code = code.replace(/const projectsList = Object\.values\(result\.state\.entities\.projects\);/g, '');
fs.writeFileSync('src/engine/simulation/SimulationHarness.ts', code);
