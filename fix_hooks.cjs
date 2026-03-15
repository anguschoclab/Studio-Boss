const fs = require('fs');

const path = 'src/components/modals/ProjectDetailModal.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /if \(!project\) return null;\n\n  const tier = BUDGET_TIERS\[project.budgetTier\];\n\n  const greenlightReport = useMemo\(\(\) => \{/,
  `const tier = project ? BUDGET_TIERS[project.budgetTier] : null;

  const greenlightReport = useMemo(() => {`
);

code = code.replace(
  /const greenlightReport = useMemo\(\(\) => \{[\s\S]*?\}, \[project, gameState, contracts, talentPool\]\);/,
  `const greenlightReport = useMemo(() => {
    if (!project || project.status !== 'needs_greenlight' || !gameState) return null;
    const projectContracts = contracts.filter(c => c.projectId === project.id);
    const attachedTalent = projectContracts.map(c => talentPool.find(t => t.id === c.talentId)).filter(Boolean) as import('@/engine/types').TalentProfile[];
    return evaluateGreenlight(project, gameState.cash, attachedTalent);
  }, [project, gameState, contracts, talentPool]);\n\n  if (!project || !tier) return null;`
);

fs.writeFileSync(path, code);
