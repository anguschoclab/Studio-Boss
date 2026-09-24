import React from "react";
import {render, screen, fireEvent} from "@testing-library/react";
import {describe, it, expect, vi, beforeEach} from "vitest";

const {mockResolveCurrentModal} = vi.hoisted(() => ({
  mockResolveCurrentModal: vi.fn(),
}));

let mockActiveModal: any = null;
let mockGameState: any = {
  entities: {talents: {}},
};

vi.mock("@/store/uiStore", () => ({
  useUIStore: vi.fn(() => ({
    activeModal: mockActiveModal,
    resolveCurrentModal: mockResolveCurrentModal,
  })),
}));

vi.mock("@/store/gameStore", () => ({
  useGameStore: vi.fn((selector: any) =>
    typeof selector === "function" ? selector({gameState: mockGameState}) : selector
  ),
}));

vi.mock("@/components/shared/TalentNameLink", () => ({
  TalentNameLink: ({name}: any) => <span>{name}</span>,
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({children, open}: any) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({children}: any) => <div>{children}</div>,
  DialogHeader: ({children}: any) => <div>{children}</div>,
  DialogTitle: ({children}: any) => <h2>{children}</h2>,
  DialogDescription: ({children}: any) => <p>{children}</p>,
  DialogFooter: ({children}: any) => <div>{children}</div>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({children, onClick, className}: any) => (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({children}: any) => <span>{children}</span>,
}));

vi.mock("lucide-react", () => ({
  Package: () => <div data-testid="icon" />,
  AlertTriangle: () => <div data-testid="icon" />,
  Users: () => <div data-testid="icon" />,
  Percent: () => <div data-testid="icon" />,
}));

import {PackageDealOfferedModal} from "@/components/modals/PackageDealOfferedModal";

const validPayload = {
  agencyId: "ag1",
  agencyName: "Paradigm West",
  agencyArchetype: "Boutique",
  agencyDescription: "A small but fierce agency.",
  leadTalentId: "t1",
  leadTalentName: "Jane Star",
  bundledTalentId: "t2",
  bundledTalentName: "Bob Character",
  packageDiscount: 0.15,
  reason: "Bundle them or lose them.",
};

describe("PackageDealOfferedModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveModal = null;
    mockGameState = {entities: {talents: {}}};
  });

  it("renders nothing when activeModal is null", () => {
    const {container} = render(<PackageDealOfferedModal />);
    expect(container.firstChild).toBeNull();
    expect(mockResolveCurrentModal).not.toHaveBeenCalled();
  });

  it("renders nothing and does NOT resolve for a different modal type", () => {
    mockActiveModal = {id: "m1", type: "CRISIS", payload: {projectId: "p1"}};
    const {container} = render(<PackageDealOfferedModal />);
    expect(container.firstChild).toBeNull();
    expect(mockResolveCurrentModal).not.toHaveBeenCalled();
  });

  it("resolves via useEffect when payload is missing (queue must not deadlock)", () => {
    mockActiveModal = {id: "m1", type: "PACKAGE_DEAL_OFFERED", payload: undefined};
    const {container} = render(<PackageDealOfferedModal />);
    expect(container.firstChild).toBeNull();
    expect(mockResolveCurrentModal).toHaveBeenCalledTimes(1);
  });

  it("renders agency, talent names, and discount", () => {
    mockActiveModal = {id: "m1", type: "PACKAGE_DEAL_OFFERED", payload: validPayload};
    render(<PackageDealOfferedModal />);
    expect(screen.getAllByText(/Paradigm West/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Jane Star/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Bob Character/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/15% fee discount/)).toBeDefined();
    expect(mockResolveCurrentModal).not.toHaveBeenCalled();
  });

  it("clicking Accept resolves the modal", () => {
    mockActiveModal = {id: "m1", type: "PACKAGE_DEAL_OFFERED", payload: validPayload};
    render(<PackageDealOfferedModal />);
    fireEvent.click(screen.getByText("Accept Package Deal"));
    expect(mockResolveCurrentModal).toHaveBeenCalledTimes(1);
  });

  it("clicking Decline resolves the modal", () => {
    mockActiveModal = {id: "m1", type: "PACKAGE_DEAL_OFFERED", payload: validPayload};
    render(<PackageDealOfferedModal />);
    fireEvent.click(screen.getByText("Decline"));
    expect(mockResolveCurrentModal).toHaveBeenCalledTimes(1);
  });
});
