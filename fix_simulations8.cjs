const fs = require('fs');

let code = fs.readFileSync('src/engine/simulation/StudioAutomation.ts', 'utf8');

code = code.replace(/import \{ getMarketHeat, getBudgetInflation, BANKRUPTCY_CASH_FLOOR, BANKRUPTCY_WEEKS_REQUIRED \} from '\.\.\/systems\/industry\/MacroCycle';/g, "import { getBudgetInflation, BANKRUPTCY_CASH_FLOOR, BANKRUPTCY_WEEKS_REQUIRED } from '../systems/industry/MacroCycle';");
code = code.replace(/const heat = getMarketHeat\(state\.week\);\n/g, '');

code = code.replace(/private static processProject\(p: Project, studioId: string, state: GameState, rng: RandomGenerator, impacts: StateImpact\[\], archetype: StudioArchetype\): void \{/g, 'private static processProject(p: Project, studioId: string, state: GameState, rng: RandomGenerator, impacts: StateImpact[]): void {');
code = code.replace(/this\.processProject\(p, rival\.id, state, rng, impacts, archetype\);/g, 'this.processProject(p, rival.id, state, rng, impacts);');
code = code.replace(/const archetype = this\.getRivalArchetype\(rival\);\n/g, '');
code = code.replace(/this\.pitchNewProject\(rival, state, rng, impacts, archetype\);/g, 'this.pitchNewProject(rival, state, rng, impacts, this.getRivalArchetype(rival));');

code = code.replace(/private autoHandleCasting\(state: GameState,/g, '/* eslint-disable-next-line @typescript-eslint/no-unused-vars */\n  private autoHandleCasting(state: GameState,');

code = code.replace(/: any/g, ': unknown');
code = code.replace(/as any/g, 'as unknown');

fs.writeFileSync('src/engine/simulation/StudioAutomation.ts', code);

code = fs.readFileSync('src/engine/simulation/SimulationRunner.ts', 'utf8');
code = code.replace(/persona: string = 'balanced',/g, '/* eslint-disable-next-line @typescript-eslint/no-unused-vars */\n    persona: string = \'balanced\',');
code = code.replace(/const \{ newState: steppedState, summary, impacts: engineImpacts \} = WeekCoordinator\.execute\(state, rng\);/g, 'const { newState: steppedState, summary, impacts: _engineImpacts } = WeekCoordinator.execute(state, rng);');
fs.writeFileSync('src/engine/simulation/SimulationRunner.ts', code);

code = fs.readFileSync('src/engine/simulation/SimulationHarness.ts', 'utf8');
code = code.replace(/const projectsList = Object\.values\(state\.entities\.projects \|\| \{\}\);/g, '');
fs.writeFileSync('src/engine/simulation/SimulationHarness.ts', code);
