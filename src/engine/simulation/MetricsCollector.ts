import { GameState, WeekSummary } from '../types';

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
  marketShare: number;
  industryLeader?: string;
  topGenreROI?: { genre: string; roi: number };
  tvAwardsWon?: number;
  tvGenreROI?: { genre: string; roi: number };
  averageA_ListCount: number;
  totalBailoutCash: number;
}

export class MetricsCollector {
  private history: SimulationMetrics[] = [];
  private totalRetired = 0;
  private totalBailoutCash = 0;
  private genreStats: Record<string, { cost: number; revenue: number }> = {};
  private tvGenreStats: Record<string, { cost: number; revenue: number }> = {};
  private totalTvAwards = 0;
  
  public record(state: GameState, summary: WeekSummary): void {
    const rivals = state.industry.rivals;
    const platforms = state.market.buyers.filter(b => b.archetype === 'streamer') as any[];
    
    // Total bails tracking (Phase 2 hardening)
    const currentBailouts = (summary as any).totalBailouts || 0;
    this.totalBailoutCash += currentBailouts;
    
    const rivalTotalCash = rivals.reduce((sum, r) => sum + r.cash, 0);
    const platformTotalCash = platforms.reduce((sum, p) => sum + (p.cash || 0), 0);
    
    // Increment total retirements
    this.totalRetired += (summary as any).retiredCount || 0;

    // Track total completed & Genre ROI
    let worldCompletedCount = 0;
    
    const allStudios = [
        { id: 'PLAYER', projects: Object.values(state.studio.internal.projects), cash: state.finance.cash, name: state.studio.name },
        ...rivals.map(r => ({ id: r.id, projects: Object.values(r.projects || {}), cash: r.cash, name: r.name }))
    ];

    allStudios.forEach(studio => {
        studio.projects.forEach(p => {
            const isFinished = ['released', 'archived', 'post_release'].includes(p.state);
            if (isFinished) worldCompletedCount++;

            // ROI Tracking
            if (p.budget > 0 && (p.revenue > 0 || isFinished)) {
                const genre = p.genre || 'Unknown';
                if (!this.genreStats[genre]) this.genreStats[genre] = { cost: 0, revenue: 0 };
                this.genreStats[genre].cost += p.budget;
                this.genreStats[genre].revenue += p.revenue;

                if (p.format === 'tv') {
                  if (!this.tvGenreStats[genre]) this.tvGenreStats[genre] = { cost: 0, revenue: 0 };
                  this.tvGenreStats[genre].cost += p.budget;
                  this.tvGenreStats[genre].revenue += p.revenue;
                }
            }
        });
    });

    // Track TV Awards dominance
    const tvAwardEvents = (summary.newsEvents || []).filter(e => e.type === 'AWARD' && e.headline.includes('Best'));
    this.totalTvAwards += tvAwardEvents.length;

    // Find Industry Leader (Highest Cash)
    const leader = allStudios.sort((a, b) => b.cash - a.cash)[0];

    // Find Top Genre ROI
    let topGenre = 'None';
    let maxROI = 0;
    Object.entries(this.genreStats).forEach(([genre, stats]) => {
        const roi = stats.cost > 0 ? (stats.revenue / stats.cost) : 0;
        if (roi > maxROI) {
            maxROI = roi;
            topGenre = genre;
        }
    });

    // Find Top TV Genre ROI
    let topTvGenre = 'None';
    let maxTvROI = 0;
    Object.entries(this.tvGenreStats).forEach(([genre, stats]) => {
        const roi = stats.cost > 0 ? (stats.revenue / stats.cost) : 0;
        if (roi > maxTvROI) {
            maxTvROI = roi;
            topTvGenre = genre;
        }
    });

    // Total industry cash (for market share)
    const totalAssets = state.finance.cash + rivalTotalCash + platformTotalCash;
    const marketShare = totalAssets > 0 ? (state.finance.cash / totalAssets) * 100 : 0;

    // totalSystemCash = player + rivals + platforms + (active budgets estimate)
    const activeBudgets = Object.values(state.studio.internal.projects)
      .filter(p => !['released', 'archived', 'post_release'].includes(p.state))
      .reduce((sum, p) => sum + (p.budget || 0), 0);

    const metrics: SimulationMetrics = {
      week: state.week,
      playerCash: state.finance.cash,
      rivalAvgCash: rivals.length > 0 ? rivalTotalCash / rivals.length : 0,
      totalSystemCash: totalAssets + activeBudgets,
      totalMarketSentiment: state.finance.marketState?.sentiment || 50,
      talentPoolSize: Object.keys(state.industry.talentPool).length,
      avgTalentPrestige: Object.values(state.industry.talentPool).reduce((sum, t) => sum + t.prestige, 0) / (Object.keys(state.industry.talentPool).length || 1),
      activeProjects: Object.values(state.studio.internal.projects).filter(p => !['released', 'archived', 'post_release'].includes(p.state)).length,
      completedProjects: worldCompletedCount,
      retiredCount: this.totalRetired,
      bankruptcyCount: rivals.filter(r => r.cash <= -50000000).length,
      marketShare: marketShare,
      industryLeader: leader?.name,
      topGenreROI: { genre: topGenre, roi: maxROI },
      tvAwardsWon: this.totalTvAwards,
      tvGenreROI: { genre: topTvGenre, roi: maxTvROI },
      averageA_ListCount: Object.values(state.industry.talentPool).filter(t => t.prestige >= 80).length,
      totalBailoutCash: this.totalBailoutCash
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

    const format = (n: number) => {
      if (Math.abs(n) > 1000000000) return (n / 1000000000).toFixed(2) + 'B';
      return (n / 1000000).toFixed(1) + 'M';
    };

    return `
--- SIMULATION REPORT (Week ${last.week}) ---
Player Cash: ${format(initial.playerCash)} -> ${format(last.playerCash)}
Rival Avg Cash: ${format(last.rivalAvgCash)}
Total System Cash: ${format(last.totalSystemCash)}
Industry Leader: ${last.industryLeader || 'None'}
Talent Pool Size: ${last.talentPoolSize} (Avg Prestige: ${last.avgTalentPrestige.toFixed(1)})
Top Genre ROI: ${last.topGenreROI?.genre} (${last.topGenreROI?.roi.toFixed(2)}x)
Total Bankruptcies: ${last.bankruptcyCount}
World Releases: ${last.completedProjects}
Player Active Projects: ${last.activeProjects}
Total Retirements: ${last.retiredCount}
Player Market Share: ${last.marketShare.toFixed(2)}%
TV Awards Won: ${last.tvAwardsWon}
Top TV Genre ROI: ${last.tvGenreROI?.genre} (${last.tvGenreROI?.roi.toFixed(2)}x)
A-List Count: ${last.averageA_ListCount}
Total Bailout Cash (Artifical): ${format(last.totalBailoutCash)}
------------------------------------------
    `;
  }
}
