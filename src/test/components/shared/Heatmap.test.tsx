import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Heatmap } from "@/components/shared/Heatmap";

// TooltipWrapper is already mocked in setup.ts

describe("Heatmap (shared)", () => {
  const mockData = [
    { id: "1", row: "Action", col: "Q1", value: 80 },
    { id: "2", row: "Action", col: "Q2", value: 60 },
    { id: "3", row: "Comedy", col: "Q1", value: 40 },
    { id: "4", row: "Comedy", col: "Q2", value: 20 },
  ];
  const rows = ["Action", "Comedy"];
  const cols = ["Q1", "Q2"];

  it("renders correct grid dimensions (2 rows × 2 cols = 4 buttons)", () => {
    render(<Heatmap data={mockData} rows={rows} cols={cols} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(4);
  });

  it("getCell returns correct cell for existing row/col", () => {
    render(<Heatmap data={mockData} rows={rows} cols={cols} showLabels />);
    const buttons = screen.getAllByRole("button");
    // First button = Action × Q1 = value 80
    expect(buttons[0]).toHaveTextContent("80");
    // Second = Action × Q2 = 60
    expect(buttons[1]).toHaveTextContent("60");
  });

  it("renders missing cell with opacity (no crash)", () => {
    const partialData = [{ id: "1", row: "Action", col: "Q1", value: 80 }];
    render(<Heatmap data={partialData} rows={rows} cols={cols} />);
    const buttons = screen.getAllByRole("button");
    // All 4 buttons should render without crashing
    expect(buttons).toHaveLength(4);
  });

  it("onCellClick fires with correct cell", () => {
    const onCellClick = vi.fn();
    render(
      <Heatmap data={mockData} rows={rows} cols={cols} onCellClick={onCellClick} />
    );
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(onCellClick).toHaveBeenCalledWith({
      id: "1",
      row: "Action",
      col: "Q1",
      value: 80,
    });
  });

  it("handles empty data gracefully", () => {
    const { container } = render(<Heatmap data={[]} rows={rows} cols={cols} />);
    // Should render without crashing
    expect(container).toBeDefined();
  });
});
