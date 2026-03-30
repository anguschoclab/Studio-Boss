const fs = require('fs');

const file = 'src/test/engine/systems/processors/processProduction.test.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("expect(changes.projectUpdates).toContain('Director is unhappy!');\n  \n\n  it('triggers a new crisis when project has a resolved crisis', () => {", "expect(changes.projectUpdates).toContain('Director is unhappy!');\n  });\n\n  it('triggers a new crisis when project has a resolved crisis', () => {");

fs.writeFileSync(file, content);
