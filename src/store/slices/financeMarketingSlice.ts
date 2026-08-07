/* eslint-disable @typescript-eslint/no-explicit-any */
import {StateCreator} from "zustand";
import {GameStore} from "../gameStore";
import {handleReleasePhaseEntry} from "@/engine/systems/projects";
import {executeMarketing} from "@/engine/systems/projectHandlers/MarketingHandler";
import {Talent} from "@/engine/types";import {type, ProjectId} from "@/engine/types/shared.types";import {RandomGenerator} from "@/engine/utils/rng";
import {getContractsByProjectId} from "@/engine/utils";

export interface FinanceMarketingSlice {
  launchReleaseMarketing: (
    projectId: ProjectId,
    budget: number,
    domesticPct: number,
    angle: string
  ) => void;
  executeMarketingEvent: (
    eventName: "superbowl_ad" | "viral_campaign" | "press_tour",
    cost: number,
    projectId: ProjectId
  ) => void;
}

export const createFinanceMarketingSlice: StateCreator<GameStore, [], [], FinanceMarketingSlice> = (
  set
) => ({
  launchReleaseMarketing: (projectId, budget, domesticPct, angle) => {
    set((s) => {
      const state = s.gameState;
      if (!state) return s;
      if (budget > state.finance.cash) return s;

      const originalProject = state.entities.projects[projectId];
      if (!originalProject || originalProject.state !== "marketing") return s;

      const newCash = state.finance.cash - budget;
      const { project: p } = executeMarketing(originalProject, {
        domesticBudget: budget * (domesticPct / 100),
        foreignBudget: budget * (1 - domesticPct / 100),
        primaryAngle: angle as any,
      });

      const projectContracts = getContractsByProjectId(
        state.entities.contractsByProjectId,
        state.entities.contracts,
        p.id
      );

      const talentPool = state.entities.talents;
      const talentMap = new Map<string, Talent>();
      Object.keys(talentPool).forEach((id) => {
        talentMap.set(id, talentPool[id]);
      });

      const rng = new RandomGenerator(state.rngState ?? 0);

      const result = handleReleasePhaseEntry(
        p,
        state.week,
        state.studio.prestige,
        projectContracts,
        talentMap
      );

      if (result.update) {
        s.appendNewsEvents([{
          id: rng.uuid("NWS"),
          week: state.week,
          type: "RELEASE",
          headline: result.update,
          description: "",
          category: "general",
          projectId: p.id,
        }]);
      }

      const updatedProjects = { ...state.entities.projects, [p.id]: p };

      return {
        finance: {
          ...s.finance,
          cash: newCash,
        },
        gameState: {
          ...state,
          finance: {
            ...state.finance,
            cash: newCash,
          },
          entities: {
            ...state.entities,
            projects: updatedProjects,
          },
          rngState: rng.getState(),
        },
      };
    });
  },

  executeMarketingEvent: (_eventName, _cost, _projectId) => {
    // Marketing event execution - logic to be implemented
  },
});
