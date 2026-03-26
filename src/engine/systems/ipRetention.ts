import { GameState, Project, IPRights } from '../types/index';

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

export function advanceIPRights(projects: Project[], currentWeek: number) {
   // Returns updated rights states and any lost projects
   const messages: string[] = [];
   
   const updatedProjects = projects.map(p => {
     if (p.ipRights && p.ipRights.reversionWeek !== undefined) {
        if (currentWeek >= p.ipRights.reversionWeek) {
          // Rights lost
          messages.push(`You lost the exclusive IP rights to ${p.title}.`);
          return {
             ...p,
             ipRights: {
                ...p.ipRights,
                rightsOwner: 'external' as const
             }
          };
        }
     }
     
     // Update catalog value dynamically
     if (p.ipRights && p.ipRights.rightsOwner === 'studio') {
        return {
           ...p,
           ipRights: {
              ...p.ipRights,
              catalogValue: calculateIPValue(p)
           }
        };
     }
     
     return p;
   });
   
   return { projects: updatedProjects, messages };
}

export function catalogValue(projects: Project[]): number {
  return projects.reduce((total, p) => {
    if (p.ipRights && p.ipRights.rightsOwner === 'studio') {
      return total + (p.ipRights.catalogValue || calculateIPValue(p));
    }
    if (p.ipRights && p.ipRights.rightsOwner === 'shared') {
      return total + ((p.ipRights.catalogValue || calculateIPValue(p)) * 0.5);
    }
    return total;
  }, 0);
}
