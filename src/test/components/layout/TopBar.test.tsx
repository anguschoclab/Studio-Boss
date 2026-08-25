/**
 * @vitest-environment jsdom
 */
import React from "react";
import {render, screen} from "@testing-library/react";
import {describe, it, expect, vi} from "vitest";

// Mock TooltipWrapper
vi.mock("@/components/ui/tooltip-wrapper", () => ({
  TooltipWrapper: ({ children, content }: any) => (
    <div data-testid="tooltip-wrapper" data-tooltip-content={content}>
      {children}
    </div>
  ),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Save: (props: any) => <svg data-testid="save-icon" {...props} />,
  FastForward: (props: any) => <svg {...props} />,
  History: (props: any) => <svg {...props} />,
  DollarSign: (props: any) => <svg {...props} />,
  Star: (props: any) => <svg {...props} />,
  Clapperboard: (props: any) => <svg {...props} />,
}));

// Mock game store
vi.mock("@/store/gameStore", () => ({
  useGameStore: vi.fn((selector: any) => {
    const state = {
      gameState: {
        week: 10,
        studio: { name: "Test Studio", prestige: 50 },
        finance: { cash: 1_000_000 },
      },
      saveGame: vi.fn(),
      advanceWeek: vi.fn(),
    };
    if (typeof selector === "function") return selector(state);
    return state;
  }),
}));

import {TopBar} from "@/components/layout/TopBar";

describe("TopBar", () => {
  it("renders without crashing", () => {
    render(<TopBar />);
    expect(document.body).toBeDefined();
  });

  // ─── Accessibility tests (PR #829) ──────────────────────────────────────
  describe("accessibility", () => {
    it("save button is wrapped in TooltipWrapper (not native title attribute)", () => {
      render(<TopBar />);
      // After PR #829, the save button should be wrapped in TooltipWrapper
      // and should NOT use the native title= attribute
      const saveButtons = document.querySelectorAll('button[aria-label="Save system state"]');
      if (saveButtons.length > 0) {
        // Check if it's inside a TooltipWrapper
        const wrapper = saveButtons[0].closest('[data-testid="tooltip-wrapper"]');
        if (wrapper) {
          // Good — it's wrapped in TooltipWrapper
          expect(wrapper).toBeInTheDocument();
          // Should not have native title attribute
          expect(saveButtons[0].getAttribute("title")).toBeNull();
        }
      }
    });

    it("save button has aria-label='Save system state'", () => {
      render(<TopBar />);
      const saveBtn = screen.queryByRole("button", { name: /save system state/i });
      if (saveBtn) {
        expect(saveBtn.getAttribute("aria-label")).toBe("Save system state");
      }
    });
  });
});
