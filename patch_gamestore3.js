import fs from 'fs';

const file = 'src/store/gameStore.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  '  doAdvanceWeek: () => {\n    let summary: WeekSummary | null = null;\n\n    set((state) => {\n      if (!state.gameState) throw new Error(\'No game in progress\');\n      const result = advanceWeek(state.gameState);\n      summary = result.summary;\n      saveGame(0, result.newState);\n      return { gameState: result.newState };\n    });',
  `  doAdvanceWeek: () => {
    let summary: WeekSummary | null = null;

    set((state) => {
      if (!state.gameState) throw new Error('No game in progress');
      const result = advanceWeek(state.gameState);
      summary = result.summary;

      if (state.gameState === result.newState) return state; // Prevent unnecessary re-renders

      saveGame(0, result.newState);
      return { gameState: result.newState };
    });`
);

fs.writeFileSync(file, code, 'utf8');
console.log('patched gameStore.ts - Part 2');
