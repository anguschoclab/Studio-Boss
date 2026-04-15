import { RevenueProcessor } from '../systems/finance/RevenueProcessor';
import { GameState, Project, Contract, Talent } from '../types';

/**
 * Economic Audit Script: Verifies that player-contracted talent on rival projects
 * generates backend point royalties for the player studio.
 */
function runAudit() {
  console.log("🔍 Starting Economic Audit: Backend Royalties...");

  // 1. Mock Talent
  const mockTalent: Talent = {
    id: "star-1",
    name: "Mega Star",
    roles: ["actor"],
    tier: 1,
    prestige: 90,
    draw: 90,
    fee: 10000000,
    fatigue: 0,
    demographics: { gender: 'MALE', ethnicity: 'Caucasian', country: 'USA', age: 35 },
    psychology: { ego: 50, greed: 50, loyalty: 50, riskAppetite: 50 },
    contractId: "pact-1"
  } as any;

  // 2. Mock Rival Project
  const mockRivalProject: Project = {
    id: "rival-film-1",
    title: "Rival Blockbuster",
    type: "FILM",
    state: "released",
    weeklyRevenue: 1000000, // $1M weekly gross
    budget: 50000000,
    revenue: 0,
    accumulatedCost: 0,
    weeksInPhase: 1,
    developmentWeeks: 0,
    productionWeeks: 0,
    progress: 100,
    buzz: 80,
    momentum: 80
  } as any;

  // 3. Mock Player Contract on that Rival Project
  const mockPlayerContract: Contract = {
    id: "pact-1",
    talentId: "star-1",
    studioId: "player-studio",
    projectId: "rival-film-1", // Player star is on a RIVAL project
    backendPercent: 10,        // 10% backend points to player!
    status: "active"
  } as any;

  // 4. Mock Game State
  const mockState: GameState = {
    industry: {
       rivals: [
         {
           id: "rival-studio-1",
           name: "Rival Pictures",
           projects: { "rival-film-1": mockRivalProject },
           cash: 100000000,
           contracts: [] // Rival doesn't "own" the talent contract in this test
         }
       ],
       talentPool: { "star-1": mockTalent }
    },
    market: { buyers: [] },
    finance: { cash: 0, ledger: [], weeklyHistory: [], marketState: {} },
    ip: { franchises: {} }
  } as any;

  // 5. Execute Audit
  const result = RevenueProcessor.calculateActiveRevenue(
    [], // Player has no active projects
    mockState,
    [mockPlayerContract],
    [],
    "player-studio"
  );

  console.log(`📊 Audit Results:`);
  console.log(`Player Backend %: ${mockPlayerContract.backendPercent}%`);
  console.log(`Calculated Distribution Revenue: $${result.distribution.toLocaleString()}`);

  const expectedRoyalty = 100000; // 10% of $1M
  if (result.distribution === expectedRoyalty) {
  } else {
    console.error(`❌ FAILURE: Expected $${expectedRoyalty.toLocaleString()}, but got $${result.distribution.toLocaleString()}`);
  }
}

runAudit();
