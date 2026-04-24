import { SimulationRunner } from '../src/engine/simulation/SimulationRunner.js';
import { getMarketHeat, getMarketRegime, getActiveShock, getBudgetInflation } from '../src/engine/systems/industry/MacroCycle.js';
import { antitrustEventLog, resetAntitrustState } from '../src/engine/systems/industry/Antitrust.js';
import { distressEventLog, resetDistressState } from '../src/engine/systems/industry/DistressCascade.js';
import { shingleEventLog, resetShingleState } from '../src/engine/systems/deals/ShingleSystem.js';
import { pitchOutcomeLog, resetPitchState } from '../src/engine/systems/deals/ShinglePitchRouter.js';
import { consolidationEventLog, resetConsolidationState } from '../src/engine/systems/industry/ConsolidationEngine.js';

resetAntitrustState();
resetDistressState();
resetShingleState();
resetPitchState();
resetConsolidationState();

// Run a 50-year simulation (2600 weeks)
const weeks = 2600;
const seed = 42;
const archetype = 'major';
const persona = 'balanced';
const autoPilot = true;

console.log(`Running ${weeks} week (50-year) headless simulation...`);
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
// Decade breakdown
console.log('\n--- DECADE BREAKDOWN ---');
const byDecade: Record<number, { releases: number; franchises: number; bankruptcies: number; heat: number; shocks: Set<string> }> = {};
for (let d = 0; d < 5; d++) byDecade[d] = { releases: 0, franchises: 0, bankruptcies: 0, heat: 0, shocks: new Set() };

releasedProjects.forEach(p => {
  const w = p.releaseWeek || 0;
  const d = Math.min(4, Math.floor(w / 520));
  byDecade[d].releases++;
});
franchises.forEach(f => {
  const w = f.creationWeek || 0;
  const d = Math.min(4, Math.floor(w / 520));
  byDecade[d].franchises++;
});

// Sample heat + shocks per decade (mid-decade)
for (let d = 0; d < 5; d++) {
  const midWeek = d * 520 + 260;
  byDecade[d].heat = getMarketHeat(midWeek);
  // collect all shocks in the decade
  for (let w = d * 520; w < (d + 1) * 520; w += 10) {
    const s = getActiveShock(w);
    if (s) byDecade[d].shocks.add(s);
  }
}

for (let d = 0; d < 5; d++) {
  const simYearStart = 1975 + d * 10;
  console.log(`Decade ${simYearStart}-${simYearStart + 9}: releases=${byDecade[d].releases}, franchises_born=${byDecade[d].franchises}, heat~${byDecade[d].heat.toFixed(2)}, inflation=${getBudgetInflation(d * 520 + 260).toFixed(2)}x${byDecade[d].shocks.size ? ', shocks: [' + Array.from(byDecade[d].shocks).join('; ') + ']' : ''}`);
}

console.log('\n--- MACRO REGIME AT MILESTONES ---');
[260, 780, 1300, 1820, 2340].forEach((w, i) => {
  console.log(`Year ${(i+1)*5 - 2} (week ${w}): heat=${getMarketHeat(w).toFixed(2)}, regime=${getMarketRegime(w)}${getActiveShock(w) ? ', shock: ' + getActiveShock(w) : ''}`);
});

// Rival-count trajectory per decade (avg of activeStudioCount - 1 = rivals)
console.log('\n--- RIVAL COUNT TRAJECTORY (avg per decade) ---');
for (let d = 0; d < 5; d++) {
  const slice = history.filter(h => h.week >= d * 520 && h.week < (d + 1) * 520);
  if (slice.length === 0) continue;
  const avgRivals = slice.reduce((s, h) => s + (h.activeStudioCount - 1), 0) / slice.length;
  const minR = Math.min(...slice.map(h => h.activeStudioCount - 1));
  const maxR = Math.max(...slice.map(h => h.activeStudioCount - 1));
  console.log(`Decade ${1975 + d * 10}s: avg=${avgRivals.toFixed(1)} rivals, min=${minR}, max=${maxR}`);
}

// New entrants log — classify by rival id prefix in final state
const finalRivals = Object.values(finalState.entities.rivals || {});
const newEntrants = finalRivals.filter(r => /^(indie-|disruptor-|divest-|upstart-studio-)/.test(r.id));
const indies = newEntrants.filter(r => r.id.startsWith('indie-') || r.id.startsWith('upstart-studio-'));
const disruptors = newEntrants.filter(r => r.id.startsWith('disruptor-'));
const divests = newEntrants.filter(r => r.id.startsWith('divest-'));
console.log(`\n--- NEW ENTRANTS (still active at end) ---`);
console.log(`Total: ${newEntrants.length} (indies=${indies.length}, disruptors=${disruptors.length}, divestitures=${divests.length})`);
newEntrants.slice(0, 15).forEach(r => {
  const yr = 1975 + Math.floor((r.foundedWeek || 0) / 52);
  console.log(`  ${yr}: ${r.name} (${r.archetype}, cash $${(r.cash / 1e6).toFixed(0)}M)`);
});

// M&A + hard-bankruptcy counts from newsHistory
const newsHistory = finalState.industry?.newsHistory || [];
const maCount = newsHistory.filter(n => /CONSOLIDATION:|VERTICAL INTEGRATION:/.test(n.headline)).length;
const hardBankrupt = newsHistory.filter(n => /INSOLVENCY:/.test(n.headline)).length;
console.log(`\n--- M&A + HARD-BANKRUPTCY COUNTS (from retained news, capped) ---`);
console.log(`M&A events (in retained news window): ${maCount}`);
console.log(`Hard bankruptcies (in retained news window): ${hardBankrupt}`);

console.log('\n--- CONSOLIDATION ENGINE EVENT LOG ---');
const regularMA = consolidationEventLog.filter(e => e.motive === 'strategic').length;
const distressedMAviaConsol = consolidationEventLog.filter(e => e.motive === 'distressed').length;
const platformMA = consolidationEventLog.filter(e => e.motive === 'platform').length;
const distressedMAviaCascade = distressEventLog.filter(e => e.kind === 'distressed-ma').length;
console.log(`Regular (strategic) M&A: ${regularMA}`);
console.log(`Distressed M&A (ConsolidationEngine): ${distressedMAviaConsol}`);
console.log(`Distressed M&A (DistressCascade stage 3): ${distressedMAviaCascade}`);
console.log(`Total distressed M&A: ${distressedMAviaConsol + distressedMAviaCascade}`);
console.log(`Platform acquisitions: ${platformMA}`);
consolidationEventLog.forEach(e => {
  console.log(`  ${e.year} (w${e.week}) ${e.motive.toUpperCase()}: ${e.acquirerName} -> ${e.targetName} $${(e.cost / 1e6).toFixed(0)}M`);
});

console.log('\n--- ANTITRUST EVENT LOG ---');
if (antitrustEventLog.length === 0) {
  console.log('(no antitrust events triggered)');
} else {
  antitrustEventLog.forEach(e => {
    console.log(`  ${e.year} (w${e.week}): ${e.kind} vs ${e.dominantName} — top1=${(e.topShare * 100).toFixed(1)}%, top3=${(e.top3Share * 100).toFixed(1)}% (${e.note})`);
  });
}

console.log('\n--- DISTRESS CASCADE EVENT LOG ---');
if (distressEventLog.length === 0) {
  console.log('(no distress events triggered)');
} else {
  const byKind: Record<string, number> = {};
  distressEventLog.forEach(e => { byKind[e.kind] = (byKind[e.kind] || 0) + 1; });
  console.log(`Totals: ${Object.entries(byKind).map(([k, v]) => `${k}=${v}`).join(', ')}`);
  distressEventLog.forEach(e => {
    const amt = e.amount ? ` $${(e.amount / 1e6).toFixed(0)}M` : '';
    const cp = e.counterpartyName ? ` -> ${e.counterpartyName}` : '';
    console.log(`  ${e.year} (w${e.week}) stage${e.stage} ${e.kind}: ${e.studioName}${cp}${amt} — ${e.note}`);
  });
}

console.log('\n--- DISTRESS CASCADE PER-DECADE ---');
for (let d = 0; d < 5; d++) {
  const slice = distressEventLog.filter(e => e.week >= d * 520 && e.week < (d + 1) * 520);
  const s1 = slice.filter(e => e.stage === 1).length;
  const s2 = slice.filter(e => e.stage === 2).length;
  const s3 = slice.filter(e => e.stage === 3).length;
  const s4 = slice.filter(e => e.stage === 4).length;
  console.log(`Decade ${1975 + d * 10}s: ip-sales=${s1}, liquidations=${s2}, distressed-M&A=${s3}, bankruptcies=${s4}`);
}

console.log('\n--- FINAL RIVAL CASH DISTRIBUTION ---');
const cashBuckets = { deeplyNegative: 0, negative: 0, thin: 0, healthy: 0, rich: 0 };
rivals.forEach(r => {
  if (r.cash < -300_000_000) cashBuckets.deeplyNegative++;
  else if (r.cash < 0) cashBuckets.negative++;
  else if (r.cash < 250_000_000) cashBuckets.thin++;
  else if (r.cash < 2_000_000_000) cashBuckets.healthy++;
  else cashBuckets.rich++;
});
console.log(`  < -$300M (lingering): ${cashBuckets.deeplyNegative}`);
console.log(`  -$300M..0 (stressed): ${cashBuckets.negative}`);
console.log(`  $0..$250M (thin): ${cashBuckets.thin}`);
console.log(`  $250M..$2B (healthy): ${cashBuckets.healthy}`);
console.log(`  > $2B (dominant): ${cashBuckets.rich}`);

console.log('\n--- TV SHOWRUNNER OVERALL DEALS ---');
const tvFormations = shingleEventLog.filter(e => e.kind === 'formed' && (e as any).medium === 'TV');
const filmFormations = shingleEventLog.filter(e => e.kind === 'formed' && (e as any).medium !== 'TV');
console.log(`Total TV showrunner deals formed: ${tvFormations.length}`);
console.log(`Total film shingles formed: ${filmFormations.length}`);
tvFormations.forEach(e => {
  const overhead = e.overheadPerYear ? ` $${(e.overheadPerYear / 1e6).toFixed(1)}M/yr` : '';
  const term = e.termYears ? ` ${e.termYears}yr` : '';
  console.log(`  ${e.year} (w${e.week}) TV-${e.dealType}: ${e.ownerName}'s ${e.shingleName} @ ${e.studioName}${overhead}${term}`);
});

console.log('\n--- SHINGLE FORMATION LOG ---');
if (shingleEventLog.length === 0) {
  console.log('(no shingles formed)');
} else {
  shingleEventLog.forEach(e => {
    const overhead = e.overheadPerYear ? ` $${(e.overheadPerYear / 1e6).toFixed(1)}M/yr` : '';
    const term = e.termYears ? ` ${e.termYears}yr` : '';
    const studio = e.studioName ? ` @ ${e.studioName}` : '';
    const extra = e.note ? ` (${e.note})` : '';
    console.log(`  ${e.year} (w${e.week}) ${e.kind.toUpperCase()}: ${e.ownerName}'s ${e.shingleName}${studio} ${e.dealType || ''}${overhead}${term}${extra}`);
  });
}

console.log('\n--- SHINGLE PER-DECADE COUNTS ---');
for (let d = 0; d < 5; d++) {
  const lo = d * 520;
  const hi = (d + 1) * 520;
  // Active shingles at end of decade: spawned before hi and not dissolved/expired-orphan before hi
  const active = Object.values(finalState.entities.shingles || {});
  // formations and churns during decade
  const formed = shingleEventLog.filter(e => e.kind === 'formed' && e.week >= lo && e.week < hi).length;
  const churned = shingleEventLog.filter(e => e.kind === 'churned' && e.week >= lo && e.week < hi).length;
  const renewed = shingleEventLog.filter(e => e.kind === 'renewed' && e.week >= lo && e.week < hi).length;
  const cancelled = shingleEventLog.filter(e => e.kind === 'cancelled' && e.week >= lo && e.week < hi).length;
  const expired = shingleEventLog.filter(e => e.kind === 'expired' && e.week >= lo && e.week < hi).length;
  console.log(`Decade ${1975 + d * 10}s: formed=${formed}, renewed=${renewed}, churned=${churned}, cancelled=${cancelled}, expired=${expired}`);
}

const finalShingles = Object.values(finalState.entities.shingles || {});
const byDealType = { FIRST_LOOK: 0, OVERALL: 0, HOUSEKEEPING: 0, POD: 0 } as any;
finalShingles.forEach(s => { byDealType[s.dealType] = (byDealType[s.dealType] || 0) + 1; });
console.log(`\n--- FINAL ACTIVE SHINGLES: ${finalShingles.length} ---`);
console.log(`  FIRST_LOOK=${byDealType.FIRST_LOOK}, OVERALL=${byDealType.OVERALL}, HOUSEKEEPING=${byDealType.HOUSEKEEPING}, POD=${byDealType.POD}`);

const totalOverhead = shingleEventLog
  .filter(e => e.kind === 'formed' || e.kind === 'renewed' || e.kind === 'churned')
  .reduce((s, e) => s + (e.overheadPerYear || 0) * (e.termYears || 1), 0);
console.log(`\nTotal overhead contracted (sum of overhead x term across formations/renewals): $${(totalOverhead / 1e6).toFixed(0)}M`);

console.log(`\nTotal pitches generated: ${pitchOutcomeLog.length}`);
const accepted = pitchOutcomeLog.filter(p => p.accepted).length;
const passthroughs = pitchOutcomeLog.filter(p => p.note && p.note.startsWith('pass-through')).length;
const passed = pitchOutcomeLog.filter(p => p.passed).length;
console.log(`  accepted=${accepted}, pass-throughs (first-look rejected, picked up by rival)=${passthroughs}, fully-passed=${passed}`);

console.log('\n--- SIMULATION COMPLETE ---');
