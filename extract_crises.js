const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/engine/systems/crises.ts');
const content = fs.readFileSync(filePath, 'utf8');

const startMarker = 'const CRISIS_POOLS = [';

const startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
    console.error('Could not find start of CRISIS_POOLS');
    process.exit(1);
}

// Find the balancing closing bracket
let bracketCount = 1;
let currentIndex = startIndex + startMarker.length;
while (bracketCount > 0 && currentIndex < content.length) {
    if (content[currentIndex] === '[') bracketCount++;
    if (content[currentIndex] === ']') bracketCount--;
    currentIndex++;
}

const poolContent = content.substring(startIndex, currentIndex);

const output = `import { CrisisOption } from '../types';

export ${poolContent};
`;

const dataDir = path.join(process.cwd(), 'src/engine/data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(path.join(dataDir, 'crises.data.ts'), output);
console.log('Successfully extracted CRISIS_POOLS');
