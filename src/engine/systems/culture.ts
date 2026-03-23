import { StudioCulture, ArchetypeKey, Project } from '../types';

export function initializeCulture(archetype: ArchetypeKey): StudioCulture {
  switch (archetype) {
    case 'indie':
      return {
        prestigeVsCommercial: 80, // High prestige
        talentFriendlyVsControlling: 70, // Talent friendly
        nicheVsBroad: 20, // Niche
        filmFirstVsTvFirst: 90 // Film focused
      };
    case 'major':
      return {
        prestigeVsCommercial: 30, // Commercial
        talentFriendlyVsControlling: 30, // Controlling
        nicheVsBroad: 90, // Broad
        filmFirstVsTvFirst: 60 // Slight film bias
      };
    default:
      return {
        prestigeVsCommercial: 50,
        talentFriendlyVsControlling: 50,
        nicheVsBroad: 50,
        filmFirstVsTvFirst: 50
      };
  }
}

// Helper to gracefully shift culture towards a target
function shiftAxis(current: number, target: number, weight: number = 2): number {
  const diff = target - current;
  return Math.min(100, Math.max(0, current + (diff * (weight / 100))));
}

export function updateCultureFromProject(culture: StudioCulture, project: Project): StudioCulture {
  const updated = { ...culture };
  
  // Shift Prestige vs Commercial
  if (project.budgetTier === 'low') {
    updated.prestigeVsCommercial = shiftAxis(updated.prestigeVsCommercial, 100, 1);
  } else if (project.budgetTier === 'blockbuster') {
    updated.prestigeVsCommercial = shiftAxis(updated.prestigeVsCommercial, 0, 2);
  }
  
  if (project.genre === 'Drama' || project.genre === 'Documentary') {
    updated.prestigeVsCommercial = shiftAxis(updated.prestigeVsCommercial, 100, 1);
  }
  
  // Shift Niche vs Broad
  if (project.targetAudience === 'niche' || project.targetAudience === 'four-quadrant') {
     updated.nicheVsBroad = shiftAxis(updated.nicheVsBroad, project.targetAudience === 'four-quadrant' ? 100 : 0, 2);
  }
  
  // Shift Film vs TV
  updated.filmFirstVsTvFirst = shiftAxis(updated.filmFirstVsTvFirst, project.format === 'film' ? 100 : 0, 2);
  
  return updated;
}
