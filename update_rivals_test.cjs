const fs = require('fs');
const file = 'src/test/engine/systems/rivals.test.ts';
let code = fs.readFileSync(file, 'utf8');

const target = `    let callCount = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => {
      callCount++;
      if (callCount === 3) return 0.5; // No activity update
      if (callCount === 4) return 0.1; // Trigger project update
      if (callCount === 5) return 0.8; // >= 0.7, so decrease
      return 0.5;
    });`;

const replaceWith = `    let callCount = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => {
      callCount++;
      if (callCount === 3) return 0.5; // No activity update
      if (callCount === 4) return 0.1; // Trigger project update
      if (callCount === 5) return 0.8; // >= 0.7, so decrease
      return 0.5;
    });`;

// Replace duplicates with a helper
code = code.replace(/    let callCount = 0;[\s\S]*?return 0\.5;\n    }\);/g, (match, offset) => {
    if (match.includes("if (callCount === 5) return 0.8; // >= 0.7, so decrease")) {
        return `    mockRandomSequence(0.8);`;
    }
    if (match.includes("if (callCount === 5) return 0.5; // < 0.7, so increase")) {
        return `    mockRandomSequence(0.5);`;
    }
    if (match.includes("if (callCount === 3) return 0.2; // Trigger activity update")) {
        return match; // leave the one in recentActivity
    }
    return match;
});

// Insert helper
code = code.replace(`  it("conditionally updates projectCount", () => {`, `  const mockRandomSequence = (projectUpdateRoll: number) => {
    let callCount = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => {
      callCount++;
      if (callCount === 3) return 0.5; // No activity update
      if (callCount === 4) return 0.1; // Trigger project update
      if (callCount === 5) return projectUpdateRoll;
      return 0.5;
    });
  };

  it("conditionally updates projectCount", () => {`);


fs.writeFileSync(file, code);
