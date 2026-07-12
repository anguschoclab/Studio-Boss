"use strict";

const { z } = require("zod");

const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function reviver(key, value) {
  if (FORBIDDEN_KEYS.has(key)) {
    return undefined;
  }
  return value;
}

function safeJsonParse(jsonString) {
  return JSON.parse(jsonString, reviver);
}

const SAVE_SCHEMA = z
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

function validateSaveData(parsed) {
  const result = SAVE_SCHEMA.safeParse(parsed);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: JSON.stringify(result.error.issues, null, 2) };
}

function parseAndValidate(jsonString) {
  const parsed = safeJsonParse(jsonString);
  return validateSaveData(parsed);
}

module.exports = { safeJsonParse, validateSaveData, parseAndValidate, SAVE_SCHEMA };
