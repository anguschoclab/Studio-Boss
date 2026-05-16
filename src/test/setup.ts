import "@testing-library/jest-dom";
import { vi, beforeEach } from 'vitest';
import React from 'react';
import { resetAdvanceWeekCache } from '@/engine/core/weekAdvance';

beforeEach(() => {
  resetAdvanceWeekCache();
});

vi.mock('@/components/ui/tooltip-wrapper', () => ({
  TooltipWrapper: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
}));

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

Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: vi.fn(),
});

Object.defineProperty(window, "Worker", {
  writable: true,
  value: class {
    onmessage: ((ev: MessageEvent) => any) | null = null;
    onerror: ((ev: ErrorEvent) => any) | null = null;
    constructor(_stringUrl: string | URL, _options?: WorkerOptions) {}
    postMessage(_message: any, _transfer?: Transferable[]) {}
    terminate() {}
    addEventListener(type: string, listener: any, _options?: any) {
      if (type === 'message') this.onmessage = listener;
    }
    removeEventListener(_type: string, _listener: any, _options?: any) {}
    dispatchEvent(_event: Event) { return true; }
  }
});
