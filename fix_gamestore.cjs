const fs = require('fs');
const path = 'src/store/gameStore.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /const project = \{\n\s+id: crypto.randomUUID\(\),/,
  "const project = {\n      id: projectId,"
);

const originalSetState = `set({ gameState: { ...state, projects: [...state.projects, project] } });`;

code = code.replace(originalSetState,
`set({
      gameState: {
        ...state,
        projects: [...state.projects, project],
        contracts: [...state.contracts, ...newContracts],
        cash: state.cash - talentFees // Deduct upfront talent fees immediately
      }
    });`);

fs.writeFileSync(path, code);
