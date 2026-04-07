import fs from 'fs';

const content = fs.readFileSync('src/components/talent/TalentPanel.tsx', 'utf8');
const fixedContent = content.replace(/p-2 min-w-\[3rem\]/g, 'px-3 py-1.5 min-w-[3rem]');
fs.writeFileSync('src/components/talent/TalentPanel.tsx', fixedContent);
