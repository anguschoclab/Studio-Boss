const fs = require('fs');

// fix greenlight.ts
let path = 'src/engine/systems/greenlight.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /let recommendation: GreenlightRecommendation = 'Do Not Greenlight Yet';/,
  `let recommendation: GreenlightRecommendation;`
);

fs.writeFileSync(path, code);

// fix opportunities.ts
path = 'src/engine/generators/opportunities.ts';
code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /import \{ generateHeadlineContent \} from '\.\/headlines';/,
  ``
);

fs.writeFileSync(path, code);

// fix weekAdvance.test.ts
path = 'src/test/engine/core/weekAdvance.test.ts';
code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /import \{ GameState, WeekSummary \} from '\.\.\/\.\.\/engine\/types';/,
  `import { WeekSummary } from '../../engine/types';`
);

fs.writeFileSync(path, code);
