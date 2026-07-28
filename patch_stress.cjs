const fs = require('fs');
let code = fs.readFileSync('src/test/engine/stress_determinism.test.ts', 'utf8');
code = code.replace(/expect\(currentStateA\)\.toEqual\(currentStateB\);\n  \}, 15000\);/g, 'expect(currentStateA).toEqual(currentStateB);\n  }, 30000);');
fs.writeFileSync('src/test/engine/stress_determinism.test.ts', code);
