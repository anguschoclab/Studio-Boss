import fs from 'fs';

const file = 'src/engine/core/weekAdvance.ts';
let code = fs.readFileSync(file, 'utf8');

// The first patch didn't work because of whitespace mismatches in regex. Let's do it manually.

code = code.replace(
  'const processProjectPhase = (\n  state: GameState,\n  weeklyChanges: WeeklyChanges\n): { state: GameState; weeklyChanges: WeeklyChanges } => {',
  'const processProjectPhase = (\n  state: GameState,\n  weeklyChanges: WeeklyChanges\n): GameState => {'
);

code = code.replace(
  '  return {\n    state: { \n      ...state, \n      studio: { ...state.studio, internal: { ...state.studio.internal, projects: updatedProjects } },\n      industry: { ...state.industry, talentPool: updatedTalentPool }\n    },\n    weeklyChanges,\n  };',
  '  return { \n    ...state, \n    studio: { ...state.studio, internal: { ...state.studio.internal, projects: updatedProjects } },\n    industry: { ...state.industry, talentPool: updatedTalentPool }\n  };'
);

code = code.replace(
  'const resolveFinancials = (\n  state: GameState,\n  weeklyChanges: WeeklyChanges\n): { state: GameState; weeklyChanges: WeeklyChanges } => {',
  'const resolveFinancials = (\n  state: GameState,\n  weeklyChanges: WeeklyChanges\n): GameState => {'
);

code = code.replace(
  '  return {\n    state: { ...state, cash: newCash, studio: { ...state.studio, internal: { ...state.studio.internal, financeHistory } } },\n    weeklyChanges,\n  };',
  '  return { ...state, cash: newCash, studio: { ...state.studio, internal: { ...state.studio.internal, financeHistory } } };'
);

code = code.replace(
  'const simulateWorld = (\n  state: GameState,\n  weeklyChanges: WeeklyChanges\n): { state: GameState; weeklyChanges: WeeklyChanges } => {',
  'const simulateWorld = (\n  state: GameState,\n  weeklyChanges: WeeklyChanges\n): GameState => {'
);

code = code.replace(
  '  return {\n    state: newState,\n    weeklyChanges,\n  };',
  '  return newState;'
);

code = code.replace(
  '  const afterProjects = processProjectPhase(nextState, weeklyChanges);\n  nextState = afterProjects.state;\n  weeklyChanges = afterProjects.weeklyChanges;',
  '  nextState = processProjectPhase(nextState, weeklyChanges);'
);

code = code.replace(
  '  const afterFinance = resolveFinancials(nextState, weeklyChanges);\n  nextState = afterFinance.state;\n  weeklyChanges = afterFinance.weeklyChanges;',
  '  nextState = resolveFinancials(nextState, weeklyChanges);'
);

code = code.replace(
  '  const afterWorld = simulateWorld(nextState, weeklyChanges);\n  nextState = afterWorld.state;\n  weeklyChanges = afterWorld.weeklyChanges;',
  '  nextState = simulateWorld(nextState, weeklyChanges);'
);


fs.writeFileSync(file, code, 'utf8');
console.log('patched weekAdvance.ts - Part 1 manual');
