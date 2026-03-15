const fs = require('fs');
let content = fs.readFileSync('src/test/engine/generators/talent.test.ts', 'utf8');

content = content.replace(
  "generateTalentPool(5, [])",
  "generateTalentPool(5, [], [], [])"
);

content = content.replace(
  "generateTalentPool(1, [])",
  "generateTalentPool(1, [], [], [])"
);

content = content.replace(
  "generateTalentPool(1, families)",
  "generateTalentPool(1, families, [], [])"
);

fs.writeFileSync('src/test/engine/generators/talent.test.ts', content);
