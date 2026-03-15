const fs = require('fs');
const file = 'src/test/engine/systems/awards.test.ts';
let content = fs.readFileSync(file, 'utf8');

// The failing tests call runAwardsCeremony(state, 2024), missing the year argument or confusing currentWeek and year.
// Signature: runAwardsCeremony(state: GameState, currentWeek: number, year: number)

content = content.replace(/runAwardsCeremony\(state, 2024\)/g, 'runAwardsCeremony(state, 62, 2024)');

fs.writeFileSync(file, content);
