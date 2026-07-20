import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LiveAuctionDashboard } from "@/components/talent/LiveAuctionDashboard";
import { useGameStore } from "@/store/gameStore";
import { Opportunity } from "@/engine/types";

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid="button">
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: any) => <span data-testid="badge">{children}</span>,
}));

vi.mock("@/components/ui/progress", () => ({
  Progress: ({ value }: any) => <div data-testid="progress" data-value={value} />,
}));

vi.mock("lucide-react", () => ({
  Gavel: () => <div data-testid="icon" />,
  TrendingUp: () => <div data-testid="icon" />,
  AlertCircle: () => <div data-testid="icon" />,
  CheckCircle2: () => <div data-testid="icon" />,
  ShieldAlert: () => <div data-testid="icon" />,
  History: () => <div data-testid="icon" />,
  X: () => <div data-testid="icon" />,
}));

vi.mock("@/engine/systems/ai/biddingEngine", () => ({
  getLiveCounterBid: vi.fn(() => 1_100_000),
}));

vi.mock("@/engine/utils", () => ({
  formatMoney: (n: number) => `$${n.toLocaleString()}`,
}));

function makeOpp(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: "opp-1",
    title: "Test Script",
    type: "script",
    format: "film",
    genre: "Action",
    budgetTier: "blockbuster",
    targetAudience: "General",
    flavor: "Cool",
    origin: "open_spec",
    costToAcquire: 1_000_000,
    weeksUntilExpiry: 10,
    expirationWeek: 10,
    bids: {},
    bidHistory: [],
    ...overrides,
  } as Opportunity;
}

describe("talent/LiveAuctionDashboard — currentMaxBid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGameStore.setState({
      gameState: { finance: { cash: 100_000_000 } },
      placeBid: vi.fn(),
    } as any);
  });

  it("returns costToAcquire when no bids exist", () => {
    const opp = makeOpp({ costToAcquire: 5_000_000, bids: {} });
    render(<LiveAuctionDashboard opportunity={opp} onClose={vi.fn()} />);
    expect(screen.getByText("$5,000,000")).toBeInTheDocument();
  });

  it("returns highest bid amount when bids exceed costToAcquire", () => {
    const opp = makeOpp({
      costToAcquire: 1_000_000,
      bids: {
        "rival-1": { amount: 10_000_000, terms: "standard" },
        "rival-2": { amount: 15_000_000, terms: "standard" },
      },
    });
    render(<LiveAuctionDashboard opportunity={opp} onClose={vi.fn()} />);
    expect(screen.getByText("$15,000,000")).toBeInTheDocument();
  });

  it("returns costToAcquire when it exceeds all bid amounts", () => {
    const opp = makeOpp({
      costToAcquire: 20_000_000,
      bids: {
        "rival-1": { amount: 5_000_000, terms: "standard" },
      },
    });
    render(<LiveAuctionDashboard opportunity={opp} onClose={vi.fn()} />);
    expect(screen.getByText("$20,000,000")).toBeInTheDocument();
  });
});
