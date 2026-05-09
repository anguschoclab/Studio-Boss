import { performance } from 'perf_hooks';

function generateDummyState() {
  const projects = {};
  for(let i=0; i<10000; i++) {
    projects['proj_' + i] = {
      id: 'proj_' + i,
      reviewScore: Math.random() * 100,
      budget: Math.random() * 100_000_000,
      state: 'released',
      releaseWeek: 10
    }
  }
  return { entities: { projects } };
}

const state = generateDummyState();

function oldWay() {
  const projects = Object.values(state.entities.projects || {});

  const eligibleProjects = projects.filter(p => {
    const score = p.reviewScore || 100;
    const budget = p.budget || 0;
    return p.state === 'released' && budget >= 50_000_000 && score <= 30 && p.releaseWeek !== null;
  });
  return eligibleProjects.length;
}

function newWay() {
  const eligibleProjects = [];
  const projects = state.entities.projects || {};
  for (const key in projects) {
    const p = projects[key];
    const score = p.reviewScore || 100;
    const budget = p.budget || 0;
    if (p.state === 'released' && budget >= 50_000_000 && score <= 30 && p.releaseWeek !== null) {
      eligibleProjects.push(p);
    }
  }
  return eligibleProjects.length;
}

const ITERATIONS = 100;

let start = performance.now();
for(let i=0; i<ITERATIONS; i++) oldWay();
let oldTime = performance.now() - start;

start = performance.now();
for(let i=0; i<ITERATIONS; i++) newWay();
let newTime = performance.now() - start;

console.log(`oldWay: ${oldTime.toFixed(2)}ms`);
console.log(`newWay: ${newTime.toFixed(2)}ms`);
