function test() {
  const filmography = [
    { gross: 60000000 },
    { gross: 40000000 },
    { gross: 100000000 },
    { gross: 20000000 }
  ];

  const start1 = performance.now();
  for(let j=0; j<1000000; j++) {
    const recentProjects = filmography.slice(0, 3);
    const momentum =
      recentProjects.length > 0
        ? recentProjects.reduce((sum, p) => sum + (p.gross > 50000000 ? 100 : 50), 0) /
          recentProjects.length
        : 50;
  }
  const end1 = performance.now();
  console.log(`Original slice + reduce: ${end1 - start1}ms`);

  const start2 = performance.now();
  for(let j=0; j<1000000; j++) {
    const len = Math.min(filmography.length, 3);
    let momentum = 50;
    if (len > 0) {
      let sum = 0;
      for (let i = 0; i < len; i++) {
        sum += filmography[i].gross > 50000000 ? 100 : 50;
      }
      momentum = sum / len;
    }
  }
  const end2 = performance.now();
  console.log(`Optimized loop (no allocs): ${end2 - start2}ms`);
}
test();
