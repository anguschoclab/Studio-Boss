import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const ROOT = join(__dirname, "../../..");

const readText = (path: string) => readFileSync(join(ROOT, path), "utf-8");

describe("registry configuration", () => {
  it("bunfig.toml forces the public npm registry", () => {
    const bunfigPath = join(ROOT, "bunfig.toml");
    expect(existsSync(bunfigPath)).toBe(true);
    const content = readText("bunfig.toml");
    expect(content).toMatch(/\[install\]/);
    expect(content).toMatch(/registry\s*=\s*"https:\/\/registry\.npmjs\.org\/"/);
  });

  it("bunfig.toml preserves text lockfiles", () => {
    const content = readText("bunfig.toml");
    expect(content).toMatch(/saveTextLockfile\s*=\s*true/);
  });

  it("bun.lock does not contain the old private registry", () => {
    const lock = readText("bun.lock");
    expect(lock).not.toContain("artifactory.ubisoft.org");
  });

  it("bun.lock only uses the public npm registry or local tarballs", () => {
    const lock = readText("bun.lock");
    // Allow file:// URLs (local overrides) and npmjs.org URLs.
    const matches = lock.matchAll(/"(https?:\/\/[^"]+)"/g);
    for (const [, url] of matches) {
      if (url.startsWith("file://")) continue;
      expect(url).toMatch(/^https:\/\/registry\.npmjs\.org\//);
    }
  });

  it("bun.lockb does NOT exist", () => {
    expect(existsSync(join(ROOT, "bun.lockb"))).toBe(false);
  });
});
