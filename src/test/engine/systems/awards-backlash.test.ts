import { describe, it, expect, vi } from "vitest";
import { checkCampaignBacklash } from "@/engine/systems/awards/NominationCalculator";
import { RandomGenerator } from "@/engine/utils/rng";

describe("checkCampaignBacklash (unified hybrid logic)", () => {
  it("Grassroots never triggers backlash regardless of score", () => {
    const rng = new RandomGenerator(42);
    expect(checkCampaignBacklash(30, "Grassroots", rng)).toBe(false);
    expect(checkCampaignBacklash(50, "Grassroots", rng)).toBe(false);
    expect(checkCampaignBacklash(90, "Grassroots", rng)).toBe(false);
  });

  it("Trade never triggers backlash when score >= 70", () => {
    const mockRng = { next: vi.fn(() => 0.01) } as unknown as RandomGenerator;
    expect(checkCampaignBacklash(70, "Trade", mockRng)).toBe(false);
    expect(checkCampaignBacklash(80, "Trade", mockRng)).toBe(false);
    expect(checkCampaignBacklash(100, "Trade", mockRng)).toBe(false);
    expect(mockRng.next).not.toHaveBeenCalled();
  });

  it("Trade triggers 10% chance when score < 70 (rng < 0.1 triggers)", () => {
    const mockRngTrigger = { next: vi.fn(() => 0.05) } as unknown as RandomGenerator;
    expect(checkCampaignBacklash(65, "Trade", mockRngTrigger)).toBe(true);

    const mockRngNoTrigger = { next: vi.fn(() => 0.15) } as unknown as RandomGenerator;
    expect(checkCampaignBacklash(65, "Trade", mockRngNoTrigger)).toBe(false);
  });

  it("Blitz never triggers backlash when score >= 70", () => {
    const mockRng = { next: vi.fn(() => 0.01) } as unknown as RandomGenerator;
    expect(checkCampaignBacklash(70, "Blitz", mockRng)).toBe(false);
    expect(checkCampaignBacklash(85, "Blitz", mockRng)).toBe(false);
    expect(mockRng.next).not.toHaveBeenCalled();
  });

  it("Blitz triggers 20% chance when score < 70 (rng < 0.2 triggers)", () => {
    const mockRngTrigger = { next: vi.fn(() => 0.15) } as unknown as RandomGenerator;
    expect(checkCampaignBacklash(65, "Blitz", mockRngTrigger)).toBe(true);

    const mockRngNoTrigger = { next: vi.fn(() => 0.25) } as unknown as RandomGenerator;
    expect(checkCampaignBacklash(65, "Blitz", mockRngNoTrigger)).toBe(false);
  });

  it("returns a boolean", () => {
    const rng = new RandomGenerator(42);
    const result = checkCampaignBacklash(50, "Blitz", rng);
    expect(typeof result).toBe("boolean");
  });

  it("is deterministic with same seed", () => {
    const rng1 = new RandomGenerator(123);
    const rng2 = new RandomGenerator(123);
    const result1 = checkCampaignBacklash(50, "Blitz", rng1);
    const result2 = checkCampaignBacklash(50, "Blitz", rng2);
    expect(result1).toBe(result2);
  });
});
