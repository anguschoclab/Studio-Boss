import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AwardsProbabilityChart } from "@/components/charts/AwardsProbabilityChart";
import type { AwardProbability } from "@/store/chartSelectors";

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock recharts
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="mock-responsive-container">{children}</div>
  ),
  BarChart: ({ children }: any) => <div data-testid="mock-bar-chart">{children}</div>,
  Bar: ({ children }: any) => <div data-testid="mock-bar">{children}</div>,
  XAxis: ({ dataKey }: any) => <div data-testid="mock-x-axis" data-datakey={dataKey} />,
  YAxis: ({ dataKey, width }: any) => (
    <div data-testid="mock-y-axis" data-datakey={dataKey} data-width={width} />
  ),
  Tooltip: ({ content }: any) => <div data-testid="mock-tooltip">{content}</div>,
  Cell: ({ fill }: any) => <div data-testid="mock-cell" data-fill={fill} />,
  LabelList: ({ dataKey }: any) => <div data-testid="mock-label-list" data-datakey={dataKey} />,
}));

const sampleData: AwardProbability[] = [
  { projectTitle: "Oscar Bait", awardBody: "Academy Awards", category: "Best Picture", probability: 85, trend: "stable" },
  { projectTitle: "Indie Gem", awardBody: "Sundance Film Festival", category: "Grand Jury Prize", probability: 60, trend: "stable" },
  { projectTitle: "TV Drama", awardBody: "Primetime Emmys", category: "Best Series", probability: 45, trend: "stable" },
];

describe("AwardsProbabilityChart", () => {
  it("renders 'No awards data available' when data is empty", () => {
    render(<AwardsProbabilityChart data={[]} />);
    expect(screen.getByText(/No awards data available/i)).toBeInTheDocument();
  });

  it("renders bar chart when data is provided", () => {
    render(<AwardsProbabilityChart data={sampleData} />);
    expect(screen.getByTestId("mock-bar-chart")).toBeInTheDocument();
  });

  it("renders a bar element for the data", () => {
    render(<AwardsProbabilityChart data={sampleData} />);
    expect(screen.getByTestId("mock-bar")).toBeInTheDocument();
  });

  it("renders YAxis with projectTitle dataKey", () => {
    render(<AwardsProbabilityChart data={sampleData} />);
    const yAxis = screen.getByTestId("mock-y-axis");
    expect(yAxis.getAttribute("data-datakey")).toBe("projectTitle");
  });

  it("renders XAxis with probability dataKey", () => {
    render(<AwardsProbabilityChart data={sampleData} />);
    const xAxis = screen.getByTestId("mock-x-axis");
    expect(xAxis.getAttribute("data-datakey")).toBe("probability");
  });

  it("renders cells with amber fill color", () => {
    render(<AwardsProbabilityChart data={sampleData} />);
    const cells = screen.getAllByTestId("mock-cell");
    expect(cells.length).toBeGreaterThan(0);
    for (const cell of cells) {
      expect(cell.getAttribute("data-fill")).toBe("#f59e0b");
    }
  });

  it("renders tooltip", () => {
    render(<AwardsProbabilityChart data={sampleData} />);
    expect(screen.getByTestId("mock-tooltip")).toBeInTheDocument();
  });
});
