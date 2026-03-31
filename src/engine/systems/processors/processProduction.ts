import { GameState, Project, StateImpact } from '@/engine/types';
import { evaluateProjectCrises } from '../production/crisisEvaluator';
import { advanceProjectProgress } from '../production/progressCalculator';
import { generateAwardsProfile } from '../awards';

/**
 * processProduction orchestrates the weekly advancement of all studio projects.
 * Now modularized for Phase 2 focus on Progress and Crises.
 */
export const processProduction = (state: GameState): StateImpact => {
  const impact: StateImpact = {
    projectUpdates: [],
    newsEvents: [],
    uiNotifications: []
  };

  const currentWeek = state.week;

  Object.values(state.studio.internal.projects).forEach((project: Project) => {
    if (project.status === 'production') {
      const oldCost = project.accumulatedCost;
      
      // 1. Evaluate Crises
      let updatedProject = evaluateProjectCrises(project, currentWeek);
      
      // 2. Advance Progress
      updatedProject = advanceProjectProgress(updatedProject);

      // 3. Update weekly cost for finance system to pick up
      updatedProject.weeklyCost = updatedProject.accumulatedCost - oldCost;

      // 4. Handle Phase Transitions
      if (updatedProject.progress >= 100) {
        updatedProject.status = 'marketing';
        updatedProject.weeksInPhase = 0;
        
        impact.newsEvents!.push({
          type: 'STUDIO_EVENT',
          headline: `${updatedProject.title} Wraps Production`,
          description: `Principal photography has concluded on "${updatedProject.title}". The film now moves into post-production and marketing preparation.`,
        });
      }

      impact.projectUpdates!.push({
        projectId: updatedProject.id,
        update: updatedProject
      });

      // UI Notifications for Crises
      if (updatedProject.activeCrisis && !project.activeCrisis) {
        impact.uiNotifications!.push(`CRISIS: "${updatedProject.title}" has been hit by a production crisis!`);
      }
    } else if (project.status === 'released' && !project.awardsProfile) {
        // Migration/Cleanup: Ensure awards profile exists
        impact.projectUpdates!.push({
            projectId: project.id,
            update: { awardsProfile: generateAwardsProfile(project) }
        });
    }
  });

  return impact;
};
