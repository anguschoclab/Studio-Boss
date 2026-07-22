import { describe, it, expect } from "vitest";
import {
  CROSSOVER_AFFINITY,
  FRANCHISE_FATIGUE_RISK,
  CROSSOVER_AFFINITY_LOWER_KEYS,
  FRANCHISE_FATIGUE_RISK_LOWER_KEYS,
} from "@/engine/data/genres";

describe("CROSSOVER_AFFINITY_LOWER_KEYS", () => {
  it("contains all keys from CROSSOVER_AFFINITY", () => {
    const originalKeys = Object.keys(CROSSOVER_AFFINITY);
    expect(Object.keys(CROSSOVER_AFFINITY_LOWER_KEYS).length).toBe(originalKeys.length);
  });

  it("has all lowercase keys", () => {
    for (const key of Object.keys(CROSSOVER_AFFINITY_LOWER_KEYS)) {
      expect(key).toBe(key.toLowerCase());
    }
  });

  it("values match original canonical keys", () => {
    for (const originalKey of Object.keys(CROSSOVER_AFFINITY)) {
      expect(CROSSOVER_AFFINITY_LOWER_KEYS[originalKey.toLowerCase()]).toBe(originalKey);
    }
  });

  it("resolves lowercase 'action' to 'Action'", () => {
    expect(CROSSOVER_AFFINITY_LOWER_KEYS["action"]).toBe("Action");
  });

  it("resolves lowercase 'sci-fi' to 'Sci-Fi'", () => {
    expect(CROSSOVER_AFFINITY_LOWER_KEYS["sci-fi"]).toBe("Sci-Fi");
  });

  it("resolves uppercase 'SUPERHERO' to 'Superhero'", () => {
    expect(CROSSOVER_AFFINITY_LOWER_KEYS["superhero"]).toBe("Superhero");
  });

  it("resolves 'video game adaptation' to 'Video Game Adaptation'", () => {
    expect(CROSSOVER_AFFINITY_LOWER_KEYS["video game adaptation"]).toBe(
      "Video Game Adaptation"
    );
  });

  it("returns undefined for unknown genre", () => {
    expect(CROSSOVER_AFFINITY_LOWER_KEYS["nonexistent"]).toBeUndefined();
  });
});

describe("FRANCHISE_FATIGUE_RISK_LOWER_KEYS", () => {
  it("contains all keys from FRANCHISE_FATIGUE_RISK", () => {
    const originalKeys = Object.keys(FRANCHISE_FATIGUE_RISK);
    expect(Object.keys(FRANCHISE_FATIGUE_RISK_LOWER_KEYS).length).toBe(originalKeys.length);
  });

  it("has all lowercase keys", () => {
    for (const key of Object.keys(FRANCHISE_FATIGUE_RISK_LOWER_KEYS)) {
      expect(key).toBe(key.toLowerCase());
    }
  });

  it("values match original canonical keys", () => {
    for (const originalKey of Object.keys(FRANCHISE_FATIGUE_RISK)) {
      expect(FRANCHISE_FATIGUE_RISK_LOWER_KEYS[originalKey.toLowerCase()]).toBe(originalKey);
    }
  });

  it("resolves lowercase 'superhero' to 'Superhero'", () => {
    expect(FRANCHISE_FATIGUE_RISK_LOWER_KEYS["superhero"]).toBe("Superhero");
  });

  it("resolves lowercase 'action' to 'Action'", () => {
    expect(FRANCHISE_FATIGUE_RISK_LOWER_KEYS["action"]).toBe("Action");
  });

  it("resolves 'cinematic universe' to 'Cinematic Universe'", () => {
    expect(FRANCHISE_FATIGUE_RISK_LOWER_KEYS["cinematic universe"]).toBe(
      "Cinematic Universe"
    );
  });

  it("returns undefined for unknown genre", () => {
    expect(FRANCHISE_FATIGUE_RISK_LOWER_KEYS["nonexistent"]).toBeUndefined();
  });
});
