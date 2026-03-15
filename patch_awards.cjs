const fs = require('fs');
const path = 'src/engine/systems/awards.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /const scored = eligibleProjects\.reduce\(\(acc, p\) => \{[\s\S]*?\} \]\s+return acc;\n    \}, \[\] as \{ project: Project, score: number \}\[\]\)\.sort\(\(a, b\) => b\.score - a\.score\);/,
  `const scored = eligibleProjects.reduce((acc, p) => {
      if (formatFilter === 'both' || p.format === formatFilter) {
        acc.push({
          project: p,
          score: evaluator(p) * (1 + (p.awardsProfile?.campaignStrength || 0) / 100)
        });
      }
      return acc;
    }, [] as { project: Project, score: number }[]).sort((a, b) => b.score - a.score);`
);

code = code.replace(
  /if \(bodiesThisWeek\.length === 0\) \{\n    return \{ newAwards, prestigeChange, projectUpdates \};\n  \}/,
  `if (bodiesThisWeek.length === 0) {
    return { newAwards, prestigeChange, projectUpdates };
  }`
);

// Fix the array push inside reduce:
code = code.replace(
  /acc\.push\(\{\n          project: p,\n          score: evaluator\(p\) \* \(1 \+ \(p\.awardsProfile\?\.campaignStrength \|\| 0\) \/ 100\) \/\/ Campaign boosts score\n        \}\);/,
  `acc.push({
          project: p,
          score: evaluator(p) * (1 + (p.awardsProfile?.campaignStrength || 0) / 100)
        });`
);

fs.writeFileSync(path, code);
