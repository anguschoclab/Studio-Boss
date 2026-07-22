import { describe, it, expect } from "vitest";
import { safeJsonParse, validateSaveData, parseAndValidate } from "../../persistence/saveSchema";
import { initializeGame } from "../../engine/core/gameInit";

describe("saveSchema", () => {
  // ─── safeJsonParse reviver tests ───

  describe("safeJsonParse", () => {
    it("parses valid JSON correctly", () => {
      const result = safeJsonParse('{"a":1,"b":{"c":2}}') as any;
      expect(result.a).toBe(1);
      expect(result.b.c).toBe(2);
    });

    it("strips __proto__ key from top-level object", () => {
      const result = safeJsonParse('{"__proto__":{"polluted":true},"a":1}') as any;
      expect(result.a).toBe(1);
      expect(Object.keys(result)).not.toContain("__proto__");
      expect(Object.prototype.hasOwnProperty.call(result, "__proto__")).toBe(false);
      expect((Object.prototype as any).polluted).toBeUndefined();
    });

    it("strips __proto__ key from nested objects", () => {
      const result = safeJsonParse('{"outer":{"__proto__":{"polluted":true},"x":2}}') as any;
      expect(result.outer.x).toBe(2);
      expect(Object.keys(result.outer)).not.toContain("__proto__");
      expect(Object.prototype.hasOwnProperty.call(result.outer, "__proto__")).toBe(false);
      expect((Object.prototype as any).polluted).toBeUndefined();
    });

    it("strips constructor key from top-level and nested objects", () => {
      const result = safeJsonParse(
        '{"constructor":{"prototype":{"polluted":true}},"nested":{"constructor":{"harm":1}}}'
      ) as any;
      expect(Object.keys(result)).not.toContain("constructor");
      expect(Object.prototype.hasOwnProperty.call(result, "constructor")).toBe(false);
      expect(Object.keys(result.nested)).not.toContain("constructor");
      expect(Object.prototype.hasOwnProperty.call(result.nested, "constructor")).toBe(false);
      expect(result.nested).toBeDefined();
      expect((Object.prototype as any).polluted).toBeUndefined();
    });

    it("strips prototype key from top-level and nested objects", () => {
      const result = safeJsonParse(
        '{"prototype":{"evil":true},"nested":{"prototype":{"evil":2}}}'
      ) as any;
      expect(Object.keys(result)).not.toContain("prototype");
      expect(Object.prototype.hasOwnProperty.call(result, "prototype")).toBe(false);
      expect(Object.keys(result.nested)).not.toContain("prototype");
      expect(Object.prototype.hasOwnProperty.call(result.nested, "prototype")).toBe(false);
    });

    it("throws on invalid JSON syntax", () => {
      expect(() => safeJsonParse("{invalid json}")).toThrow(SyntaxError);
      expect(() => safeJsonParse("")).toThrow(SyntaxError);
      expect(() => safeJsonParse("undefined")).toThrow(SyntaxError);
    });

    it("preserves all other keys and values intact", () => {
      const result = safeJsonParse(
        '{"normal":"value","num":42,"bool":true,"nullVal":null,"arr":[1,2,3]}'
      ) as any;
      expect(result.normal).toBe("value");
      expect(result.num).toBe(42);
      expect(result.bool).toBe(true);
      expect(result.nullVal).toBeNull();
      expect(result.arr).toEqual([1, 2, 3]);
    });

    it("handles arrays correctly without stripping array elements", () => {
      const result = safeJsonParse('[1,"two",{"__proto__":{"x":1},"ok":true}]') as any[];
      expect(result[0]).toBe(1);
      expect(result[1]).toBe("two");
      expect(Object.keys(result[2])).not.toContain("__proto__");
      expect(Object.prototype.hasOwnProperty.call(result[2], "__proto__")).toBe(false);
      expect(result[2].ok).toBe(true);
      expect((Object.prototype as any).x).toBeUndefined();
    });

    it("handles primitive values (string, number, null) without error", () => {
      expect(safeJsonParse('"hello"')).toBe("hello");
      expect(safeJsonParse("42")).toBe(42);
      expect(safeJsonParse("null")).toBeNull();
      expect(safeJsonParse("true")).toBe(true);
    });
  });

  // ─── validateSaveData schema tests ───

  describe("validateSaveData", () => {
    const validState = initializeGame("Test Studio", "major");

    it("accepts a valid GameState from initializeGame()", () => {
      const result = validateSaveData(validState);
      expect(result.success).toBe(true);
    });

    it("rejects non-object root (array)", () => {
      const result = validateSaveData([1, 2, 3]);
      expect(result.success).toBe(false);
    });

    it("rejects non-object root (string)", () => {
      const result = validateSaveData("hello");
      expect(result.success).toBe(false);
    });

    it("rejects non-object root (number)", () => {
      const result = validateSaveData(42);
      expect(result.success).toBe(false);
    });

    it("rejects non-object root (null)", () => {
      const result = validateSaveData(null);
      expect(result.success).toBe(false);
    });

    it("rejects non-object root (boolean)", () => {
      const result = validateSaveData(true);
      expect(result.success).toBe(false);
    });

    it("rejects missing week field", () => {
      const { week, ...rest } = validState;
      const result = validateSaveData(rest);
      expect(result.success).toBe(false);
    });

    it("rejects non-number week (string)", () => {
      const result = validateSaveData({ ...validState, week: "five" });
      expect(result.success).toBe(false);
    });

    it("rejects non-number week (boolean)", () => {
      const result = validateSaveData({ ...validState, week: true });
      expect(result.success).toBe(false);
    });

    it("rejects missing gameSeed", () => {
      const { gameSeed, ...rest } = validState;
      const result = validateSaveData(rest);
      expect(result.success).toBe(false);
    });

    it("rejects missing tickCount", () => {
      const { tickCount, ...rest } = validState;
      const result = validateSaveData(rest);
      expect(result.success).toBe(false);
    });

    it("rejects missing game.currentWeek", () => {
      const result = validateSaveData({ ...validState, game: {} });
      expect(result.success).toBe(false);
    });

    it("rejects missing finance.cash", () => {
      const result = validateSaveData({
        ...validState,
        finance: { ...validState.finance, cash: undefined },
      });
      expect(result.success).toBe(false);
    });

    it("rejects non-number finance.cash (string)", () => {
      const result = validateSaveData({
        ...validState,
        finance: { ...validState.finance, cash: "rich" },
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing studio.id", () => {
      const result = validateSaveData({
        ...validState,
        studio: { ...validState.studio, id: undefined },
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing studio.name", () => {
      const result = validateSaveData({
        ...validState,
        studio: { ...validState.studio, name: undefined },
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing studio.archetype", () => {
      const result = validateSaveData({
        ...validState,
        studio: { ...validState.studio, archetype: undefined },
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid studio.archetype value", () => {
      const result = validateSaveData({
        ...validState,
        studio: { ...validState.studio, archetype: "blockbuster" },
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing studio.prestige", () => {
      const result = validateSaveData({
        ...validState,
        studio: { ...validState.studio, prestige: undefined },
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing entities field", () => {
      const { entities, ...rest } = validState;
      const result = validateSaveData(rest);
      expect(result.success).toBe(false);
    });

    it("rejects missing market field", () => {
      const { market, ...rest } = validState;
      const result = validateSaveData(rest);
      expect(result.success).toBe(false);
    });

    it("rejects missing industry field", () => {
      const { industry, ...rest } = validState;
      const result = validateSaveData(rest);
      expect(result.success).toBe(false);
    });

    it("rejects missing culture.genrePopularity", () => {
      const result = validateSaveData({ ...validState, culture: {} });
      expect(result.success).toBe(false);
    });

    it("rejects non-record culture.genrePopularity (array)", () => {
      const result = validateSaveData({ ...validState, culture: { genrePopularity: [1, 2, 3] } });
      expect(result.success).toBe(false);
    });

    it("rejects missing history field", () => {
      const { history, ...rest } = validState;
      const result = validateSaveData(rest);
      expect(result.success).toBe(false);
    });

    it("rejects non-array history (object)", () => {
      const result = validateSaveData({ ...validState, history: { not: "array" } });
      expect(result.success).toBe(false);
    });

    it("rejects missing eventHistory field", () => {
      const { eventHistory, ...rest } = validState;
      const result = validateSaveData(rest);
      expect(result.success).toBe(false);
    });

    it("rejects non-array eventHistory (object)", () => {
      const result = validateSaveData({ ...validState, eventHistory: { not: "array" } });
      expect(result.success).toBe(false);
    });

    it("accepts extra/unknown top-level fields (passthrough)", () => {
      const result = validateSaveData({ ...validState, customField: "extra", another: 123 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect((result.data as any).customField).toBe("extra");
        expect((result.data as any).another).toBe(123);
      }
    });

    it("accepts extra nested fields in finance, studio, game (passthrough)", () => {
      const result = validateSaveData({
        ...validState,
        finance: { ...validState.finance, customFinance: "yes" },
        studio: { ...validState.studio, customStudio: 42 },
        game: { ...validState.game, customGame: true },
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect((result.data as any).finance.customFinance).toBe("yes");
        expect((result.data as any).studio.customStudio).toBe(42);
        expect((result.data as any).game.customGame).toBe(true);
      }
    });

    it("accepts optional fields (news, ip) when present", () => {
      const result = validateSaveData({
        ...validState,
        news: { headlines: [] },
        ip: { vault: [], franchises: {} },
      });
      expect(result.success).toBe(true);
    });

    it("accepts when optional fields are absent", () => {
      const { news, ip, ...rest } = validState;
      const result = validateSaveData(rest);
      expect(result.success).toBe(true);
    });
  });

  // ─── Integration: safeJsonParse + validateSaveData combined ───

  describe("parseAndValidate", () => {
    const validState = initializeGame("Test Studio", "major");

    it("valid JSON string with __proto__ pollution attempt — stripped, validated, passes", () => {
      const jsonStr = JSON.stringify({ ...validState, __proto__: { polluted: true } });
      const result = parseAndValidate(jsonStr);
      expect(result.success).toBe(true);
      expect((Object.prototype as any).polluted).toBeUndefined();
    });

    it("valid JSON string with constructor.prototype pollution — stripped, validated, passes", () => {
      const jsonStr = JSON.stringify({ ...validState, constructor: { prototype: { evil: true } } });
      const result = parseAndValidate(jsonStr);
      expect(result.success).toBe(true);
      expect((Object.prototype as any).evil).toBeUndefined();
    });

    it("malformed JSON string — safeJsonParse throws (not caught by parseAndValidate)", () => {
      expect(() => parseAndValidate("{invalid}")).toThrow(SyntaxError);
    });

    it("valid JSON but wrong shape — parsed OK, validation fails", () => {
      const result = parseAndValidate('{"hello":"world"}');
      expect(result.success).toBe(false);
    });
  });
});
