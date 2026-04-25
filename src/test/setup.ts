import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

Object.defineProperty(window, "Worker", {
  writable: true,
  value: class {
    onmessage: ((ev: MessageEvent) => any) | null = null;
    onerror: ((ev: ErrorEvent) => any) | null = null;
    constructor(stringUrl: string | URL, options?: WorkerOptions) {}
    postMessage(message: unknown, transfer?: Transferable[]) {}
    terminate() {}
    addEventListener(type: string, listener: unknown, options?: unknown) {}
    removeEventListener(type: string, listener: unknown, options?: unknown) {}
    dispatchEvent(event: Event) { return true; }
  }
});
