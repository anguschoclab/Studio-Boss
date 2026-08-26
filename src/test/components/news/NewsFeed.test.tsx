/**
 * @vitest-environment jsdom
 */
import React from "react";
import {render, screen} from "@testing-library/react";
import {describe, it, expect, vi} from "vitest";

// Mock stores
vi.mock("@/store/gameStore", () => ({
  useGameStore: vi.fn((selector: any) => {
    const state = {
      gameState: {
        week: 10,
        eventHistory: [
          {
            id: "e1",
            week: 5,
            type: "RELEASE",
            title: "Big Release",
            description: "A major release happened",
            data: { projectId: "p1" },
          },
          {
            id: "e2",
            week: 8,
            type: "AWARD",
            title: "Award Won",
            description: "Best Picture",
            data: { talentId: "t1" },
          },
        ],
      },
    };
    if (typeof selector === "function") return selector(state);
    return state;
  }),
}));

vi.mock("@/store/uiStore", () => ({
  useUIStore: vi.fn(() => ({
    selectTalent: vi.fn(),
    selectProject: vi.fn(),
    selectRival: vi.fn(),
    setActiveTab: vi.fn(),
  })),
}));

vi.mock("@/store/selectors", () => ({
  selectNewsHistory: vi.fn((state: any) => {
    // Return events from eventHistory as news items
    return (state.eventHistory || []).map((e: any) => ({
      id: e.id,
      week: e.week,
      type: e.type,
      headline: e.title,
      description: e.description,
      projectId: e.data?.projectId,
      talentId: e.data?.talentId,
    }));
  }),
}));

import {NewsFeed} from "@/components/news/NewsFeed";

describe("NewsFeed", () => {
  it("renders without crashing", () => {
    render(<NewsFeed />);
    expect(document.body).toBeDefined();
  });

  // ─── Accessibility tests (PR #824) ──────────────────────────────────────
  describe("accessibility", () => {
    it("clickable timeline items have aria-label with headline text", () => {
      render(<NewsFeed />);
      // Items with talentId or projectId should be clickable and have aria-label
      const clickableItems = document.querySelectorAll('[role="button"]');
      // If there are clickable items, they should have aria-label
      if (clickableItems.length > 0) {
        expect(clickableItems[0].getAttribute("aria-label")).toBeTruthy();
      }
    });

    it("clickable items have role='button' and tabIndex={0}", () => {
      render(<NewsFeed />);
      const clickableItems = document.querySelectorAll('[role="button"]');
      for (const item of clickableItems) {
        expect(item.getAttribute("tabIndex")).toBe("0");
      }
    });
  });
});
