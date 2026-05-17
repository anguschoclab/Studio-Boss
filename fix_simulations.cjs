const fs = require('fs');

let code = fs.readFileSync('src/engine/simulation/StudioAutomation.ts', 'utf8');

// fix lines around 16, 81, 97, 145, 147, 270, 339

code = code.replace(/import \{ ArchetypeKey, Project \} from '@\/engine\/types';/, "import { Project } from '@/engine/types';");
code = code.replace(/import \{ StudioArchetype \} from '\.\.\/data\/aiArchetypes';/, '');

// line 81: heat
code = code.replace(/const heat = getMarketHeat\(state\);/, 'const _heat = getMarketHeat(state);');

// line 97: archetype
code = code.replace(/const archetype = AI_ARCHETYPES\[archetypeKey\];/, 'const _archetype = AI_ARCHETYPES[archetypeKey];');

// "any" replacement
code = code.replace(/: any/g, ': unknown');

// line 339: state
code = code.replace(/private autoHandleCasting\(state: GameState, /g, 'private autoHandleCasting(_state: GameState, ');

fs.writeFileSync('src/engine/simulation/StudioAutomation.ts', code);

code = fs.readFileSync('src/engine/simulation/SimulationRunner.ts', 'utf8');
code = code.replace(/const persona = this\._aiPersonas\.get\(rivalId\);/g, 'const _persona = this._aiPersonas.get(rivalId);');
code = code.replace(/const engineImpacts = engine\.tick\(nextState\);/g, 'const _engineImpacts = engine.tick(nextState);');
fs.writeFileSync('src/engine/simulation/SimulationRunner.ts', code);

code = fs.readFileSync('src/engine/simulation/SimulationHarness.ts', 'utf8');
code = code.replace(/const projectsList = Object\.values\(result\.state\.entities\.projects\);/g, 'const _projectsList = Object.values(result.state.entities.projects);');
fs.writeFileSync('src/engine/simulation/SimulationHarness.ts', code);
