import React from "react";
import {render, screen, fireEvent} from "@testing-library/react";
import {describe, it, expect, vi, beforeEach} from "vitest";

const {mockResolveCurrentModal, mockGreenlightProject} = vi.hoisted(() => ({
  mockResolveCurrentModal: vi.fn(),
  mockGreenlightProject: vi.fn(),
}));

let mockActiveModal: any = null;
let mockGameState: any = null;

vi.mock("@/store/uiStore", () => ({
  useUIStore: vi.fn(() => ({
    activeModal: mockActiveModal,
    resolveCurrentModal: mockResolveCurrentModal,
  })),
}));

vi.mock("@/store/gameStore", () => ({
  useGameStore: vi.fn((selector: any) =>
    typeof selector === "function"
      ? selector({gameState: mockGameState, greenlightProject: mockGreenlightProject})
      : selector
  ),
}));

vi.mock("@/engine/systems/greenlight", () => ({
  evaluateGreenlight: vi.fn(() => ({
    recommendation: "GREENLIGHT",
    score: 82,
    roleCompleteness: 100,
    scheduleCertainty: 75,
    positives: ["Strong cast attached"],
    negatives: [],
  })),
}));

vi.mock("@/engine/utils", () => ({
  getContractsByProjectId: vi.fn(() => []),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({children, open}: any) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({children}: any) => <div>{children}</div>,
  DialogHeader: ({children}: any) => <div>{children}</div>,
  DialogTitle: ({children}: any) => <h2>{children}</h2>,
  DialogFooter: ({children}: any) => <div>{children}</div>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({children, onClick, disabled, className}: any) => (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

vi.mock("lucide-react", () => ({
  CheckCircle2: () => <div data-testid="icon" />,
  XCircle: () => <div data-testid="icon" />,
  Clock: () => <div data-testid="icon" />,
  UserCheck: () => <div data-testid="icon" />,
  ShieldAlert: () => <div data-testid="icon" />,
}));

import {GreenlightDecisionModal} from "@/components/modals/GreenlightDecisionModal";

const mockProject = {
  id: "p1",
  title: "Space Opera",
  genre: "sci-fi",
};

function makeGameState(projects: Record<string, any> = {p1: mockProject}) {
  return {
    week: 10,
    finance: {cash: 100_000_000},
    entities: {
      projects,
      contracts: {},
      talents: {},
      contractsByProjectId: {},
    },
  };
}

function setModal(payload: any) {
  mockActiveModal = {id: "m1", type: "GREENLIGHT_DECISION", payload};
}

describe("GreenlightDecisionModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveModal = null;
    mockGameState = makeGameState();
  });

  it("renders nothing when activeModal is null", () => {
    const {container} = render(<GreenlightDecisionModal />);
    expect(container.firstChild).toBeNull();
    expect(mockResolveCurrentModal).not.toHaveBeenCalled();
  });

  it("renders nothing and does NOT resolve when activeModal type is not GREENLIGHT_DECISION", () => {
    mockActiveModal = {id: "m1", type: "CRISIS", payload: {}};
    const {container} = render(<GreenlightDecisionModal />);
    expect(container.firstChild).toBeNull();
    expect(mockResolveCurrentModal).not.toHaveBeenCalled();
  });

  it("resolves via useEffect when the project is missing (queue must not deadlock)", () => {
    mockGameState = makeGameState({});
    setModal({projectId: "missing"});
    const {container} = render(<GreenlightDecisionModal />);
    expect(container.firstChild).toBeNull();
    expect(mockResolveCurrentModal).toHaveBeenCalledTimes(1);
  });

  it("resolves via useEffect when gameState is null (queue must not deadlock)", () => {
    mockGameState = null;
    setModal({projectId: "p1"});
    const {container} = render(<GreenlightDecisionModal />);
    expect(container.firstChild).toBeNull();
    expect(mockResolveCurrentModal).toHaveBeenCalledTimes(1);
  });

  it("renders the greenlight report when the project exists", () => {
    setModal({projectId: "p1"});
    render(<GreenlightDecisionModal />);
    expect(screen.getByText("GREENLIGHT")).toBeDefined();
    expect(screen.getByText("82")).toBeDefined();
    expect(screen.getByText("Strong cast attached")).toBeDefined();
    expect(mockResolveCurrentModal).not.toHaveBeenCalled();
  });

  it("clicking Greenlight calls greenlightProject then resolves", () => {
    setModal({projectId: "p1"});
    render(<GreenlightDecisionModal />);
    fireEvent.click(screen.getByRole("button", {name: /greenlight/i}));
    expect(mockGreenlightProject).toHaveBeenCalledWith("p1");
    expect(mockResolveCurrentModal).toHaveBeenCalledTimes(1);
  });

  it("clicking Defer resolves only", () => {
    setModal({projectId: "p1"});
    render(<GreenlightDecisionModal />);
    fireEvent.click(screen.getByText(/Defer/i).closest("button")!);
    expect(mockGreenlightProject).not.toHaveBeenCalled();
    expect(mockResolveCurrentModal).toHaveBeenCalledTimes(1);
  });

  it("clicking Reject resolves only", () => {
    setModal({projectId: "p1"});
    render(<GreenlightDecisionModal />);
    fireEvent.click(screen.getByText(/Reject/i).closest("button")!);
    expect(mockGreenlightProject).not.toHaveBeenCalled();
    expect(mockResolveCurrentModal).toHaveBeenCalledTimes(1);
  });
});
