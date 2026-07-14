import { StudioCulture, ArchetypeKey, Project } from "@/engine/types";

const CULTURE_TEMPLATES: Record<string, StudioCulture> = {
  indie: {
    prestigeVsCommercial: 80,
    talentFriendlyVsControlling: 70,
    nicheVsBroad: 20,
    filmFirstVsTvFirst: 90,
    franchiseOriginal: 20,
  },
  major: {
    prestigeVsCommercial: 30,
    talentFriendlyVsControlling: 30,
    nicheVsBroad: 90,
    filmFirstVsTvFirst: 60,
    franchiseOriginal: 80,
  },
  boutique: {
    prestigeVsCommercial: 70,
    talentFriendlyVsControlling: 60,
    nicheVsBroad: 30,
    filmFirstVsTvFirst: 80,
    franchiseOriginal: 40,
  },
  streamer: {
    prestigeVsCommercial: 40,
    talentFriendlyVsControlling: 40,
    nicheVsBroad: 80,
    filmFirstVsTvFirst: 20,
    franchiseOriginal: 60,
  },
};

const DEFAULT_CULTURE: StudioCulture = {
  prestigeVsCommercial: 50,
  talentFriendlyVsControlling: 50,
  nicheVsBroad: 50,
  filmFirstVsTvFirst: 50,
  franchiseOriginal: 50,
};

export function initializeCulture(archetype: ArchetypeKey): StudioCulture {
  return CULTURE_TEMPLATES[archetype] || DEFAULT_CULTURE;
}

function shiftAxis(current: number, target: number, weight: number = 2): number {
  const diff = target - current;
  return Math.min(100, Math.max(0, current + diff * (weight / 100)));
}

export function updateCultureFromProject(culture: StudioCulture, project: Project): StudioCulture {
  const updated = { ...culture };

  if (project.budgetTier === "low") {
    updated.prestigeVsCommercial = shiftAxis(updated.prestigeVsCommercial, 100, 1);
  } else if (project.budgetTier === "blockbuster") {
    updated.prestigeVsCommercial = shiftAxis(updated.prestigeVsCommercial, 0, 2);
  }

  if (project.genre === "Drama" || project.genre === "Documentary") {
    updated.prestigeVsCommercial = shiftAxis(updated.prestigeVsCommercial, 100, 1);
  }

  if (project.targetAudience === "niche" || project.targetAudience === "four-quadrant") {
    updated.nicheVsBroad = shiftAxis(
      updated.nicheVsBroad,
      project.targetAudience === "four-quadrant" ? 100 : 0,
      2
    );
  }

  updated.filmFirstVsTvFirst = shiftAxis(
    updated.filmFirstVsTvFirst,
    project.format === "film" ? 100 : 0,
    2
  );

  return updated;
}
