const fs = require('fs');

const content = fs.readFileSync('src/test/engine/systems/rumors.test.ts', 'utf8');

let newContent = content.replace(/import \* as utils from '\.\.\/\.\.\/\.\.\/engine\/utils';\nvi\.spyOn\(utils, 'secureRandom'\)\.mockReturnValue\(0\.5\);/g, "");

newContent = "import * as utils from '../../../engine/utils';\n" + newContent;

fs.writeFileSync('src/test/engine/systems/rumors.test.ts', newContent);
console.log('patched again');
