import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const ROOT = join(__dirname, "../../..");

describe("Lockfile hygiene", () => {
  it("bun.lock exists and is valid JSON with lockfileVersion", () => {
    const lockPath = join(ROOT, "bun.lock");
    expect(existsSync(lockPath)).toBe(true);
    const content = readFileSync(lockPath, "utf-8");
    // bun.lock uses JSONC (trailing commas) — strip them for strict JSON.parse
    const jsonc = content.replace(/,\s*([}\]])/g, "$1");
    const parsed = JSON.parse(jsonc);
    expect(parsed.lockfileVersion).toBeDefined();
  });

  it("bun.lockb does NOT exist", () => {
    expect(existsSync(join(ROOT, "bun.lockb"))).toBe(false);
  });

  it("package-lock.json does NOT exist", () => {
    expect(existsSync(join(ROOT, "package-lock.json"))).toBe(false);
  });

  it("pnpm-lock.yaml does NOT exist", () => {
    expect(existsSync(join(ROOT, "pnpm-lock.yaml"))).toBe(false);
  });
});

describe("package.json fields", () => {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8"));

  it("packageManager field exists and starts with bun@", () => {
    expect(pkg.packageManager).toBeDefined();
    expect(pkg.packageManager).toMatch(/^bun@\d/);
  });
});

describe("Playwright config", () => {
  it("webServer command uses bun run dev, not npm run dev", () => {
    const config = readFileSync(join(ROOT, "playwright.config.ts"), "utf-8");
    expect(config).toContain("bun run dev");
    expect(config).not.toContain("npm run dev");
  });
});

describe(".gitignore", () => {
  it("does not contain !package-lock.json negation", () => {
    const gitignore = readFileSync(join(ROOT, ".gitignore"), "utf-8");
    expect(gitignore).not.toContain("!package-lock.json");
  });
});

describe("README", () => {
  const readme = readFileSync(join(ROOT, "README.md"), "utf-8");

  it("does not contain 'npm i' or 'npm install'", () => {
    expect(readme).not.toMatch(/npm i\b/);
    expect(readme).not.toMatch(/npm install/);
  });

  it("does not contain 'npm run dev'", () => {
    expect(readme).not.toContain("npm run dev");
  });

  it("does not contain 'npm installed'", () => {
    expect(readme).not.toContain("npm installed");
  });
});
