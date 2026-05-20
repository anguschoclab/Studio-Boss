const fs = require('fs');
let code = fs.readFileSync('src/engine/simulation/HeadlessController.ts', 'utf8');

// remove unused imports
code = code.replace(/import \{ StudioArchetype, AI_ARCHETYPES \} from '\.\.\/data\/aiArchetypes';/g, '');
code = code.replace(/import \{ evaluateGreenlight \} from '\.\.\/systems\/greenlight';/g, '');
code = code.replace(/import \{ GameState, StateImpact, Contract, Project \} from '@\/engine\/types';/g, "import { GameState, StateImpact, Contract } from '@/engine/types';");

// replace "any" with "unknown"
code = code.replace(/: any/g, ": unknown");
code = code.replace(/as any/g, "as unknown");

fs.writeFileSync('src/engine/simulation/HeadlessController.ts', code);
