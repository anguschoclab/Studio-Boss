import { describe, it, expect } from "vitest";
import { buildRebootParams, generateRebootProposal, RebootProposal } from "@/engine/systems/ip/ipRebootEngine";
import { IPAsset } from "@/engine/types";
import { RandomGenerator } from "@/engine/utils/rng";
import { CreateProjectParams } from "@/store/storeUtils";

function makeAsset(overrides: Partial<IPAsset> = {}): IPAsset {
  return {
    id: "ip-1",
    originalProjectId: "prj-orig",
    title: "Test IP",
    franchiseId: "FR-1",
    baseValue: 50_000_000,
    decayRate: 0.8,
    merchandisingMultiplier: 1.0,
    syndicationStatus: "NONE",
    syndicationTier: "NONE",
    totalEpisodes: 0,
    rightsExpirationWeek: 999,
    rightsOwner: "STUDIO",
    ...overrides,
  };
}

describe("buildRebootParams", () => {
  it("returns valid CreateProjectParams with title ending in (Revival)", () => {
    const asset = makeAsset({ title: "Great Film" });
    const params = buildRebootParams(asset, 0);
    expect(params.title).toBe("Great Film (Revival)");
  });

  it("picks blockbuster tier when baseValue > 100M", () => {
    const asset = makeAsset({ baseValue: 150_000_000 });
    const params = buildRebootParams(asset, 0);
    expect(params.budgetTier).toBe("blockbuster");
  });

  it("picks high tier when baseValue <= 100M", () => {
    const asset = makeAsset({ baseValue: 100_000_000 });
    const params = buildRebootParams(asset, 0);
    expect(params.budgetTier).toBe("high");
  });

  it("returns full initialBuzzBonus when fatigue=0", () => {
    const asset = makeAsset({ decayRate: 0.8 });
    const params = buildRebootParams(asset, 0);
    const expected = Math.floor(0.8 * 50) + 20;
    expect(params.initialBuzzBonus).toBe(expected);
  });

  it("returns initialBuzzBonus=0 when fatigue=100", () => {
    const asset = makeAsset({ decayRate: 0.8 });
    const params = buildRebootParams(asset, 100);
    expect(params.initialBuzzBonus).toBe(0);
  });

  it("returns halved initialBuzzBonus when fatigue=50", () => {
    const asset = makeAsset({ decayRate: 0.8 });
    const baseBuzz = Math.floor(0.8 * 50) + 20;
    const params = buildRebootParams(asset, 50);
    expect(params.initialBuzzBonus).toBe(Math.round(baseBuzz * 0.5));
  });

  it("sets isSpinoff=true and parentProjectId from asset", () => {
    const asset = makeAsset({ originalProjectId: "prj-99" });
    const params = buildRebootParams(asset, 0);
    expect(params.isSpinoff).toBe(true);
    expect(params.parentProjectId).toBe("prj-99");
  });

  it("sets franchiseId from asset", () => {
    const asset = makeAsset({ franchiseId: "FR-42" });
    const params = buildRebootParams(asset, 0);
    expect(params.franchiseId).toBe("FR-42");
  });

  it("sets format=film, genre=DRAMA, flavor=reboot, targetAudience=GENERAL", () => {
    const params = buildRebootParams(makeAsset(), 0);
    expect(params.format).toBe("film");
    expect(params.genre).toBe("DRAMA");
    expect(params.flavor).toBe("reboot");
    expect(params.targetAudience).toBe("GENERAL");
  });
});

describe("generateRebootProposal", () => {
  it("returns object with ipId, ipTitle, suggestedBudget, estimatedNostalgiaBonus, description", () => {
    const vault: IPAsset[] = [makeAsset({ title: "My Show" })];
    const rng = new RandomGenerator(42);
    const result = generateRebootProposal(vault, rng);
    expect(result).not.toBeNull();
    expect(result).toHaveProperty("ipId");
    expect(result).toHaveProperty("ipTitle");
    expect(result).toHaveProperty("suggestedBudget");
    expect(result).toHaveProperty("estimatedNostalgiaBonus");
    expect(result).toHaveProperty("description");
  });

  it("returns null for empty vault", () => {
    const rng = new RandomGenerator(42);
    expect(generateRebootProposal([], rng)).toBeNull();
  });

  it("returns null when no STUDIO-owned assets", () => {
    const vault: IPAsset[] = [makeAsset({ rightsOwner: "MARKET" })];
    const rng = new RandomGenerator(42);
    expect(generateRebootProposal(vault, rng)).toBeNull();
  });
});
