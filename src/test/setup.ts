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
    postMessage(message: any, transfer?: Transferable[]) {}
    terminate() {}
    addEventListener(type: string, listener: any, options?: any) {}
    removeEventListener(type: string, listener: any, options?: any) {}
    dispatchEvent(event: Event) { return true; }
  }
});
