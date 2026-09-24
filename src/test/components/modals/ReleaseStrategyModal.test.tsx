import React from "react";
import {render, screen, fireEvent} from "@testing-library/react";
import {describe, it, expect, vi, beforeEach} from "vitest";

const {mockResolveCurrentModal, mockSetReleaseStrategy} = vi.hoisted(() => ({
  mockResolveCurrentModal: vi.fn(),
  mockSetReleaseStrategy: vi.fn(),
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
      ? selector({gameState: mockGameState, setReleaseStrategy: mockSetReleaseStrategy})
      : selector
  ),
}));

vi.mock("@/engine/systems/ReleaseStrategySystem", () => ({
  getReleaseStrategyEffect: vi.fn(() => ({
    revenueMultiplier: 1.5,
    description: "Test effect",
  })),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({children, open}: any) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({children}: any) => <div>{children}</div>,
  DialogHeader: ({children}: any) => <div>{children}</div>,
  DialogTitle: ({children}: any) => <h2>{children}</h2>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({children, onClick, disabled, className}: any) => (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({children}: any) => <span>{children}</span>,
}));

import {ReleaseStrategyModal} from "@/components/modals/ReleaseStrategyModal";

const mockProject = {id: "p1", title: "Space Opera", genre: "sci-fi"};

function makeGameState(projects: Record<string, any> = {p1: mockProject}) {
  return {entities: {projects}};
}

function setModal(payload: any) {
  mockActiveModal = {id: "m1", type: "RELEASE_STRATEGY", payload};
}

describe("ReleaseStrategyModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveModal = null;
    mockGameState = makeGameState();
  });

  it("renders nothing when activeModal is null", () => {
    const {container} = render(<ReleaseStrategyModal />);
    expect(container.firstChild).toBeNull();
    expect(mockResolveCurrentModal).not.toHaveBeenCalled();
  });

  it("renders nothing and does NOT resolve when activeModal type is not RELEASE_STRATEGY", () => {
    mockActiveModal = {id: "m1", type: "CRISIS", payload: {}};
    const {container} = render(<ReleaseStrategyModal />);
    expect(container.firstChild).toBeNull();
    expect(mockResolveCurrentModal).not.toHaveBeenCalled();
  });

  it("resolves via useEffect when the project is missing (undismissable modal must not deadlock)", () => {
    mockGameState = makeGameState({});
    setModal({projectId: "missing", projectTitle: "Gone"});
    const {container} = render(<ReleaseStrategyModal />);
    expect(container.firstChild).toBeNull();
    expect(mockResolveCurrentModal).toHaveBeenCalledTimes(1);
  });

  it("resolves via useEffect when the payload has no projectId (undismissable modal must not deadlock)", () => {
    setModal({});
    const {container} = render(<ReleaseStrategyModal />);
    expect(container.firstChild).toBeNull();
    expect(mockResolveCurrentModal).toHaveBeenCalledTimes(1);
  });

  it("renders the strategy cards when the project exists", () => {
    setModal({projectId: "p1", projectTitle: "Space Opera"});
    render(<ReleaseStrategyModal />);
    expect(screen.getByText("Theatrical Release")).toBeDefined();
    expect(screen.getByText("Streaming Deal")).toBeDefined();
    expect(mockResolveCurrentModal).not.toHaveBeenCalled();
  });

  it("confirming a selection calls setReleaseStrategy then resolves", () => {
    setModal({projectId: "p1", projectTitle: "Space Opera"});
    render(<ReleaseStrategyModal />);
    fireEvent.click(screen.getByText("Theatrical Release"));
    fireEvent.click(screen.getByRole("button", {name: /lock in strategy/i}));
    expect(mockSetReleaseStrategy).toHaveBeenCalledWith("p1", "theatrical");
    expect(mockResolveCurrentModal).toHaveBeenCalledTimes(1);
  });
});
