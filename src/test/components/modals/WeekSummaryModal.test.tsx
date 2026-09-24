import React from "react";
import {render, screen, fireEvent} from "@testing-library/react";
import {describe, it, expect, vi, beforeEach} from "vitest";

const {mockResolveCurrentModal} = vi.hoisted(() => ({
  mockResolveCurrentModal: vi.fn(),
}));

let mockActiveModal: any = null;

vi.mock("@/store/uiStore", () => ({
  useUIStore: vi.fn(() => ({
    activeModal: mockActiveModal,
    resolveCurrentModal: mockResolveCurrentModal,
  })),
}));

vi.mock("@/store/gameStore", () => ({
  useGameStore: vi.fn((selector: any) =>
    typeof selector === "function" ? selector({snapshots: []}) : selector
  ),
}));

vi.mock("@/engine/utils", () => ({
  formatMoney: vi.fn((n: number) => `$${n}`),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({children, open}: any) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({children}: any) => <div>{children}</div>,
  DialogHeader: ({children}: any) => <div>{children}</div>,
  DialogTitle: ({children}: any) => <h2>{children}</h2>,
  DialogFooter: ({children}: any) => <div>{children}</div>,
}));

vi.mock("@/components/modals/NewsStoryModal", () => ({
  NewsStoryModal: () => null,
}));

vi.mock("lucide-react", () => ({
  AlertTriangle: () => <div data-testid="icon" />,
  DollarSign: () => <div data-testid="icon" />,
  ArrowRight: () => <div data-testid="icon" />,
  Newspaper: () => <div data-testid="icon" />,
  Trophy: () => <div data-testid="icon" />,
  MessageSquare: () => <div data-testid="icon" />,
}));

import {WeekSummaryModal} from "@/components/modals/WeekSummaryModal";

const validSummary = {
  id: "w10",
  fromWeek: 9,
  toWeek: 10,
  cashBefore: 100_000_000,
  cashAfter: 120_000_000,
  totalRevenue: 50_000_000,
  totalCosts: 30_000_000,
  projectUpdates: [],
  events: [],
  newsEvents: [],
  narrativeEvents: [],
  isQuietWeek: false,
};

function setModal(payload: any) {
  mockActiveModal = {id: "m1", type: "SUMMARY", payload};
}

describe("WeekSummaryModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveModal = null;
  });

  it("renders nothing when activeModal is null", () => {
    const {container} = render(<WeekSummaryModal />);
    expect(container.firstChild).toBeNull();
    expect(mockResolveCurrentModal).not.toHaveBeenCalled();
  });

  it("renders nothing and does NOT resolve when activeModal type is not SUMMARY", () => {
    mockActiveModal = {id: "m1", type: "CRISIS", payload: {}};
    const {container} = render(<WeekSummaryModal />);
    expect(container.firstChild).toBeNull();
    expect(mockResolveCurrentModal).not.toHaveBeenCalled();
  });

  it("resolves via useEffect when the payload is missing (malformed modal must not crash)", () => {
    setModal(undefined);
    const {container} = render(<WeekSummaryModal />);
    expect(container.firstChild).toBeNull();
    expect(mockResolveCurrentModal).toHaveBeenCalledTimes(1);
  });

  it("renders the weekly report for a valid summary", () => {
    setModal(validSummary);
    render(<WeekSummaryModal />);
    expect(screen.getByText(/CYCLE W10 REPORT/i)).toBeDefined();
    expect(mockResolveCurrentModal).not.toHaveBeenCalled();
  });

  it("confirm button resolves the modal", () => {
    setModal(validSummary);
    render(<WeekSummaryModal />);
    fireEvent.click(screen.getByRole("button", {name: /confirm report and continue/i}));
    expect(mockResolveCurrentModal).toHaveBeenCalledTimes(1);
  });
});
