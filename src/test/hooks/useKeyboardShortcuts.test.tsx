import React from "react";
import {render, fireEvent} from "@testing-library/react";
import {describe, it, expect, vi, beforeEach} from "vitest";

const {
  mockSetActiveHub,
  mockOpenCreateProject,
  mockToggleQuickActions,
  mockResolveCurrentModal,
} = vi.hoisted(() => ({
  mockSetActiveHub: vi.fn(),
  mockOpenCreateProject: vi.fn(),
  mockToggleQuickActions: vi.fn(),
  mockResolveCurrentModal: vi.fn(),
}));

let mockActiveModal: any = null;

vi.mock("@/store/uiStore", () => ({
  useUIStore: vi.fn(() => ({
    setActiveHub: mockSetActiveHub,
    openCreateProject: mockOpenCreateProject,
    toggleQuickActions: mockToggleQuickActions,
    activeModal: mockActiveModal,
    resolveCurrentModal: mockResolveCurrentModal,
  })),
}));

import {useKeyboardShortcuts} from "@/hooks/useKeyboardShortcuts";

const Probe: React.FC = () => {
  useKeyboardShortcuts();
  return null;
};

describe("useKeyboardShortcuts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveModal = null;
  });

  it("Escape does NOT resolve the modal queue — dialogs own Escape via onOpenChange", () => {
    mockActiveModal = { id: "m1", type: "SUMMARY", payload: {} };
    render(<Probe />);
    fireEvent.keyDown(window, {key: "Escape"});
    expect(mockResolveCurrentModal).not.toHaveBeenCalled();
  });

  it("Escape with no active modal does nothing", () => {
    mockActiveModal = null;
    render(<Probe />);
    fireEvent.keyDown(window, {key: "Escape"});
    expect(mockResolveCurrentModal).not.toHaveBeenCalled();
    expect(mockSetActiveHub).not.toHaveBeenCalled();
    expect(mockOpenCreateProject).not.toHaveBeenCalled();
    expect(mockToggleQuickActions).not.toHaveBeenCalled();
  });

  it("cmd+1 navigates to the Studio HQ hub", () => {
    render(<Probe />);
    fireEvent.keyDown(window, {key: "1", metaKey: true});
    expect(mockSetActiveHub).toHaveBeenCalledWith("hq");
  });

  it("cmd+2 navigates to the production hub", () => {
    render(<Probe />);
    fireEvent.keyDown(window, {key: "2", metaKey: true});
    expect(mockSetActiveHub).toHaveBeenCalledWith("production");
  });

  it("cmd+n opens the create-project modal", () => {
    render(<Probe />);
    fireEvent.keyDown(window, {key: "n", metaKey: true});
    expect(mockOpenCreateProject).toHaveBeenCalledTimes(1);
  });

  it("cmd+shift+a toggles the quick actions dock", () => {
    render(<Probe />);
    fireEvent.keyDown(window, {key: "a", metaKey: true, shiftKey: true});
    expect(mockToggleQuickActions).toHaveBeenCalledTimes(1);
  });

  it("unmapped keys do nothing", () => {
    render(<Probe />);
    fireEvent.keyDown(window, {key: "x"});
    fireEvent.keyDown(window, {key: "5", metaKey: true});
    expect(mockResolveCurrentModal).not.toHaveBeenCalled();
    expect(mockSetActiveHub).not.toHaveBeenCalled();
    expect(mockOpenCreateProject).not.toHaveBeenCalled();
    expect(mockToggleQuickActions).not.toHaveBeenCalled();
  });
});
