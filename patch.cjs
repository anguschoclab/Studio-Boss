const fs = require('fs');
const file = 'src/components/pipeline/ProjectCard.tsx';
let content = fs.readFileSync(file, 'utf8');

const importStatement = "import { Button } from '@/components/ui/button';\n";
const lastImportIndex = content.lastIndexOf('import ');
const nextLineIndex = content.indexOf('\n', lastImportIndex) + 1;

content = content.slice(0, nextLineIndex) + importStatement + content.slice(nextLineIndex);

fs.writeFileSync(file, content);
