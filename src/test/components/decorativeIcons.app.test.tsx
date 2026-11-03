import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { readFileSync } from "fs";
import { join } from "path";
import React from "react";

import { OpportunityCard } from "@/components/discovery/OpportunityCard";
import { TopBar } from "@/components/layout/TopBar";
import { StudioSidebar } from "@/components/layout/StudioSidebar";
import { useGameStore } from "@/store/gameStore";
import { useUIStore } from "@/store/uiStore";
import { Opportunity } from "@/engine/types";

vi.mock("@/store/gameStore");
vi.mock("@/store/uiStore");
// NewsTicker pulls its own derived state; irrelevant to icon semantics.
vi.mock("@/components/layout/NewsTicker", () => ({ NewsTicker: () => null }));
vi.mock("@tanstack/react-router", async (orig) => {
  const actual = await orig<typeof import("@tanstack/react-router")>();
  return { ...actual, useNavigate: () => vi.fn() };
});

const SRC = join(__dirname, "../..");

const readSrc = (rel: string) => readFileSync(join(SRC, rel), "utf-8");

// Decorative lucide icons inside app-level components must carry
// aria-hidden="true" so screen readers don't announce empty glyph names.
// Convention mirrors decorativeIcons.test.tsx (ui primitives). Components
// that mount cheaply are rendered; store/modal-heavy components are guarded
// by source inspection — the same fallback the ContextMenu case uses.
describe("Decorative icons — app-level aria-hidden coverage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("OpportunityCard: decorative Gavel and Clock icons are aria-hidden", () => {
    const opportunity: Opportunity = {
      id: "opp-1",
      type: "script",
      title: "Test Package",
      format: "film",
      genre: "drama",
      budgetTier: "mid",
      targetAudience: "general",
      flavor: "test flavor",
      origin: "open_spec",
      costToAcquire: 1_000_000,
      weeksUntilExpiry: 1, // <=1 renders the CLOSING SOON Clock icon
      bids: {},
      bidHistory: [],
      expirationWeek: 6,
    };
    const { container } = render(
      <OpportunityCard opportunity={opportunity} onEnterAuction={() => {}} />
    );
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThanOrEqual(3); // corner Gavel + Clock + button Gavel
    svgs.forEach((svg) => expect(svg).toHaveAttribute("aria-hidden", "true"));
  });

  it("TopBar: prestige Star and slate Activity icons are aria-hidden", () => {
    const state: any = {
      gameState: {
        week: 5,
        studio: { name: "Test", prestige: 10 },
        finance: { cash: 1_000_000, weeklyHistory: [] },
        entities: { projects: {} },
      },
      doAdvanceWeek: vi.fn(),
      saveToSlot: vi.fn(),
    };
    vi.mocked(useGameStore).mockImplementation((selector: any) => selector(state));
    const { container } = render(<TopBar />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThanOrEqual(2);
    svgs.forEach((svg) => expect(svg).toHaveAttribute("aria-hidden", "true"));
  });

  it("StudioSidebar: Cash/Prestige/Slate metric icons are aria-hidden", () => {
    const gameState: any = {
      week: 5,
      studio: { name: "Test", prestige: 10 },
      finance: { cash: 1_000_000 },
      entities: { projects: {} },
    };
    vi.mocked(useGameStore).mockImplementation((selector: any) =>
      selector({ gameState, clearGame: vi.fn() })
    );
    vi.mocked(useUIStore).mockReturnValue({
      activeTab: "overview",
      setActiveTab: vi.fn(),
      setShowSettings: vi.fn(),
    } as any);
    const { container } = render(<StudioSidebar />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThanOrEqual(3); // DollarSign + Star + Clapperboard
    svgs.forEach((svg) => expect(svg).toHaveAttribute("aria-hidden", "true"));
  });

  it("DiscoveryBoard: header/empty-state/sidebar icons carry aria-hidden (source guard)", () => {
    // DiscoveryBoard pulls TrendBoard/NewsFeed/LiveAuctionDashboard + store
    // selectors — too stateful to mount cheaply; guard the JSX directly.
    const src = readSrc("components/discovery/DiscoveryBoard.tsx");
    expect(src).toMatch(/<Newspaper[^>]*aria-hidden="true"/);
    expect(src).toMatch(/<Plus[^>]*aria-hidden="true"/);
    expect(src).toMatch(/<Sparkles[^>]*aria-hidden="true"/);
    expect(src).toMatch(/<TrendingUp[^>]*aria-hidden="true"/);
  });

  it("AwardsCeremonyModal: Next-Category ChevronRight carries aria-hidden (source guard)", () => {
    const src = readSrc("components/modals/AwardsCeremonyModal.tsx");
    expect(src).toMatch(/<ChevronRight[^>]*aria-hidden="true"/);
  });

  it("PostProductionModal: Confirm ChevronRight carries aria-hidden (source guard)", () => {
    const src = readSrc("components/modals/PostProductionModal.tsx");
    expect(src).toMatch(/<ChevronRight[^>]*aria-hidden="true"/);
  });

  it("ProjectMarketingTab: both picker ChevronDown icons carry aria-hidden (source guard)", () => {
    const src = readSrc("components/modals/tabs/ProjectMarketingTab.tsx");
    const matches = src.match(/<ChevronDown[^>]*aria-hidden="true"/g);
    expect(matches?.length).toBe(2);
  });

  it("CastingFeedback: feedback-bullet ChevronRight carries aria-hidden (source guard)", () => {
    // The icon only renders per feedback item — conditional on willingness
    // output — so the attribute is guarded at the JSX level.
    const src = readSrc("components/talent/CastingFeedback.tsx");
    expect(src).toMatch(/<ChevronRight[^>]*aria-hidden="true"/);
  });
});
