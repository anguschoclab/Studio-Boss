import { Project, GameState, WeeklyFinancialReport, Buyer, Contract, TalentPact } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';
import { StateImpact, FinancialSnapshot } from '../../types/state.types';
import { RevenueProcessor } from './RevenueProcessor';
import { ExpenseProcessor } from './ExpenseProcessor';
import { InterestRateSimulator } from '../market/InterestRateSimulator';

export function generateWeeklyFinancialReport(
  state: GameState,
  studioId: string,
  projectsMap: Record<string, Project>,
  studioCash: number,
  studioArchetype: string,
  studioPrestige: number,
  contracts: Contract[],
  pacts: TalentPact[],
  rng: RandomGenerator,
  pendingImpacts: StateImpact[] = []
): { report: WeeklyFinancialReport; snapshot: FinancialSnapshot } {
  const projects = Object.values(projectsMap || {});
  const market = state.finance.marketState || InterestRateSimulator.initialize();
  
  const passive = RevenueProcessor.calculateVaultDividends(state.ip.vault, studioId);
  
  const { boxOffice, distribution, merch, totalRoyalties, projectRecoupment } = 
    RevenueProcessor.calculateActiveRevenue(projects, state, contracts, state.ip.vault, studioId);

  const expenses = ExpenseProcessor.calculateConsolidatedExpenses(
      projects, 
      state, 
      market, 
      studioArchetype, 
      studioCash, 
      studioPrestige, 
      pacts
  );

  let otherRevenue = 0;
  let otherExpenses = 0;

  for (let i = 0; i < pendingImpacts.length; i++) {
    const impact = pendingImpacts[i];
    const isTarget = impact.payload && (impact.payload as any).targetId === studioId;
    const isGenericPlayer = studioId === 'player' && !impact.payload?.targetId;

    if (isTarget || isGenericPlayer) {
        if (impact.type === 'FINANCE_TRANSACTION' && impact.payload) {
            const amount = (impact.payload as { amount: number }).amount || 0;
            if (amount > 0) otherRevenue += amount;
            else otherExpenses += Math.abs(amount);
        } else if (impact.cashChange) {
            const change = impact.cashChange as number;
            if (change > 0) otherRevenue += change;
            else otherExpenses += Math.abs(change);
        }
    }
  }

  const netProfit = (boxOffice + distribution + merch + passive + (expenses.interest < 0 ? Math.abs(expenses.interest) : 0)) 
                  - (expenses.production + expenses.marketing + expenses.overhead + expenses.pacts + totalRoyalties + (expenses.interest > 0 ? expenses.interest : 0));

  const report: WeeklyFinancialReport = {
    id: rng.uuid('SNP'),
    week: state.week,
    year: Math.floor((state.week - 1) / 52) + 1,
    startingCash: studioCash,
    revenue: { 
      boxOffice, 
      distribution, 
      other: merch + passive + otherRevenue 
    },
    expenses: { 
      production: expenses.production, 
      marketing: expenses.marketing, 
      overhead: expenses.overhead,
      pacts: expenses.pacts
    },
    endingCash: studioCash + netProfit,
    netProfit,
  };

  const snapshot: FinancialSnapshot = {
    id: rng.uuid('SNP'),
    week: state.week,
    revenue: {
      theatrical: boxOffice,
      streaming: distribution,
      merch: merch,
      passive: passive + otherRevenue
    },
    expenses: {
      production: expenses.production,
      burn: expenses.overhead,
      marketing: expenses.marketing,
      royalties: totalRoyalties,
      interest: expenses.interest,
      pacts: expenses.pacts
    },
    net: netProfit,
    cash: studioCash + netProfit,
    projectRecoupment
  };

  return { report, snapshot };
}
