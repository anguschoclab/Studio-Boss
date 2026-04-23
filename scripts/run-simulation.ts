import { SimulationRunner } from '../src/engine/simulation/SimulationRunner';

// Run a 10-year simulation (520 weeks)
const weeks = 520;
const seed = 42;
const archetype = 'major';
const persona = 'balanced';
const autoPilot = true;

console.log(`Running ${weeks} week (10-year) headless simulation...`);
console.log(`Seed: ${seed}, Archetype: ${archetype}, Auto-pilot: ${autoPilot}\n`);

let projectsCreated = 0;
let projectsReleased = 0;
let maEvents = 0;

const result = SimulationRunner.run(weeks, seed, archetype, persona, autoPilot);

console.log('Simulation complete!');
console.log('\n' + result.metrics.getSummaryReport());

// Additional analysis
const history = result.metrics.getHistory();
const finalState = result.finalState;

// Debug: Check player projects in final state
const finalPlayerProjects = Object.values(finalState.entities.projects).filter(p => p.ownerId === 'PLAYER');
console.log(`\n[DEBUG] Final player projects count: ${finalPlayerProjects.length}`);
finalPlayerProjects.forEach(p => {
  console.log(`  - ${p.title}: state=${p.state}, weeksInPhase=${p.weeksInPhase}, productionWeeks=${p.productionWeeks}`);
});

// Analyze M&A activity
const initialStudios = 11; // PLAYER + 10 rivals
const finalStudios = history[history.length - 1].activeStudioCount;
const mergers = initialStudios - finalStudios;

// Analyze franchises
const franchises = Object.values(finalState.ip?.franchises || {});
const franchisesCreated = franchises.length;

// Analyze bankruptcies
const bankruptcies = history[history.length - 1].bankruptcyCount;

// Analyze rival performance
const rivals = Object.values(finalState.entities.rivals || {});
const rivalPerformance = rivals.map(r => ({
  name: r.name,
  cash: r.cash,
  prestige: r.prestige,
  isAcquirable: r.isAcquirable,
  archetype: r.archetype
})).sort((a, b) => b.cash - a.cash);

// Analyze projects
const allProjects = Object.values(finalState.entities.projects || {});
const playerProjects = allProjects.filter(p => p.ownerId === 'PLAYER');
const releasedProjects = allProjects.filter(p => p.state === 'released' || p.state === 'archived');
const successfulProjects = releasedProjects.filter(p => p.revenue > p.budget);

console.log('\n--- DETAILED ANALYSIS ---');
console.log(`M&A Activity: ${mergers} studios consolidated (from ${initialStudios} to ${finalStudios})`);
console.log(`Franchises Created: ${franchisesCreated} total franchises in system`);
console.log(`Studios Failed/Bankrupt: ${bankruptcies} studios in critical financial state`);
console.log(`Total Projects Released: ${releasedProjects.length}`);
console.log(`Successful Projects (ROI > 1.0): ${successfulProjects.length} (${((successfulProjects.length / releasedProjects.length) * 100).toFixed(1)}% success rate)`);
console.log(`Player Projects: ${playerProjects.length} total`);

console.log('\n--- RIVAL PERFORMANCE RANKING ---');
rivalPerformance.forEach((r, i) => {
  console.log(`${i + 1}. ${r.name} - Cash: $${(r.cash / 1000000).toFixed(1)}M, Prestige: ${r.prestige.toFixed(0)}, Archetype: ${r.archetype}${r.isAcquirable ? ' (ACQUIRABLE)' : ''}`);
});

// Analyze market trends
const marketTrends = finalState.market?.trends || [];
console.log('\n--- MARKET TRENDS ---');
marketTrends.forEach(t => {
  console.log(`${t.genre}: Heat ${t.heat.toFixed(0)}%`);
});

// Analyze talent pool
const talents = Object.values(finalState.entities.talents || {});
const aListCount = talents.filter(t => t.prestige >= 80).length;
console.log('\n--- TALENT POOL ---');
console.log(`Total Talents: ${talents.length}`);
console.log(`A-List Talents (80+ Prestige): ${aListCount}`);
console.log(`Avg Prestige: ${(talents.reduce((sum, t) => sum + t.prestige, 0) / talents.length).toFixed(1)}`);

// Analyze news events over time
const newsEvents = history.flatMap(h => []);
console.log('\n--- SIMULATION COMPLETE ---');
