import { describe, it, expect } from 'vitest';
import { initializeCulture, updateCultureFromProject } from '../../../engine/systems/culture';
import { Project, ContentFlag } from '../../../engine/types';

const mockProject: Project = {
  id: "proj-1",
  title: "Test Film",
  type: 'FILM',
  format: "film",
  genre: "Action",
  budgetTier: "mid",
  budget: 50_000_000,
  weeklyCost: 100_000,
  targetAudience: "General",
  flavor: "Cool",
  state: "development",
  weeksInPhase: 0,
  developmentWeeks: 10,
  productionWeeks: 10,
  revenue: 0,
  weeklyRevenue: 0,
  releaseWeek: null,
  buzz: 50,
  accumulatedCost: 0,
  momentum: 50,
  progress: 0,
  activeCrisis: null,
  contentFlags: [] as ContentFlag[]
} as Project;

describe('Culture System', () => {
  it('initializes culture based on the studio archetype', () => {
    const majorCulture = initializeCulture('major');
    expect(majorCulture.prestigeVsCommercial).toBe(30); 
    
    const indieCulture = initializeCulture('indie');
    expect(indieCulture.prestigeVsCommercial).toBe(80); 
  });

  it('shifts culture correctly when greenlighting a high-budget commercial film', () => {
    const initialCulture = initializeCulture('indie'); // Start at prestige (80)
    const blockbuster = { ...mockProject, budgetTier: 'blockbuster', budget: 200_000_000, genre: 'Action' } as Project;

    const newCulture = updateCultureFromProject(initialCulture, blockbuster);
    
    // A blockbuster action movie shifts the studio away from prestige (80) toward commercial (0)
    expect(newCulture.prestigeVsCommercial).toBeLessThan(initialCulture.prestigeVsCommercial);
  });

  it('shifts culture correctly when greenlighting an indie prestige drama', () => {
    const initialCulture = initializeCulture('major'); // Start highly commercial (30)
    const indieDrama = { ...mockProject, budgetTier: 'low', budget: 5_000_000, genre: 'Drama' } as Project;

    const newCulture = updateCultureFromProject(initialCulture, indieDrama);
    
    // A low budget drama shifts the studio toward prestige (100)
    expect(newCulture.prestigeVsCommercial).toBeGreaterThan(initialCulture.prestigeVsCommercial);
  });

  it('clamps culture values between 0 and 100', () => {
    const culture = initializeCulture('indie');
    culture.prestigeVsCommercial = 99.5; 

    const indieDrama = { ...mockProject, budgetTier: 'low', budget: 5_000_000, genre: 'Drama' } as Project;
    
    const newCulture = updateCultureFromProject(culture, indieDrama);
    expect(newCulture.prestigeVsCommercial).toBeLessThanOrEqual(100);
  });
});
