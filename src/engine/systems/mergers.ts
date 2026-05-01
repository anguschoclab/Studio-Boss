import { GameState, RivalStudio, Project, Opportunity } from '@/engine/types';
import { generateId } from '../utils';

export function evaluateAcquisitionTarget(target: RivalStudio, buyerCash: number): { viable: boolean; price: number; reason?: string } {
  let basePrice = Math.max(10_000_000, (target.strength * 2_000_000) + target.cash);
  if (target.archetype === 'major') basePrice *= 2.0;
  if (target.archetype === 'indie') basePrice *= 1.2;
  const finalPrice = Math.round(basePrice);
  if (buyerCash < finalPrice) {
    return { viable: false, price: finalPrice, reason: 'Insufficient funds for acquisition.' };
  }
  return { viable: true, price: finalPrice };
}

export function executeAcquisition(state: GameState, targetId: string): GameState {
  const target = state.entities.rivals[targetId];
  if (!target) return state;
  const evalResult = evaluateAcquisitionTarget(target, state.finance.cash);
  if (!evalResult.viable) return state;

  const updatedRivals = { ...state.entities.rivals };
  delete updatedRivals[targetId];
  
  // Consolidation Logic: Deep-merge library and talent rosters
  const updatedProjects = { ...state.entities.projects };
  const targetProjects = Object.values(state.entities.projects).filter(p => p.ownerId === targetId);
  targetProjects.forEach(p => {
      updatedProjects[p.id] = { ...p, ownerId: 'player', isAcquired: true };
  });

  const updatedContracts = { ...state.entities.contracts };
  const targetContracts = Object.values(state.entities.contracts).filter(c => c.ownerId === targetId);
  targetContracts.forEach(c => {
      updatedContracts[c.id] = { ...c, ownerId: 'player' };
  });

  const newPrestige = Math.min(100, state.studio.prestige + (target.strength * 0.2));

  return {
    ...state,
    finance: { 
      ...state.finance, 
      cash: state.finance.cash - evalResult.price + (target.cash || 0) 
    },
    studio: { 
      ...state.studio, 
      prestige: newPrestige,
    },
    entities: {
      ...state.entities,
      projects: updatedProjects,
      contracts: updatedContracts,
      rivals: updatedRivals
    },
    industry: {
      ...state.industry,
      newsHistory: [
        {
          id: generateId('NEWS'),
          week: state.week,
          type: 'STUDIO_EVENT' as const,
          headline: `CONSOLIDATED: ${state.studio.name} absorbs ${target.name}!`,
          description: `The acquisition is finalized. ${Object.keys(targetProjects).length} projects and ${targetContracts.length} talent contracts have been integrated into ${state.studio.name}.`,
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
          id: generateId('RUM'),
          week: state.week,
          text: `Rumors swirl that ${target.name}'s upcoming blockbuster is facing massive reshoots.`,
          truthful: false,
          category: 'rival' as const,
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
    [targetId]: { ...target, strength: target.strength - stealAmount }
  };

  return {
    ...state,
    finance: { ...state.finance, cash: state.finance.cash - 3_000_000 },
    studio: { ...state.studio, prestige: Math.min(100, state.studio.prestige + stealAmount) },
    entities: {
      ...state.entities,
      rivals: updatedRivals
    },
    industry: {
      ...state.industry,
      newsHistory: [
        {
          id: generateId('NEWS'),
          week: state.week,
          type: 'STUDIO_EVENT' as const,
          headline: `${state.studio.name} poaches top executive from ${target.name}!`,
          description: `A major talent move shakes the industry.`,
        },
        ...state.industry.newsHistory,
      ].slice(0, 50),
    },
  };
}
