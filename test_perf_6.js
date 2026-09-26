import fs from 'fs';
const content = fs.readFileSync('src/store/slices/snapshotSlice.ts', 'utf-8');
console.log(content.includes('const projectsArray = Object.values(state.entities.projects || {});'));
