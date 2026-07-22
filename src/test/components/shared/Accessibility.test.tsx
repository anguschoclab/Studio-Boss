/**
 * @vitest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FilterBar } from "@/components/shared/FilterBar";

describe("Accessibility - Search Inputs", () => {
  it("FilterBar search input has aria-label", () => {
    render(
      <FilterBar
        searchValue=""
        onSearchChange={() => {}}
        searchPlaceholder="Search talents..."
      />
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-label", "Search talents...");
  });

  it("FilterBar search input has aria-label even with default placeholder", () => {
    render(
      <FilterBar
        searchValue=""
        onSearchChange={() => {}}
      />
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-label");
  });

  it("FilterBar clear search button has aria-label='Clear search'", () => {
    render(
      <FilterBar
        searchValue="some query"
        onSearchChange={() => {}}
      />
    );
    const clearButton = screen.getByLabelText("Clear search");
    expect(clearButton).toBeDefined();
  });

  it("FilterBar decorative search icon has aria-hidden", () => {
    const { container } = render(
      <FilterBar
        searchValue=""
        onSearchChange={() => {}}
      />
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("FilterBar clear button icon has aria-hidden when search has value", () => {
    const { container } = render(
      <FilterBar
        searchValue="test"
        onSearchChange={() => {}}
      />
    );
    const svgs = container.querySelectorAll("svg");
    // Both search icon and clear icon should have aria-hidden
    const ariaHiddenSvgs = Array.from(svgs).filter((s) => s.getAttribute("aria-hidden") === "true");
    expect(ariaHiddenSvgs.length).toBeGreaterThanOrEqual(2);
  });
});
