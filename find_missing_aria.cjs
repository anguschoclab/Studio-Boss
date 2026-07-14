const fs = require('fs');
const path = require('path');

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      walk(path.join(dir, file), fileList);
    } else if (file.endsWith('.tsx')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

const files = walk('./src/components');
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const regex = /<Button[^>]+size="icon"[^>]*>/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const text = match[0];
    if (!text.includes('aria-label') && !text.includes('tooltip')) {
      console.log('Missing in ' + file + ':\n' + text);
    }
  }
}
