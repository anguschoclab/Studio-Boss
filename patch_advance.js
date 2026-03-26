import fs from 'fs';

const file = 'src/engine/core/weekAdvance.ts';
let code = fs.readFileSync(file, 'utf8');

// 1. processProjectPhase
code = code.replace(
  /const processProjectPhase = \(\n  state: GameState,\n  weeklyChanges: WeeklyChanges\n\): \{ state: GameState; weeklyChanges: WeeklyChanges \} => \{/g,
  `const processProjectPhase = (\n  state: GameState,\n  weeklyChanges: WeeklyChanges\n): GameState => {`
);
code = code.replace(
  /  return \{\n    state: \{ \n      \.\.\.state, \n      studio: \{ \.\.\.state\.studio, internal: \{ \.\.\.state\.studio\.internal, projects: updatedProjects \} \},\n      industry: \{ \.\.\.state\.industry, talentPool: updatedTalentPool \}\n    \},\n    weeklyChanges,\n  \};/g,
  `  return {\n    ...state,\n    studio: { ...state.studio, internal: { ...state.studio.internal, projects: updatedProjects } },\n    industry: { ...state.industry, talentPool: updatedTalentPool }\n  };`
);

// 2. resolveFinancials
code = code.replace(
  /const resolveFinancials = \(\n  state: GameState,\n  weeklyChanges: WeeklyChanges\n\): \{ state: GameState; weeklyChanges: WeeklyChanges \} => \{/g,
  `const resolveFinancials = (\n  state: GameState,\n  weeklyChanges: WeeklyChanges\n): GameState => {`
);
code = code.replace(
  /  return \{\n    state: \{ \.\.\.state, cash: newCash, studio: \{ \.\.\.state\.studio, internal: \{ \.\.\.state\.studio\.internal, financeHistory \} \} \},\n    weeklyChanges,\n  \};/g,
  `  return { ...state, cash: newCash, studio: { ...state.studio, internal: { ...state.studio.internal, financeHistory } } };`
);

// 3. simulateWorld
code = code.replace(
  /const simulateWorld = \(\n  state: GameState,\n  weeklyChanges: WeeklyChanges\n\): \{ state: GameState; weeklyChanges: WeeklyChanges \} => \{/g,
  `const simulateWorld = (\n  state: GameState,\n  weeklyChanges: WeeklyChanges\n): GameState => {`
);
code = code.replace(
  /  return \{\n    state: newState,\n    weeklyChanges,\n  \};/g,
  `  return newState;`
);

// advanceWeek usage updates
code = code.replace(
  /  \/\/ 1\. Process Projects \(Advancement, Quality, Completion\)\n  const afterProjects = processProjectPhase\(nextState, weeklyChanges\);\n  nextState = afterProjects\.state;\n  weeklyChanges = afterProjects\.weeklyChanges;/g,
  `  // 1. Process Projects (Advancement, Quality, Completion)\n  nextState = processProjectPhase(nextState, weeklyChanges);`
);

code = code.replace(
  /  \/\/ 2\. Resolve Finances \(Burn, Revenue, Cash Flow\)\n  const afterFinance = resolveFinancials\(nextState, weeklyChanges\);\n  nextState = afterFinance\.state;\n  weeklyChanges = afterFinance\.weeklyChanges;/g,
  `  // 2. Resolve Finances (Burn, Revenue, Cash Flow)\n  nextState = resolveFinancials(nextState, weeklyChanges);`
);

code = code.replace(
  /  \/\/ 3\. Simulate World \(Rivals, Talent Stat Decay, Agency Refresh\)\n  const afterWorld = simulateWorld\(nextState, weeklyChanges\);\n  nextState = afterWorld\.state;\n  weeklyChanges = afterWorld\.weeklyChanges;/g,
  `  // 3. Simulate World (Rivals, Talent Stat Decay, Agency Refresh)\n  nextState = simulateWorld(nextState, weeklyChanges);`
);

fs.writeFileSync(file, code, 'utf8');
console.log('patched weekAdvance.ts - Part 1');
