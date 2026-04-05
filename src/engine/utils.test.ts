import { describe, it, expect, vi } from "vitest";
import { getWeekDisplay, pick } from "./utils";
import { RandomGenerator } from "./utils/rng";

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

describe("pick", () => {
  it("should return an element from the array", () => {
    const rng = new RandomGenerator(42);
    const arr = [1, 2, 3, 4, 5];
    const picked = pick(arr, rng);
    expect(arr).toContain(picked);
  });

  it("should delegate to the rng.pick method", () => {
    const rng = new RandomGenerator(123);
    const pickSpy = vi.spyOn(rng, "pick");
    const arr = ["a", "b", "c"];

    const result = pick(arr, rng);

    expect(pickSpy).toHaveBeenCalledWith(arr);
    expect(pickSpy).toHaveBeenCalledTimes(1);
    expect(pickSpy).toHaveReturnedWith(result);
  });
});
