import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockDevelopFromOwnedIP, mockResolveCurrentModal } = vi.hoisted(() => ({
  mockDevelopFromOwnedIP: vi.fn(),
  mockResolveCurrentModal: vi.fn(),
}));

vi.mock("@/store/gameStore", () => ({
  useGameStore: vi.fn((selector: any) => {
    if (typeof selector === "function") {
      return selector({ developFromOwnedIP: mockDevelopFromOwnedIP });
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
  Dialog: ({ children, open }: any) => open ? <div>{children}</div> : null,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick }: any) => (
    <button data-testid="button" onClick={onClick}>{children}</button>
  ),
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: any) => <span>{children}</span>,
}));

vi.mock("lucide-react", () => ({
  Film: () => <div data-testid="icon" />,
  Zap: () => <div data-testid="icon" />,
  DollarSign: () => <div data-testid="icon" />,
  TrendingUp: () => <div data-testid="icon" />,
  X: () => <div data-testid="icon" />,
}));

vi.mock("@/engine/utils", () => ({
  formatMoney: (n: number) => `$${n.toLocaleString()}`,
}));

import { RebootOpportunityModal } from "@/components/modals/RebootOpportunityModal";
import { useUIStore } from "@/store/uiStore";

function makeProposal(overrides: any = {}) {
  return {
    ipId: "ip-1",
    ipTitle: "Great Film",
    suggestedBudget: 75_000_000,
    estimatedNostalgiaBonus: 15,
    description: "Nostalgia is at an all-time high for this classic property.",
    ...overrides,
  };
}

function setModal(payload: any) {
  (useUIStore as any).mockImplementation(() => ({
    activeModal: { id: "m1", type: "REBOOT_OPPORTUNITY", payload },
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

describe("RebootOpportunityModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setNoModal();
  });

  it("renders nothing when activeModal is null", () => {
    setNoModal();
    const { container } = render(<RebootOpportunityModal />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when activeModal type is not REBOOT_OPPORTUNITY", () => {
    setWrongTypeModal();
    const { container } = render(<RebootOpportunityModal />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when activeModal.payload is undefined", () => {
    (useUIStore as any).mockImplementation(() => ({
      activeModal: { id: "m1", type: "REBOOT_OPPORTUNITY", payload: undefined },
      resolveCurrentModal: mockResolveCurrentModal,
    }));
    const { container } = render(<RebootOpportunityModal />);
    expect(container.firstChild).toBeNull();
  });

  it("displays ipTitle from proposal", () => {
    setModal(makeProposal({ ipTitle: "My Awesome Movie" }));
    render(<RebootOpportunityModal />);
    expect(screen.getAllByText("My Awesome Movie").length).toBeGreaterThanOrEqual(1);
  });

  it("displays description from proposal", () => {
    setModal(makeProposal({ description: "A truly unique reboot angle." }));
    render(<RebootOpportunityModal />);
    expect(screen.getByText("A truly unique reboot angle.")).toBeDefined();
  });

  it("displays suggestedBudget formatted as money", () => {
    setModal(makeProposal({ suggestedBudget: 80_000_000 }));
    render(<RebootOpportunityModal />);
    expect(screen.getByText(/\$80,000,000/)).toBeDefined();
  });

  it("displays estimatedNostalgiaBonus value", () => {
    setModal(makeProposal({ estimatedNostalgiaBonus: 25 }));
    render(<RebootOpportunityModal />);
    expect(screen.getByText(/25/)).toBeDefined();
  });

  it("clicking Greenlight calls developFromOwnedIP with proposal.ipId then resolveCurrentModal", () => {
    setModal(makeProposal({ ipId: "ip-99" }));
    render(<RebootOpportunityModal />);
    const greenlightBtn = screen.getByText(/Greenlight/i);
    fireEvent.click(greenlightBtn);
    expect(mockDevelopFromOwnedIP).toHaveBeenCalledWith("ip-99");
    expect(mockResolveCurrentModal).toHaveBeenCalled();
  });

  it("clicking Pass calls resolveCurrentModal only", () => {
    setModal(makeProposal());
    render(<RebootOpportunityModal />);
    const passBtn = screen.getByText("Pass");
    fireEvent.click(passBtn);
    expect(mockDevelopFromOwnedIP).not.toHaveBeenCalled();
    expect(mockResolveCurrentModal).toHaveBeenCalled();
  });
});
