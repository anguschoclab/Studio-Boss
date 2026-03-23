import { describe, it, expect } from 'vitest';
import { initializeCulture, updateCultureFromProject } from '../../../engine/systems/culture';
import { Project } from '../../../engine/types';

const mockProject: Project = {
  id: "proj-1",
  title: "Test Film",
  format: "film",
  genre: "Action",
  budgetTier: "mid",
  budget: 50_000_000,
  weeklyCost: 100_000,
  targetAudience: "All",
  flavor: "Cool",
  status: "development",
  weeksInPhase: 0,
  developmentWeeks: 10,
  productionWeeks: 10,
  revenue: 0,
  weeklyRevenue: 0,
  releaseWeek: null,
  buzz: 50,
  marketingBudget: 0,
  marketingDomesticSplit: 50,
  marketingAngle: 'broad',
  franchiseId: undefined,
  reviewScore: undefined,
  boxOfficeRank: undefined
};

describe('Culture System', () => {
  it('initializes culture based on the studio archetype', () => {
    const majorCulture = initializeCulture('major');
    expect(majorCulture.prestigeVsCommercial).toBe(30); 
    
    const indieCulture = initializeCulture('indie');
    expect(indieCulture.prestigeVsCommercial).toBe(80); 
    
    // There is no tech_disruptor, so we test the default
    const techCulture = initializeCulture('other' as any);
    expect(techCulture.prestigeVsCommercial).toBe(50); 
  });

  it('shifts culture correctly when greenlighting a high-budget commercial film', () => {
    const initialCulture = initializeCulture('indie'); // Start at prestige
    const blockbuster: Project = { ...mockProject, budgetTier: 'blockbuster', budget: 200_000_000, genre: 'Action' };

    const newCulture = updateCultureFromProject(initialCulture, blockbuster);
    
    // A blockbuster action movie shifts the studio away from prestige (80) toward commercial (0)
    expect(newCulture.prestigeVsCommercial).toBeLessThan(initialCulture.prestigeVsCommercial);
  });

  it('shifts culture correctly when greenlighting an indie prestige drama', () => {
    const initialCulture = initializeCulture('major'); // Start highly commercial
    const indieDrama: Project = { ...mockProject, budgetTier: 'low', budget: 5_000_000, genre: 'Drama' };

    const newCulture = updateCultureFromProject(initialCulture, indieDrama);
    
    // A low budget drama shifts the studio toward prestige (100)
    expect(newCulture.prestigeVsCommercial).toBeGreaterThan(initialCulture.prestigeVsCommercial);
  });

  it('clamps culture values between 0 and 100', () => {
    let culture = initializeCulture('indie');
    culture.prestigeVsCommercial = 98; // Very close to max prestige

    const indieDrama: Project = { ...mockProject, budgetTier: 'low', budget: 5_000_000, genre: 'Drama' };
    
    const newCulture = updateCultureFromProject(culture, indieDrama);
    expect(newCulture.prestigeVsCommercial).toBeLessThanOrEqual(100);
  });
});
