const fs = require('fs');
const path = 'src/engine/core/weekAdvance.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /buyers: updatedBuyers,/,
  `buyers: updatedBuyers,\n    talentPool: Array.from(talentPoolMap.values()),`
);

fs.writeFileSync(path, code);
