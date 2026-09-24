import React from "react";
import {render, screen, fireEvent} from "@testing-library/react";
import {describe, it, expect, vi, beforeEach} from "vitest";

const {mockResolveCurrentModal, mockResolveCastingConstraint} = vi.hoisted(() => ({
  mockResolveCurrentModal: vi.fn(),
  mockResolveCastingConstraint: vi.fn(),
}));

let mockActiveModal: any = null;
let mockGameState: any = {
  entities: {
    projects: {p1: {id: "p1", title: "Night Terrors"}},
    talents: {t1: {id: "t1", name: "Diva Star"}},
  },
};

vi.mock("@/store/uiStore", () => ({
  useUIStore: vi.fn(() => ({
    activeModal: mockActiveModal,
    resolveCurrentModal: mockResolveCurrentModal,
  })),
}));

vi.mock("@/store/gameStore", () => ({
  useGameStore: vi.fn((selector: any) =>
    typeof selector === "function"
      ? selector({
          gameState: mockGameState,
          resolveCastingConstraint: mockResolveCastingConstraint,
        })
      : selector
  ),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({children, open}: any) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({children}: any) => <div>{children}</div>,
  DialogHeader: ({children}: any) => <div>{children}</div>,
  DialogTitle: ({children}: any) => <h2>{children}</h2>,
  DialogFooter: ({children}: any) => <div>{children}</div>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({children, onClick, className}: any) => (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  ),
}));

vi.mock("@/engine/utils", () => ({
  formatMoney: (n: number) => `$${n.toLocaleString()}`,
}));

vi.mock("lucide-react", () => ({
  ShieldAlert: () => <div data-testid="icon" />,
  DollarSign: () => <div data-testid="icon" />,
  Clock: () => <div data-testid="icon" />,
  Star: () => <div data-testid="icon" />,
}));

import {CastingConstraintModal} from "@/components/modals/CastingConstraintModal";

const options = [
  {
    id: "opt-rewrite",
    label: "Rewrite the scene",
    description: "Cut the requirement entirely.",
    weeksDelay: 2,
  },
  {
    id: "opt-pay",
    label: "Pay the premium",
    description: "Meet the talent's fee demand.",
    cashCost: 5_000_000,
  },
];

const payload = {
  violationId: "v1",
  projectId: "p1",
  talentId: "t1",
  options,
};

describe("CastingConstraintModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveModal = null;
    mockGameState = {
      entities: {
        projects: {p1: {id: "p1", title: "Night Terrors"}},
        talents: {t1: {id: "t1", name: "Diva Star"}},
      },
    };
  });

  it("renders nothing when activeModal is null", () => {
    const {container} = render(<CastingConstraintModal />);
    expect(container.firstChild).toBeNull();
    expect(mockResolveCurrentModal).not.toHaveBeenCalled();
  });

  it("renders nothing and does NOT resolve for a different modal type", () => {
    mockActiveModal = {id: "m1", type: "CRISIS", payload: {projectId: "p1"}};
    const {container} = render(<CastingConstraintModal />);
    expect(container.firstChild).toBeNull();
    expect(mockResolveCurrentModal).not.toHaveBeenCalled();
  });

  it("resolves via useEffect when options are missing (queue must not deadlock)", () => {
    mockActiveModal = {
      id: "m1",
      type: "CASTING_CONSTRAINT",
      payload: {violationId: "v1", projectId: "p1", talentId: "t1", options: []},
    };
    const {container} = render(<CastingConstraintModal />);
    expect(container.firstChild).toBeNull();
    expect(mockResolveCurrentModal).toHaveBeenCalledTimes(1);
  });

  it("renders talent, project, and all resolution options", () => {
    mockActiveModal = {id: "m1", type: "CASTING_CONSTRAINT", payload};
    render(<CastingConstraintModal />);
    expect(screen.getAllByText(/Diva Star/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Rewrite the scene")).toBeDefined();
    expect(screen.getByText("Pay the premium")).toBeDefined();
    expect(mockResolveCurrentModal).not.toHaveBeenCalled();
  });

  it("choosing an option calls resolveCastingConstraint with the payload and option id, then resolves", () => {
    mockActiveModal = {id: "m1", type: "CASTING_CONSTRAINT", payload};
    render(<CastingConstraintModal />);
    fireEvent.click(screen.getByText("Rewrite the scene"));
    expect(mockResolveCastingConstraint).toHaveBeenCalledWith(payload, "opt-rewrite");
    expect(mockResolveCurrentModal).toHaveBeenCalledTimes(1);
  });

  it("Ignore for now resolves without touching the constraint", () => {
    mockActiveModal = {id: "m1", type: "CASTING_CONSTRAINT", payload};
    render(<CastingConstraintModal />);
    fireEvent.click(screen.getByText("Ignore for now"));
    expect(mockResolveCastingConstraint).not.toHaveBeenCalled();
    expect(mockResolveCurrentModal).toHaveBeenCalledTimes(1);
  });
});
