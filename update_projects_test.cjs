const fs = require('fs');

const path = 'src/test/engine/systems/projects.test.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /transitions from development to production/,
  `transitions from development to needs_greenlight`
);

code = code.replace(
  /expect\(p\.status\)\.toBe\("production"\);/,
  `expect(p.status).toBe("needs_greenlight");`
);

code = code.replace(
  /expect\(update\)\.toContain\("enters production"\);/,
  `expect(update).toContain("is ready for greenlight committee review");`
);

fs.writeFileSync(path, code);
