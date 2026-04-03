import { GameState, RivalStudio, Project, Talent, StateImpact } from '@/engine/types';
import { RandomGenerator } from '../utils/rng';

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

export function executeAcquisition(state: GameState, targetId: string, rng: RandomGenerator): StateImpact | null {
  const targetIndex = state.industry.rivals.findIndex(r => r.id === targetId);
  if (targetIndex === -1) return null;
  const target = state.industry.rivals[targetIndex];
  const evalResult = evaluateAcquisitionTarget(target, state.finance.cash);
  if (!evalResult.viable) return null;

  const targetProjects = target.projects || {};
  const projectUpdates: { projectId: string; update: Partial<Project> }[] = [];
  Object.keys(targetProjects).forEach(id => {
      projectUpdates.push({ projectId: id, update: { ...targetProjects[id], isAcquired: true } });
  });

  return {
    cashChange: -evalResult.price + (target.cash || 0),
    prestigeChange: Math.min(100, state.studio.prestige + (target.strength * 0.2)) - state.studio.prestige,
    projectUpdates,
    newHeadlines: [
      {
        id: rng.uuid('hl'),
        week: state.week,
        category: 'market' as const,
        text: `CONSOLIDATED: ${state.studio.name} absorbs ${target.name}!`
      }
    ],
    newsEvents: [
      {
        id: rng.uuid('news'),
        week: state.week,
        type: 'STUDIO_EVENT' as const,
        headline: `M&A Finalized`,
        description: `The acquisition of ${target.name} is complete. ${projectUpdates.length} projects have been integrated.`,
      }
    ],
    // The reducer will need to handle RIVAL_REMOVAL specifically if added to StateImpact, 
    // or we can handle it via a special field. 
    // For now, we'll assume the caller (Store) removes the rival from the list.
  };
}

export function executeSabotage(state: GameState, targetId: string, rng: RandomGenerator): StateImpact | null {
  const target = state.industry.rivals.find(r => r.id === targetId);
  if (!target || state.finance.cash < 1_000_000) return null;

  return {
    cashChange: -1_000_000,
    newRumors: [
      {
        id: rng.uuid('rumor'),
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
  const target = state.industry.rivals.find(r => r.id === targetId);
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
        id: rng.uuid('hl'),
        week: state.week,
        category: 'talent' as const,
        text: `${state.studio.name} poaches top executive from ${target.name}!`
      }
    ]
  };
}
