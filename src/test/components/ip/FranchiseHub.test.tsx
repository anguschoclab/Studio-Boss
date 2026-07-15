import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FranchiseHub } from "@/components/ip/FranchiseHub";
import { useGameStore } from "@/store/gameStore";

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: any) => <span data-testid="badge">{children}</span>,
}));

vi.mock("@/components/ui/progress", () => ({
  Progress: ({ value }: any) => <div data-testid="progress" data-value={value} />,
}));

vi.mock("lucide-react", () => ({
  Network: () => <div data-testid="icon" />,
  Zap: () => <div data-testid="icon" />,
  AlertTriangle: () => <div data-testid="icon" />,
  TrendingUp: () => <div data-testid="icon" />,
  Layers: () => <div data-testid="icon" />,
  Film: () => <div data-testid="icon" />,
  Tv: () => <div data-testid="icon" />,
  Play: (props: any) => <svg data-testid="play-icon" {...props} />,
}));

vi.mock("@/engine/utils", () => ({
  formatMoney: (n: number) => `$${n.toLocaleString()}`,
}));

vi.mock("zustand/react/shallow", () => ({
  useShallow: (selector: any) => selector,
}));

function makeAssetState(): any {
  return {
    gameState: {
      ip: {
        vault: [
          {
            id: "asset-1",
            originalProjectId: "proj-1",
            title: "Blockbuster Film",
            franchiseId: "fr-1",
            baseValue: 100_000_000,
            decayRate: 0.01,
            merchandisingMultiplier: 1.2,
            syndicationStatus: "SYNDICATED",
            syndicationTier: "GOLD",
            totalEpisodes: 0,
            rightsExpirationWeek: 999,
            rightsOwner: "STUDIO",
          },
          {
            id: "asset-2",
            originalProjectId: "proj-2",
            title: "Hit Series",
            franchiseId: "fr-1",
            baseValue: 80_000_000,
            decayRate: 0.02,
            merchandisingMultiplier: 1.0,
            syndicationStatus: "NONE",
            syndicationTier: "NONE",
            totalEpisodes: 50,
            rightsExpirationWeek: 999,
            rightsOwner: "STUDIO",
          },
        ],
        franchises: {
          "fr-1": {
            id: "fr-1",
            name: "Test Universe",
            relevanceScore: 80,
            fatigueLevel: 0.2,
            audienceLoyalty: 70,
            totalEquity: 500_000_000,
            synergyMultiplier: 1.5,
            assetIds: ["asset-1", "asset-2"],
            activeProjectIds: [],
            lastReleaseWeeks: [10],
            creationWeek: 1,
          },
        },
      },
    },
  };
}

describe("FranchiseHub — a11y", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Exploit IP button has type="button"', () => {
    useGameStore.setState(makeAssetState() as any);
    render(<FranchiseHub />);
    const exploitBtn = screen.getByText("Exploit IP").closest("button");
    expect(exploitBtn).not.toBeNull();
    expect(exploitBtn?.getAttribute("type")).toBe("button");
  });

  it('Deep Analytics button has type="button"', () => {
    useGameStore.setState(makeAssetState() as any);
    render(<FranchiseHub />);
    const analyticsBtn = screen.getByText("Deep Analytics").closest("button");
    expect(analyticsBtn).not.toBeNull();
    expect(analyticsBtn?.getAttribute("type")).toBe("button");
  });

  it("Exploit IP button has focus-visible ring classes", () => {
    useGameStore.setState(makeAssetState() as any);
    render(<FranchiseHub />);
    const exploitBtn = screen.getByText("Exploit IP").closest("button");
    expect(exploitBtn?.className).toContain("focus-visible:ring");
  });

  it('Play icon inside Exploit IP button has aria-hidden="true"', () => {
    useGameStore.setState(makeAssetState() as any);
    render(<FranchiseHub />);
    const playIcon = screen.getByTestId("play-icon");
    expect(playIcon.getAttribute("aria-hidden")).toBe("true");
  });
});
