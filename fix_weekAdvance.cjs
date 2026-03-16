const fs = require('fs');
let code = fs.readFileSync('src/engine/core/weekAdvance.ts', 'utf8');

const replacement = `import { generateOpportunity } from '../generators/opportunities';
import { GameState, WeekSummary } from '../types';`;

code = code.replace(`import { GameState, WeekSummary } from '../types';`, replacement);

const opportunityReplacement = `  // Manage Opportunities
  const updatedOpportunities = state.opportunities
    .map(opp => ({ ...opp, weeksUntilExpiry: opp.weeksUntilExpiry - 1 }))
    .filter(opp => opp.weeksUntilExpiry > 0);

  // Random events
  const events: string[] = [];
  if (Math.random() < 0.15) {
    events.push(pick(EVENT_POOL));
  }

  // Possibly spawn a new opportunity
  if (Math.random() < 0.2) { // 20% chance per week
    const newOpp = generateOpportunity(state.week, state.studio.prestige);
    updatedOpportunities.push(newOpp);
    events.push(\`A new script "\${newOpp.title}" just hit the market!\`);
  }`;

code = code.replace(`  // Manage Opportunities
  const updatedOpportunities = state.opportunities
    .map(opp => ({ ...opp, expiryWeeks: opp.expiryWeeks - 1 }))
    .filter(opp => opp.expiryWeeks > 0);

  // Random events
  const events: string[] = [];`, opportunityReplacement);

fs.writeFileSync('src/engine/core/weekAdvance.ts', code);
