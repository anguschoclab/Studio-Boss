import { Project, GameState, Buyer } from '@/engine/types';
import { RevenueProcessor } from './RevenueProcessor';
import { ExpenseProcessor } from './ExpenseProcessor';
import { InterestRateSimulator } from '../market/InterestRateSimulator';

export function calculateWeeklyCosts(state: GameState): number {
  const projects = Object.values(state.entities.projects || {});

  const market = state.finance.marketState || InterestRateSimulator.initialize();
  const expenses = ExpenseProcessor.calculateConsolidatedExpenses(
      projects, 
      state, 
      market, 
      state.studio.archetype, 
      state.finance.cash, 
      state.studio.prestige, 
      state.deals?.activeDeals || []
  );
  return expenses.production + expenses.marketing + expenses.overhead + expenses.pacts;
}

export function calculateWeeklyRevenue(state: GameState): number {
  const projects = Object.values(state.entities.projects || {});
  const buyers = state.market?.buyers || [];

  let boxOffice = 0;
  let distribution = 0;

  const buyersMap = new Map<string, Buyer>();
  buyers.forEach(b => buyersMap.set(b.id, b));

  projects.forEach(p => {
    if (p.state === 'released') {
      if (p.distributionStatus === 'theatrical') {
        boxOffice += RevenueProcessor.calculateTheatricalDecay(p.weeklyRevenue || 0, 0.18, p.isCultClassic);
      } else if (p.distributionStatus === 'streaming') {
        const platform = p.buyerId ? buyersMap.get(p.buyerId) : undefined;
        if (platform) {
          distribution += RevenueProcessor.calculateStreamingRevenue(p, platform);
        }
      }
    }
  });

  return boxOffice + distribution;
}
