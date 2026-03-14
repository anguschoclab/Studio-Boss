const fs = require('fs');

let code = fs.readFileSync('src/engine/systems/projects.ts', 'utf-8');

// Replace the status transition logic
code = code.replace(
  "  if (p.status === 'development' && p.weeksInPhase >= p.developmentWeeks) {\n    p.status = 'production';\n    p.weeksInPhase = 0;\n    update = `\"${p.title}\" enters production`;\n  } else if (p.status === 'production' && p.weeksInPhase >= p.productionWeeks) {",
  `  if (p.status === 'development' && p.weeksInPhase >= p.developmentWeeks) {
    if (p.format === 'tv') {
      p.status = 'pitching';
      p.weeksInPhase = 0;
      update = \`"\${p.title}" is ready to be pitched to networks/streamers.\`;
    } else {
      p.status = 'production';
      p.weeksInPhase = 0;
      update = \`"\${p.title}" enters production\`;
    }
  } else if (p.status === 'production' && p.weeksInPhase >= p.productionWeeks) {`
);

fs.writeFileSync('src/engine/systems/projects.ts', code);
