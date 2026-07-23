import { GameState, RivalStudio } from "@/engine/types";
import { generateId } from "../utils";
import { RegulatorSystem } from "./industry/RegulatorSystem";

export interface AcquisitionPreview {
  targetId: string;
  targetName: string;
  price: number;
  playerCash: number;
  affordable: boolean;
  combinedShare: number;
  regulatorRisk: "none" | "review" | "high";
  blockChance: number;
  canProceed: boolean;
  reason?: string;
}

export function evaluatePlayerAcquisition(
  state: GameState,
  targetId: string
): AcquisitionPreview {
  const target = state.entities.rivals[targetId];
  if (!target) {
    return {
      targetId,
      targetName: "Unknown",
      price: 0,
      playerCash: state.finance.cash,
      affordable: false,
      combinedShare: 0,
      regulatorRisk: "none",
      blockChance: 0,
      canProceed: false,
      reason: "Target studio not found.",
    };
  }

  const { viable, price, reason } = evaluateAcquisitionTarget(
    target,
    state.finance.cash
  );
  const combinedShare =
    RegulatorSystem.getMarketShare(state, "player") +
    RegulatorSystem.getMarketShare(state, targetId);

  let regulatorRisk: AcquisitionPreview["regulatorRisk"] = "none";
  let blockChance = 0;
  if (combinedShare > 35) {
    regulatorRisk = "high";
    blockChance = 0.9;
  } else if (combinedShare > 25) {
    regulatorRisk = "review";
    blockChance = 0.4 + (combinedShare - 25) * 0.05;
  }

  return {
    targetId,
    targetName: target.name,
    price,
    playerCash: state.finance.cash,
    affordable: viable,
    combinedShare,
    regulatorRisk,
    blockChance,
    canProceed: viable,
    reason: viable ? undefined : reason,
  };
}

export function evaluateAcquisitionTarget(
  target: RivalStudio,
  buyerCash: number
): { viable: boolean; price: number; reason?: string } {
  let basePrice = Math.max(10_000_000, target.strength * 2_000_000 + target.cash);
  if (target.archetype === "major") basePrice *= 2.0;
  if (target.archetype === "indie") basePrice *= 1.2;
  const finalPrice = Math.round(basePrice);
  if (buyerCash < finalPrice) {
    return { viable: false, price: finalPrice, reason: "Insufficient funds for acquisition." };
  }
  return { viable: true, price: finalPrice };
}

export function executeAcquisition(state: GameState, targetId: string): GameState {
  const target = state.entities.rivals[targetId];
  if (!target) return state;
  const evalResult = evaluateAcquisitionTarget(target, state.finance.cash);
  if (!evalResult.viable) return state;

  const verdict = RegulatorSystem.isBlocked(state, "player", targetId);
  if (verdict.blocked) {
    const filingFee = Math.round(evalResult.price * 0.02);
    return {
      ...state,
      finance: { ...state.finance, cash: state.finance.cash - filingFee },
      studio: {
        ...state.studio,
        prestige: Math.max(0, state.studio.prestige - 3),
      },
      industry: {
        ...state.industry,
        newsHistory: [
          {
            id: generateId("NEWS"),
            week: state.week,
            type: "STUDIO_EVENT" as const,
            headline: `BLOCKED: Regulators reject ${state.studio.name}'s bid for ${target.name}`,
            description: `${verdict.reason ?? "Competition concerns"} — combined share would reach ${verdict.sharePreview.toFixed(1)}%. ${state.studio.name} forfeits $${(filingFee / 1e6).toFixed(1)}M in filing costs.`,
          },
          ...state.industry.newsHistory,
        ].slice(0, 50),
      },
    };
  }

  const updatedRivals = { ...state.entities.rivals };
  delete updatedRivals[targetId];

  // Consolidation Logic: Deep-merge library and talent rosters
  const updatedProjects = { ...state.entities.projects };
  let targetProjectsCount = 0;
  // ⚡ Bolt: Replaced Object.values().filter().forEach() with a single O(N) for...in pass to eliminate intermediate array allocations
  for (const pid in state.entities.projects) {
    const p = state.entities.projects[pid];
    if (p.ownerId === targetId) {
      updatedProjects[pid] = { ...p, ownerId: state.studio.id, isAcquired: true };
      targetProjectsCount++;
    }
  }

  const updatedContracts = { ...state.entities.contracts };
  let targetContractsCount = 0;
  // ⚡ Bolt: Replaced Object.values().filter().forEach() with a single O(N) for...in pass to eliminate intermediate array allocations
  for (const cid in state.entities.contracts) {
    const c = state.entities.contracts[cid];
    if (c.ownerId === targetId) {
      updatedContracts[cid] = { ...c, ownerId: state.studio.id };
      targetContractsCount++;
    }
  }

  const newPrestige = Math.min(100, state.studio.prestige + target.strength * 0.2);

  return {
    ...state,
    finance: {
      ...state.finance,
      cash: state.finance.cash - evalResult.price + (target.cash || 0),
    },
    studio: {
      ...state.studio,
      prestige: newPrestige,
    },
    entities: {
      ...state.entities,
      projects: updatedProjects,
      contracts: updatedContracts,
      rivals: updatedRivals,
    },
    industry: {
      ...state.industry,
      newsHistory: [
        {
          id: generateId("NEWS"),
          week: state.week,
          type: "STUDIO_EVENT" as const,
          headline: `CONSOLIDATED: ${state.studio.name} absorbs ${target.name}!`,
          description: `The acquisition is finalized. ${targetProjectsCount} projects and ${targetContractsCount} talent contracts have been integrated into ${state.studio.name}.`,
        },
        ...state.industry.newsHistory,
      ].slice(0, 50),
    },
  };
}

export function executeSabotage(state: GameState, targetId: string): GameState {
  const target = state.entities.rivals[targetId];
  if (!target || state.finance.cash < 1_000_000) return state;

  return {
    ...state,
    finance: { ...state.finance, cash: state.finance.cash - 1_000_000 },
    industry: {
      ...state.industry,
      rumors: [
        {
          id: generateId("RUM"),
          week: state.week,
          text: `Rumors swirl that ${target.name}'s upcoming blockbuster is facing massive reshoots.`,
          truthful: false,
          category: "rival" as const,
          resolved: false,
        },
        ...(state.industry.rumors || []),
      ].slice(0, 20),
    },
  };
}

export function executePoach(state: GameState, targetId: string): GameState {
  const target = state.entities.rivals[targetId];
  if (!target || state.finance.cash < 3_000_000) return state;

  const stealAmount = Math.min(5, target.strength);
  const updatedRivals = {
    ...state.entities.rivals,
    [targetId]: { ...target, strength: target.strength - stealAmount },
  };

  return {
    ...state,
    finance: { ...state.finance, cash: state.finance.cash - 3_000_000 },
    studio: { ...state.studio, prestige: Math.min(100, state.studio.prestige + stealAmount) },
    entities: {
      ...state.entities,
      rivals: updatedRivals,
    },
    industry: {
      ...state.industry,
      newsHistory: [
        {
          id: generateId("NEWS"),
          week: state.week,
          type: "STUDIO_EVENT" as const,
          headline: `${state.studio.name} poaches top executive from ${target.name}!`,
          description: `A major talent move shakes the industry.`,
        },
        ...state.industry.newsHistory,
      ].slice(0, 50),
    },
  };
}
