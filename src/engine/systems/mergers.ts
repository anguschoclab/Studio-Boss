import { GameState, RivalStudio, Project } from '../types/index';

export function evaluateAcquisitionTarget(target: RivalStudio, buyerCash: number): { viable: boolean; price: number; reason?: string } {
  // Base valuation on their remaining cash and strength
  let basePrice = Math.max(10_000_000, (target.strength * 2_000_000) + target.cash);
  
  // Archetype multiplier
  if (target.archetype === 'major') basePrice *= 2.0;
  if (target.archetype === 'indie') basePrice *= 1.2;
  
  const finalPrice = Math.round(basePrice);
  
  if (buyerCash < finalPrice) {
    return { viable: false, price: finalPrice, reason: 'Insufficient funds for acquisition.' };
  }
  
  return { viable: true, price: finalPrice };
}

export function executeAcquisition(state: GameState, targetId: string): GameState {
  const targetIndex = state.industry.rivals.findIndex(r => r.id === targetId);
  if (targetIndex === -1) return state;
  
  const target = state.industry.rivals[targetIndex];
  const evalResult = evaluateAcquisitionTarget(target, state.cash);
  
  if (!evalResult.viable) return state;
  
  // Execute Buyout
  const updatedRivals = [...state.industry.rivals];
  updatedRivals.splice(targetIndex, 1); // Remove from competitors list
  
  // Boost player studio prestige/strength
  const newPrestige = Math.min(100, state.studio.prestige + (target.strength * 0.2));
  
  // Gain their active projects (Simulated as random opportunities or empty shells)
  const newOpportunities = [...(state.market.opportunities || [])];
  newOpportunities.push({
    id: crypto.randomUUID(),
    title: `Acquired ${target.name} IP Catalog`,
    format: 'film',
    type: 'rights' as const,
    origin: 'agency_package' as const,
    budgetTier: 'mid',
    costToAcquire: 0,
    weeksUntilExpiry: 52,
    flavor: `A diverse library of IP acquired from ${target.name}.`,
    targetAudience: 'broad',
    genre: target.genreFocus || 'Drama'
  });
  
  return {
    ...state,
    cash: state.cash - evalResult.price,
    studio: {
      ...state.studio,
      prestige: newPrestige
    },
    market: {
      ...state.market,
      opportunities: newOpportunities
    },
    industry: {
      ...state.industry,
      rivals: updatedRivals,
      headlines: [
        {
          id: crypto.randomUUID(),
          week: state.week,
          category: 'market' as const,
          text: `INDUSTRY SHOCKER: ${state.studio.name} acquires ${target.name} in a historic ${"$" + (evalResult.price / 1_000_000).toFixed(1)}M buyout!`
        },
        ...state.industry.headlines
      ].slice(0, 50)
    }
  };
}

export function executeSabotage(state: GameState, targetId: string): GameState {
  const target = state.industry.rivals.find(r => r.id === targetId);
  if (!target || state.cash < 1_000_000) return state;

  return {
    ...state,
    cash: state.cash - 1_000_000,
    industry: {
      ...state.industry,
      rumors: [
        {
          id: crypto.randomUUID(),
          week: state.week,
          text: `Rumors swirl that ${target.name}'s upcoming blockbuster is facing massive reshoots.`,
          truthful: false,
          category: 'rival' as const,
          resolved: false,
        },
        ...(state.industry.rumors || [])
      ].slice(0, 20)
    }
  };
}

export function executePoach(state: GameState, targetId: string): GameState {
  const targetIndex = state.industry.rivals.findIndex(r => r.id === targetId);
  if (targetIndex === -1 || state.cash < 3_000_000) return state;

  const updatedRivals = [...state.industry.rivals];
  const target = updatedRivals[targetIndex];
  
  // Steal strength/market share
  const stealAmount = Math.min(5, target.strength);
  updatedRivals[targetIndex] = { ...target, strength: target.strength - stealAmount };

  return {
    ...state,
    cash: state.cash - 3_000_000,
    studio: {
      ...state.studio,
      prestige: Math.min(100, state.studio.prestige + stealAmount)
    },
    industry: {
      ...state.industry,
      rivals: updatedRivals,
      headlines: [
        {
          id: crypto.randomUUID(),
          week: state.week,
          category: 'talent' as const,
          text: `${state.studio.name} poaches top executive from ${target.name}!`
        },
        ...state.industry.headlines
      ].slice(0, 50)
    }
  };
}
