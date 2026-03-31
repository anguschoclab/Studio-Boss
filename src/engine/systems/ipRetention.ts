import { Project } from '@/engine/types';
import { StateImpact } from '../types/state.types';

export function calculateIPValue(project: Project): number {
  if (project.status === 'development' || project.status === 'pitching' || project.status === 'needs_greenlight') {
    return project.budget * 0.1; // Base speculative value
  }
  
  // Real value comes from box office and buzz
  let value = project.revenue * 0.4; // 40% of theatrical as baseline catalog value
  
  if (project.awardsProfile && project.awardsProfile.prestigeScore > 80) {
    value *= 1.5; // Prestige titles hold more long-term value
  }
  
  if (project.genre === 'Sci-Fi' || project.genre === 'Horror' || project.genre === 'Animation') {
    value *= 1.25; // Franchise friendly genres hold more value
  }
  
  return value;
}

export function checkRightsExpiry(project: Project, currentWeek: number): string | null {
  if (project.ipRights && project.ipRights.reversionWeek) {
    const weeksLeft = project.ipRights.reversionWeek - currentWeek;
    if (weeksLeft === 4) {
      return `WARNING: Rights to "${project.title}" revert in 4 weeks. Exploit or renew now!`;
    }
    if (weeksLeft === 0) {
      return `CRITICAL: Rights to "${project.title}" have reverted. You no longer control this IP.`;
    }
  }
  return null;
}

export function advanceIPRights(projects: Project[], currentWeek: number): StateImpact {
   const impact: StateImpact = {
       projectUpdates: [],
       uiNotifications: []
   };
   
   for (const p of projects) {
     if (p.ipRights && p.ipRights.reversionWeek !== undefined) {
        if (currentWeek >= p.ipRights.reversionWeek) {
          impact.uiNotifications!.push(`You lost the exclusive IP rights to ${p.title}.`);
          impact.projectUpdates!.push({
            projectId: p.id,
            update: {
                ipRights: {
                    ...p.ipRights,
                    rightsOwner: 'external' as const
                }
            }
          });
          continue;
        }
     }
     
     if (p.ipRights && p.ipRights.rightsOwner === 'studio') {
        impact.projectUpdates!.push({
            projectId: p.id,
            update: {
                ipRights: {
                    ...p.ipRights,
                    catalogValue: calculateIPValue(p)
                }
            }
        });
     }
   }
   
   return impact;
}

export function catalogValue(projects: Project[]): number {
  let total = 0;
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    if (p.ipRights) {
      if (p.ipRights.rightsOwner === 'studio') {
        total += (p.ipRights.catalogValue || calculateIPValue(p));
      } else if (p.ipRights.rightsOwner === 'shared') {
        total += ((p.ipRights.catalogValue || calculateIPValue(p)) * 0.5);
      }
    }
  }
  return total;
}
