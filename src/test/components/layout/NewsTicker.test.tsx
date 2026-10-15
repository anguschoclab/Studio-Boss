import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { NewsTicker } from "../../../../src/components/layout/NewsTicker";
import * as gameStore from "../../../../src/store/gameStore";

vi.mock("../../../../src/store/gameStore");

describe("NewsTicker", () => {
  it("returns default fallback state if there are no headlines", () => {
    vi.spyOn(gameStore, "useGameStore").mockImplementation((selector: unknown) =>
      (selector as (state: unknown) => unknown)({ gameState: { weekSummaries: [] } })
    );
    render(<NewsTicker />);
    expect(
      screen.getAllByText(
        (c) => c.includes("ESTABLISHING UPLINK") || c.includes("THE TRADES") || c.includes("UPLINK")
      ).length
    ).toBeGreaterThan(0);
  });

  it("displays active news items from the store (doubled for marquee)", () => {
    vi.spyOn(gameStore, "useGameStore").mockImplementation((selector: unknown) =>
      (selector as (state: unknown) => unknown)({
        gameState: {
          weekSummaries: [
            {
              fromWeek: 1,
              toWeek: 1,
              cashBefore: 0,
              cashAfter: 0,
              totalRevenue: 0,
              totalCosts: 0,
              projectUpdates: [],
              newsEvents: [
                {
                  id: "1",
                  week: 1,
                  type: "STUDIO_EVENT",
                  headline: "Local Studio Boss saves the day!",
                  description: "",
                  category: "general",
                },
              ],
              events: [],
            },
          ],
        },
      })
    );

    render(<NewsTicker />);
    // Component doubles the array for marquee effect, so we expect multiple matches
    const elements = screen.getAllByText(/Local Studio Boss saves the day!/i);
    expect(elements.length).toBeGreaterThan(0);
    expect(elements[0]).toBeInTheDocument();
  });

  it("marks decorative headline icons and the masthead glyph aria-hidden", () => {
    vi.spyOn(gameStore, "useGameStore").mockImplementation((selector: unknown) =>
      (selector as (state: unknown) => unknown)({
        gameState: {
          weekSummaries: [
            {
              fromWeek: 1,
              toWeek: 1,
              cashBefore: 0,
              cashAfter: 0,
              totalRevenue: 0,
              totalCosts: 0,
              projectUpdates: [],
              newsEvents: [
                {
                  id: "1",
                  week: 1,
                  type: "STUDIO_EVENT",
                  headline: "Local Studio Boss saves the day!",
                  description: "",
                  category: "general",
                },
              ],
              events: [],
            },
          ],
        },
      })
    );

    const { container } = render(<NewsTicker />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
    svgs.forEach((svg) => expect(svg).toHaveAttribute("aria-hidden", "true"));
  });

  it("does not emit duplicated class tokens on ticker items", () => {
    vi.spyOn(gameStore, "useGameStore").mockImplementation((selector: unknown) =>
      (selector as (state: unknown) => unknown)({
        gameState: {
          weekSummaries: [
            {
              fromWeek: 1,
              toWeek: 1,
              cashBefore: 0,
              cashAfter: 0,
              totalRevenue: 0,
              totalCosts: 0,
              projectUpdates: [],
              newsEvents: [
                {
                  id: "1",
                  week: 1,
                  type: "STUDIO_EVENT",
                  headline: "Dup check",
                  description: "",
                  category: "general",
                },
              ],
              events: [],
            },
          ],
        },
      })
    );

    render(<NewsTicker />);
    const item = screen.getAllByRole("button", { name: /Dup check/i })[0];
    const tokens = (item.getAttribute("class") || "").split(/\s+/);
    expect(tokens.filter((t) => t === "cursor-pointer").length).toBeLessThanOrEqual(1);
  });
});
