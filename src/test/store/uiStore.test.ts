import {describe, it, expect, beforeEach} from "vitest";
import {useUIStore} from "../../store/uiStore";

describe("uiStore", () => {
  beforeEach(() => {
    // Reset store before each test
    useUIStore.setState({
      activeTab: "pipeline",
      showCreateProject: false,
      selectedProjectId: null,
    });
  });

  it("sets active tab", () => {
    useUIStore.getState().setActiveTab("finance");
    expect(useUIStore.getState().activeTab).toBe("finance");
  });

  it("sets awards tab", () => {
    useUIStore.getState().setActiveTab("awards");
    expect(useUIStore.getState().activeTab).toBe("awards");
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

});
