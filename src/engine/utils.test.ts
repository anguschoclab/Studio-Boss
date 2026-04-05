import { describe, it, expect, vi } from "vitest";
import { getWeekDisplay, randRange } from "./utils";
import { RandomGenerator } from "./utils/rng";

describe("randRange", () => {
  it("should delegate to rng.rangeInt", () => {
    const rng = new RandomGenerator(1234);
    const rangeIntSpy = vi.spyOn(rng, 'rangeInt').mockReturnValue(42);

    const result = randRange(10, 50, rng);

    expect(rangeIntSpy).toHaveBeenCalledWith(10, 50);
    expect(result).toBe(42);
  });

  it("should return values within the specified boundaries", () => {
    const rng = new RandomGenerator(42);
    const min = 5;
    const max = 10;

    // Test multiple times to ensure it stays within bounds
    for (let i = 0; i < 100; i++) {
      const result = randRange(min, max, rng);
      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThanOrEqual(max);
      // Ensures it returns an integer (since rangeInt returns integers)
      expect(Number.isInteger(result)).toBe(true);
    }
  });

  it("should handle min equal to max", () => {
    const rng = new RandomGenerator(999);

    for (let i = 0; i < 10; i++) {
      expect(randRange(7, 7, rng)).toBe(7);
      expect(randRange(-3, -3, rng)).toBe(-3);
      expect(randRange(0, 0, rng)).toBe(0);
    }
  });
});

describe("getWeekDisplay", () => {
  it("should return correct display week and year for year 2026 (weeks 1-52)", () => {
    expect(getWeekDisplay(1)).toEqual({ displayWeek: 1, year: 2026 });
    expect(getWeekDisplay(26)).toEqual({ displayWeek: 26, year: 2026 });
    expect(getWeekDisplay(52)).toEqual({ displayWeek: 52, year: 2026 });
  });

  it("should return correct display week and year for year 2027 (weeks 53-104)", () => {
    expect(getWeekDisplay(53)).toEqual({ displayWeek: 1, year: 2027 });
    expect(getWeekDisplay(78)).toEqual({ displayWeek: 26, year: 2027 });
    expect(getWeekDisplay(104)).toEqual({ displayWeek: 52, year: 2027 });
  });

  it("should handle the start of year 2028 (week 105)", () => {
    expect(getWeekDisplay(105)).toEqual({ displayWeek: 1, year: 2028 });
  });

  it("should handle week 0 and negative weeks based on the current implementation", () => {
    // Current implementation:
    // displayWeek: ((week - 1) % 52) + 1
    // year: 2026 + Math.floor((week - 1) / 52)

    // For week 0:
    // displayWeek: ((-1) % 52) + 1 = -1 + 1 = 0
    // year: 2026 + Math.floor(-1 / 52) = 2026 - 1 = 2025
    expect(getWeekDisplay(0)).toEqual({ displayWeek: 0, year: 2025 });

    // For week -51:
    // displayWeek: ((-52) % 52) + 1 = 0 + 1 = 1
    // year: 2026 + Math.floor(-52 / 52) = 2026 - 1 = 2025
    expect(getWeekDisplay(-51)).toEqual({ displayWeek: 1, year: 2025 });
  });
});
