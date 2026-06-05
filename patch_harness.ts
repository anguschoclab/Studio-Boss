import * as fs from 'fs';

let content = fs.readFileSync('src/engine/simulation/SimulationHarness.ts', 'utf8');

content = content.replace(
`        const rivalsList = Object.values(state.entities.rivals || {});

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
        });`,
`        let totalRivalCash = 0;
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
        });`
);

content = content.replace(
`        if (w % 52 === 0) {
            const avgRivalCash = rivalsList.length > 0 ? totalRivalCash / rivalsList.length : 0;
            console.log(\`📍 Week \${w} Milestone: Industry Cash $\${(totalIndustryCash / 1e9).toFixed(2)}B | Avg Rival Cash $\${(avgRivalCash / 1e6).toFixed(1)}M\`);
        }`,
`        if (w % 52 === 0) {
            const avgRivalCash = rivalsCount > 0 ? totalRivalCash / rivalsCount : 0;
            console.log(\`📍 Week \${w} Milestone: Industry Cash $\${(totalIndustryCash / 1e9).toFixed(2)}B | Avg Rival Cash $\${(avgRivalCash / 1e6).toFixed(1)}M\`);
        }`
);

fs.writeFileSync('src/engine/simulation/SimulationHarness.ts', content);
console.log("Patched SimulationHarness");
