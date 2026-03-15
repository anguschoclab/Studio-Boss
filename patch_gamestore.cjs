const fs = require('fs');

const path = 'src/store/gameStore.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /const project = \{\n      id: crypto\.randomUUID\(\),/,
  `// Calculate talent costs
    const attachedTalentIds = params.attachedTalentIds || [];
    const attachedTalent = attachedTalentIds
      .map(id => state.talentPool.find(t => t.id === id))
      .filter(t => t !== undefined);

    const talentFees = attachedTalent.reduce((sum, t) => sum + (t?.fee || 0), 0);
    const totalBudget = budget + talentFees;

    const projectId = crypto.randomUUID();

    const newContracts = attachedTalent.map(t => ({
      id: \`contract-\${crypto.randomUUID()}\`,
      talentId: t.id,
      projectId,
      fee: t.fee,
      backendPercent: t.prestige > 80 ? 10 : 0,
    }));

    const project = {
      id: projectId,`
);

code = code.replace(
  /budget,\n      weeklyCost,\n      status: 'development'/,
  `budget: totalBudget,\n      weeklyCost,\n      status: 'development'`
);

code = code.replace(
  /set\(\{ gameState: \{ \.\.\.state, projects: \[\.\.\.state\.projects, project\] \} \}\);/,
  `set({
      gameState: {
        ...state,
        projects: [...state.projects, project],
        contracts: [...state.contracts, ...newContracts],
        cash: state.cash - talentFees // Deduct upfront talent fees immediately
      }
    });`
);

fs.writeFileSync(path, code);
