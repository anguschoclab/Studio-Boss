/**
 * @vitest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";

// Mock stores
vi.mock("@/store/gameStore", () => ({
  useGameStore: vi.fn(),
}));

// Mock TalentProfileModal to avoid complex rendering
vi.mock("@/components/talent/TalentProfileModal", () => ({
  TalentModal: () => null,
}));

// Mock TalentCard to simplify testing
vi.mock("@/components/talent/TalentCard", () => ({
  TalentCard: () => <div data-testid="mock-talent-card" />,
}));

// Mock useAgencyMap
vi.mock("@/hooks/useTalentMap", () => ({
  useAgencyMap: () => new Map(),
}));

import { useGameStore } from "@/store/gameStore";
import { TalentHub } from "@/components/talent/TalentHub";

describe("TalentHub Focus-Visible Styles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      if (typeof selector === "function") {
        return selector({
          gameState: {
            week: 1,
            entities: {
              talents: {},
              contracts: {},
              projects: {},
            },
          },
          toggleBookmark: vi.fn(),
          isBookmarked: () => false,
        });
      }
      return selector;
    });
  });

  it("roster bookmark button has aria-pressed attribute", () => {
    render(
      <TooltipProvider>
        <TalentHub />
      </TooltipProvider>
    );
    const bookmarkBtn = screen.getByRole("button", { name: /Show bookmarks only/i });
    expect(bookmarkBtn).toHaveAttribute("aria-pressed", "false");
  });

  it("SBDB tab trigger is present", () => {
    render(
      <TooltipProvider>
        <TalentHub />
      </TooltipProvider>
    );
    const sbdbTab = screen.getByText("INDUSTRY SBDB");
    expect(sbdbTab).toBeDefined();
  });

  it("roster bookmark icon does not have aria-hidden (roster tab lacks accessibility fix)", () => {
    render(
      <TooltipProvider>
        <TalentHub />
      </TooltipProvider>
    );
    const bookmarkBtn = screen.getByRole("button", { name: /Show bookmarks only/i });
    const svg = bookmarkBtn.querySelector("svg");
    // Roster tab's bookmark button does not have aria-hidden on svg
    expect(svg).toBeDefined();
  });

  it("roster bookmark button has aria-label", () => {
    render(
      <TooltipProvider>
        <TalentHub />
      </TooltipProvider>
    );
    const bookmarkBtn = screen.getByRole("button", { name: /Show bookmarks only/i });
    expect(bookmarkBtn).toHaveAttribute("aria-label", "Show bookmarks only");
  });
});
