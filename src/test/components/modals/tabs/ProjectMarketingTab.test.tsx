import {describe, it, expect, vi, beforeAll} from "vitest";
import {render, screen, fireEvent} from "@testing-library/react";
import React from "react";
import {ProjectMarketingTab} from "@/components/modals/tabs/ProjectMarketingTab";
import {Tabs} from "@/components/ui/tabs";
import {Project} from "@/engine/types";

beforeAll(() => {
  // recharts requires ResizeObserver which jsdom does not provide
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

const project = {
  id: "p1",
  title: "Test Project",
  budget: 10_000_000,
  // no marketingLevel → campaign not locked
} as unknown as Project;

function renderTab(overrides: Partial<Parameters<typeof ProjectMarketingTab>[0]> = {}) {
  const props = {
    project,
    selectedTier: "none" as const,
    onSelectTier: vi.fn(),
    projectionData: [],
    cash: 100_000_000,
    onLockCampaign: vi.fn(),
    ...overrides,
  };
  return render(
    <Tabs defaultValue="marketing">
      <ProjectMarketingTab {...props} />
    </Tabs>
  );
}

describe("ProjectMarketingTab — secondary angle clear button", () => {
  it("exposes an accessible name on the Clear button", () => {
    renderTab({
      selectedPrimaryAngle: "AWARDS_PUSH",
      selectedSecondaryAngle: "SELL_THE_STARS",
      onSelectSecondaryAngle: vi.fn(),
    });
    // Icon-adjacent action buttons must carry an aria-label; "Clear" alone is
    // ambiguous — a screen reader user needs to know WHAT is cleared.
    const clearButton = screen.getByRole("button", {
      name: /clear secondary marketing angle/i,
    });
    expect(clearButton).toBeInTheDocument();
  });

  it("clears the secondary angle via onSelectSecondaryAngle(null)", () => {
    const onSelectSecondaryAngle = vi.fn();
    renderTab({
      selectedPrimaryAngle: "AWARDS_PUSH",
      selectedSecondaryAngle: "SELL_THE_STARS",
      onSelectSecondaryAngle,
    });
    fireEvent.click(screen.getByRole("button", { name: /clear secondary/i }));
    expect(onSelectSecondaryAngle).toHaveBeenCalledWith(null);
  });

  it("does not render the clear control when no secondary angle is selected", () => {
    renderTab({
      selectedPrimaryAngle: "AWARDS_PUSH",
      selectedSecondaryAngle: null,
    });
    expect(
      screen.queryByRole("button", { name: /clear secondary/i })
    ).not.toBeInTheDocument();
  });
});
