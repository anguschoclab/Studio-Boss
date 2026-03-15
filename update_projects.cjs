const fs = require('fs');

const path = 'src/engine/systems/projects.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /if \(p\.format === 'tv'\) {\s*p\.status = 'pitching';\s*p\.weeksInPhase = 0;\s*update = `"\$\{p\.title\}" is ready to be pitched to networks\/streamers\.`;\s*} else {\s*p\.status = 'production';\s*p\.weeksInPhase = 0;\s*update = `"\$\{p\.title\}" enters production`;\s*}/,
  `if (p.format === 'tv') {
      p.status = 'pitching';
      p.weeksInPhase = 0;
      update = \`"\${p.title}" is ready to be pitched to networks/streamers.\`;
    } else {
      p.status = 'needs_greenlight';
      p.weeksInPhase = 0;
      update = \`"\${p.title}" is ready for greenlight committee review.\`;
    }`
);

fs.writeFileSync(path, code);
