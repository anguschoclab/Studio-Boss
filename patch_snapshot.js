import fs from 'fs';
const content = fs.readFileSync('src/store/slices/snapshotSlice.ts', 'utf-8');
const search = `    // Derived counts
    const projectsArray = Object.values(state.entities.projects || {});
    // Completed projects are those that have been released (including post-release and archived)
    const completedProjects = projectsArray.filter(
      (p) => p.state === "released" || p.state === "post_release" || p.state === "archived"
    ).length;

    // Active projects are those currently in development, production, or marketing
    const activeProjects = projectsArray.filter(
      (p) => p.state !== "released" && p.state !== "post_release" && p.state !== "archived"
    ).length;`;
console.log(content.includes(search));
