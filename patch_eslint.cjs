const fs = require('fs');
const file = 'src/test/persistence/saveLoad.test.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('let setItemSpy: any;', 'let setItemSpy: ReturnType<typeof vi.spyOn>;');
content = content.replace('let getItemSpy: any;', 'let getItemSpy: ReturnType<typeof vi.spyOn>;');

fs.writeFileSync(file, content);
