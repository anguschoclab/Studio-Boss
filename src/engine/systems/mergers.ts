import { GameState, IPAsset, Project, RivalStudio, StateImpact } from '@/engine/types';
import { RandomGenerator } from '../utils/rng';

export function evaluateAcquisitionTarget(
  target: RivalStudio, 
  buyerCash: number, 
  buyerMarketShare: number = 0
): { viable: boolean; price: number; reason?: string } {
  // ⚖️ Anti-Trust Barrier: FTC blocks any acquisition that pushes combined market share past 40%.
  const targetShare = target.marketShare || 0;
  if (buyerMarketShare + targetShare > 0.40) {
    return { viable: false, price: 0, reason: 'FTC BLOCK: Combined market share would exceed the 40% anti-trust threshold.' };
  }

  let basePrice = Math.max(10_000_000, (target.strength * 2_000_000) + target.cash);
  if (target.archetype === 'major') basePrice *= 2.0;
  if (target.archetype === 'indie') basePrice *= 1.2;
  const finalPrice = Math.round(basePrice);
  if (buyerCash < finalPrice) {
    return { viable: false, price: finalPrice, reason: 'Insufficient funds for acquisition.' };
  }
  return { viable: true, price: finalPrice };
}

export function executeAcquisition(state: GameState, targetId: string, rng: RandomGenerator): StateImpact | null {
  const target = state.entities.rivals[targetId];
  if (!target) return null;
  
  const evalResult = evaluateAcquisitionTarget(target, state.finance.cash);
  if (!evalResult.viable) return null;

  // Transfer projects
  const newProjects: Project[] = [];
  const allProjects = state.entities.projects;
  for (const id in allProjects) {
    const p = allProjects[id];
    if (p.ownerId === target.id) {
      // Active projects get stuck in turnaround
      const newState = (p.state === 'production' || p.state === 'marketing') ? 'turnaround' : p.state;
      newProjects.push({ 
        ...p, 
        state: newState,
        isAcquired: true 
      });
    }
  }

  // Transfer IP assets
  const vault = state.ip.vault || [];
  const targetIdStr = target.id;
  const newIPAssets: IPAsset[] = [];

  for (let i = 0; i < vault.length; i++) {
    const a = vault[i];
    if (a.rightsOwner === 'RIVAL' && a.ownerStudioId === targetIdStr) {
      newIPAssets.push({
        ...a,
        rightsOwner: 'STUDIO' as const
      });
    }
  }

  return {
    cashChange: -evalResult.price + (target.cash || 0),
    prestigeChange: Math.min(100, state.studio.prestige + (target.strength * 0.2)) - state.studio.prestige,
    newProjects,
    newIPAssets,
    newHeadlines: [
      {
        id: rng.uuid('NWS'),
        week: state.week,
        category: 'market' as const,
        text: `CONSOLIDATED: ${state.studio.name} absorbs ${target.name}!`
      }
    ],
    newsEvents: [
      {
        id: rng.uuid('NWS'),
        week: state.week,
        type: 'STUDIO_EVENT' as const,
        headline: `M&A Finalized`,
        description: `The acquisition of ${target.name} is complete. ${newProjects.length} projects and ${newIPAssets.length} IP assets have been integrated.`,
      }
    ]
  };
}

export function executeSabotage(state: GameState, targetId: string, rng: RandomGenerator): StateImpact | null {
  const target = state.entities.rivals[targetId];
  if (!target || state.finance.cash < 1_000_000) return null;

  return {
    cashChange: -1_000_000,
    newRumors: [
      {
        id: rng.uuid('RMR'),
        week: state.week,
        text: `Rumors swirl that ${target.name}'s upcoming blockbuster is facing massive reshoots.`,
        truthful: false,
        category: 'rival' as const,
        resolved: false,
        resolutionWeek: state.week + 4
      }
    ]
  };
}

export function executePoach(state: GameState, targetId: string, rng: RandomGenerator): StateImpact | null {
  const target = state.entities.rivals[targetId];
  if (!target || state.finance.cash < 3_000_000) return null;

  const stealAmount = Math.min(5, target.strength);

  return {
    cashChange: -3_000_000,
    prestigeChange: stealAmount,
    rivalUpdates: [
      {
        rivalId: target.id,
        update: { strength: target.strength - stealAmount }
      }
    ],
    newHeadlines: [
      {
        id: rng.uuid('NWS'),
        week: state.week,
        category: 'talent' as const,
        text: `${state.studio.name} poaches top executive from ${target.name}!`
      }
    ]
  };
}
