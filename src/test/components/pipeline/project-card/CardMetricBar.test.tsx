import {render, screen} from "@testing-library/react";
import {describe, it, expect} from "vitest";
import {CardMetricBar} from "@/components/pipeline/project-card/CardMetricBar";
import {Target} from "lucide-react";

function renderBar(overrides: Partial<Parameters<typeof CardMetricBar>[0]> = {}) {
  return render(
    <CardMetricBar
      label="MARKET BUZZ"
      value="50%"
      pct={50}
      icon={Target}
      iconClassName="group-hover:text-amber-400"
      valueClassName="text-amber-400"
      barClassName="bg-amber-400"
      overlay="pulse"
      tooltip="MARKET ANTICIPATION INDEX"
      {...overrides}
    />
  );
}

describe("CardMetricBar", () => {
  it("renders label, value and a bar fill at the given percentage", () => {
    renderBar();
    expect(screen.getByText("MARKET BUZZ")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    const fill = screen.getByTestId("metric-fill");
    expect(fill).toHaveStyle({ width: "50%" });
    expect(fill.className).toContain("bg-amber-400");
  });

  it("clamps the fill width at 100%", () => {
    renderBar({ pct: 140 });
    expect(screen.getByTestId("metric-fill")).toHaveStyle({ width: "100%" });
  });

  it("renders the pulse overlay for buzz-style metrics", () => {
    renderBar({ overlay: "pulse" });
    expect(screen.getByTestId("metric-overlay").className).toContain("animate-pulse");
  });

  it("renders the fade overlay for phase-style metrics", () => {
    renderBar({ overlay: "fade" });
    const overlay = screen.getByTestId("metric-overlay");
    expect(overlay.className).toContain("to-black/20");
    expect(overlay.className).not.toContain("animate-pulse");
  });
});
