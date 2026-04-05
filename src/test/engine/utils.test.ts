import { formatMoney, getWeekDisplay, clamp } from "../../engine/utils";
import { describe, it, expect } from "vitest";

describe("utils", () => {
  describe("formatMoney", () => {
    it.each([
      // Basic cases
      [0, "$0"],
      [50, "$50"],
      [999, "$999"],
      [1000, "$1K"],
      [1500, "$2K"],
      [999499, "$999K"],
      [1000000, "$1.0M"],
      [1500000, "$1.5M"],
      [1000000000, "$1.0B"],
      [1500000000, "$1.5B"],

      // Negatives
      [-0, "-$0"],
      [-50, "-$50"],
      [-999, "-$999"],
      [-1000, "-$1K"],
      [-1500, "-$2K"],
      [-1000000, "-$1.0M"],
      [-1500000, "-$1.5M"],
      [-1000000000, "-$1.0B"],
      [-1500000000, "-$1.5B"],

      // Special Numbers
      [NaN, "$NaN"],
      [Infinity, "$InfinityB"],
      [-Infinity, "-$InfinityB"],

      // Rounding Boundary Cases (K tier)
      [999.4, "$999"],
      [999.5, "$1K"],
      [1499.9, "$1K"], // .toFixed(0) rounds 1.4999 to 1
      [1500, "$2K"],   // .toFixed(0) rounds 1.5 to 2

      // Rounding Boundary Cases (M tier)
      [999499.4, "$999K"],
      [999950, "$1.0M"],
      [1049999, "$1.0M"],
      [1050000, "$1.1M"],

      // Rounding Boundary Cases (B tier)
      [999949999.9, "$999.9M"],
      [999950000, "$1.0B"],
      [1049999999, "$1.0B"],
      [1050000000, "$1.1B"],
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

  describe("groupContractsByProject", () => {
    it("returns an empty Map for an empty array", () => {
      const map = groupContractsByProject([]);
      expect(map.size).toBe(0);
      expect(map instanceof Map).toBe(true);
    });

    it("groups a single contract by projectId", () => {
      const contracts: Contract[] = [
        { id: "c1", talentId: "t1", projectId: "p1", fee: 100, backendPercent: 0, role: "actor" },
      ];
      const map = groupContractsByProject(contracts);
      expect(map.size).toBe(1);
      expect(map.get("p1")).toEqual([contracts[0]]);
    });

    it("groups multiple contracts under the same projectId", () => {
      const contracts: Contract[] = [
        { id: "c1", talentId: "t1", projectId: "p1", fee: 100, backendPercent: 0, role: "actor" },
        { id: "c2", talentId: "t2", projectId: "p1", fee: 200, backendPercent: 5, role: "director" },
      ];
      const map = groupContractsByProject(contracts);
      expect(map.size).toBe(1);
      expect(map.get("p1")).toEqual(contracts);
    });

    it("groups multiple contracts into different projectIds", () => {
      const contracts: Contract[] = [
        { id: "c1", talentId: "t1", projectId: "p1", fee: 100, backendPercent: 0, role: "actor" },
        { id: "c2", talentId: "t2", projectId: "p2", fee: 200, backendPercent: 5, role: "director" },
        { id: "c3", talentId: "t3", projectId: "p1", fee: 50, backendPercent: 0, role: "writer" },
        { id: "c4", talentId: "t4", projectId: "p3", fee: 500, backendPercent: 10, role: "actor" },
      ];
      const map = groupContractsByProject(contracts);
      expect(map.size).toBe(3);
      expect(map.get("p1")).toEqual([contracts[0], contracts[2]]);
      expect(map.get("p2")).toEqual([contracts[1]]);
      expect(map.get("p3")).toEqual([contracts[3]]);
    });
  });
});
