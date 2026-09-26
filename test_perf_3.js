import { createSelector } from "reselect";

function test() {
  const projects = {};
  for(let i=0; i<10000; i++) {
    projects['p' + i] = {
      state: i % 2 === 0 ? 'released' : 'production'
    };
  }

  const selectProjectsRaw = (state) => state.projects;
  const selectProjects = createSelector([selectProjectsRaw], (projects) => Object.values(projects));
  const selectActiveProjects = createSelector([selectProjects], (projects) =>
    projects.filter(
      (p) => p.state !== "released" && p.state !== "archived" && p.state !== "post_release"
    )
  );

  const start1 = performance.now();
  let state = {projects};
  for(let j=0; j<1000; j++) {
    // Modify slightly to break memoization
    state = {projects: {...state.projects, ['p'+j]: {state: 'production'}}};

    // In selectors.ts, multiple selectors call `selectProjects`, so we simulate getting active and completed
    const active = selectActiveProjects(state);
  }
  const end1 = performance.now();
  console.log(`With createSelector and filter: ${end1 - start1}ms`);
}
test();
