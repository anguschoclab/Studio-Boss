import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockAcquireDistressedAsset,
  mockDeclineDistressedAsset,
  mockResolveCurrentModal,
} = vi.hoisted(() => ({
  mockAcquireDistressedAsset: vi.fn(),
  mockDeclineDistressedAsset: vi.fn(),
  mockResolveCurrentModal: vi.fn(),
}));

const mockGameState: any = {
  week: 6,
  finance: { cash: 500_000_000 },
  industry: {
    distressedOffers: [
      {
        id: "o1",
        sellerId: "r1",
        sellerName: "Carolco",
        assetKind: "franchise" as const,
        assetId: "f1",
        assetLabel: "franchise 'Rambo'",
        price: 100_000_000,
        aiBuyerId: "r2",
        aiBuyerName: "Helix",
        createdWeek: 5,
        expiresWeek: 7,
      },
    ],
  },
  ip: { franchises: { f1: { id: "f1", name: "Rambo", ownerId: "r1" } }, vault: [] },
};

vi.mock("@/store/gameStore", () => ({
  useGameStore: vi.fn((selector: any) => {
    if (typeof selector === "function") {
      return selector({
        acquireDistressedAsset: mockAcquireDistressedAsset,
        declineDistressedAsset: mockDeclineDistressedAsset,
        gameState: mockGameState,
      });
    }
    return selector;
  }),
}));

vi.mock("@/store/uiStore", () => ({
  useUIStore: vi.fn(() => ({
    activeModal: null as any,
    resolveCurrentModal: mockResolveCurrentModal,
  })),
}));

vi.mock("@/store/selectors", () => ({
  selectDistressedOffer: (_state: any, offerId: string) =>
    mockGameState.industry.distressedOffers.find((o: any) => o.id === offerId),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open, onOpenChange }: any) =>
    open ? <div data-testid="dialog" onClick={onOpenChange}>{children}</div> : null,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button data-testid="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock("lucide-react", () => ({
  AlertTriangle: () => <div data-testid="icon" />,
  DollarSign: () => <div data-testid="icon" />,
  Clock: () => <div data-testid="icon" />,
  Building2: () => <div data-testid="icon" />,
}));

vi.mock("@/engine/utils", () => ({
  formatMoney: (n: number) => `$${n.toLocaleString()}`,
}));

import { DistressedAssetOfferModal } from "@/components/modals/DistressedAssetOfferModal";
import { useUIStore } from "@/store/uiStore";
import { useGameStore } from "@/store/gameStore";

function setModal(payload: any) {
  (useUIStore as any).mockImplementation(() => ({
    activeModal: { id: "m1", type: "DISTRESSED_ASSET_OFFER", payload },
    resolveCurrentModal: mockResolveCurrentModal,
  }));
}

function setNoModal() {
  (useUIStore as any).mockImplementation(() => ({
    activeModal: null,
    resolveCurrentModal: mockResolveCurrentModal,
  }));
}

function setWrongTypeModal() {
  (useUIStore as any).mockImplementation(() => ({
    activeModal: { id: "m1", type: "CRISIS", payload: {} },
    resolveCurrentModal: mockResolveCurrentModal,
  }));
}

function setCash(cash: number) {
  mockGameState.finance.cash = cash;
}

const defaultOffer = mockGameState.industry.distressedOffers[0];

describe("DistressedAssetOfferModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setNoModal();
    setCash(500_000_000);
  });

  it("renders nothing when activeModal is null", () => {
    setNoModal();
    const { container } = render(<DistressedAssetOfferModal />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when activeModal type is not DISTRESSED_ASSET_OFFER", () => {
    setWrongTypeModal();
    const { container } = render(<DistressedAssetOfferModal />);
    expect(container.firstChild).toBeNull();
  });

  it("renders offer details: asset label, seller name, price, AI buyer name, weeks remaining", () => {
    setModal({ offerId: "o1" });
    render(<DistressedAssetOfferModal />);
    expect(screen.getByText("franchise 'Rambo'")).toBeDefined();
    expect(screen.getByText("From Carolco")).toBeDefined();
    expect(screen.getByText(/\$100,000,000/)).toBeDefined();
    expect(screen.getAllByText(/Helix/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Expires in 1 week/)).toBeDefined();
  });

  it("Acquire button is disabled when player cash < price", () => {
    setCash(50_000_000);
    setModal({ offerId: "o1" });
    render(<DistressedAssetOfferModal />);
    const buttons = screen.getAllByTestId("button");
    // Acquire is the second button (after Decline)
    const acquireBtn = buttons[buttons.length - 1] as HTMLButtonElement;
    expect(acquireBtn.disabled).toBe(true);
  });

  it("Acquire button is enabled when player cash >= price", () => {
    setCash(500_000_000);
    setModal({ offerId: "o1" });
    render(<DistressedAssetOfferModal />);
    const buttons = screen.getAllByTestId("button");
    const acquireBtn = buttons[buttons.length - 1] as HTMLButtonElement;
    expect(acquireBtn.disabled).toBe(false);
  });

  it("clicking Acquire calls acquireDistressedAsset, does NOT double-resolve", () => {
    setModal({ offerId: "o1" });
    render(<DistressedAssetOfferModal />);
    const buttons = screen.getAllByTestId("button");
    const acquireBtn = buttons[buttons.length - 1];
    fireEvent.click(acquireBtn);
    expect(mockAcquireDistressedAsset).toHaveBeenCalledWith("o1");
    // The slice resolves the modal — the component must NOT call resolveCurrentModal again
    expect(mockResolveCurrentModal).not.toHaveBeenCalled();
  });

  it("clicking Decline calls declineDistressedAsset, does NOT double-resolve", () => {
    setModal({ offerId: "o1" });
    render(<DistressedAssetOfferModal />);
    const declineBtn = screen.getByText("Decline");
    fireEvent.click(declineBtn);
    expect(mockDeclineDistressedAsset).toHaveBeenCalledWith("o1");
    expect(mockResolveCurrentModal).not.toHaveBeenCalled();
  });

  it("dialog close (X/Escape) calls declineDistressedAsset, not just resolveCurrentModal", () => {
    setModal({ offerId: "o1" });
    render(<DistressedAssetOfferModal />);
    const dialog = screen.getByTestId("dialog");
    fireEvent.click(dialog);
    expect(mockDeclineDistressedAsset).toHaveBeenCalledWith("o1");
    // resolveCurrentModal should NOT be called directly — the slice handles it
    expect(mockResolveCurrentModal).not.toHaveBeenCalled();
  });

  it("null offer calls resolveCurrentModal via useEffect, not during render", () => {
    setModal({ offerId: "nonexistent" });
    const { container } = render(<DistressedAssetOfferModal />);
    // Component should render null without crashing
    expect(container.firstChild).toBeNull();
    // resolveCurrentModal should have been called (via useEffect after render)
    expect(mockResolveCurrentModal).toHaveBeenCalledTimes(1);
  });
});
