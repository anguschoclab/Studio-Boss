const fs = require('fs');

const path = 'src/store/gameStore.ts';
let code = fs.readFileSync(path, 'utf8');

const regex = /const project = \{\n      id: projectId,\n      \.\.\.params,\n      budget: totalBudget,\n      weeklyCost,\n      status: 'development' as const,\n/;

console.log("Regex match:", regex.test(code));

const projectDef = code.substring(code.indexOf('const project = {'), code.indexOf('set({'));
console.log(projectDef);
