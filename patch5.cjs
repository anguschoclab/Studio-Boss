const fs = require('fs');
const file = 'src/test/store/uiStore.test.ts';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
`const summary: any = { fromWeek: 1, toWeek: 2 };`,
`const summary = { fromWeek: 1, toWeek: 2 } as unknown as import('../../engine/types').WeekSummary;`
);

fs.writeFileSync(file, data);
