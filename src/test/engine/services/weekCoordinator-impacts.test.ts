import { describe, it, expect } from "vitest";
import { WeekCoordinator } from "../../../engine/services/WeekCoordinator";
import { createMockGameState, createMockProject } from "../../utils/mockFactories";
import type { StateImpact } from "../../../engine/types";

function findImpacts(impacts: StateImpact[], type: string): StateImpact[] {
  return impacts.filter((i) => i.type === type);
}

describe("WeekCoordinator impact types", () => {
  it("produces MODAL_TRIGGERED with modalType SUMMARY", () => {
    const state = createMockGameState();
    const { impacts } = WeekCoordinator.execute(state);
    const modals = findImpacts(impacts, "MODAL_TRIGGERED");
    const summary = modals.find(
      (i) => (i.payload as { modalType: string }).modalType === "SUMMARY",
    );
    expect(summary).toBeDefined();
  });

  it("produces MODAL_TRIGGERED with modalType GREENLIGHT_DECISION when a project needs greenlight", () => {
    const project = createMockProject({
      id: "proj-gl",
      state: "needs_greenlight" as any,
      ownerId: "player-studio",
    });
    const state = createMockGameState({
      entities: {
        projects: { "proj-gl": project },
        releasedProjectIds: [],
        talents: {},
        contracts: {},
        contractsByProjectId: {},
        contractsByTalentId: {},
        rivals: {},
      },
    });
    const { impacts } = WeekCoordinator.execute(state);
    const modals = findImpacts(impacts, "MODAL_TRIGGERED");
    const greenlight = modals.find(
      (i) => (i.payload as { modalType: string }).modalType === "GREENLIGHT_DECISION",
    );
    expect(greenlight).toBeDefined();
    const payload = greenlight!.payload as { modalType: string; payload: { projectId: string } };
    expect(payload.payload.projectId).toBe("proj-gl");
  });

  it("produces PROJECT_UPDATED when a development project has script evolution", () => {
    const project = createMockProject({
      id: "proj-dev",
      state: "development",
      ownerId: "player-studio",
    });
    const state = createMockGameState({
      entities: {
        projects: { "proj-dev": project },
        releasedProjectIds: [],
        talents: {},
        contracts: {},
        contractsByProjectId: {},
        contractsByTalentId: {},
        rivals: {},
      },
    });
    const { impacts } = WeekCoordinator.execute(state);
    const projectUpdates = findImpacts(impacts, "PROJECT_UPDATED");
    const devUpdate = projectUpdates.find(
      (i) => (i.payload as { projectId: string }).projectId === "proj-dev",
    );
    expect(devUpdate).toBeDefined();
  });

  it("produces INDUSTRY_UPDATE with studio.loans key when loans are active", () => {
    const state = createMockGameState({
      studio: {
        id: "player-studio",
        name: "Test Studio",
        archetype: "major",
        prestige: 50,
        ownedPlatforms: [],
        internal: { projectHistory: [], projects: {}, contracts: [] },
        snapshotHistory: [],
        activeCampaigns: {},
        loans: [
          {
            id: "loan-1",
            principal: 100_000_000,
            weeklyPayment: 1_000_000,
            weeksRemaining: 10,
            interestRate: 0.05,
            takenWeek: 1,
          } as any,
        ],
      } as any,
    });
    const { impacts } = WeekCoordinator.execute(state);
    const industryImpacts = findImpacts(impacts, "INDUSTRY_UPDATE");
    const loansImpact = industryImpacts.find(
      (i) => {
        const update = (i.payload as { update?: Record<string, unknown> }).update;
        return update && update["studio.loans"] !== undefined;
      },
    );
    expect(loansImpact).toBeDefined();
    const loans = (loansImpact!.payload as { update: { "studio.loans": unknown[] } }).update["studio.loans"];
    expect(Array.isArray(loans)).toBe(true);
    // The loan with 10 weeks remaining should become 9 after decrement
    expect((loans as { weeksRemaining: number }[]).length).toBe(1);
    expect((loans as { weeksRemaining: number }[])[0].weeksRemaining).toBe(9);
  });

  it("does not produce SYSTEM_TICK impacts for loan updates (replaced by INDUSTRY_UPDATE)", () => {
    const state = createMockGameState({
      studio: {
        id: "player-studio",
        name: "Test Studio",
        archetype: "major",
        prestige: 50,
        ownedPlatforms: [],
        internal: { projectHistory: [], projects: {}, contracts: [] },
        snapshotHistory: [],
        activeCampaigns: {},
        loans: [
          {
            id: "loan-1",
            principal: 100_000_000,
            weeklyPayment: 1_000_000,
            weeksRemaining: 5,
            interestRate: 0.05,
            takenWeek: 1,
          } as any,
        ],
      } as any,
    });
    const { impacts } = WeekCoordinator.execute(state);
    const systemTicks = findImpacts(impacts, "SYSTEM_TICK");
    const loanSystemTick = systemTicks.find(
      (i) => {
        const payload = i.payload as { __studioUpdate?: { loans?: unknown } };
        return payload.__studioUpdate?.loans !== undefined;
      },
    );
    expect(loanSystemTick).toBeUndefined();
  });
});
