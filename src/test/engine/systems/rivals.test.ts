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
};

describe("updateRival", () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a new object without mutating the original", () => {
    const updated = updateRival(mockRival);
    expect(updated).not.toBe(mockRival);
    expect(mockRival.strength).toBe(50);
    expect(mockRival.cash).toBe(100_000_000);
    expect(mockRival.recentActivity).toBe("Doing nothing");
    expect(mockRival.projectCount).toBe(5);
  });

  it("updates strength within expected bounds", () => {
    let updated = updateRival(mockRival);
    expect(updated.strength).toBe(50);

    vi.spyOn(Math, 'random').mockReturnValue(1);
    updated = updateRival(mockRival);
    expect(updated.strength).toBe(53);

    vi.spyOn(Math, 'random').mockReturnValue(0);
    updated = updateRival(mockRival);
    expect(updated.strength).toBe(47);
  });

  it("clamps strength between 20 and 100", () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const weakRival = { ...mockRival, strength: 21 };
    expect(updateRival(weakRival).strength).toBe(20);

    vi.spyOn(Math, 'random').mockReturnValue(1);
    const strongRival = { ...mockRival, strength: 99 };
    expect(updateRival(strongRival).strength).toBe(100);
  });

  it("updates cash within expected bounds", () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(updateRival(mockRival).cash).toBe(95_000_000);

    vi.spyOn(Math, 'random').mockReturnValue(1);
    expect(updateRival(mockRival).cash).toBe(120_000_000);
  });

  it("conditionally updates recentActivity", () => {
    vi.spyOn(Math, 'random').mockImplementation(() => 0.5);
    let updated = updateRival(mockRival);
    expect(updated.recentActivity).toBe("Doing nothing");

    let callCount = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => {
      callCount++;
      if (callCount === 3) return 0.2; // Trigger activity update
      return 0.5;
    });
    updated = updateRival(mockRival);
    expect(updated.recentActivity).not.toBe("Doing nothing");
  });

  it("conditionally updates projectCount", () => {
    vi.spyOn(Math, 'random').mockImplementation(() => 0.5);
    let updated = updateRival(mockRival);
    expect(updated.projectCount).toBe(5);

    let callCount = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => {
      callCount++;
      if (callCount === 3) return 0.5; // No activity update
      if (callCount === 4) return 0.1; // Trigger project update
      if (callCount === 5) return 0.5; // < 0.7, so increase
      return 0.5;
    });
    updated = updateRival(mockRival);
    expect(updated.projectCount).toBe(6);

    callCount = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => {
      callCount++;
      if (callCount === 3) return 0.5; // No activity update
      if (callCount === 4) return 0.1; // Trigger project update
      if (callCount === 5) return 0.8; // >= 0.7, so decrease
      return 0.5;
    });
    updated = updateRival(mockRival);
    expect(updated.projectCount).toBe(4);
  });

  it("clamps projectCount to a minimum of 1", () => {
    const fewProjects = { ...mockRival, projectCount: 1 };

    let callCount = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => {
      callCount++;
      if (callCount === 3) return 0.5; // No activity update
      if (callCount === 4) return 0.1; // Trigger project update
      if (callCount === 5) return 0.8; // >= 0.7, so decrease
      return 0.5;
    });

    const updated = updateRival(fewProjects);
    expect(updated.projectCount).toBe(1);
  });
});
