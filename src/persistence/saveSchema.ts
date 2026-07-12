import { z } from "zod";

const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function reviver(this: any, key: string, value: unknown): unknown {
  if (FORBIDDEN_KEYS.has(key)) {
    return undefined;
  }
  return value;
}

export function safeJsonParse(jsonString: string): unknown {
  return JSON.parse(jsonString, reviver as (key: string, value: unknown) => unknown);
}

export const SAVE_SCHEMA = z
  .object({
    week: z.number().int().positive(),
    gameSeed: z.number(),
    tickCount: z.number(),
    game: z.object({ currentWeek: z.number() }).passthrough(),
    finance: z.object({ cash: z.number() }).passthrough(),
    studio: z
      .object({
        id: z.string(),
        name: z.string(),
        archetype: z.enum(["major", "mid-tier", "indie"]),
        prestige: z.number(),
      })
      .passthrough(),
    entities: z.record(z.string(), z.unknown()),
    market: z.object({}).passthrough(),
    industry: z.object({}).passthrough(),
    culture: z
      .object({
        genrePopularity: z.record(z.string(), z.number()),
      })
      .passthrough(),
    history: z.array(z.unknown()),
    eventHistory: z.array(z.unknown()),
  })
  .passthrough();

export type ValidationResult = { success: true; data: unknown } | { success: false; error: string };

export function validateSaveData(parsed: unknown): ValidationResult {
  const result = SAVE_SCHEMA.safeParse(parsed);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: JSON.stringify(result.error.issues, null, 2) };
}

export function parseAndValidate(jsonString: string): ValidationResult {
  const parsed = safeJsonParse(jsonString);
  return validateSaveData(parsed);
}
