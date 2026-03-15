const fs = require('fs');

const weekAdvanceFile = 'src/engine/core/weekAdvance.ts';
let weekAdvanceCode = fs.readFileSync(weekAdvanceFile, 'utf8');
weekAdvanceCode = weekAdvanceCode.replace(`import { GameState, Contract, WeekSummary } from '../types';`, `import { GameState, WeekSummary } from '../types';`);
fs.writeFileSync(weekAdvanceFile, weekAdvanceCode);

const saveLoadFile = 'src/persistence/saveLoad.ts';
let saveLoadCode = fs.readFileSync(saveLoadFile, 'utf8');
saveLoadCode = saveLoadCode.replace(`let slots = loadSaveSlots();`, `const slots = loadSaveSlots();`).replace(`let slots = loadSaveSlots();`, `const slots = loadSaveSlots();`);
fs.writeFileSync(saveLoadFile, saveLoadCode);

const awardsTestFile = 'src/test/engine/systems/awards.test.ts';
let awardsTestCode = fs.readFileSync(awardsTestFile, 'utf8');
awardsTestCode = awardsTestCode.replace(`const expectNoAwards = (projects: any[]) => {`, `const expectNoAwards = (projects: typeof eligibleProject[]) => {`);
awardsTestCode = awardsTestCode.replace(`const checkBestPictureAward = (project: any, expectedStatus: 'won' | 'nominated') => {`, `const checkBestPictureAward = (project: typeof eligibleProject, expectedStatus: 'won' | 'nominated') => {`);
fs.writeFileSync(awardsTestFile, awardsTestCode);
