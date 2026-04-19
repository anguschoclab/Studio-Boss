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
  avgNielsenKeyDemo: number;
  cutCounts: Record<string, number>;
  activeStudioCount: number;
  consolidationCount: number;
}

export class MetricsCollector {
  private history: SimulationMetrics[] = [];
  private totalRetired = 0;
  private totalBailoutCash = 0;
  private genreStats: Record<string, { cost: number; revenue: number }> = {};
  private tvGenreStats: Record<string, { cost: number; revenue: number }> = {};
  private totalTvAwards = 0;
  
  public record(state: GameState, summary: WeekSummary): void {
    const rivalsList = Object.values(state.entities.rivals || {});
    const platforms = state.market.buyers.filter(b => b.archetype === 'streamer') as any[];
    
    // Total bails tracking (Phase 2 hardening)
    const currentBailouts = (summary as any).totalBailouts || 0;
    this.totalBailoutCash += currentBailouts;
    
    const rivalTotalCash = rivalsList.reduce((sum, r) => sum + (Number(r.cash) || 0), 0);
    const platformTotalCash = platforms.reduce((sum, p) => sum + (Number(p.cash) || 0), 0);
    const playerCash = Number(state.finance.cash) || 0;
    
    // Increment total retirements
    this.totalRetired += (summary as any).retiredCount || 0;

    // Track total completed & Genre ROI
    let worldCompletedCount = 0;
    
    // Performance Optimization: Unified metrics loop
    let activeBudgets = 0;
    let playerActiveProjectsCount = 0;
    let totalNielsenDemo = 0;
    let tvProjectCount = 0;
    const cutCounts: Record<string, number> = { 'theatrical': 0, 'directors_cut': 0, 'sanitized': 0, 'unrated': 0 };

    const allStudios = [
        { id: 'PLAYER', projects: Object.values(state.entities.projects), cash: Number(state.finance.cash) || 0, name: state.studio.name },
        ...rivalsList.map(r => ({ id: r.id, projects: Object.values(r.projects || {}), cash: Number(r.cash) || 0, name: r.name }))
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

                const formatMatch = (p.format || '').toLowerCase();
                if (formatMatch === 'tv' || formatMatch === 'series') {
                  if (!this.tvGenreStats[genre]) this.tvGenreStats[genre] = { cost: 0, revenue: 0 };
                  this.tvGenreStats[genre].cost += p.budget;
                  this.tvGenreStats[genre].revenue += p.revenue;
                }
            }

            // Player-specific metrics
            if (studio.id === 'PLAYER' && !isFinished) {
              activeBudgets += (p.budget || 0);
              playerActiveProjectsCount++;
            }

            // Nielsen & Cut Analytics
            const formatMatch = (p.format || '').toLowerCase();
            const nProfile = (p as any).nielsenProfile;
            if ((formatMatch === 'tv' || formatMatch === 'series') && nProfile) {
                totalNielsenDemo += Number(nProfile.seasonAvgKeyDemo) || 0;
                tvProjectCount++;
            }
            if (p.activeCut) {
                cutCounts[p.activeCut] = (cutCounts[p.activeCut] || 0) + 1;
            }
        });
    });

    // Track TV Awards dominance
    const tvAwardEvents = (summary.newsEvents || []).filter(e => e.type === 'AWARD' && e.headline.includes('Best'));
    this.totalTvAwards += tvAwardEvents.length;

    // Find Industry Leader (Highest Cash)
    const leader = [...allStudios].sort((a, b) => b.cash - a.cash)[0];

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
    const totalAssets = playerCash + rivalTotalCash + platformTotalCash;
    const marketShare = totalAssets > 0 ? (playerCash / totalAssets) * 100 : 0;

    // 10. Talent Pool Analysis (Optimized single-pass)
    let totalPrestige = 0;
    let aListCount = 0;
    const talentValues = Object.values(state.entities.talents || {});
    const talentPoolSize = talentValues.length;
    
    talentValues.forEach(t => {
        totalPrestige += t.prestige || 0;
        if (t.prestige >= 80) aListCount++;
    });

    const metrics: SimulationMetrics = {
      week: state.week,
      playerCash: playerCash,
      rivalAvgCash: rivalsList.length > 0 ? rivalTotalCash / rivalsList.length : 0,
      totalSystemCash: totalAssets + activeBudgets,
      totalMarketSentiment: state.finance.marketState?.sentiment || 50,
      talentPoolSize: talentPoolSize,
      avgTalentPrestige: totalPrestige / (talentPoolSize || 1),
      activeProjects: playerActiveProjectsCount,
      completedProjects: worldCompletedCount,
      retiredCount: this.totalRetired,
      bankruptcyCount: rivalsList.filter(r => (Number(r.cash) || 0) <= -50000000).length,
      marketShare: marketShare,
      industryLeader: leader?.name,
      topGenreROI: { genre: topGenre, roi: maxROI },
      tvAwardsWon: this.totalTvAwards,
      tvGenreROI: { genre: topTvGenre, roi: maxTvROI },
      averageA_ListCount: aListCount,
      totalBailoutCash: this.totalBailoutCash,
      avgNielsenKeyDemo: tvProjectCount > 0 ? totalNielsenDemo / tvProjectCount : 0,
      cutCounts: cutCounts,
      activeStudioCount: rivalsList.length + 1,
      consolidationCount: 11 - (rivalsList.length + 1)
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
Active Studios: ${last.activeStudioCount} / 11 (Mergers: ${last.consolidationCount})
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
Avg TV Rating (18-49): ${last.avgNielsenKeyDemo.toFixed(2)}
Cut Variety: Theatrical (${last.cutCounts['theatrical']}), DirCut (${last.cutCounts['directors_cut']}), Sanitized (${last.cutCounts['sanitized']})
Total Bailout Cash (Artifical): ${format(last.totalBailoutCash)}
------------------------------------------
    `;
  }
}
