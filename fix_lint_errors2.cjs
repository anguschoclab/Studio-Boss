const fs = require('fs');

const weekAdvanceFile = 'src/engine/core/weekAdvance.ts';
let weekAdvanceCode = fs.readFileSync(weekAdvanceFile, 'utf8');
weekAdvanceCode = weekAdvanceCode.replace(`import { GameState, WeekSummary, Contract } from '../types';`, `import { GameState, WeekSummary } from '../types';`);
fs.writeFileSync(weekAdvanceFile, weekAdvanceCode);
