function withObjectValues(state) {
  let count = 0;
  Object.values(state.entities.projects).forEach(p => {
    if (p.ownerId === 'player') count++;
  });
  return count;
}

function withForIn(state) {
  let count = 0;
  for (const key in state.entities.projects) {
    if (state.entities.projects[key].ownerId === 'player') count++;
  }
  return count;
}

const state = {
  entities: {
    projects: {}
  }
};

for (let i = 0; i < 10000; i++) {
  state.entities.projects[`proj_${i}`] = { ownerId: i % 10 === 0 ? 'player' : 'rival' };
}

const iterations = 1000;

console.time('Object.values');
for (let i = 0; i < iterations; i++) {
  withObjectValues(state);
}
console.timeEnd('Object.values');

console.time('for...in');
for (let i = 0; i < iterations; i++) {
  withForIn(state);
}
console.timeEnd('for...in');
