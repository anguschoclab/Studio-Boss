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
  if (content.includes('size="icon"')) {
    const parts = content.split('size="icon"');
    // very basic check to see if the button tag block has aria-label
    for (let i = 0; i < parts.length - 1; i++) {
       // Look back to the previous '<Button' and forward to the next '>'
       const before = parts[i].substring(parts[i].lastIndexOf('<Button'));
       const after = parts[i+1].substring(0, parts[i+1].indexOf('>'));
       const tag = before + 'size="icon"' + after;
       if (!tag.includes('aria-label') && tag.includes('<Button')) {
           console.log(`Missing aria-label on icon button in ${file}:\n${tag}\n`);
       }
    }
  }
}
