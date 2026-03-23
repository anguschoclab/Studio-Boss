import { GameState, RivalStudio, Project } from '../types';

export function evaluateAcquisitionTarget(target: RivalStudio, buyerCash: number): { viable: boolean; price: number; reason?: string } {
  if (!target.isAcquirable) {
    return { viable: false, price: 0, reason: 'This studio is not currently for sale.' };
  }
  
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
  const targetIndex = state.rivals.findIndex(r => r.id === targetId);
  if (targetIndex === -1) return state;
  
  const target = state.rivals[targetIndex];
  const evalResult = evaluateAcquisitionTarget(target, state.cash);
  
  if (!evalResult.viable) return state;
  
  // Execute Buyout
  const updatedRivals = [...state.rivals];
  updatedRivals.splice(targetIndex, 1); // Remove from competitors list
  
  // Boost player studio prestige/strength
  const newPrestige = Math.min(100, state.studio.prestige + (target.strength * 0.2));
  
  // Gain their active projects (Simulated as random opportunities or empty shells)
  const newOpportunities = [...(state.opportunities || [])];
  newOpportunities.push({
    id: crypto.randomUUID(),
    title: `Acquired ${target.name} IP Catalog`,
    format: 'film',
    type: 'rights',
    origin: 'agency_package',
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
    rivals: updatedRivals,
    opportunities: newOpportunities,
    headlines: [
      {
        id: crypto.randomUUID(),
        week: state.week,
        category: 'market' as const,
        text: `INDUSTRY SHOCKER: ${state.studio.name} acquires ${target.name} in a historic ${"$" + (evalResult.price / 1_000_000).toFixed(1)}M buyout!`
      },
      ...state.headlines
    ].slice(0, 50)
  };
}

export function sellLabel(state: GameState, projectsToSell: Project[], askingPrice: number): GameState {
  // Logic for the player divesting a chunk of projects/IP to a rival for cash
  // Simplified for MVP: instantly sell and remove projects
  const sellIds = new Set(projectsToSell.map(p => p.id));
  const remainingProjects = state.projects.filter(p => !sellIds.has(p.id));
  
  return {
    ...state,
    cash: state.cash + askingPrice,
    projects: remainingProjects,
    headlines: [
      {
        id: crypto.randomUUID(),
        week: state.week,
        category: 'market',
        text: `${state.studio.name} divests major catalog label for ${"$" + (askingPrice / 1_000_000).toFixed(1)}M.`
      },
      ...state.headlines
    ]
  };
}
