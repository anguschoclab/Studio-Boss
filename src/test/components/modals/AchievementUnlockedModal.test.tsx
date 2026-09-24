import React from "react";
import {render, screen, fireEvent} from "@testing-library/react";
import {describe, it, expect, vi, beforeEach} from "vitest";

const {mockResolveCurrentModal} = vi.hoisted(() => ({
  mockResolveCurrentModal: vi.fn(),
}));

vi.mock("@/store/uiStore", () => ({
  useUIStore: vi.fn((selector: any) =>
    typeof selector === "function" ? selector({resolveCurrentModal: mockResolveCurrentModal}) : selector
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({children, onClick, className}: any) => (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  ),
}));

vi.mock("lucide-react", () => ({
  Trophy: () => <div data-testid="icon" />,
  Star: () => <div data-testid="icon" />,
}));

import {AchievementUnlockedModal} from "@/components/modals/AchievementUnlockedModal";

const payload = {
  achievementId: "a1",
  name: "Box Office Titan",
  description: "Grossed over $1B at the box office.",
  week: 12,
};

describe("AchievementUnlockedModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders achievement name, description, and week", () => {
    render(<AchievementUnlockedModal payload={payload} />);
    expect(screen.getByText("Box Office Titan")).toBeDefined();
    expect(screen.getByText(/Grossed over \$1B/)).toBeDefined();
    expect(screen.getByText(/WEEK 12/)).toBeDefined();
  });

  it("ACKNOWLEDGE button resolves the modal", () => {
    render(<AchievementUnlockedModal payload={payload} />);
    fireEvent.click(screen.getByText("ACKNOWLEDGE"));
    expect(mockResolveCurrentModal).toHaveBeenCalledTimes(1);
  });

  it("Escape key dismisses the modal (non-Radix overlay — owns its own listener)", () => {
    render(<AchievementUnlockedModal payload={payload} />);
    fireEvent.keyDown(window, {key: "Escape"});
    expect(mockResolveCurrentModal).toHaveBeenCalledTimes(1);
  });

  it("non-Escape keys do not resolve the modal", () => {
    render(<AchievementUnlockedModal payload={payload} />);
    fireEvent.keyDown(window, {key: "Enter"});
    expect(mockResolveCurrentModal).not.toHaveBeenCalled();
  });
});
