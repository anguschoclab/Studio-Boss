import { describe, it, expect } from "vitest";
import { getMarketHeat } from "@/engine/systems/industry/MacroCycle";

describe("getMarketHeat — difficulty", () => {
  it("accepts an optional difficulty and yields different heat", () => {
    const relaxed = getMarketHeat(200, "relaxed");
    const cutthroat = getMarketHeat(200, "cutthroat");
    expect(cutthroat).not.toBe(relaxed);
  });

  it("defaults to standard when no difficulty passed (backwards-callable)", () => {
    const explicit = getMarketHeat(200, "standard");
    const implicit = getMarketHeat(200);
    expect(explicit).toBe(implicit);
  });

  it("still clamps within sane bounds", () => {
    const h = getMarketHeat(500, "cutthroat");
    expect(h).toBeGreaterThanOrEqual(0.45);
    expect(h).toBeLessThanOrEqual(1.55);
  });
});
