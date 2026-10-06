import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MarketTrendsHeatmap } from "@/components/industry/MarketTrendsHeatmap";
import { useGameStore } from "@/store/gameStore";

vi.mock("@/components/shared/Heatmap", () => ({
  Heatmap: ({ data, rows, cols }: any) => (
    <div
      data-testid="heatmap"
      data-length={data.length}
      data-rows={rows.length}
      data-cols={cols.length}
    >
      {data.map((d: any) => (
        <div
          key={d.id}
          data-testid="heatmap-cell"
          data-row={d.row}
          data-col={d.col}
          data-value={d.value}
        >
          {d.tooltip}
        </div>
      ))}
    </div>
  ),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("lucide-react", () => ({
  TrendingUp: () => <div data-testid="icon" />,
  TrendingDown: () => <div data-testid="icon" />,
  Activity: () => <div data-testid="icon" />,
}));

describe("MarketTrendsHeatmap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders null when gameState is null", () => {
    useGameStore.setState({ gameState: null } as any);
    const { container } = render(<MarketTrendsHeatmap />);
    expect(container.firstChild).toBeNull();
  });

  it("renders heatmap with correct number of cells (7 genres × 4 quarters = 28)", () => {
    useGameStore.setState({
      gameState: {
        week: 10,
        finance: { cash: 100_000_000, marketState: { sentiment: 50 } },
        studio: { culture: { genrePopularity: { Action: 60 } } },
        market: { trends: [{ genre: "Action", heat: 70, direction: "hot", weeksRemaining: 10 }] },
        entities: {
          projects: {},
          rivals: {},
          talents: {},
          contracts: {},
        },
      } as any,
    } as any);

    render(<MarketTrendsHeatmap />);
    const cells = screen.getAllByTestId("heatmap-cell");
    expect(cells).toHaveLength(28);
  });

  it("pre-aggregates player project counts by genre", () => {
    useGameStore.setState({
      gameState: {
        week: 10,
        finance: { cash: 100_000_000, marketState: { sentiment: 50 } },
        studio: { culture: { genrePopularity: {} } },
        market: { trends: [] },
        entities: {
          projects: {
            p1: { id: "p1", genre: "Action", state: "development" },
            p2: { id: "p2", genre: "Action", state: "production" },
            p3: { id: "p3", genre: "Comedy", state: "archived" },
          },
          rivals: {},
          talents: {},
          contracts: {},
        },
      } as any,
    } as any);

    render(<MarketTrendsHeatmap />);
    const actionCells = screen
      .getAllByTestId("heatmap-cell")
      .filter((c) => c.getAttribute("data-row") === "Action");
    const comedyCells = screen
      .getAllByTestId("heatmap-cell")
      .filter((c) => c.getAttribute("data-row") === "Comedy");

    const actionTooltip = actionCells[0].textContent || "";
    expect(actionTooltip).toContain("Active Projects: 2");

    const comedyTooltip = comedyCells[0].textContent || "";
    expect(comedyTooltip).toContain("Active Projects: 0");
  });

  it("pre-aggregates rival project counts by genre", () => {
    useGameStore.setState({
      gameState: {
        week: 10,
        finance: { cash: 100_000_000, marketState: { sentiment: 50 } },
        studio: { culture: { genrePopularity: {} } },
        market: { trends: [] },
        entities: {
          projects: {},
          rivals: {
            r1: {
              id: "r1",
              name: "Rival 1",
              projects: {
                rp1: { genre: "Horror" },
                rp2: { genre: "Horror" },
                rp3: { genre: "Drama" },
              },
            },
          },
          talents: {},
          contracts: {},
        },
      } as any,
    } as any);

    render(<MarketTrendsHeatmap />);
    const horrorCells = screen
      .getAllByTestId("heatmap-cell")
      .filter((c) => c.getAttribute("data-row") === "Horror");
    const horrorTooltip = horrorCells[0].textContent || "";
    expect(horrorTooltip).toContain("Active Projects: 2");
  });

  it("hoists genre-only calculations (same opportunity value across all 4 quarters)", () => {
    useGameStore.setState({
      gameState: {
        week: 10,
        finance: { cash: 100_000_000, marketState: { sentiment: 50 } },
        studio: { culture: { genrePopularity: { Action: 60 } } },
        market: { trends: [{ genre: "Action", heat: 70, direction: "hot", weeksRemaining: 10 }] },
        entities: { projects: {}, rivals: {}, talents: {}, contracts: {} },
      } as any,
    } as any);

    render(<MarketTrendsHeatmap />);
    const actionCells = screen
      .getAllByTestId("heatmap-cell")
      .filter((c) => c.getAttribute("data-row") === "Action");
    const values = actionCells.map((c) => Number(c.getAttribute("data-value")));
    expect(values[0]).toBe(values[1]);
    expect(values[1]).toBe(values[2]);
    expect(values[2]).toBe(values[3]);
  });

  it("trend heat value is correctly looked up by genre (case-insensitive match)", () => {
    useGameStore.setState({
      gameState: {
        week: 10,
        finance: { cash: 100_000_000, marketState: { sentiment: 50 } },
        studio: { culture: { genrePopularity: {} } },
        market: {
          trends: [{ genre: "ACTION", heat: 90, direction: "hot", weeksRemaining: 10 }],
        },
        entities: { projects: {}, rivals: {}, talents: {}, contracts: {} },
      } as any,
    } as any);

    render(<MarketTrendsHeatmap />);
    const actionCells = screen
      .getAllByTestId("heatmap-cell")
      .filter((c) => c.getAttribute("data-row") === "Action");
    // heat=90, popularity=50 (default), sentiment=50, saturation=0
    // opportunity = 50*0.3 + 90*0.4 - 0 + 50*0.1 = 15 + 36 + 5 = 56
    const value = Number(actionCells[0].getAttribute("data-value"));
    expect(value).toBe(56);
  });

  it("genre with no matching trend defaults to heat=50", () => {
    useGameStore.setState({
      gameState: {
        week: 10,
        finance: { cash: 100_000_000, marketState: { sentiment: 50 } },
        studio: { culture: { genrePopularity: {} } },
        market: { trends: [] },
        entities: { projects: {}, rivals: {}, talents: {}, contracts: {} },
      } as any,
    } as any);

    render(<MarketTrendsHeatmap />);
    const actionCells = screen
      .getAllByTestId("heatmap-cell")
      .filter((c) => c.getAttribute("data-row") === "Action");
    // heat=50 (default), popularity=50 (default), sentiment=50, saturation=0
    // opportunity = 50*0.3 + 50*0.4 + 50*0.1 = 15 + 20 + 5 = 40
    const value = Number(actionCells[0].getAttribute("data-value"));
    expect(value).toBe(40);
  });

  it("hotGenres and coolingGenres produce correct sorted results", () => {
    useGameStore.setState({
      gameState: {
        week: 10,
        finance: { cash: 100_000_000, marketState: { sentiment: 50 } },
        studio: {
          culture: {
            genrePopularity: {
              Action: 90,
              Comedy: 10,
              Drama: 50,
              Horror: 50,
              Romance: 50,
              "Sci-Fi": 50,
              Thriller: 50,
            },
          },
        },
        market: { trends: [] },
        entities: { projects: {}, rivals: {}, talents: {}, contracts: {} },
      } as any,
    } as any);

    render(<MarketTrendsHeatmap />);
    // With no trends, heat defaults to 50 for all
    // Action: pop=90 → opp = 90*0.3 + 50*0.4 + 50*0.1 = 27+20+5 = 52
    // Comedy: pop=10 → opp = 10*0.3 + 50*0.4 + 50*0.1 = 3+20+5 = 28
    // Others: pop=50 → opp = 50*0.3 + 50*0.4 + 50*0.1 = 15+20+5 = 40
    // Hot genres (top 3 by value): Action(52), then three at 40 — top 3 are Action + any two at 40
    // Cooling genres (bottom 3): Comedy(28) + two at 40
    const allCells = screen.getAllByTestId("heatmap-cell");
    expect(allCells).toHaveLength(28);
    // Verify Action has highest value
    const actionValue = Number(
      allCells.find((c) => c.getAttribute("data-row") === "Action")?.getAttribute("data-value")
    );
    const comedyValue = Number(
      allCells.find((c) => c.getAttribute("data-row") === "Comedy")?.getAttribute("data-value")
    );
    expect(actionValue).toBeGreaterThan(comedyValue);
  });

  it("duplicate trend genres do not cause errors", () => {
    useGameStore.setState({
      gameState: {
        week: 10,
        finance: { cash: 100_000_000, marketState: { sentiment: 50 } },
        studio: { culture: { genrePopularity: {} } },
        market: {
          trends: [
            { genre: "Action", heat: 30, direction: "cooling", weeksRemaining: 5 },
            { genre: "Action", heat: 80, direction: "hot", weeksRemaining: 10 },
          ],
        },
        entities: { projects: {}, rivals: {}, talents: {}, contracts: {} },
      } as any,
    } as any);

    render(<MarketTrendsHeatmap />);
    const cells = screen.getAllByTestId("heatmap-cell");
    expect(cells).toHaveLength(28);
    // With Map semantics, last duplicate wins (heat=80)
    // opportunity = 50*0.3 + 80*0.4 + 50*0.1 = 15+32+5 = 52
    const actionValue = Number(
      cells.find((c) => c.getAttribute("data-row") === "Action")?.getAttribute("data-value")
    );
    expect(actionValue).toBe(52);
  });
});
