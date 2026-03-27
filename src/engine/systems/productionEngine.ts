import { GameState, Project, Headline } from '@/engine/types';
import { updateCultureFromProject } from './culture';

export interface ProductionTransitionResult {
  newState: GameState;
  headline?: Headline;
}


export function calculateChemistry(project: Project, attachedTalent: TalentProfile[]): number {
  if (attachedTalent.length === 0) return 50;

  let baseChemistry = 50;

  // Unscripted Ensemble
  if (project.format === 'unscripted' && project.template?.castingRequirements?.some(req => req.roleType === 'ENSEMBLE')) {
    let conflictScore = 0;
    let totalDrama = 0;
    const traits = new Set<string>();

    for (const t of attachedTalent) {
      if (t.perks) {
        for (const perk of t.perks) {
          traits.add(perk);
        }
      }
      totalDrama += (t.ego || 0);
    }

    if (traits.has('Diva') && (traits.has('Hot-Headed') || traits.has('Abrasive') || traits.has('Difficult'))) {
      conflictScore += 30;
    }
    if (traits.has('Volatile')) conflictScore += 10;

    const avgDrama = attachedTalent.length > 0 ? totalDrama / attachedTalent.length : 0;
    baseChemistry += conflictScore + (avgDrama * 0.4);

  } else if (project.format === 'unscripted' && project.template?.castingRequirements?.some(req => req.roleType === 'HOST')) {
    const host = attachedTalent.find(t => t.roles.includes('showrunner') || t.roles.includes('director'));
    let charismaBonus = 0;
    if (host) {
      charismaBonus = host.draw * 0.5;
    }

    const uniqueTraits = new Set<string>();
    for (const t of attachedTalent) {
       if (t.perks) t.perks.forEach(p => uniqueTraits.add(p));
    }
    const varietyBonus = Math.min(30, uniqueTraits.size * 5);

    baseChemistry += charismaBonus + varietyBonus;

  } else {
    let synergyScore = 0;
    let totalActing = 0;

    for (const t of attachedTalent) {
       totalActing += t.skill || t.draw;
       if (t.perks) {
         if (t.perks.includes('Collaborative')) synergyScore += 10;
         if (t.perks.includes('Reliable')) synergyScore += 5;
         if (t.perks.includes('Diva') || t.perks.includes('Difficult')) synergyScore -= 15;
         if (t.perks.includes('Volatile')) synergyScore -= 10;
       }
    }

    const avgActing = attachedTalent.length > 0 ? totalActing / attachedTalent.length : 0;
    baseChemistry += synergyScore + (avgActing * 0.4);
  }

  return Math.max(1, Math.min(100, Math.round(baseChemistry)));
}

export const ProductionEngine = {
  /**
   * Transitions a project to the production phase.
   */
  transitionToProduction(
    state: GameState,
    projectId: string,
    headlineText: string,
    extraProjectUpdates: Partial<Project> = {}
  ): ProductionTransitionResult {
    const projectIndex = Object.values(state.studio.internal.projects).findIndex(p => p.id === projectId);
    if (projectIndex === -1) return { newState: state };

    const project = state.studio.internal.projects[projectIndex];
    const updatedProjects = [...state.studio.internal.projects];
    updatedProjects[projectIndex] = {
      ...project,
      status: 'production',
      weeksInPhase: 0,
      ...extraProjectUpdates
    };

    const newCulture = state.studio.culture ? updateCultureFromProject(state.studio.culture, project) : undefined;
    const headline: Headline = {
      id: `ph-${crypto.randomUUID()}`,
      text: headlineText,
      week: state.week,
      category: 'market' as const
    };

    const newState: GameState = {
      ...state,
      studio: {
        ...state.studio,
        culture: newCulture,
        internal: {
          ...state.studio.internal,
          projects: updatedProjects
        }
      },
      industry: {
        ...state.industry,
        headlines: [headline, ...state.industry.headlines].slice(0, 50)
      }
    };

    return { newState, headline };
  },

  /**
   * Handles weekly budget burns and production specific logic.
   * (Currently many of these are in projects.ts, but can be moved here if they become more complex)
   */
  processProductionTick(project: Project): Project {
    // Placeholder for future complex production logic (e.g. daily rushes, reshoots)
    return project;
  }
};
