// IMPORTANT: This module must have no imports so it can run before any other
// module in the setup chain. Node >= 22 ships an experimental global
// `localStorage` that is unusable without --localstorage-file (access throws /
// returns undefined). It shadows jsdom's implementation, so zustand's
// `persist` middleware resolves storage to undefined at module-init time and
// crashes on setItem. Because ESM imports are hoisted, this shim must execute
// during setup.ts's import phase — keep it dependency-free and imported first.

class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length() {
    return this.map.size;
  }
  clear() {
    this.map.clear();
  }
  getItem(key: string) {
    return this.map.has(key) ? this.map.get(key)! : null;
  }
  key(index: number) {
    return Array.from(this.map.keys())[index] ?? null;
  }
  removeItem(key: string) {
    this.map.delete(key);
  }
  setItem(key: string, value: string) {
    this.map.set(key, String(value));
  }
}

const memoryStorage = new MemoryStorage();
Object.defineProperty(globalThis, "localStorage", {
  writable: true,
  configurable: true,
  value: memoryStorage,
});
if (typeof window !== "undefined") {
  Object.defineProperty(window, "localStorage", {
    writable: true,
    configurable: true,
    value: memoryStorage,
  });
}

export { memoryStorage };
