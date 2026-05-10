const fs = require('fs');

const marketContent = fs.readFileSync('src/test/engine/systems/marketEvents.test.ts', 'utf8');
const newMarket = marketContent.replace(/vi\.spyOn\(utils, 'secureRandom'\)\.mockReturnValue\(0\.5\);/g, "vi.spyOn(utils, 'secureRandom').mockReturnValue(0.5);\n      vi.spyOn(utils, 'rand').mockReturnValue(0.5);");
fs.writeFileSync('src/test/engine/systems/marketEvents.test.ts', newMarket);

const rumorsContent = fs.readFileSync('src/test/engine/systems/rumors.test.ts', 'utf8');
const newRumors = rumorsContent.replace(/const impact = advanceRumors\(stateWithRumor\);/g, "vi.spyOn(utils, 'secureRandom').mockReturnValue(0.5);\n    const impact = advanceRumors(stateWithRumor);");
fs.writeFileSync('src/test/engine/systems/rumors.test.ts', newRumors);

console.log('patched tests');
