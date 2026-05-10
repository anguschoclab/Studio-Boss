const fs = require('fs');

const content = fs.readFileSync('src/test/engine/systems/rumors.test.ts', 'utf8');

const newContent = content.replace(/const impact = advanceRumors\(stateWithRumor\);/g, "vi.spyOn(utils, 'secureRandom').mockReturnValue(0.5);\n    const impact = advanceRumors(stateWithRumor);");

fs.writeFileSync('src/test/engine/systems/rumors.test.ts', newContent);
console.log('patched final time');
