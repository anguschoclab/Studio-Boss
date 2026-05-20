const fs = require('fs');

let code = fs.readFileSync('src/engine/simulation/StudioAutomation.ts', 'utf8');

code = code.replace(/import \{ getBudgetInflation, BANKRUPTCY_CASH_FLOOR, BANKRUPTCY_WEEKS_REQUIRED \} from '\.\.\/systems\/industry\/MacroCycle';/g, "import { getMarketHeat, getBudgetInflation, BANKRUPTCY_CASH_FLOOR, BANKRUPTCY_WEEKS_REQUIRED } from '../systems/industry/MacroCycle';");

code = code.replace(/private static createUpdateImpact\(studioId: string, projectId: string, update: Partial<Project>, state: GameState\): StateImpact \{/g, '/* eslint-disable-next-line @typescript-eslint/no-unused-vars */\n  private static createUpdateImpact(studioId: string, projectId: string, update: Partial<Project>, state: GameState): StateImpact {');

fs.writeFileSync('src/engine/simulation/StudioAutomation.ts', code);
