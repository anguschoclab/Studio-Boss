import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { IPAssetCard } from "@/components/ip/IPAssetCard";
import { IPAsset } from "@/engine/types";

const { mockDevelopFromOwnedIP, mockAcquireAndRebootIP, mockSelectFatigueForAsset } = vi.hoisted(() => ({
  mockDevelopFromOwnedIP: vi.fn(),
  mockAcquireAndRebootIP: vi.fn(),
  mockSelectFatigueForAsset: vi.fn(() => 0),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick }: any) => (
    <button data-testid="button" onClick={onClick}>{children}</button>
  ),
}));

vi.mock("@/components/ui/tooltip-wrapper", () => ({
  TooltipWrapper: ({ children }: any) => <>{children}</>,
}));

vi.mock("lucide-react", () => ({
  TrendingUp: () => <div data-testid="icon" />,
  DollarSign: () => <div data-testid="icon" />,
  History: () => <div data-testid="icon" />,
  Globe: () => <div data-testid="icon" />,
  Lock: () => <div data-testid="icon" />,
}));

vi.mock("@/engine/utils", () => ({
  formatMoney: (n: number) => `$${n.toLocaleString()}`,
}));

vi.mock("@/lib/utils", () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(" "),
}));

vi.mock("@/store/gameStore", () => ({
  useGameStore: vi.fn((selector: any) => {
    if (typeof selector === "function") {
      return selector({
        developFromOwnedIP: mockDevelopFromOwnedIP,
        acquireAndRebootIP: mockAcquireAndRebootIP,
      });
    }
    return selector;
  }),
}));

vi.mock("@/store/selectors", () => ({
  selectFatigueForAsset: mockSelectFatigueForAsset,
}));

vi.mock("@/engine/data/syndicationConfig", () => ({
  SYNDICATION_TIERS: {
    NONE: { label: "None", color: "#888" },
    BRONZE: { label: "Bronze", color: "#cd7f32" },
    SILVER: { label: "Silver", color: "#c0c0c0" },
    GOLD: { label: "Gold", color: "#ffd700" },
  },
}));

function makeAsset(overrides: Partial<IPAsset> = {}): IPAsset {
  return {
    id: "ip-1",
    originalProjectId: "prj-orig",
    title: "Test IP",
    franchiseId: "FR-1",
    baseValue: 50_000_000,
    decayRate: 0.8,
    merchandisingMultiplier: 1.0,
    syndicationStatus: "NONE",
    syndicationTier: "NONE",
    totalEpisodes: 0,
    rightsExpirationWeek: 999,
    rightsOwner: "STUDIO",
    ...overrides,
  };
}

describe("IPAssetCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectFatigueForAsset.mockReturnValue(0);
  });

  it("renders DEVELOP SEQUEL button for owned STUDIO asset", () => {
    render(<IPAssetCard asset={makeAsset()} />);
    expect(screen.getByText("DEVELOP SEQUEL")).toBeDefined();
  });

  it("renders fatigue badge for owned STUDIO asset", () => {
    mockSelectFatigueForAsset.mockReturnValue(45);
    render(<IPAssetCard asset={makeAsset()} />);
    expect(screen.getByText(/FATIGUE/i)).toBeDefined();
  });

  it("does NOT render DEVELOP SEQUEL for market asset (shows ACQUIRE & REBOOT)", () => {
    render(<IPAssetCard asset={makeAsset({ rightsOwner: "MARKET" })} isMarket />);
    expect(screen.getByText("ACQUIRE & REBOOT")).toBeDefined();
    expect(screen.queryByText("DEVELOP SEQUEL")).toBeNull();
  });

  it("does NOT render fatigue badge for market asset", () => {
    render(<IPAssetCard asset={makeAsset({ rightsOwner: "MARKET" })} isMarket />);
    expect(screen.queryByText(/FATIGUE/i)).toBeNull();
  });

  it("fatigue badge shows rose color class for fatigue > 60", () => {
    mockSelectFatigueForAsset.mockReturnValue(75);
    render(<IPAssetCard asset={makeAsset()} />);
    const badge = screen.getByText(/FATIGUE/i).closest("div");
    expect(badge?.className).toContain("rose");
  });

  it("fatigue badge shows amber color class for fatigue > 30 and <= 60", () => {
    mockSelectFatigueForAsset.mockReturnValue(45);
    render(<IPAssetCard asset={makeAsset()} />);
    const badge = screen.getByText(/FATIGUE/i).closest("div");
    expect(badge?.className).toContain("amber");
  });

  it("fatigue badge shows emerald color class for fatigue <= 30", () => {
    mockSelectFatigueForAsset.mockReturnValue(15);
    render(<IPAssetCard asset={makeAsset()} />);
    const badge = screen.getByText(/FATIGUE/i).closest("div");
    expect(badge?.className).toContain("emerald");
  });

  it("clicking DEVELOP SEQUEL calls developFromOwnedIP with asset ID", () => {
    render(<IPAssetCard asset={makeAsset({ id: "ip-99" })} />);
    const btn = screen.getByText("DEVELOP SEQUEL");
    fireEvent.click(btn);
    expect(mockDevelopFromOwnedIP).toHaveBeenCalledWith("ip-99");
  });

  it("fatigue value displays as percentage", () => {
    mockSelectFatigueForAsset.mockReturnValue(42);
    render(<IPAssetCard asset={makeAsset()} />);
    expect(screen.getByText(/42%/)).toBeDefined();
  });
});
