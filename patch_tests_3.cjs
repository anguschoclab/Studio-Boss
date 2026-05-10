const fs = require('fs');

const rumorsContent = fs.readFileSync('src/test/engine/systems/rumors.test.ts', 'utf8');
const newRumors = rumorsContent.replace(/import \{ describe, it, expect \} from 'vitest';/, "import { describe, it, expect, vi } from 'vitest';\nimport * as utils from '@/engine/utils';");
fs.writeFileSync('src/test/engine/systems/rumors.test.ts', newRumors);

console.log('patched rumors imports');
