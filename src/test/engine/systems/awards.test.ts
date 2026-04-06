import { describe, it, expect } from "vitest";
import { calculateNominationWeight, runAwardsCeremony, checkCampaignBacklash } from "../../../engine/systems/awards";
import { GameState } from "../../../engine/types";
import { RandomGenerator } from "../../../engine/utils/rng";
import { createMockGameState } from '../../utils/mockFactories';

describe("awards system", () => {
  const luckyRng = new RandomGenerator(777);

  const eligibleProject = {
    id: "p1",
    title: "The Award Bait",
    format: "film",
    genre: "Drama",
    budgetTier: "mid",
    budget: 10_000_000,
    state: "released",
    releaseWeek: 5,
    buzz: 50,
    awardsProfile: {
        criticScore: 90,
        audienceScore: 85,
        prestigeScore: 88,
        craftScore: 85,
        culturalHeat: 70,
        campaignStrength: 20,
        academyAppeal: 85,
        guildAppeal: 80,
        populistAppeal: 60,
        indieCredibility: 75,
        industryNarrativeScore: 80
    },
    reception: {
      metaScore: 90,
      audienceScore: 85,
      status: 'Acclaimed',
      reviews: [],
      isCultPotential: false
    }
  } as any;

  describe("calculateNominationWeight", () => {
    it("calculates a base weight for nomination", () => {
       const weight = calculateNominationWeight(eligibleProject, []);
       expect(weight).toBeGreaterThan(50);
    });

    it("favors Drama over Action in Academy-type ceremonies", () => {
       const dramaProject = { ...eligibleProject, genre: "Drama" } as any;
       const actionProject = { ...eligibleProject, genre: "Action" } as any;
       expect(calculateNominationWeight(dramaProject, [])).toBeGreaterThan(calculateNominationWeight(actionProject, []));
    });
  });

  describe("runAwardsCeremony", () => {
    it("performs awards resolution using the new weighting system", () => {
      const rng = new RandomGenerator(1);
      const state = createMockGameState({ week: 10 }); // Academy Awards week
      state.entities.projects = { [eligibleProject.id]: eligibleProject };

      const impacts = runAwardsCeremony(state, 10, 2024, rng);

      // Check for INDUSTRY_UPDATE (Award)
      const awardUpdate = impacts.find(i => i.type === 'INDUSTRY_UPDATE');
      expect(awardUpdate).toBeDefined();
      
      const payload = awardUpdate?.payload || {};
      const keys = Object.keys(payload);
      expect(keys.some(k => k.startsWith('industry.awards'))).toBe(true);

      // Check for NEWS_ADDED (Headline)
      expect(impacts.some(i => i.type === 'NEWS_ADDED')).toBe(true);
    });
  });

  describe("checkCampaignBacklash", () => {
    it("only triggers for Blitz campaigns with low quality", () => {
      const rng = new RandomGenerator(42);
      expect(checkCampaignBacklash(60, 'Blitz', rng)).toBeDefined();
      expect(checkCampaignBacklash(80, 'Blitz', rng)).toBe(false);
      expect(checkCampaignBacklash(60, 'Grassroots', rng)).toBe(false);
    });
  });
});
