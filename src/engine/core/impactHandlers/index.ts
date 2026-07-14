import { GameState, StateImpact, ImpactType } from "@/engine/types";
import {
  addContractsToIndex,
  addContractsToTalentIndex,
  removeContractsByTalentFromIndex,
  removeContractsByProjectFromTalentIndex,
} from "@/engine/utils";

// Import all handler modules
import * as financeHandlers from "./financeHandlers";
import * as projectHandlers from "./projectHandlers";
import * as talentHandlers from "./talentHandlers";
import * as relationshipHandlers from "./relationshipHandlers";
import * as marketHandlers from "./marketHandlers";
import * as industryHandlers from "./industryHandlers";
import * as studioHandlers from "./studioHandlers";
import * as ipHandlers from "./ipHandlers";
import * as tvHandlers from "./tvHandlers";
import * as dealHandlers from "./dealHandlers";
import * as noopHandlers from "./noopHandlers";

/**
 * Handler registry mapping impact types to their handler functions
 */
const handlerRegistry: Record<
  Exclude<ImpactType, undefined>,
  (state: GameState, impact: any) => GameState
> = {
  // Finance handlers
  FUNDS_CHANGED: financeHandlers.handleFundsChanged,
  LEDGER_UPDATED: financeHandlers.handleLedgerUpdated,
  FINANCE_SNAPSHOT_ADDED: financeHandlers.handleFinanceSnapshotAdded,
  SYNC_M_A_FUNDS: financeHandlers.handleSyncMAFunds,
  FUNDS_DEDUCTED: financeHandlers.handleFundsDeducted,
  FINANCE_TRANSACTION: financeHandlers.handleFinanceTransaction,
  MARKET_EVENT_UPDATED: financeHandlers.handleMarketEventUpdated,

  // Project handlers
  PROJECT_UPDATED: projectHandlers.handleProjectUpdated,
  PROJECT_REMOVED: projectHandlers.handleProjectRemoved,
  PROJECT_CREATED: (state: GameState, impact: import("@/engine/types").StateImpact) => {
    const { project } = impact.payload as { project: import("@/engine/types").Project };
    const projects = { ...state.entities.projects };
    projects[project.id] = project;
    return {
      ...state,
      entities: {
        ...state.entities,
        projects,
      },
    };
  },
  AWARD_WON: projectHandlers.handleAwardWon,
  PILOT_GRADUATED: projectHandlers.handlePilotGraduated,

  // Talent handlers
  TALENT_UPDATED: talentHandlers.handleTalentUpdated,
  TALENT_ADDED: talentHandlers.handleTalentAdded,
  TALENT_REMOVED: talentHandlers.handleTalentRemoved,
  CASTING_CONSTRAINT_CHECKED: talentHandlers.handleCastingConstraintChecked,
  MEDICAL_LEAVE_TRIGGERED: talentHandlers.handleMedicalLeaveTriggered,

  // Relationship handlers
  RELATIONSHIP_FORMED: relationshipHandlers.handleRelationshipFormed,
  RELATIONSHIP_UPDATED: relationshipHandlers.handleRelationshipUpdated,
  CLIQUE_FORMED: relationshipHandlers.handleCliqueFormed,
  CLIQUE_UPDATED: relationshipHandlers.handleCliqueUpdated,
  SCREENPLAY_NOTE_CREATED: relationshipHandlers.handleScreenplayNoteCreated,
  SCREENPLAY_NOTE_IMPLEMENTED: relationshipHandlers.handleScreenplayNoteImplemented,
  PRODUCTION_ADDITION_CREATED: relationshipHandlers.handleProductionAdditionCreated,
  CREDIT_SCENE_CREATED: relationshipHandlers.handleCreditSceneCreatedOrUpdated,
  CREDIT_SCENE_UPDATED: relationshipHandlers.handleCreditSceneCreatedOrUpdated,
  TALK_SHOW_APPEARANCE_CREATED: relationshipHandlers.handleTalkShowAppearanceCreated,
  PHOTOSHOOT_CREATED: relationshipHandlers.handlePhotoshootCreated,
  PRESS_TOUR_CREATED: relationshipHandlers.handlePressTourCreated,
  BREAKOUT_STAR_CREATED: relationshipHandlers.handleBreakoutStarCreatedOrUpdated,
  BREAKOUT_STAR_UPDATED: relationshipHandlers.handleBreakoutStarCreatedOrUpdated,
  GUEST_STAR_OPPORTUNITY: relationshipHandlers.handleGuestStarOpportunityOrBooked,
  GUEST_STAR_BOOKED: relationshipHandlers.handleGuestStarOpportunityOrBooked,
  DISCOVERY_STATE_UPDATED: relationshipHandlers.handleDiscoveryStateUpdated,

  // Market handlers
  BUYER_UPDATED: marketHandlers.handleBuyerUpdated,
  OPPORTUNITY_UPDATED: marketHandlers.handleOpportunityUpdated,
  TRENDS_UPDATED: marketHandlers.handleTrendsUpdated,

  // Industry handlers
  INDUSTRY_UPDATE: industryHandlers.handleIndustryUpdate,
  SCANDAL_ADDED: industryHandlers.handleScandalAdded,
  SCANDAL_REMOVED: industryHandlers.handleScandalRemoved,
  SCANDAL_UPDATED: (state: GameState, impact: import("@/engine/types").StateImpact) => {
    const { scandalUpdates } = impact.payload as {
      scandalUpdates: import("@/engine/types/state.types").ScandalUpdate[];
    };
    if (!scandalUpdates || scandalUpdates.length === 0) return state;

    const updatesMap = new Map(scandalUpdates.map((u) => [u.scandalId, u.update]));

    return {
      ...state,
      industry: {
        ...state.industry,
        scandals: (state.industry.scandals || []).map((s) => {
          const update = updatesMap.get(s.id);
          if (update) {
            return { ...s, ...update };
          }
          return s;
        }),
      },
    };
  },
  RIVAL_UPDATED: industryHandlers.handleRivalUpdated,
  MERGER_OFFERED: industryHandlers.handleMergerOffered,
  MERGER_RESOLVED: industryHandlers.handleMergerResolved,

  // Studio handlers
  PRESTIGE_CHANGED: studioHandlers.handlePrestigeChanged,
  NEWS_ADDED: studioHandlers.handleNewsAdded,
  SYSTEM_TICK: studioHandlers.handleSystemTick,

  // IP handlers
  FRANCHISE_UPDATED: ipHandlers.handleFranchiseUpdated,
  VAULT_ASSET_UPDATED: ipHandlers.handleVaultAssetUpdated,
  FORMAT_LICENSED: ipHandlers.handleFormatLicensed,

  // TV handlers
  TV_RECOMMENDATION_CREATED: tvHandlers.handleTVRecommendationCreated,
  TV_RECOMMENDATION_ACCEPTED: tvHandlers.handleTVRecommendationAccepted,
  TV_RECOMMENDATION_STATE_UPDATED: tvHandlers.handleTVRecommendationStateUpdated,

  // Deal handlers
  DEAL_UPDATED: dealHandlers.handleDealUpdated,

  // No-op handlers (trigger UI modals/notifications)
  CASTING_CONSTRAINT_VIOLATION: noopHandlers.handleCastingConstraintViolation,
  CASTING_PREMIUM_DEMAND: noopHandlers.handleCastingPremiumDemand,
  CASTING_ALTERNATIVE_SUGGESTED: noopHandlers.handleCastingAlternativeSuggested,
  MODAL_TRIGGERED: (state: GameState) => state,

  // Shingle handlers
  SHINGLE_CREATED: (state: GameState, impact: import("@/engine/types").StateImpact) => {
    const { shingle } = impact.payload as { shingle: import("@/engine/types").ProducerShingle };
    const existing = state.entities.shingles || {};
    return {
      ...state,
      entities: {
        ...state.entities,
        shingles: { ...existing, [shingle.id]: shingle },
      },
    };
  },
  SHINGLE_UPDATED: (state: GameState, impact: import("@/engine/types").StateImpact) => {
    const { shingleId, update } = impact.payload as {
      shingleId: string;
      update: Partial<import("@/engine/types").ProducerShingle>;
    };
    const existing = state.entities.shingles || {};
    const cur = existing[shingleId];
    if (!cur) return state;
    return {
      ...state,
      entities: {
        ...state.entities,
        shingles: { ...existing, [shingleId]: { ...cur, ...update } },
      },
    };
  },
  SHINGLE_DISSOLVED: (state: GameState, impact: import("@/engine/types").StateImpact) => {
    const { shingleId } = impact.payload as { shingleId: string };
    const existing = { ...(state.entities.shingles || {}) };
    delete existing[shingleId];
    return {
      ...state,
      entities: {
        ...state.entities,
        shingles: existing,
      },
    };
  },

  // Contract handlers
  CONTRACT_ADDED: (state: GameState, impact: import("@/engine/types").StateImpact) => {
    const { contract } = impact.payload as { contract: import("@/engine/types").Contract };
    const contracts = { ...state.entities.contracts, [contract.id]: contract };
    const newContracts = [contract];
    const contractsByProjectId = addContractsToIndex(
      state.entities.contractsByProjectId,
      newContracts
    );
    const contractsByTalentId = addContractsToTalentIndex(
      state.entities.contractsByTalentId,
      newContracts
    );
    return {
      ...state,
      entities: {
        ...state.entities,
        contracts,
        contractsByProjectId,
        contractsByTalentId,
      },
    };
  },
};

/**
 * Apply a single StateImpact to the GameState using the handler registry
 * This replaces the massive switch statement in the original impactReducer
 */
export function applySingleImpact(state: GameState, impact: StateImpact): GameState {
  // Apply validation/sanitization for specific impact types
  if (impact.type === "FUNDS_CHANGED") {
    let amount = impact.payload.amount;
    if (isNaN(amount) || amount === null) amount = 0;
    if (Math.abs(amount) > 10_000_000_000) amount = Math.sign(amount) * 10_000_000_000;
    impact.payload.amount = amount;
  }

  if (impact.type === "RIVAL_UPDATED" && impact.payload.update?.cash !== undefined) {
    let val = impact.payload.update.cash;
    if (isNaN(val) || val === null) val = 0;
    if (Math.abs(val) > 1_000_000_000_000) val = Math.sign(val) * 1_000_000_000_000;
    impact.payload.update.cash = val;
  }

  // Handle "bag" impacts (impacts with undefined type but other impact fields)
  if (!impact.type) {
    let newState = state;
    if (impact.cashChange !== undefined) {
      newState = applySingleImpact(newState, {
        type: "FUNDS_CHANGED",
        payload: { amount: impact.cashChange },
      });
    }
    if (impact.prestigeChange !== undefined) {
      newState = applySingleImpact(newState, {
        type: "PRESTIGE_CHANGED",
        payload: { amount: impact.prestigeChange },
      });
    }
    if (impact.projectUpdates) {
      impact.projectUpdates.forEach((u) => {
        newState = applySingleImpact(newState, { type: "PROJECT_UPDATED", payload: u });
      });
    }
    if (impact.rivalUpdates) {
      impact.rivalUpdates.forEach((u) => {
        newState = applySingleImpact(newState, { type: "RIVAL_UPDATED", payload: u });
      });
    }
    if (impact.newHeadlines) {
      impact.newHeadlines.forEach((h) => {
        newState = applySingleImpact(newState, {
          type: "NEWS_ADDED",
          payload: { headline: h.text, description: "" },
        });
      });
    }
    if (impact.newsEvents) {
      impact.newsEvents.forEach((e) => {
        newState = applySingleImpact(newState, {
          type: "NEWS_ADDED",
          payload: { headline: e.headline, description: e.description },
        });
      });
    }
    if (impact.newAwards) {
      impact.newAwards.forEach((award) => {
        const projects = { ...newState.entities.projects };
        const project = projects[award.projectId];
        if (project) {
          projects[award.projectId] = {
            ...project,
            awards: [...(project.awards || []), award],
          };
        }
        newState = { ...newState, entities: { ...newState.entities, projects } };
      });
    }
    if (impact.cultClassicProjectIds) {
      impact.cultClassicProjectIds.forEach((id) => {
        const projects = { ...newState.entities.projects };
        const project = projects[id];
        if (project) {
          projects[id] = { ...project, isCultClassic: true };
        }
        newState = { ...newState, entities: { ...newState.entities, projects } };
      });
    }
    if (impact.razzieWinnerTalents) {
      impact.razzieWinnerTalents.forEach((id) => {
        const talents = { ...newState.entities.talents };
        const talent = talents[id];
        if (talent) {
          talents[id] = { ...talent, razzieWinner: true };
        }
        newState = { ...newState, entities: { ...newState.entities, talents } };
      });
    }
    if (impact.newContracts && impact.newContracts.length > 0) {
      const contracts = { ...newState.entities.contracts };
      impact.newContracts.forEach((c) => {
        contracts[c.id] = c;
      });
      const contractsByProjectId = addContractsToIndex(
        newState.entities.contractsByProjectId,
        impact.newContracts
      );
      const contractsByTalentId = addContractsToTalentIndex(
        newState.entities.contractsByTalentId,
        impact.newContracts
      );
      newState = {
        ...newState,
        entities: {
          ...newState.entities,
          contracts,
          contractsByProjectId,
          contractsByTalentId,
        },
      };
    }
    if (impact.newProjects && impact.newProjects.length > 0) {
      const projects = { ...newState.entities.projects };
      impact.newProjects.forEach((p) => {
        projects[p.id] = p;
      });
      newState = {
        ...newState,
        entities: {
          ...newState.entities,
          projects,
        },
      };
    }
    if (impact.removeContracts && impact.removeContracts.length > 0) {
      const contracts = { ...newState.entities.contracts };
      let contractsByProjectId = newState.entities.contractsByProjectId;
      let contractsByTalentId = newState.entities.contractsByTalentId;
      for (const entry of impact.removeContracts) {
        const [pid, tid] = entry.split(":");
        if (pid && tid) {
          const result = removeContractsByTalentFromIndex(
            contractsByProjectId,
            contracts,
            pid,
            tid
          );
          contractsByProjectId = result.index;
          const talentResult = removeContractsByProjectFromTalentIndex(
            contractsByTalentId,
            contracts,
            pid,
            tid
          );
          contractsByTalentId = talentResult.index;
          for (const cId of result.removedIds) {
            delete contracts[cId];
          }
        }
      }
      newState = {
        ...newState,
        entities: {
          ...newState.entities,
          contracts,
          contractsByProjectId,
          contractsByTalentId,
        },
      };
    }
    if (impact.scandalUpdates && impact.scandalUpdates.length > 0) {
      newState = applySingleImpact(newState, {
        type: "SCANDAL_UPDATED",
        payload: {
          scandalUpdates: impact.scandalUpdates,
        },
      });
    }
    return newState;
  }

  // Look up handler and apply
  const handler = handlerRegistry[impact.type as keyof typeof handlerRegistry];
  if (handler) {
    return handler(state, impact);
  }

  // If no handler found, return state unchanged
  return state;
}

/**
 * Pure reducer that processes an array of impacts without mutating original state.
 */
export function applyImpacts(state: GameState, impacts: StateImpact[]): GameState {
  return impacts.reduce((currentState, impact) => applySingleImpact(currentState, impact), state);
}

// Re-export all handlers for testing purposes
export * from "./financeHandlers";
export * from "./projectHandlers";
export * from "./talentHandlers";
export * from "./relationshipHandlers";
export * from "./marketHandlers";
export * from "./industryHandlers";
export * from "./studioHandlers";
export * from "./ipHandlers";
export * from "./tvHandlers";
export * from "./dealHandlers";
export * from "./noopHandlers";
