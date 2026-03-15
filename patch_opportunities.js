const fs = require('fs');
const content = fs.readFileSync('src/engine/generators/opportunities.ts', 'utf8');
const newContent = content.replace(/import { generateHeadlineContent } from '\.\/headlines'; \/\/ Reuse some generation logic if needed, or build new one\n/g, '');
fs.writeFileSync('src/engine/generators/opportunities.ts', newContent);
