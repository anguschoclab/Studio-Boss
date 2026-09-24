import React from "react";
import {render, screen, fireEvent} from "@testing-library/react";
import {describe, it, expect, vi, beforeEach} from "vitest";

const {mockResolveCurrentModal, mockUpdateProject, mockAddFunds} = vi.hoisted(() => ({
  mockResolveCurrentModal: vi.fn(),
  mockUpdateProject: vi.fn(),
  mockAddFunds: vi.fn(),
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
      ? selector({
          gameState: mockGameState,
          updateProject: mockUpdateProject,
          addFunds: mockAddFunds,
        })
      : selector
  ),
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

vi.mock("lucide-react", () => ({
  Clapperboard: () => <div data-testid="icon" />,
  Clock: () => <div data-testid="icon" />,
  Zap: () => <div data-testid="icon" />,
  Film: () => <div data-testid="icon" />,
  ChevronRight: () => <div data-testid="icon" />,
}));

import {PostProductionModal} from "@/components/modals/PostProductionModal";

const mockProject = {id: "p1", title: "Space Opera", buzz: 50, postProductionWeeksRemaining: 3};

function makeGameState(projects: Record<string, any> = {p1: mockProject}) {
  return {entities: {projects}};
}

function setModal(payload: any) {
  mockActiveModal = {id: "m1", type: "POST_PRODUCTION", payload};
}

describe("PostProductionModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveModal = null;
    mockGameState = makeGameState();
  });

  it("renders nothing when activeModal is null", () => {
    const {container} = render(<PostProductionModal />);
    expect(container.firstChild).toBeNull();
    expect(mockResolveCurrentModal).not.toHaveBeenCalled();
  });

  it("renders nothing and does NOT resolve when activeModal type is not POST_PRODUCTION", () => {
    mockActiveModal = {id: "m1", type: "CRISIS", payload: {}};
    const {container} = render(<PostProductionModal />);
    expect(container.firstChild).toBeNull();
    expect(mockResolveCurrentModal).not.toHaveBeenCalled();
  });

  it("resolves via useEffect when the project is missing (no decision to make)", () => {
    mockGameState = makeGameState({});
    setModal({projectId: "missing", projectTitle: "Gone"});
    const {container} = render(<PostProductionModal />);
    expect(container.firstChild).toBeNull();
    expect(mockResolveCurrentModal).toHaveBeenCalledTimes(1);
  });

  it("resolves via useEffect when the payload has no projectId (queue must not deadlock)", () => {
    setModal({});
    const {container} = render(<PostProductionModal />);
    expect(container.firstChild).toBeNull();
    expect(mockResolveCurrentModal).toHaveBeenCalledTimes(1);
  });

  it("renders the timeline and options when the project exists", () => {
    setModal({projectId: "p1", projectTitle: "Space Opera"});
    render(<PostProductionModal />);
    expect(screen.getByText("Post-Production Phase")).toBeDefined();
    expect(screen.getByText("Rush Post-Production")).toBeDefined();
    expect(screen.getByText("Extended Cut")).toBeDefined();
    expect(mockResolveCurrentModal).not.toHaveBeenCalled();
  });

  it("Standard Schedule resolves without touching the project", () => {
    setModal({projectId: "p1", projectTitle: "Space Opera"});
    render(<PostProductionModal />);
    fireEvent.click(screen.getByRole("button", {name: /standard schedule/i}));
    expect(mockUpdateProject).not.toHaveBeenCalled();
    expect(mockAddFunds).not.toHaveBeenCalled();
    expect(mockResolveCurrentModal).toHaveBeenCalledTimes(1);
  });

  it("confirming Rush charges $2M, updates the project, then resolves", () => {
    setModal({projectId: "p1", projectTitle: "Space Opera"});
    render(<PostProductionModal />);
    fireEvent.click(screen.getByText("Rush Post-Production"));
    fireEvent.click(screen.getByRole("button", {name: /confirm/i}));
    expect(mockAddFunds).toHaveBeenCalledWith(-2_000_000);
    expect(mockUpdateProject).toHaveBeenCalledWith("p1", {postProductionWeeksRemaining: 1});
    expect(mockResolveCurrentModal).toHaveBeenCalledTimes(1);
  });
});
