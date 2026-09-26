import fs from 'fs';
const content = fs.readFileSync('src/store/gameStore.ts', 'utf-8');
const lines = content.split('\n');
for (let i = 140; i < 160; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
