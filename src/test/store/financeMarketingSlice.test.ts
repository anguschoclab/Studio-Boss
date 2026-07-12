import { describe, it, expect } from "vitest";
import { Contract } from "@/engine/types";

describe("financeMarketingSlice — contract filtering logic", () => {
  it("Object.values().filter() and for...in produce identical results for projectId matching", () => {
    const contracts: Record<string, Contract> = {
      "CON-1": { id: "CON-1", projectId: "PRJ-1", talentId: "TAL-1", fee: 5_000_000 } as Contract,
      "CON-2": { id: "CON-2", projectId: "PRJ-2", talentId: "TAL-1", fee: 5_000_000 } as Contract,
      "CON-3": { id: "CON-3", projectId: "PRJ-1", talentId: "TAL-2", fee: 3_000_000 } as Contract,
    };

    // Current approach: Object.values().filter()
    const objectValuesResult = Object.values(contracts).filter((c) => c.projectId === "PRJ-1");

    // Refactored approach: for...in
    const forInResult: Contract[] = [];
    for (const key in contracts) {
      if (Object.prototype.hasOwnProperty.call(contracts, key)) {
        if (contracts[key].projectId === "PRJ-1") {
          forInResult.push(contracts[key]);
        }
      }
    }

    expect(forInResult).toHaveLength(2);
    expect(objectValuesResult).toHaveLength(2);
    expect(forInResult.map((c) => c.id).sort()).toEqual(objectValuesResult.map((c) => c.id).sort());
  });

  it("returns empty array when no contracts match projectId", () => {
    const contracts: Record<string, Contract> = {
      "CON-1": { id: "CON-1", projectId: "PRJ-1", talentId: "TAL-1", fee: 5_000_000 } as Contract,
    };

    const forInResult: Contract[] = [];
    for (const key in contracts) {
      if (Object.prototype.hasOwnProperty.call(contracts, key)) {
        if (contracts[key].projectId === "PRJ-999") {
          forInResult.push(contracts[key]);
        }
      }
    }

    expect(forInResult).toHaveLength(0);
  });

  it("returns empty array when contracts record is empty", () => {
    const contracts: Record<string, Contract> = {};

    const forInResult: Contract[] = [];
    for (const key in contracts) {
      if (Object.prototype.hasOwnProperty.call(contracts, key)) {
        if (contracts[key].projectId === "PRJ-1") {
          forInResult.push(contracts[key]);
        }
      }
    }

    expect(forInResult).toHaveLength(0);
  });
});
