const fs = require('fs');

// Refactor names.ts
const namesFile = 'src/engine/generators/names.ts';
let namesCode = fs.readFileSync(namesFile, 'utf8');
namesCode = namesCode.replace('const MALE_FIRST_NAMES', 'export const MALE_FIRST_NAMES');
namesCode = namesCode.replace('const FEMALE_FIRST_NAMES', 'export const FEMALE_FIRST_NAMES');
namesCode = namesCode.replace('const LAST_NAMES', 'export const LAST_NAMES');
fs.writeFileSync(namesFile, namesCode);

// Refactor talent.ts
const talentFile = 'src/engine/generators/talent.ts';
let talentCode = fs.readFileSync(talentFile, 'utf8');

// Replace LAST_NAMES array definition with imports, but we need FIRST_NAMES which was different in talent.ts.
// Wait, talent.ts has FIRST_NAMES combining some names. I'll just remove the duplicate LAST_NAMES from talent.ts
// and import it from names.ts.

talentCode = talentCode.replace(`import { pick, randRange } from '../utils';`, `import { pick, randRange } from '../utils';
import { LAST_NAMES } from './names';`);

talentCode = talentCode.replace(`const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
];\n\n`, '');

fs.writeFileSync(talentFile, talentCode);
