import { GameState, WeekSummary } from '@/engine/types';

export interface SimulationMetrics {
  week: number;
  playerCash: number;
  rivalAvgCash: number;
  totalSystemCash: number;
  totalMarketSentiment: number;
  talentPoolSize: number;
  avgTalentPrestige: number;
  activeProjects: number;
  completedProjects: number;
  retiredCount: number;
  bankruptcyCount: number;
}

export class MetricsCollector {
  private history: SimulationMetrics[] = [];
  private totalRetired = 0;
  private totalCompleted = 0;
  
  public record(state: GameState, summary: WeekSummary): void {
    const rivals = state.industry.rivals;
    const platforms = state.market.buyers.filter(b => b.archetype === 'streamer') as any[];
    
    const rivalTotalCash = rivals.reduce((sum, r) => sum + r.cash, 0);
    const platformTotalCash = platforms.reduce((sum, p) => sum + (p.cash || 0), 0);
    
    // Increment total retirements
    this.totalRetired += (summary as any).retiredCount || 0;

    // Track total completed (projects in 'released' or 'archived' state across ALL studios)
    let worldCompletedCount = Object.values(state.studio.internal.projects)
      .filter(p => ['released', 'archived', 'post_release'].includes(p.state)).length;
    
    state.industry.rivals.forEach(rival => {
      worldCompletedCount += Object.values(rival.projects || {})
        .filter(p => ['released', 'archived', 'post_release'].includes(p.state)).length;
    });

    this.totalCompleted = Math.max(this.totalCompleted, worldCompletedCount);

    // totalSystemCash = player + rivals + platforms + (active budgets estimate)
    const activeBudgets = Object.values(state.studio.internal.projects)
      .filter(p => !['released', 'archived', 'post_release'].includes(p.state))
      .reduce((sum, p) => sum + (p.budget || 0), 0);

    const metrics: SimulationMetrics = {
      week: state.week,
      playerCash: state.finance.cash,
      rivalAvgCash: rivals.length > 0 ? rivalTotalCash / rivals.length : 0,
      totalSystemCash: state.finance.cash + rivalTotalCash + platformTotalCash + activeBudgets,
      totalMarketSentiment: state.finance.marketState?.sentiment || 50,
      talentPoolSize: Object.keys(state.industry.talentPool).length,
      avgTalentPrestige: Object.values(state.industry.talentPool).reduce((sum, t) => sum + t.prestige, 0) / (Object.keys(state.industry.talentPool).length || 1),
      activeProjects: Object.values(state.studio.internal.projects).filter(p => !['released', 'archived', 'post_release'].includes(p.state)).length,
      completedProjects: this.totalCompleted,
      retiredCount: this.totalRetired,
      bankruptcyCount: rivals.filter(r => r.cash <= 0).length
    };

    this.history.push(metrics);
  }

  public getHistory(): SimulationMetrics[] {
    return this.history;
  }

  public getSummaryReport(): string {
    if (this.history.length === 0) return 'No data recorded.';

    const last = this.history[this.history.length - 1];
    const initial = this.history[0];

    const format = (n: number) => (n / 1000000).toFixed(1) + 'M';

    return `
--- SIMULATION REPORT (Week ${last.week}) ---
Player Cash: ${format(initial.playerCash)} -> ${format(last.playerCash)}
Rival Avg Cash: ${format(last.rivalAvgCash)}
Total System Cash: ${format(last.totalSystemCash)}
Talent Pool Size: ${last.talentPoolSize} (Avg Prestige: ${last.avgTalentPrestige.toFixed(1)})
Total Bankruptcies: ${last.bankruptcyCount}
World Releases (Total/Archived): ${last.completedProjects}
Active Player Projects: ${last.activeProjects}
Total Retirements: ${last.retiredCount}
------------------------------------------
    `;
  }
}
