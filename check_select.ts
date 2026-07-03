import fs from 'fs';
import path from 'path';

function walk(dir: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      walk(path.join(dir, file), fileList);
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        fileList.push(path.join(dir, file));
      }
    }
  }
  return fileList;
}

const files = walk('src');
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('<SelectTrigger')) {
    const parts = content.split('<SelectTrigger');
    for (let i = 1; i < parts.length; i++) {
       const after = parts[i].substring(0, parts[i].indexOf('>'));
       const tag = '<SelectTrigger' + after + '>';
       if (!tag.includes('aria-label') && !tag.includes('id=')) {
           console.log(`Missing aria-label on SelectTrigger in ${file}:\n${tag}\n`);
       }
    }
  }
}
