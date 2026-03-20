const fs = require('fs');
let content = fs.readFileSync('src/engine/types.ts', 'utf8');

// Update ProjectStatus
content = content.replace(
  "export type ProjectStatus = 'development' | 'pitching' | 'production' | 'released' | 'archived';",
  "export type ProjectStatus = 'development' | 'pitching' | 'needs_greenlight' | 'production' | 'marketing' | 'released' | 'archived';"
);

fs.writeFileSync('src/engine/types.ts', content);
