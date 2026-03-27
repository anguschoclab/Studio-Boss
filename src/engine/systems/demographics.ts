import { Project, AudienceQuadrant, DemographicGroup, GameState } from '@/engine/types';

/**
 * Evaluates how strongly a project resonates with a specific marketing target audience.
 * Returns a score between 0.0 and 2.0 (where >1.0 means highly efficient reach).
 */
export function calculateAudienceIndex(project: Project, target: AudienceQuadrant): number {
  let index = 1.0;
  
  // Genre affinities
  if (target.includes('male')) {
    if (project.genre === 'Action' || project.genre === 'Sci-Fi') index += 0.3;
    if (project.genre === 'Romance') index -= 0.3;
  }
  
  if (target.includes('female')) {
    if (project.genre === 'Romance' || project.genre === 'Drama') index += 0.3;
    if (project.genre === 'Action') index -= 0.2;
  }
  
  if (target.includes('under_25')) {
    if (project.genre === 'Horror' || project.genre === 'Animation') index += 0.4;
    if (project.genre === 'Documentary' || project.genre === 'Historical') index -= 0.4;
  }
  
  if (target.includes('over_25')) {
    if (project.genre === 'Documentary' || project.genre === 'Thriller') index += 0.2;
    if (project.genre === 'Animation') index -= 0.3;
  }
  
  if (target === 'four_quadrant') {
    // Four quadrant requires high budget / broad appeal
    if (project.budgetTier === 'blockbuster') index += 0.5;
    else if (project.budgetTier === 'low') index -= 0.4;
    
    // Niche genres hurt 4-quadrant
    if (project.genre === 'Horror' || project.genre === 'Documentary') index -= 0.5;
  }
  
  // Content Rating affinity
  if (project.rating === 'R' || project.rating === 'NC-17') {
    if (target.includes('under_25') || target === 'four_quadrant') {
      index -= 0.5; // Restricting access drops efficiency massively
    } else {
      index += 0.2; // Over_25 might actually like edgy content more
    }
  }
  
  if (project.rating === 'G' || project.rating === 'PG') {
    if (target.includes('over_25') && project.genre !== 'Animation') {
      index -= 0.3; // Adults might find it boring
    }
  }

  return Math.max(0.1, Math.min(2.0, index));
}

/**
 * Executes a marketing push, spending cash to generate buzz.
 */
export function simulateMarketingCampaign(
  state: GameState, 
  projectId: string, 
  spend: number, 
  target: AudienceQuadrant
): GameState {
  
  const pIndex = Object.values(state.studio.internal.projects).findIndex(p => p.id === projectId);
  if (pIndex === -1 || state.cash < spend) return state;
  
  const project = state.studio.internal.projects[pIndex];
  
  // Calculate how much buzz this spend buys
  const baseBuzzGain = (spend / 100_000); // 1 buzz point per 100k
  
  // Modify by audience index
  const alignment = calculateAudienceIndex(project, target);
  
  const finalBuzzGain = Math.floor(baseBuzzGain * alignment);
  
  // Record marketing spend in the project
  const updatedProject = {
    ...project,
    buzz: Math.min(100, project.buzz + finalBuzzGain),
    marketingBudget: (project.marketingBudget || 0) + spend,
    targetDemographic: target
  };
  
  const newProjects = [...state.studio.internal.projects];
  newProjects[pIndex] = updatedProject;
  
  return {
    ...state,
    cash: state.cash - spend,
    studio: {
      ...state.studio,
      internal: {
        ...state.studio.internal,
        projects: newProjects
      }
    }
  };
}
