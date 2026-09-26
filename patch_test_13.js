import fs from 'fs';
const content = fs.readFileSync('src/store/slices/talentStatsSlice.ts', 'utf-8');
const search = `    const filmography = talent.filmography || [];
    const recentProjects = filmography.slice(0, 3);
    const momentum =
      recentProjects.length > 0
        ? recentProjects.reduce((sum: number, p) => sum + ((p.gross || 0) > 50000000 ? 10 : 5), 0) /
          recentProjects.length
        : 5;`;
console.log(content.includes(search));
