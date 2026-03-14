import { describe, it, expect } from "vitest";
import { formatMoney, getWeekDisplay, pick, randRange, clamp } from "../../engine/utils";

describe("utils", () => {
  describe("formatMoney", () => {
    it("formats thousands", () => {
      expect(formatMoney(1500)).toBe("$2K");
      expect(formatMoney(1000)).toBe("$1K");
      expect(formatMoney(999)).toBe("$999");
    });
    it("formats millions", () => {
      expect(formatMoney(1500000)).toBe("$1.5M");
      expect(formatMoney(1000000)).toBe("$1.0M");
    });
    it("formats billions", () => {
      expect(formatMoney(1500000000)).toBe("$1.5B");
      expect(formatMoney(1000000000)).toBe("$1.0B");
    });
    it("formats negative numbers", () => {
      expect(formatMoney(-1500)).toBe("-$2K");
      expect(formatMoney(-1500000)).toBe("-$1.5M");
      expect(formatMoney(-1500000000)).toBe("-$1.5B");
      expect(formatMoney(-500)).toBe("-$500");
    });
    it("formats small numbers", () => {
      expect(formatMoney(0)).toBe("$0");
      expect(formatMoney(50)).toBe("$50");
    });
  });

  describe("getWeekDisplay", () => {
    it("calculates correct week and year", () => {
      expect(getWeekDisplay(1)).toEqual({ displayWeek: 1, year: 2026 });
      expect(getWeekDisplay(52)).toEqual({ displayWeek: 52, year: 2026 });
      expect(getWeekDisplay(53)).toEqual({ displayWeek: 1, year: 2027 });
      expect(getWeekDisplay(104)).toEqual({ displayWeek: 52, year: 2027 });
    });
  });

  describe("pick", () => {
    it("picks an element from the array", () => {
      const arr = [1, 2, 3];
      const result = pick(arr);
      expect(arr).toContain(result);
    });
  });

  describe("randRange", () => {
    it("returns a number within the range", () => {
      const result = randRange(1, 10);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(10);
    });
  });

  describe("clamp", () => {
    it("returns the minimum when value is below min", () => {
      expect(clamp(0, 1, 10)).toBe(1);
    });

    it("returns the value when within range", () => {
      expect(clamp(5, 1, 10)).toBe(5);
    });

    it("returns the maximum when value is above max", () => {
      expect(clamp(15, 1, 10)).toBe(10);
    });
  });
});
