import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const ROOT = join(__dirname, "../../..");

describe("Bun version alignment", () => {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8"));
  const ciYml = readFileSync(join(ROOT, ".github/workflows/ci.yml"), "utf-8");

  it("packageManager pins a concrete Bun version", () => {
    expect(pkg.packageManager).toMatch(/^bun@\d+\.\d+\.\d+$/);
  });

  it("CI uses the same Bun version as packageManager", () => {
    const match = pkg.packageManager.match(/^bun@(.+)$/);
    expect(match).not.toBeNull();
    const version = match![1];
    expect(ciYml).toContain(`bun-version: ${version}`);
    expect(ciYml).not.toContain("bun-version: latest");
  });
});
