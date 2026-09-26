function test() {
  const projects = {};
  for(let i=0; i<10000; i++) {
    projects['p' + i] = {
      state: i % 2 === 0 ? 'released' : 'production'
    };
  }

  const start1 = performance.now();
  for(let j=0; j<1000; j++) {
    const projectsArray = Object.values(projects);
    const completedProjects = projectsArray.filter(
      (p) => p.state === "released" || p.state === "post_release" || p.state === "archived"
    ).length;

    const activeProjects = projectsArray.filter(
      (p) => p.state !== "released" && p.state !== "post_release" && p.state !== "archived"
    ).length;
  }
  const end1 = performance.now();
  console.log(`Array allocation + filters: ${end1 - start1}ms`);

  const start2 = performance.now();
  for(let j=0; j<1000; j++) {
    let completedProjects = 0;
    let activeProjects = 0;
    const projectsObj = projects || {};
    for (const pid in projectsObj) {
        if (!Object.prototype.hasOwnProperty.call(projectsObj, pid)) continue;
        const p = projectsObj[pid];
        if (p.state === "released" || p.state === "post_release" || p.state === "archived") {
            completedProjects++;
        } else {
            activeProjects++;
        }
    }
  }
  const end2 = performance.now();
  console.log(`Direct iteration: ${end2 - start2}ms`);
}
test();
