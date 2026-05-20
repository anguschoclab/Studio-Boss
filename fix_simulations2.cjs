const fs = require('fs');

let code = fs.readFileSync('src/engine/simulation/StudioAutomation.ts', 'utf8');

code = code.replace(/import { StudioArchetype } from '\.\.\/data\/aiArchetypes';/, '');
code = code.replace(/const heat = getMarketHeat\(state\);/g, 'const _heat = getMarketHeat(state);');
code = code.replace(/const archetype = AI_ARCHETYPES\[archetypeKey\];/g, 'const _archetype = AI_ARCHETYPES[archetypeKey];');
code = code.replace(/: any/g, ': unknown');
code = code.replace(/as any/g, 'as unknown');
code = code.replace(/private autoHandleCasting\(state: GameState,/g, 'private autoHandleCasting(_state: GameState,');

fs.writeFileSync('src/engine/simulation/StudioAutomation.ts', code);

code = fs.readFileSync('src/engine/simulation/SimulationRunner.ts', 'utf8');
code = code.replace(/const persona = this\._aiPersonas\.get\(rivalId\);/g, 'const _persona = this._aiPersonas.get(rivalId);');
code = code.replace(/const engineImpacts = engine\.tick\(nextState\);/g, 'const _engineImpacts = engine.tick(nextState);');
fs.writeFileSync('src/engine/simulation/SimulationRunner.ts', code);

code = fs.readFileSync('src/engine/simulation/SimulationHarness.ts', 'utf8');
code = code.replace(/const projectsList = Object\.values\(result\.state\.entities\.projects\);/g, 'const _projectsList = Object.values(result.state.entities.projects);');
fs.writeFileSync('src/engine/simulation/SimulationHarness.ts', code);
