const fs = require('fs');
const file = 'src/engine/systems/awards/CeremonyRunner.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace("import { GameState, Project, RivalStudio, StateImpact, Contract } from '@/engine/types';", "import { GameState, Project, StateImpact, Contract } from '@/engine/types';");
fs.writeFileSync(file, code);
