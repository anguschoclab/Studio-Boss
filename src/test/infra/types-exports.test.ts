import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const ROOT = join(__dirname, "../../..");

describe("TypeScript and config exports", () => {
  it("declares window.electronAPI globally", () => {
    const candidates = [
      "src/types/electron.d.ts",
      "src/electron.d.ts",
      "src/types/electronAPI.d.ts",
      "src/electronAPI.d.ts",
    ];
    const found = candidates.some((c) => existsSync(join(ROOT, c)));
    expect(found).toBe(true);
  });

  it("tsconfig.node.json includes all root config files", () => {
    const raw = readFileSync(join(ROOT, "tsconfig.node.json"), "utf-8");
    // tsconfig allows comments and trailing commas
    const jsonc = raw
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "")
      .replace(/,\s*([}\]])/g, "$1");
    const tsNode = JSON.parse(jsonc);
    expect(tsNode.include).toContain("vite.config.ts");
    expect(tsNode.include).toContain("vitest.config.ts");
    expect(tsNode.include).toContain("playwright.config.ts");
  });

  it("vite.config.ts does not duplicate vitest config", () => {
    const viteConfig = readFileSync(join(ROOT, "vite.config.ts"), "utf-8");
    expect(viteConfig).not.toMatch(/\btest:\s*\{/);
  });
});
