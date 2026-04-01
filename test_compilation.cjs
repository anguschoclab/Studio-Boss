const { execSync } = require('child_process');
try {
  execSync('npx vitest run src/test/engine/systems/finance.test.ts', { stdio: 'pipe' });
  console.log('Passed!');
} catch (e) {
  console.log(e.stdout.toString());
}
