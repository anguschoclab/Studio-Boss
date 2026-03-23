import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { updateRival } from "../../../engine/systems/rivals";
import { RivalStudio } from "../../../engine/types";

const mockRival: RivalStudio = {
  id: "rival-1",
  name: "Test Studio",
  motto: "Testing motto",
  archetype: "major",
  strength: 50,
  cash: 100_000_000,
  prestige: 50,
  recentActivity: "Doing nothing",
  projectCount: 5,
  strategy: 'acquirer',
  isAcquirable: false,
};

describe("updateRival", () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("updates strength and cash", () => {
    const updated = updateRival(mockRival);
    expect(updated.strength).toBe(50); // 50 + (0.5 * 6 - 3) = 50
    expect(updated.cash).toBe(110_000_000); // 100M + (0.5 * 40M - 10M) = 110M
  });

  it("updates strategy based on archetype", () => {
    expect(updateRival(mockRival).strategy).toBe('acquirer');
    
    // Test indie
    const indie = { ...mockRival, archetype: 'indie' as const };
    expect(updateRival(indie).strategy).toBe('prestige_chaser');
  });

  it("sets isAcquirable correctly", () => {
    vi.spyOn(Math, 'random').mockReturnValue(0); // lowest values
    
    // Subtract enough so that even with updateRival adding slightly to cash, it stays negative
    const brokeRival = { ...mockRival, cash: -50_000_000, strength: 30 };
    const updated = updateRival(brokeRival);
    expect(updated.isAcquirable).toBe(true);
    expect(updated.recentActivity).toContain("buyer");
  });
});
