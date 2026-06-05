1. **Optimize `MetricsCollector.ts`**: Replace `Object.values()` arrays (like `Object.values(state.entities.projects)` and `Object.values(state.entities.talents || {})`) coupled with `.filter()` or `.reduce()` loops with direct `for...in` loops to prevent array allocation garbage collection spikes. Specifically, use the following replacements:

```
<<<<<<< SEARCH
    const playerProjectsList = Object.values(state.entities.projects).filter(p => isPlayerOwner(state, p.ownerId));
    const allStudios = [
        { id: state.studio.id, projects: playerProjectsList, cash: Number(state.finance.cash) || 0, name: state.studio.name },
        ...rivalsList.map(r => ({ id: r.id, projects: Object.values(r.projects || {}), cash: Number(r.cash) || 0, name: r.name }))
    ];
=======
    const playerProjectsList: import('@/engine/types').Project[] = [];
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
    }
>>>>>>> REPLACE
```

```
<<<<<<< SEARCH
    // 10. Talent Pool Analysis (Optimized single-pass)
    let totalPrestige = 0;
    let aListCount = 0;
    const talentValues = Object.values(state.entities.talents || {});
    const talentPoolSize = talentValues.length;

    talentValues.forEach(t => {
        totalPrestige += t.prestige || 0;
        if (t.prestige >= 80) aListCount++;
    });
=======
    // 10. Talent Pool Analysis (Optimized single-pass)
    let totalPrestige = 0;
    let aListCount = 0;
    let talentPoolSize = 0;

    for (const tid in state.entities.talents || {}) {
        const t = state.entities.talents[tid];
        talentPoolSize++;
        totalPrestige += t.prestige || 0;
        if (t.prestige >= 80) aListCount++;
    }
>>>>>>> REPLACE
```

```
<<<<<<< SEARCH
  public record(state: GameState, summary: WeekSummary): void {
    const rivalsList = Object.values(state.entities.rivals || {});
    const platforms = state.market.buyers.filter(b => b.archetype === 'streamer') as import('@/engine/types').StreamerPlatform[];

    // Total bails tracking (Phase 2 hardening)
    const currentBailouts = summary.totalBailouts || 0;
    this.totalBailoutCash += currentBailouts;

    const rivalTotalCash = rivalsList.reduce((sum, r) => sum + (Number(r.cash) || 0), 0);
=======
  public record(state: GameState, summary: WeekSummary): void {
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
    }
>>>>>>> REPLACE
```

```
<<<<<<< SEARCH
    const metrics: SimulationMetrics = {
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
    };
=======
    const metrics: SimulationMetrics = {
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
    };
>>>>>>> REPLACE
```

2. **Optimize `SimulationHarness.ts`**: Replace `Object.values(state.entities.rivals || {})` and `Object.values(state.entities.talents || {})` coupled with `.reduce()` or `.filter()` logic with direct `for...in` loops to avoid array allocations during test loops. Use the following replacements:

```
<<<<<<< SEARCH
        const rivalsList = Object.values(state.entities.rivals || {});

        // Collect Snapshot Metrics
        const totalRivalCash = rivalsList.reduce((sum, r) => sum + r.cash, 0);
        const totalIndustryCash = totalRivalCash + state.finance.cash;
        const totalProjects = Object.keys(state.entities.projects).length +
          rivalsList.reduce((sum, r) => sum + r.projectIds.length, 0);

        // Calculate Market Share Concentration (HHI - Herfindahl-Hirschman Index)
        const marketShares = rivalsList.map(r => r.marketShare || 0);
        const hhi = marketShares.reduce((sum, ms) => sum + (ms * 100) ** 2, 0);

        // Talent Burnout Audit
        const talentPool = Object.values(state.entities.talents || {});
        const burntOutCount = talentPool.filter(t => t.fatigue > 80).length;
        const burnoutRate = talentPool.length > 0 ? burntOutCount / talentPool.length : 0;

        metrics.push({
          totalIndustryCash,
          avgRivalCash: rivalsList.length > 0 ? totalRivalCash / rivalsList.length : 0,
          totalActiveProjects: totalProjects,
          marketShareConcentration: hhi,
          talentBurnoutRate: burnoutRate
        });
=======
        let totalRivalCash = 0;
        let rivalProjectsCount = 0;
        let hhi = 0;
        let rivalsCount = 0;
        for (const rid in state.entities.rivals || {}) {
            const r = state.entities.rivals[rid];
            totalRivalCash += r.cash || 0;
            rivalProjectsCount += (r.projectIds || []).length;
            const ms = r.marketShare || 0;
            hhi += (ms * 100) ** 2;
            rivalsCount++;
        }

        // Collect Snapshot Metrics
        const totalIndustryCash = totalRivalCash + state.finance.cash;
        const totalProjects = Object.keys(state.entities.projects).length + rivalProjectsCount;

        // Talent Burnout Audit
        let talentPoolCount = 0;
        let burntOutCount = 0;
        for (const tid in state.entities.talents || {}) {
            const t = state.entities.talents[tid];
            talentPoolCount++;
            if (t.fatigue > 80) burntOutCount++;
        }
        const burnoutRate = talentPoolCount > 0 ? burntOutCount / talentPoolCount : 0;

        metrics.push({
          totalIndustryCash,
          avgRivalCash: rivalsCount > 0 ? totalRivalCash / rivalsCount : 0,
          totalActiveProjects: totalProjects,
          marketShareConcentration: hhi,
          talentBurnoutRate: burnoutRate
        });
>>>>>>> REPLACE
```

```
<<<<<<< SEARCH
        if (w % 52 === 0) {
            const avgRivalCash = rivalsList.length > 0 ? totalRivalCash / rivalsList.length : 0;
            console.log(`📍 Week ${w} Milestone: Industry Cash $${(totalIndustryCash / 1e9).toFixed(2)}B | Avg Rival Cash $${(avgRivalCash / 1e6).toFixed(1)}M`);
        }
=======
        if (w % 52 === 0) {
            const avgRivalCash = rivalsCount > 0 ? totalRivalCash / rivalsCount : 0;
            console.log(`📍 Week ${w} Milestone: Industry Cash $${(totalIndustryCash / 1e9).toFixed(2)}B | Avg Rival Cash $${(avgRivalCash / 1e6).toFixed(1)}M`);
        }
>>>>>>> REPLACE
```

3. **Log learning in `.jules/bolt.md`**: Note the performance benefits of iterating directly with `for...in` instead of array methods (`Object.values`, `reduce`, `filter`) over state entities during high-frequency simulation runs to reduce O(N) allocation overhead. Append the following text:

```markdown
## 2026-05-28 - Replace Object.values arrays with for...in loops in MetricsCollector and SimulationHarness
**Learning:** High-frequency metrics and snapshot reporting loops (like `MetricsCollector.record` and `SimulationHarness.run`) cause significant garbage collection pressure when calling `Object.values()` coupled with array methods (`filter`, `reduce`, `map`) to iterate over GameState entities, creating intermediate O(N) array allocation overhead per tick.
**Action:** Replace `Object.values` chained functions with direct `for...in` loops to iterate over state entities (`rivals`, `talents`, `projects`) efficiently without creating intermediate arrays, reducing time complexity and eliminating GC pressure.
```

4. **Verify Edits**: Use `cat` to visually confirm that the edits to `src/engine/simulation/MetricsCollector.ts`, `src/engine/simulation/SimulationHarness.ts`, and `.jules/bolt.md` were written successfully.
5. **Test the Changes**: Run the standard tests `pnpm run test` and `pnpm run lint` (if any lint issues arise from the global setup they will be evaluated).
6. **Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.**
7. **Submit PR**: Format PR title and body according to Bolt's requirements (💡 What, 🎯 Why, 📊 Impact, 🔬 Measurement).
