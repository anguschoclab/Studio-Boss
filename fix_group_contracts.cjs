const fs = require('fs');

// Add helper to utils.ts
const utilsFile = 'src/engine/utils.ts';
let utilsCode = fs.readFileSync(utilsFile, 'utf8');

if (!utilsCode.includes('groupContractsByProject')) {
  utilsCode = `import { Contract } from './types';\n` + utilsCode;
  utilsCode += `\nexport function groupContractsByProject(contracts: Contract[]): Map<string, Contract[]> {
  const map = new Map<string, Contract[]>();
  for (const contract of contracts) {
    if (!map.has(contract.projectId)) {
      map.set(contract.projectId, []);
    }
    map.get(contract.projectId)!.push(contract);
  }
  return map;
}\n`;
  fs.writeFileSync(utilsFile, utilsCode);
}

// Refactor finance.ts
const financeFile = 'src/engine/systems/finance.ts';
let financeCode = fs.readFileSync(financeFile, 'utf8');
financeCode = financeCode.replace(`import { Project, Contract } from '../types';`, `import { Project, Contract } from '../types';\nimport { groupContractsByProject } from '../utils';`);
const fTarget = `  // Group contracts by projectId for O(1) lookup
  const contractsByProject = new Map<string, Contract[]>();
  for (const contract of contracts) {
    if (!contractsByProject.has(contract.projectId)) {
      contractsByProject.set(contract.projectId, []);
    }
    contractsByProject.get(contract.projectId)!.push(contract);
  }`;
financeCode = financeCode.replace(fTarget, `  const contractsByProject = groupContractsByProject(contracts);`);
fs.writeFileSync(financeFile, financeCode);

// Refactor weekAdvance.ts
const weekAdvanceFile = 'src/engine/core/weekAdvance.ts';
let weekAdvanceCode = fs.readFileSync(weekAdvanceFile, 'utf8');
weekAdvanceCode = weekAdvanceCode.replace(`import { pick } from '../utils';`, `import { pick, groupContractsByProject } from '../utils';`);
const wTarget = `  // Group contracts by projectId for O(1) lookup
  const contractsByProject = new Map<string, Contract[]>();
  for (const contract of state.contracts) {
    if (!contractsByProject.has(contract.projectId)) {
      contractsByProject.set(contract.projectId, []);
    }
    contractsByProject.get(contract.projectId)!.push(contract);
  }`;
weekAdvanceCode = weekAdvanceCode.replace(wTarget, `  const contractsByProject = groupContractsByProject(state.contracts);`);
fs.writeFileSync(weekAdvanceFile, weekAdvanceCode);
