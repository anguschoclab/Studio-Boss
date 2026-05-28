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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
constructor(/* eslint-disable @typescript-eslint/no-unused-vars */ stringUrl: string | URL, options?: WorkerOptions) {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
postMessage(/* eslint-disable @typescript-eslint/no-unused-vars */ message: any, transfer?: Transferable[]) {}
    terminate() {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
addEventListener(/* eslint-disable @typescript-eslint/no-unused-vars */ type: string, listener: any, options?: any) {
      if (type === 'message') this.onmessage = listener;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
removeEventListener(/* eslint-disable @typescript-eslint/no-unused-vars */ type: string, listener: any, options?: any) {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
dispatchEvent(/* eslint-disable @typescript-eslint/no-unused-vars */ event: Event) { return true; }
  }
});
