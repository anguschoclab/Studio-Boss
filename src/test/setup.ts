import "@testing-library/jest-dom";
import { vi } from "vitest";

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

// Mock vite-plugin-pwa virtual module
vi.mock("virtual:pwa-register/react", () => ({
  useRegisterSW: () => ({
    needRefresh: [false, () => {}],
    updateServiceWorker: () => {},
  }),
}));

// Mock Web Worker for GameStore
class MockWorker {
  url: string;
  onmessage: ((ev: MessageEvent) => void) | null = null;
  handlers: Set<(ev: MessageEvent) => void> = new Set();

  constructor(stringUrl: string) {
    this.url = stringUrl;
  }

  postMessage(data: any) {
    // Simulate async response
    setTimeout(() => {
      let response = { type: 'UNKNOWN', payload: {} };
      
      if (data.type === 'INIT_GAME') {
        response = { 
          type: 'INIT_RESULT', 
          payload: { 
            ...data.payload, 
            week: 1, 
            finance: { cash: 1000000, ledger: [], weeklyHistory: [] }, 
            studio: { name: data.payload.studioName, prestige: 50, internal: { projectHistory: [] } },
            ip: { vault: [], franchises: {} },
            market: { buyers: [], opportunities: [], trends: [] },
            industry: { newsHistory: [], scandals: [] },
            entities: { projects: {}, rivals: {}, talents: {} } 
          } 
        };
      } else if (data.type === 'ADVANCE_WEEK') {
        const nextState = { ...data.payload.state, week: data.payload.state.week + 1 };
        response = { type: 'ADVANCE_RESULT', payload: { newState: nextState, summary: { fromWeek: data.payload.state.week, toWeek: nextState.week, events: [] }, impacts: [] } };
      }

      const event = { data: response } as MessageEvent;
      if (this.onmessage) this.onmessage(event);
      this.handlers.forEach(h => h(event));
    }, 10);
  }

  terminate() {}

  addEventListener(type: string, handler: any) {
    if (type === 'message') this.handlers.add(handler);
  }

  removeEventListener(type: string, handler: any) {
    if (type === 'message') this.handlers.delete(handler);
  }

  dispatchEvent() { return true; }
}

global.Worker = MockWorker as any;
