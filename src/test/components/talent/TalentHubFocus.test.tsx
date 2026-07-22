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

  it("bookmark button has focus-visible:ring-2 class", () => {
    render(
      <TooltipProvider>
        <TalentHub />
      </TooltipProvider>
    );
    const bookmarkBtn = screen.getByRole("button", { name: /Show bookmarks only/i });
    expect(bookmarkBtn.className).toContain("focus-visible:ring-2");
  });

  it("bookmark button has focus-visible:ring-offset-2 class", () => {
    render(
      <TooltipProvider>
        <TalentHub />
      </TooltipProvider>
    );
    const bookmarkBtn = screen.getByRole("button", { name: /Show bookmarks only/i });
    expect(bookmarkBtn.className).toContain("focus-visible:ring-offset-2");
  });

  it("bookmark button uses ring-offset-background (not ring-offset-black)", () => {
    render(
      <TooltipProvider>
        <TalentHub />
      </TooltipProvider>
    );
    const bookmarkBtn = screen.getByRole("button", { name: /Show bookmarks only/i });
    expect(bookmarkBtn.className).toContain("ring-offset-background");
    expect(bookmarkBtn.className).not.toContain("ring-offset-black");
  });

  it("bookmark button has aria-pressed attribute", () => {
    render(
      <TooltipProvider>
        <TalentHub />
      </TooltipProvider>
    );
    const bookmarkBtn = screen.getByRole("button", { name: /Show bookmarks only/i });
    expect(bookmarkBtn).toHaveAttribute("aria-pressed", "false");
  });

  it("bookmark icon has aria-hidden", () => {
    render(
      <TooltipProvider>
        <TalentHub />
      </TooltipProvider>
    );
    const bookmarkBtn = screen.getByRole("button", { name: /Show bookmarks only/i });
    const svg = bookmarkBtn.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("search input has aria-label", () => {
    render(
      <TooltipProvider>
        <TalentHub />
      </TooltipProvider>
    );
    const searchInput = screen.getByRole("textbox");
    expect(searchInput).toHaveAttribute("aria-label", "Search global database");
  });
});
