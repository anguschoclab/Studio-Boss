import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const ROOT = join(__dirname, "../../..");

describe("package.json metadata", () => {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8"));

  it("name is not the generic scaffold name", () => {
    expect(pkg.name).not.toBe("vite_react_shadcn_ts");
  });

  it("description is set", () => {
    expect(pkg.description).toBeDefined();
    expect(pkg.description.length).toBeGreaterThan(0);
  });

  it("engines.bun matches the packageManager version", () => {
    const pmMatch = pkg.packageManager?.match(/^bun@(.+)$/);
    expect(pmMatch).toBeTruthy();
    const version = pmMatch![1];
    expect(pkg.engines?.bun).toBe(version);
  });
});
