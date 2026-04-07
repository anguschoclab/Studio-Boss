import fs from 'fs';
import path from 'path';

function findIssues(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            findIssues(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('NewsTicker')) {
               // console.log(fullPath);
            }
        }
    }
}

findIssues('src/components');
