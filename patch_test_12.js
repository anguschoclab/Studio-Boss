import fs from 'fs';
const content = fs.readFileSync('src/store/slices/talentSlice.ts', 'utf-8');
const search = `    const filmography = talent.filmography || [];
    const recentProjects = filmography.slice(0, 3);
    const momentum =
      recentProjects.length > 0
        ? recentProjects.reduce((sum, p) => sum + (p.gross > 50000000 ? 100 : 50), 0) /
          recentProjects.length
        : 50;`;
console.log(content.includes(search));
