import { describe, it, expect, beforeEach } from "vitest";
import { useUIStore } from "../../store/uiStore";

describe("uiStore", () => {
  beforeEach(() => {
    // Reset store before each test
    useUIStore.setState({
      activeTab: "command",
      showCreateProject: false,
      showPitchProject: false,
      pitchingProjectId: null,
      modalQueue: [],
      activeModal: null,
      selectedProjectId: null,
      selectedTalentId: null,
    });
  });

  it("sets active tab", () => {
    useUIStore.getState().setActiveTab("finance");
    expect(useUIStore.getState().activeTab).toBe("finance");
  });

  it("opens and closes create project modal", () => {
    useUIStore.getState().openCreateProject();
    expect(useUIStore.getState().showCreateProject).toBe(true);

    useUIStore.getState().closeCreateProject();
    expect(useUIStore.getState().showCreateProject).toBe(false);
  });

  it("selects a project", () => {
    useUIStore.getState().selectProject("proj-1");
    expect(useUIStore.getState().selectedProjectId).toBe("proj-1");

    useUIStore.getState().selectProject(null);
    expect(useUIStore.getState().selectedProjectId).toBeNull();
  });

  it("manages the modal queue correctly", () => {
    const payload = { test: 123 };
    
    // First modal becomes active immediately
    useUIStore.getState().enqueueModal('SUMMARY', payload);
    expect(useUIStore.getState().activeModal?.type).toBe('SUMMARY');
    expect(useUIStore.getState().activeModal?.payload).toEqual(payload);
    expect(useUIStore.getState().modalQueue.length).toBe(0);

    // Second modal goes to queue
    useUIStore.getState().enqueueModal('CRISIS', { id: 'c1' });
    expect(useUIStore.getState().modalQueue.length).toBe(1);
    expect(useUIStore.getState().modalQueue[0].type).toBe('CRISIS');

    // Resolving first pops second
    useUIStore.getState().resolveCurrentModal();
    expect(useUIStore.getState().activeModal?.type).toBe('CRISIS');
    expect(useUIStore.getState().modalQueue.length).toBe(0);

    // Resolving last clears active
    useUIStore.getState().resolveCurrentModal();
    expect(useUIStore.getState().activeModal).toBeNull();
  });
});
