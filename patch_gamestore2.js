import fs from 'fs';

const file = 'src/store/gameStore.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  '  newGame: (studioName, archetype) => {\n    const gameState = initializeGame(studioName, archetype);\n    saveGame(0, gameState);\n    set({ gameState });\n  },',
  `  newGame: (studioName, archetype) => {
    set((s) => {
      const gameState = initializeGame(studioName, archetype);
      saveGame(0, gameState);
      return { gameState };
    });
  },`
);

fs.writeFileSync(file, code, 'utf8');
console.log('patched gameStore.ts - Part 1 manual');
