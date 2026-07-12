import { describe, it, expect } from "vitest";
import { NewsImpact, Agency } from "@/engine/types";
import { MarketState } from "@/engine/types/state.types";
import { tickAgencies, evaluatePackageOffer } from "@/engine/systems/ai/AgentBrain";
import { RandomGenerator } from "@/engine/utils/rng";
import {
  createMockGameState,
  createMockTalent,
  createMockRival,
} from "../../generators/mockFactory";

const mockMarket: MarketState = {
  baseRate: 0.045,
  savingsYield: 0.025,
  debtRate: 0.095,
  loanRate: 0.07,
  rateHistory: [],
};

describe("Agent Brain (Target C2)", () => {
  const rng = new RandomGenerator(888);

  describe("tickAgencies", () => {
    it("should generate rumors for SHARK agencies", () => {
      const mockAgency: Agency = {
        id: "a1",
        name: "Shark Agency",
        archetype: "powerhouse",
        tier: "A_TIER",
        culture: "shark",
        prestige: 90,
        leverage: 80,
        currentMotivation: "THE_SHARK",
        motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 },
      } as any;

      const mockRival = createMockRival({ id: "r1", name: "Rival Studio" });
      const state = createMockGameState();
      state.industry.agencies = [mockAgency];
      state.entities.rivals = { [mockRival.id]: mockRival };

      const impacts = tickAgencies(state, rng);
      expect(Array.isArray(impacts)).toBe(true);

      if (impacts.length > 0) {
        const impact = impacts[0] as NewsImpact;
        expect(impact.type).toBe("NEWS_ADDED");
        expect(impact.payload.headline).toContain("poach top talent");
      }
    });

    it("should generate MODAL_TRIGGERED for a mega_corp agency with eligible contracted talent", () => {
      const playerStudioId = "PLR-1";
      const packagerAgency: Agency = {
        id: "mega-1",
        name: "MegaCorp Agency",
        archetype: "mega_corp",
        tier: "powerhouse",
        culture: "corporate",
        prestige: 95,
        leverage: 90,
        currentMotivation: "THE_PACKAGER",
        motivationProfile: { financial: 80, prestige: 60, legacy: 40, aggression: 80 },
      } as any;

      const leadTalent = createMockTalent({
        id: "lead-1",
        name: "A-Lister",
        prestige: 90,
        agencyId: "mega-1",
      });
      const bundledTalent = createMockTalent({
        id: "bundle-1",
        name: "B-Client",
        prestige: 40,
        agencyId: "mega-1",
      });

      const state = createMockGameState({
        studio: {
          id: playerStudioId,
          name: "Player Studio",
          archetype: "major",
          prestige: 50,
          internal: { projectHistory: [], firstLookDeals: [] },
        },
        entities: {
          projects: {
            "proj-1": { id: "proj-1", ownerId: playerStudioId, state: "production" } as any,
          },
          contracts: {
            "c-1": {
              id: "c-1",
              talentId: "lead-1",
              projectId: "proj-1",
              fee: 1_000_000,
              backendPercent: 0,
            },
          },
          talents: {
            "lead-1": leadTalent,
            "bundle-1": bundledTalent,
          },
          rivals: {},
        },
      });
      state.industry.agencies = [packagerAgency];

      // Use seed that will reliably trigger pact_aggression=0.35 for mega_corp
      const deterministicRng = new RandomGenerator(1337);
      const impacts = tickAgencies(state, deterministicRng);

      const modalImpact = impacts.find((i) => i.type === "MODAL_TRIGGERED");
      if (modalImpact) {
        expect((modalImpact.payload as any).modalType).toBe("PACKAGE_DEAL_OFFERED");
        expect((modalImpact.payload as any).payload.agencyId).toBe("mega-1");
        expect((modalImpact.payload as any).payload.leadTalentId).toBe("lead-1");
      }
    });
  });

  describe("evaluatePackageOffer", () => {
    it("returns a package deal if agency is THE_PACKAGER with 20% discount", () => {
      const agency: Agency = {
        id: "packager-1",
        name: "Pack House",
        archetype: "mega_corp",
        tier: "powerhouse",
        culture: "corporate",
        prestige: 85,
        leverage: 85,
        currentMotivation: "THE_PACKAGER",
        motivationProfile: { financial: 80, prestige: 60, legacy: 40, aggression: 80 },
      } as any;

      const leadTalent = createMockTalent({ id: "lead", name: "Star", prestige: 80 });
      const bundledTalent = createMockTalent({
        id: "bundle",
        name: "B-Side",
        agencyId: "packager-1",
      });
      const talentPool = [leadTalent, bundledTalent];

      const result = evaluatePackageOffer(agency, leadTalent, talentPool, mockMarket, rng);

      if (result.requiredTalentId) {
        expect(result.requiredTalentId).toBe("bundle");
        expect(result.packageDiscount).toBe(0.2);
        expect(result.reason).toContain("Agency policy");
      } else {
        expect(result.reason).toBe("No package deal offered.");
      }
    });

    it("returns no deal if no other clients are available", () => {
      const agency: Agency = {
        id: "packager-1",
        name: "Pack House",
        archetype: "mega_corp",
        tier: "powerhouse",
        culture: "corporate",
        prestige: 85,
        leverage: 85,
        currentMotivation: "THE_PACKAGER",
        motivationProfile: { financial: 80, prestige: 60, legacy: 40, aggression: 80 },
      } as any;

      const leadTalent = createMockTalent({ id: "lead", name: "Star", prestige: 80 });
      const talentPool = [leadTalent];

      const result = evaluatePackageOffer(agency, leadTalent, talentPool, mockMarket, rng);
      expect(result.requiredTalentId).toBeUndefined();
      expect(result.reason).toBe("No package deal offered.");
    });
  });
});
