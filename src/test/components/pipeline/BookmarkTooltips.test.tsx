/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";

// Mock stores
vi.mock("@/store/gameStore", () => ({
  useGameStore: vi.fn(),
}));
vi.mock("@/store/uiStore", () => ({
  useUIStore: vi.fn(),
}));

// Mock the TalentAvatar to avoid complex rendering
vi.mock("@/components/talent/TalentAvatar", () => ({
  TalentAvatar: () => <div data-testid="mock-avatar" />,
}));

// Mock useAgencyMap
vi.mock("@/hooks/useTalentMap", () => ({
  useAgencyMap: () => new Map(),
}));

import { useGameStore } from "@/store/gameStore";
import { useUIStore } from "@/store/uiStore";
import { ProjectCard } from "@/components/pipeline/ProjectCard";
import { TalentCard } from "@/components/talent/TalentCard";
import { createMockProject, createMockTalent } from "@/test/utils/mockFactories";

describe("Bookmark Tooltips", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      if (typeof selector === "function") {
        return selector({
          gameState: { week: 1 },
          toggleBookmark: vi.fn(),
          isBookmarked: () => false,
        });
      }
      return selector;
    });
    vi.mocked(useUIStore).mockImplementation((selector: any) => {
      if (typeof selector === "function") {
        return selector({
          selectProject: vi.fn(),
          selectTalent: vi.fn(),
          openPitchProject: vi.fn(),
          openCrisisModal: vi.fn(),
        });
      }
      return selector;
    });
  });

  describe("ProjectCard bookmark button", () => {
    it("has aria-label for bookmark button", () => {
      const project = createMockProject({ id: "proj-1", title: "Test Project" });
      render(
        <TooltipProvider>
          <ProjectCard project={project} />
        </TooltipProvider>
      );
      const bookmarkBtn = screen.getByLabelText("Add bookmark");
      expect(bookmarkBtn).toBeDefined();
    });

    it("has onPointerDown to stop propagation", () => {
      const project = createMockProject({ id: "proj-1", title: "Test Project" });
      render(
        <TooltipProvider>
          <ProjectCard project={project} />
        </TooltipProvider>
      );
      const bookmarkBtn = screen.getByLabelText("Add bookmark");
      expect(bookmarkBtn).toHaveProperty("onPointerDown");
    });

    it("bookmark icon has aria-hidden", () => {
      const project = createMockProject({ id: "proj-1", title: "Test Project" });
      const { container } = render(
        <TooltipProvider>
          <ProjectCard project={project} />
        </TooltipProvider>
      );
      const svgs = container.querySelectorAll("svg");
      const ariaHiddenSvgs = Array.from(svgs).filter(
        (s) => s.getAttribute("aria-hidden") === "true"
      );
      expect(ariaHiddenSvgs.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("TalentCard bookmark button", () => {
    it("has aria-label for bookmark button", () => {
      const talent = createMockTalent({ id: "talent-1", name: "Test Talent" });
      render(
        <TooltipProvider>
          <TalentCard talent={talent} />
        </TooltipProvider>
      );
      const bookmarkBtn = screen.getByLabelText("Add bookmark");
      expect(bookmarkBtn).toBeDefined();
    });

    it("has onPointerDown to stop propagation", () => {
      const talent = createMockTalent({ id: "talent-1", name: "Test Talent" });
      render(
        <TooltipProvider>
          <TalentCard talent={talent} />
        </TooltipProvider>
      );
      const bookmarkBtn = screen.getByLabelText("Add bookmark");
      expect(bookmarkBtn).toHaveProperty("onPointerDown");
    });

    it("bookmark icon has aria-hidden", () => {
      const talent = createMockTalent({ id: "talent-1", name: "Test Talent" });
      const { container } = render(
        <TooltipProvider>
          <TalentCard talent={talent} />
        </TooltipProvider>
      );
      const svgs = container.querySelectorAll("svg");
      const ariaHiddenSvgs = Array.from(svgs).filter(
        (s) => s.getAttribute("aria-hidden") === "true"
      );
      expect(ariaHiddenSvgs.length).toBeGreaterThanOrEqual(1);
    });
  });
});
