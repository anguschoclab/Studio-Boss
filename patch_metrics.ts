import * as fs from 'fs';

let content = fs.readFileSync('src/engine/simulation/MetricsCollector.ts', 'utf8');

content = content.replace(
`    const playerProjectsList = Object.values(state.entities.projects).filter(p => isPlayerOwner(state, p.ownerId));
    const allStudios = [
        { id: state.studio.id, projects: playerProjectsList, cash: Number(state.finance.cash) || 0, name: state.studio.name },
        ...rivalsList.map(r => ({ id: r.id, projects: Object.values(r.projects || {}), cash: Number(r.cash) || 0, name: r.name }))
    ];`,
`    const playerProjectsList: import('@/engine/types').Project[] = [];
    for (const pid in state.entities.projects) {
        const p = state.entities.projects[pid];
        if (isPlayerOwner(state, p.ownerId)) playerProjectsList.push(p);
    }
    const allStudios = [
        { id: state.studio.id, projects: playerProjectsList, cash: Number(state.finance.cash) || 0, name: state.studio.name }
    ];
    for (const rid in state.entities.rivals || {}) {
        const r = state.entities.rivals[rid];
        const rProjects: import('@/engine/types').Project[] = [];
        for (const pid in r.projects || {}) {
            rProjects.push(r.projects[pid]);
        }
        allStudios.push({ id: r.id, projects: rProjects, cash: Number(r.cash) || 0, name: r.name });
    }`
);

content = content.replace(
`    // 10. Talent Pool Analysis (Optimized single-pass)
    let totalPrestige = 0;
    let aListCount = 0;
    const talentValues = Object.values(state.entities.talents || {});
    const talentPoolSize = talentValues.length;

    talentValues.forEach(t => {
        totalPrestige += t.prestige || 0;
        if (t.prestige >= 80) aListCount++;
    });`,
`    // 10. Talent Pool Analysis (Optimized single-pass)
    let totalPrestige = 0;
    let aListCount = 0;
    let talentPoolSize = 0;

    for (const tid in state.entities.talents || {}) {
        const t = state.entities.talents[tid];
        talentPoolSize++;
        totalPrestige += t.prestige || 0;
        if (t.prestige >= 80) aListCount++;
    }`
);

content = content.replace(
`  public record(state: GameState, summary: WeekSummary): void {
    const rivalsList = Object.values(state.entities.rivals || {});
    const platforms = state.market.buyers.filter(b => b.archetype === 'streamer') as import('@/engine/types').StreamerPlatform[];

    // Total bails tracking (Phase 2 hardening)
    const currentBailouts = summary.totalBailouts || 0;
    this.totalBailoutCash += currentBailouts;

    const rivalTotalCash = rivalsList.reduce((sum, r) => sum + (Number(r.cash) || 0), 0);`,
`  public record(state: GameState, summary: WeekSummary): void {
    const platforms = state.market.buyers.filter(b => b.archetype === 'streamer') as import('@/engine/types').StreamerPlatform[];

    // Total bails tracking (Phase 2 hardening)
    const currentBailouts = summary.totalBailouts || 0;
    this.totalBailoutCash += currentBailouts;

    let rivalTotalCash = 0;
    let rivalsCount = 0;
    let bankruptCount = 0;
    for (const rid in state.entities.rivals || {}) {
        const r = state.entities.rivals[rid];
        const rCash = Number(r.cash) || 0;
        rivalTotalCash += rCash;
        rivalsCount++;
        if (rCash <= -50000000) bankruptCount++;
    }`
);

content = content.replace(
`    const metrics: SimulationMetrics = {
      week: state.week,
      playerCash: playerCash,
      rivalAvgCash: rivalsList.length > 0 ? rivalTotalCash / rivalsList.length : 0,
      totalSystemCash: totalAssets + activeBudgets,
      totalMarketSentiment: state.finance.marketState?.sentiment || 50,
      talentPoolSize: talentPoolSize,
      avgTalentPrestige: totalPrestige / (talentPoolSize || 1),
      activeProjects: activeProjectsCount,
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
    };`,
`    const metrics: SimulationMetrics = {
      week: state.week,
      playerCash: playerCash,
      rivalAvgCash: rivalsCount > 0 ? rivalTotalCash / rivalsCount : 0,
      totalSystemCash: totalAssets + activeBudgets,
      totalMarketSentiment: state.finance.marketState?.sentiment || 50,
      talentPoolSize: talentPoolSize,
      avgTalentPrestige: totalPrestige / (talentPoolSize || 1),
      activeProjects: activeProjectsCount,
      completedProjects: worldCompletedCount,
      retiredCount: this.totalRetired,
      bankruptcyCount: bankruptCount,
      marketShare: marketShare,
      industryLeader: leader?.name,
      topGenreROI: { genre: topGenre, roi: maxROI },
      tvAwardsWon: this.totalTvAwards,
      tvGenreROI: { genre: topTvGenre, roi: maxTvROI },
      averageA_ListCount: aListCount,
      totalBailoutCash: this.totalBailoutCash,
      avgNielsenKeyDemo: tvProjectCount > 0 ? totalNielsenDemo / tvProjectCount : 0,
      cutCounts: cutCounts,
      activeStudioCount: rivalsCount + 1,
      consolidationCount: 11 - (rivalsCount + 1)
    };`
);

fs.writeFileSync('src/engine/simulation/MetricsCollector.ts', content);
console.log("Patched MetricsCollector");
