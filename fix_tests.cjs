const fs = require('fs');

// Fix saveLoad.test.ts (add localStorage mock)
let saveLoadContent = fs.readFileSync('src/test/persistence/saveLoad.test.ts', 'utf8');

const localStorageMock = `
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem(key) {
        return store[key] || null;
      },
      setItem(key, value) {
        store[key] = value.toString();
      },
      clear() {
        store = {};
      },
      removeItem(key) {
        delete store[key];
      }
    };
  })();
  Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
  });
`;

if (!saveLoadContent.includes('localStorageMock')) {
  saveLoadContent = saveLoadContent.replace(/describe\("saveLoad", \(\) => \{/, 'describe("saveLoad", () => {' + localStorageMock);
  fs.writeFileSync('src/test/persistence/saveLoad.test.ts', saveLoadContent);
}

// Fix gameStore.test.ts mock structure
let gameStoreContent = fs.readFileSync('src/test/store/gameStore.test.ts', 'utf8');

// Also mock crypto.randomUUID
const uuidMock = `
Object.defineProperty(global, 'crypto', {
  value: { randomUUID: () => 'test-uuid' },
  writable: true
});
`;

if (!gameStoreContent.includes('crypto.randomUUID')) {
    gameStoreContent = `import { mock } from "bun:test";\n` + gameStoreContent.replace(/vi\.mock\([^]+?\);/, `mock.module("../../persistence/saveLoad", () => ({\n  saveGame: mock(),\n  loadGame: mock((slot) => {\n    if (slot === 1) return { studio: { name: "Loaded Studio" } };\n    return null;\n  }),\n  getSaveSlots: mock(() => [{ exists: true }]),\n}));\n${uuidMock}`);
    fs.writeFileSync('src/test/store/gameStore.test.ts', gameStoreContent);
}
