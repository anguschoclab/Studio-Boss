import { initializeGame } from './src/engine/core/gameInit.ts';
const start = performance.now();
for (let i = 0; i < 100; i++) {
  initializeGame('Test Studio', 'major', 12345 + i);
}
const end = performance.now();
console.log(`Baseline benchmark: ${(end - start).toFixed(2)}ms`);
