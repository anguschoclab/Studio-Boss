import { describe, it, expect } from "vitest";
import { selectAllProjects, selectProjectsByState, selectProjectCastAndCrew } from "../../store/selectors";

describe("selectors tests", () => {
  it("selectAllProjects selector", () => {
    const state = { studio: { internal: { projects: { "1": { id: "1", title: "Test Project" } } } } };
    const projects = selectAllProjects(state as any);
    expect(Array.isArray(projects)).toBe(true);
    expect(projects.length).toBe(1);
  });

  it("selectProjectsByState selector", () => {
    const state = { studio: { internal: { projects: { "1": { id: "1", status: "development" }, "2": { id: "2", status: "released" } } } } };
    const projects = selectProjectsByState(state as any, "development");
    expect(projects.length).toBe(1);
    expect(projects[0].id).toBe("1");
  });

  it("Relational selectProjectCastAndCrew selector", () => {
    const state = {
      studio: { internal: { projects: { "1": { id: "1" } }, contracts: [{ projectId: "1", talentId: "t1" }, { projectId: "1", talentId: "t2" }] } },
      industry: { talentPool: { "t1": { id: "t1" }, "t2": { id: "t2" } } }
    };
    const cast = selectProjectCastAndCrew(state as any, "1");
    expect(cast.length).toBe(2);
  });
});
