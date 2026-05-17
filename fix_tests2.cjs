const fs = require('fs');

let code = fs.readFileSync('src/test/setup.ts', 'utf8');
code = code.replace(/class MockWorker implements Worker \{/g, '/* eslint-disable @typescript-eslint/no-unused-vars */\nclass MockWorker implements Worker {');
fs.writeFileSync('src/test/setup.ts', code);

code = fs.readFileSync('src/test/components/modals/UnifiedModal.test.tsx', 'utf8');
code = code.replace(/let container: HTMLElement;/g, '');
fs.writeFileSync('src/test/components/modals/UnifiedModal.test.tsx', code);

code = fs.readFileSync('src/test/engine/systems/talent/RelationshipSystem.test.ts', 'utf8');
code = code.replace(/import { GameState } from '@\/engine\/types';/g, '');
fs.writeFileSync('src/test/engine/systems/talent/RelationshipSystem.test.ts', code);

code = fs.readFileSync('src/test/engine/systems/talent/driftEngine.test.ts', 'utf8');
code = code.replace(/const { personality: _personality, ...rest } = talent;/g, 'const { personality: _unused, ...rest } = talent;');
fs.writeFileSync('src/test/engine/systems/talent/driftEngine.test.ts', code);

code = fs.readFileSync('src/test/selectors.test.ts', 'utf8');
code = code.replace(/import { GameState } from '@\/engine\/types';/g, '');
fs.writeFileSync('src/test/selectors.test.ts', code);
