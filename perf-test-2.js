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
  const allProjects = Object.values(state.entities.projects || {});

  const eligibleFilm = [];
  const eligibleTv = [];

  for (const p of allProjects) {
    if ((p.state === 'released' || p.state === 'post_release' || p.state === 'archived') &&
        p.releaseWeek !== null &&
        p.releaseWeek > 100 - 52) {

      const formatMatch = (p.format || '').toLowerCase();
      if (formatMatch === 'film') eligibleFilm.push(p);
      else if (formatMatch === 'tv' || formatMatch === 'series') eligibleTv.push(p);
    }
  }
}

function newWay() {
  const eligibleFilm = [];
  const eligibleTv = [];
  const projects = state.entities.projects || {};

  for (const id in projects) {
    const p = projects[id];
    if ((p.state === 'released' || p.state === 'post_release' || p.state === 'archived') &&
        p.releaseWeek !== null &&
        p.releaseWeek > 100 - 52) {

      const formatMatch = (p.format || '').toLowerCase();
      if (formatMatch === 'film') eligibleFilm.push(p);
      else if (formatMatch === 'tv' || formatMatch === 'series') eligibleTv.push(p);
    }
  }
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
