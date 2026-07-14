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
files.push('./src/pages/NewGame.tsx');
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');

  // Look for icon buttons missing aria-label
  let buttonMatches = content.match(/<Button[^>]+size="icon"[^>]*>/g) || [];
  for (let match of buttonMatches) {
    if (!match.includes('aria-label') && !match.includes('tooltip')) {
      console.log(`Missing aria-label on icon button in ${file}:\n${match}\n`);
    }
  }

  // Look for bare inputs missing aria-label or id (and no label)
  let inputMatches = content.match(/<(?:input)[^>]*>/g) || [];
  for (let match of inputMatches) {
    if (!match.includes('aria-label') && !match.includes('id=')) {
      console.log(`Missing aria-label/id on input in ${file}:\n${match}\n`);
    }
  }

  // Look for select missing aria-label or id
  let selectMatches = content.match(/<(?:select)[^>]*>/g) || [];
  for (let match of selectMatches) {
    if (!match.includes('aria-label') && !match.includes('id=')) {
      console.log(`Missing aria-label/id on select in ${file}:\n${match}\n`);
    }
  }
}
