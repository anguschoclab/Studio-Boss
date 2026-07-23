import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPreviewAcquisition, mockAcquireRival, mockResolveCurrentModal } =
  vi.hoisted(() => ({
    mockPreviewAcquisition: vi.fn(),
    mockAcquireRival: vi.fn(),
    mockResolveCurrentModal: vi.fn(),
  }));

vi.mock("@/store/gameStore", () => ({
  useGameStore: vi.fn((selector: any) => {
    if (typeof selector === "function") {
      return selector({
        previewAcquisition: mockPreviewAcquisition,
        acquireRival: mockAcquireRival,
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

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock("lucide-react", () => ({
  Building2: () => <div data-testid="icon" />,
  ShieldAlert: () => <div data-testid="icon" />,
  X: () => <div data-testid="icon" />,
}));

import { AcquisitionConfirmModal } from "@/components/modals/AcquisitionConfirmModal";
import { useUIStore } from "@/store/uiStore";

function makePreview(overrides: any = {}) {
  return {
    targetId: "r1",
    targetName: "Target Co",
    price: 50_000_000,
    playerCash: 5_000_000_000,
    affordable: true,
    combinedShare: 15.0,
    regulatorRisk: "none" as const,
    blockChance: 0,
    canProceed: true,
    ...overrides,
  };
}

function setModal(payload: any) {
  (useUIStore as any).mockImplementation(() => ({
    activeModal: { id: "m1", type: "ACQUISITION_CONFIRM", payload },
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

describe("AcquisitionConfirmModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setNoModal();
    mockPreviewAcquisition.mockReturnValue(makePreview());
  });

  it("renders nothing when activeModal is null", () => {
    setNoModal();
    const { container } = render(<AcquisitionConfirmModal />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when activeModal type is not ACQUISITION_CONFIRM", () => {
    setWrongTypeModal();
    const { container } = render(<AcquisitionConfirmModal />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing and calls resolveCurrentModal when payload is undefined", () => {
    (useUIStore as any).mockImplementation(() => ({
      activeModal: { id: "m1", type: "ACQUISITION_CONFIRM", payload: undefined },
      resolveCurrentModal: mockResolveCurrentModal,
    }));
    const { container } = render(<AcquisitionConfirmModal />);
    expect(container.firstChild).toBeNull();
    expect(mockResolveCurrentModal).toHaveBeenCalled();
  });

  it("displays target name, price, cash, and combined share", () => {
    mockPreviewAcquisition.mockReturnValue(
      makePreview({
        targetName: "Mega Studio",
        price: 80_000_000,
        playerCash: 2_000_000_000,
        combinedShare: 42.5,
      })
    );
    setModal({ targetId: "r1" });
    render(<AcquisitionConfirmModal />);
    expect(screen.getAllByText(/Mega Studio/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/\$80M/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/\$2\.00B/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/42\.5%/).length).toBeGreaterThanOrEqual(1);
  });

  it("clicking Bid calls acquireRival then resolveCurrentModal", () => {
    mockPreviewAcquisition.mockReturnValue(makePreview({ targetId: "r99" }));
    setModal({ targetId: "r99" });
    render(<AcquisitionConfirmModal />);
    const bidBtn = screen.getByText(/Bid/i).closest("button")!;
    fireEvent.click(bidBtn);
    expect(mockAcquireRival).toHaveBeenCalledWith("r99");
    expect(mockResolveCurrentModal).toHaveBeenCalled();
  });

  it("clicking Walk Away calls resolveCurrentModal only", () => {
    setModal({ targetId: "r1" });
    render(<AcquisitionConfirmModal />);
    const walkBtn = screen.getByText(/Walk Away/i).closest("button")!;
    fireEvent.click(walkBtn);
    expect(mockAcquireRival).not.toHaveBeenCalled();
    expect(mockResolveCurrentModal).toHaveBeenCalled();
  });

  it("Bid button is disabled when !canProceed", () => {
    mockPreviewAcquisition.mockReturnValue(
      makePreview({ canProceed: false, affordable: false })
    );
    setModal({ targetId: "r1" });
    render(<AcquisitionConfirmModal />);
    const bidBtn = screen.getByText(/Bid/i).closest("button")!;
    expect(bidBtn.disabled).toBe(true);
  });
});
