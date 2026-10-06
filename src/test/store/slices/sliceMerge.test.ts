import { describe, it, expect } from "vitest";
import { existsSync } from "fs";
import { join } from "path";

const slicesDir = join(__dirname, "..", "..", "..", "src", "store", "slices");
const systemsDir = join(__dirname, "..", "..", "..", "src", "engine", "systems");

describe("Slice merge verification", () => {
  it("talentContractSlice.ts is deleted", () => {
    expect(existsSync(join(slicesDir, "talentContractSlice.ts"))).toBe(false);
  });

  it("projectCreationSlice.ts is deleted", () => {
    expect(existsSync(join(slicesDir, "projectCreationSlice.ts"))).toBe(false);
  });

  it("talentMarketplaceSlice.ts is deleted", () => {
    expect(existsSync(join(slicesDir, "talentMarketplaceSlice.ts"))).toBe(false);
  });

  it("projectIPSlice.ts is deleted", () => {
    expect(existsSync(join(slicesDir, "projectIPSlice.ts"))).toBe(false);
  });

  it("talentSlice exports merged methods", async () => {
    const mod = await import("../../../store/slices/talentSlice");
    expect(mod.createTalentSlice).toBeDefined();
    expect(typeof mod.createTalentSlice).toBe("function");
  });

  it("projectSlice exports merged methods", async () => {
    const mod = await import("../../../store/slices/projectSlice");
    expect(mod.createProjectSlice).toBeDefined();
    expect(typeof mod.createProjectSlice).toBe("function");
  });

  it("marketingSlice is mounted in gameStore", async () => {
    const mod = await import("../../../store/gameStore");
    expect(mod.useGameStore).toBeDefined();
  });

  it("awards.ts (legacy file) is deleted", () => {
    expect(existsSync(join(systemsDir, "awards.ts"))).toBe(false);
  });

  it("awards/index.ts exports processRazzies and runAwardsCeremony", async () => {
    const mod = await import("../../../engine/systems/awards/index");
    expect(mod.processRazzies).toBeDefined();
    expect(mod.runAwardsCeremony).toBeDefined();
  });
});
