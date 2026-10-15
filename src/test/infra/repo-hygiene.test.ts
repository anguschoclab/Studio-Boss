import { describe, it, expect } from "vitest";
import { existsSync, readdirSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";

const ROOT = join(__dirname, "../../..");

describe("Repository hygiene", () => {
  it("tracks Jules learning files under a single casing (.Jules, not .jules)", () => {
    // On case-insensitive filesystems .Jules and .jules collapse into one
    // directory; the git index must not contain the lowercase variants.
    const tracked = execSync("git ls-files", { cwd: ROOT, encoding: "utf-8" });
    const lowerJules = tracked
      .split("\n")
      .filter((p) => p.startsWith(".jules/"));
    expect(lowerJules).toEqual([]);
  });

  it("src/routes vestigial directory is removed", () => {
    const routesDir = join(ROOT, "src/routes");
    if (existsSync(routesDir)) {
      // Allow the dir only while it is truly empty; a tracked route tree
      // would reintroduce the dead second router.
      expect(readdirSync(routesDir)).toEqual([]);
      throw new Error("src/routes exists — delete the vestigial directory");
    }
    expect(existsSync(routesDir)).toBe(false);
  });

  it("no duplicate component implementations under discovery/ and talent/", () => {
    // discovery/LiveAuctionDashboard was dead code shadowing the live
    // talent/ variant imported by DiscoveryBoard.
    expect(
      existsSync(join(ROOT, "src/components/discovery/LiveAuctionDashboard.tsx"))
    ).toBe(false);
    expect(
      existsSync(join(ROOT, "src/test/components/discovery/LiveAuctionDashboard.test.tsx"))
    ).toBe(false);
  });
});
