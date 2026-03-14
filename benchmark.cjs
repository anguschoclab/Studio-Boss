const { performance } = require('perf_hooks');

const projects = Array.from({ length: 1000 }, (_, i) => ({
  id: i,
  status: i % 3 === 0 ? 'development' : i % 3 === 1 ? 'production' : 'released'
}));

function renderWithoutMemo() {
  return projects.filter(p => p.status === 'development' || p.status === 'production').length;
}

let memoizedValue = null;
let lastProjects = null;

function renderWithMemo() {
  if (lastProjects !== projects) {
    memoizedValue = projects.reduce((acc, p) => (p.status === 'development' || p.status === 'production' ? acc + 1 : acc), 0);
    lastProjects = projects;
  }
  return memoizedValue;
}

const ITERATIONS = 100000;

const start1 = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  renderWithoutMemo();
}
const end1 = performance.now();
console.log(`Without memo (filter): ${(end1 - start1).toFixed(2)} ms`);

const start2 = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  renderWithMemo();
}
const end2 = performance.now();
console.log(`With memo + reduce: ${(end2 - start2).toFixed(2)} ms`);
