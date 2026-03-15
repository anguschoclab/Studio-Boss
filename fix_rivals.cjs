const fs = require('fs');
const file = 'src/test/engine/systems/rivals.test.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/    callCount = 0;\n    vi\.spyOn\(Math, 'random'\)\.mockImplementation\(\(\) => \{\n      callCount\+\+;\n      if \(callCount === 3\) return 0\.5; \/\/ No activity update\n      if \(callCount === 4\) return 0\.1; \/\/ Trigger project update\n      if \(callCount === 5\) return 0\.8; \/\/ >= 0\.7, so decrease\n      return 0\.5;\n    \}\);/, '    mockRandomSequence(0.8);');

fs.writeFileSync(file, code);
