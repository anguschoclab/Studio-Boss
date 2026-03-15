const fs = require('fs');
let text = fs.readFileSync('src/engine/core/weekAdvance.ts', 'utf8');

// Replace the old awards logic block
const startText = '  // Awards logic (Week 52)';
const endText = '  const newState: GameState = {';

text = text.substring(0, text.indexOf(startText)) +
`  // Run any awards ceremonies scheduled for this week
  const year = Math.floor(nextWeek / 52) + 1; // 1-indexed year
  const ceremonyResult = runAwardsCeremony(state, nextWeek, year);

  const newAwards = ceremonyResult.newAwards;
  const prestigeChange = ceremonyResult.prestigeChange;

  if (newAwards.length > 0) {
    projectUpdates.push(...ceremonyResult.projectUpdates);

    // Check which bodies fired to announce it
    const uniqueBodies = [...new Set(newAwards.map(a => a.body))];
    events.push(\`The \${uniqueBodies.join(' and ')} took place this week!\`);
  }

` + text.substring(text.indexOf(endText));

fs.writeFileSync('src/engine/core/weekAdvance.ts', text);
