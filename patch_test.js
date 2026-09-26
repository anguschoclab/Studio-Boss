import fs from 'fs';
const content = fs.readFileSync('src/store/slices/snapshotSlice.ts', 'utf-8');
console.log(content);
