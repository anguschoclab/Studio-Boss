const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/engine/systems/awards.ts');
const content = fs.readFileSync(filePath, 'utf8');

const calendarStart = 'export const AWARDS_CALENDAR';
const configStart = 'const AWARD_CONFIGS';

const extractBlock = (startMarker) => {
    const startIndex = content.indexOf(startMarker);
    if (startIndex === -1) return '';
    
    let balance = 0;
    let started = false;
    let i = startIndex;
    
    while (i < content.length) {
        if (content[i] === '{' || content[i] === '[') {
            balance++;
            started = true;
        } else if (content[i] === '}' || content[i] === ']') {
            balance--;
        }
        
        i++;
        if (started && balance === 0) break;
    }
    
    // Find the next semicolon or newline after the block ends
    while (i < content.length && content[i] !== ';' && content[i] !== '\n') {
        i++;
    }
    if (content[i] === ';') i++;

    return content.substring(startIndex, i);
};

const calendar = extractBlock(calendarStart);
const configs = extractBlock(configStart);

const output = `import { AwardBody, AwardCategory, Project } from '@/engine/types';

export interface AwardConfig {
  body: AwardBody;
  category: AwardCategory;
  format: 'film' | 'tv' | 'both';
  evaluator: (p: Project) => number;
}

${calendar}

export ${configs}
`;

fs.writeFileSync(path.join(process.cwd(), 'src/engine/data/awards.data.ts'), output);
console.log('Successfully re-extracted awards data');
