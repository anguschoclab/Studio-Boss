import { formatMoney, getWeekDisplay, clamp } from "../../engine/utils";

describe("utils", () => {
  describe("formatMoney", () => {
    it.each([
      // thousands
      [1500, "$2K"],
      [1000, "$1K"],
      [999, "$999"],

      // millions
      [1500000, "$1.5M"],
      [1000000, "$1.0M"],

      // billions
      [1500000000, "$1.5B"],
      [1000000000, "$1.0B"],

      // negatives
      [-1500, "-$2K"],
      [-1500000, "-$1.5M"],
      [-1500000000, "-$1.5B"],
      [-500, "-$500"],

      // small numbers
      [0, "$0"],
      [50, "$50"],

      // new edge cases
      [-0, "-$0"],
      [NaN, "$NaN"],
      [Infinity, "$InfinityB"],
      [-Infinity, "-$InfinityB"],
      [999.9, "$1K"],
      [999999.9, "$1.0M"],
      [999999999.9, "$1.0B"],
    ])("formats %p as %p", (amount, expected) => {
      expect(formatMoney(amount)).toBe(expected);
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
