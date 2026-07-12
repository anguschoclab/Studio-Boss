import "@testing-library/jest-dom";
import { vi, beforeEach } from "vitest";
import React from "react";
import { resetAdvanceWeekCache } from "@/engine/core/weekAdvance";

beforeEach(() => {
  resetAdvanceWeekCache();
});

vi.mock("@/components/ui/tooltip-wrapper", () => ({
  TooltipWrapper: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

if (typeof window !== "undefined") {
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
      constructor(_stringUrl: string | URL, _options?: WorkerOptions) {}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      postMessage(_message: any, _transfer?: Transferable[]) {}
      terminate() {}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      addEventListener(type: string, listener: any, _options?: any) {
        if (type === "message") this.onmessage = listener;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      removeEventListener(_type: string, _listener: any, _options?: any) {}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      dispatchEvent(_event: Event) {
        return true;
      }
    },
  });
}
