import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HeatMap } from "@/components/charts/HeatMap";

describe("HeatMap", () => {
  const mockData = [
    { x: "Q1", y: "Action", value: 80 },
    { x: "Q2", y: "Action", value: 60 },
    { x: "Q1", y: "Comedy", value: 40 },
    { x: "Q2", y: "Comedy", value: 20 },
  ];
  const xLabels = ["Q1", "Q2"];
  const yLabels = ["Action", "Comedy"];

  it("renders correct number of cells for given xLabels × yLabels", () => {
    render(
      <HeatMap data={mockData} xLabels={xLabels} yLabels={yLabels} />
    );
    // 2x2 = 4 cell buttons (role="button")
    const cells = screen.getAllByRole("button");
    expect(cells).toHaveLength(4);
  });

  it("returns correct value for existing cell", () => {
    render(
      <HeatMap data={mockData} xLabels={xLabels} yLabels={yLabels} />
    );
    // The first cell should be Q1 × Action = 80
    const cells = screen.getAllByRole("button");
    expect(cells[0]).toHaveTextContent("80");
  });

  it("returns 0 for missing cell", () => {
    const partialData = [
      { x: "Q1", y: "Action", value: 80 },
    ];
    render(
      <HeatMap data={partialData} xLabels={xLabels} yLabels={yLabels} />
    );
    const cells = screen.getAllByRole("button");
    // Q2 × Action should be 0, Q1 × Comedy should be 0, Q2 × Comedy should be 0
    expect(cells[1]).toHaveTextContent("0");
    expect(cells[2]).toHaveTextContent("0");
    expect(cells[3]).toHaveTextContent("0");
  });

  it("calls onCellClick with correct cell object when clicked", () => {
    const onCellClick = vi.fn();
    render(
      <HeatMap
        data={mockData}
        xLabels={xLabels}
        yLabels={yLabels}
        onCellClick={onCellClick}
      />
    );
    const cells = screen.getAllByRole("button");
    fireEvent.click(cells[0]);
    expect(onCellClick).toHaveBeenCalledWith({ x: "Q1", y: "Action", value: 80 });
  });

  it("does not crash when cell data is missing", () => {
    const emptyData: { x: string; y: string; value: number }[] = [];
    const { container } = render(
      <HeatMap data={emptyData} xLabels={xLabels} yLabels={yLabels} />
    );
    expect(container.textContent).toContain("No data available");
  });

  it("handles duplicate x/y keys — last one wins (Map semantics)", () => {
    const dupData = [
      { x: "Q1", y: "Action", value: 30 },
      { x: "Q1", y: "Action", value: 90 },
    ];
    render(
      <HeatMap data={dupData} xLabels={["Q1"]} yLabels={["Action"]} />
    );
    const cells = screen.getAllByRole("button");
    expect(cells[0]).toHaveTextContent("90");
  });
});
