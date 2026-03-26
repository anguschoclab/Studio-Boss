import fs from 'fs';

const file = 'src/engine/core/weekAdvance.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'awards: [...(state.industry.awards || []), ...newAwards],',
  `awards: (() => {
        const oldAwards = state.industry.awards || [];
        const combined = new Array(oldAwards.length + newAwards.length);
        for (let i = 0; i < oldAwards.length; i++) combined[i] = oldAwards[i];
        for (let i = 0; i < newAwards.length; i++) combined[oldAwards.length + i] = newAwards[i];
        return combined;
      })(),`
);

code = code.replace(
  'headlines: [...newHeadlines, ...state.industry.headlines].slice(0, 50),',
  `headlines: (() => {
        const oldHeadlines = state.industry.headlines || [];
        const totalLen = Math.min(50, newHeadlines.length + oldHeadlines.length);
        const combined = new Array(totalLen);
        let idx = 0;
        for (let i = 0; i < newHeadlines.length && idx < 50; i++) combined[idx++] = newHeadlines[i];
        for (let i = 0; i < oldHeadlines.length && idx < 50; i++) combined[idx++] = oldHeadlines[i];
        return combined;
      })(),`
);

code = code.replace(
  '     newState.industry.scandals = [...(newState.industry.scandals || []), ...scandalResult.newScandals];',
  `     const oldScandals = newState.industry.scandals || [];
     const combinedScandals = new Array(oldScandals.length + scandalResult.newScandals.length);
     for(let i = 0; i < oldScandals.length; i++) combinedScandals[i] = oldScandals[i];
     for(let i = 0; i < scandalResult.newScandals.length; i++) combinedScandals[oldScandals.length + i] = scandalResult.newScandals[i];
     newState.industry.scandals = combinedScandals;`
);

code = code.replace(
  '  financeHistory = [...financeHistory, { week: nextWeek, cash: newCash, revenue, costs }];',
  `  const newHistory = new Array(financeHistory.length + 1);
  for(let i=0; i<financeHistory.length; i++) newHistory[i] = financeHistory[i];
  newHistory[financeHistory.length] = { week: nextWeek, cash: newCash, revenue, costs };
  financeHistory = newHistory;`
);

fs.writeFileSync(file, code, 'utf8');
console.log('patched weekAdvance.ts - Part 2 manual');
