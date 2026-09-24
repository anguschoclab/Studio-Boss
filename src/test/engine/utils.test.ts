import {describe, it, expect} from "vitest";
import {
  formatMoney,
  getWeekDisplay,
  pick,
  randRange,
  clamp,
  countKeys,
  hasAtLeastKeys,
  countRivalProjects,
  countPlayerProjects,
} from "../../engine/utils";
import {RivalStudio, Project} from "../../engine/types";
import {createMockGameState} from "../utils/mockFactories";

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
      expect(getWeekDisplay(105)).toEqual({ displayWeek: 1, year: 2028 });
    });

    it("characterizes week 0 and negative weeks", () => {
      expect(getWeekDisplay(0)).toEqual({ displayWeek: 0, year: 2025 });
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

  describe("countKeys", () => {
    it("returns 0 for an empty object", () => {
      expect(countKeys({})).toBe(0);
    });

    it("returns 0 for null and undefined", () => {
      expect(countKeys(null)).toBe(0);
      expect(countKeys(undefined)).toBe(0);
    });

    it("counts own enumerable keys", () => {
      expect(countKeys({ a: 1, b: 2, c: 3 })).toBe(3);
    });

    it("ignores inherited prototype properties", () => {
      const proto = { inherited: true };
      const obj = Object.create(proto);
      obj.own1 = 1;
      obj.own2 = 2;
      expect(countKeys(obj)).toBe(2);
    });
  });

  describe("hasAtLeastKeys", () => {
    it("returns true when the record has at least n keys", () => {
      expect(hasAtLeastKeys({ a: 1, b: 2, c: 3 }, 3)).toBe(true);
      expect(hasAtLeastKeys({ a: 1, b: 2, c: 3 }, 2)).toBe(true);
    });

    it("returns false when the record has fewer than n keys", () => {
      expect(hasAtLeastKeys({ a: 1, b: 2 }, 3)).toBe(false);
      expect(hasAtLeastKeys({}, 1)).toBe(false);
    });

    it("returns false for null and undefined when n >= 1", () => {
      expect(hasAtLeastKeys(null, 1)).toBe(false);
      expect(hasAtLeastKeys(undefined, 4)).toBe(false);
    });

    it("returns true for n <= 0 regardless of input", () => {
      expect(hasAtLeastKeys({}, 0)).toBe(true);
      expect(hasAtLeastKeys(null, 0)).toBe(true);
    });

    it("ignores inherited prototype properties", () => {
      const proto = { inherited: true };
      const obj = Object.create(proto);
      obj.own1 = 1;
      expect(hasAtLeastKeys(obj, 2)).toBe(false);
      expect(hasAtLeastKeys(obj, 1)).toBe(true);
    });
  });

  describe("countRivalProjects", () => {
    const rival = { id: "r1", projects: { a: {}, b: {} } } as unknown as RivalStudio;

    it("counts rival.projects plus entity-store projects tagged ownerId", () => {
      const state = createMockGameState();
      state.entities.projects = {
        p1: { ownerId: "r1" } as Project,
        p2: { ownerId: "r1" } as Project,
        p3: { ownerId: "r2" } as Project,
        p4: {} as Project,
      };
      expect(countRivalProjects(state, rival)).toBe(4);
    });

    it("handles missing rival.projects and empty entity store", () => {
      const state = createMockGameState();
      const bareRival = { id: "r1" } as unknown as RivalStudio;
      expect(countRivalProjects(state, bareRival)).toBe(0);
    });
  });

  describe("countPlayerProjects", () => {
    it("counts unowned and player-owned entity projects, excluding rival-owned", () => {
      const state = createMockGameState(); // studio.id === "player-studio"
      state.entities.projects = {
        p1: { ownerId: "player-studio" } as Project,
        p2: {} as Project,
        p3: { ownerId: "r1" } as Project,
        p4: { ownerId: "r2" } as Project,
      };
      expect(countPlayerProjects(state)).toBe(2);
    });

    it("returns 0 when there are no projects", () => {
      expect(countPlayerProjects(createMockGameState())).toBe(0);
    });
  });
});
