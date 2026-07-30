const fs = require('fs');
let code = fs.readFileSync('src/test/engine/stress_determinism.test.ts', 'utf8');

code = code.replace(
  `describe("52-Week Determinism Stress Test", () => {
  test("should produce bit-identical results after 52 weeks of simulation", () => {`,
  `describe("52-Week Determinism Stress Test", () => {
  test("should produce bit-identical results after 52 weeks of simulation", () => {`
);

code = code.replace(
    `    // Final state comparison
    expect(currentStateA).toEqual(currentStateB);
  });
});`,
    `    // Final state comparison
    expect(currentStateA).toEqual(currentStateB);
  }, 15000);
});`
);

fs.writeFileSync('src/test/engine/stress_determinism.test.ts', code);
