import { Project } from '../types';

export function exploitIP(sourceProject: Project) {
  if (sourceProject.status !== 'released') {
    return null;
  }

  // Financial success check: revenue > budget * 1.5
  if (sourceProject.revenue <= sourceProject.budget * 1.5) {
    return null;
  }

  const spinoffName = `\${sourceProject.title}: Origins`;

  return {
    title: spinoffName,
    format: sourceProject.format,
    genre: sourceProject.genre,
    budgetTier: sourceProject.budgetTier,
    targetAudience: sourceProject.targetAudience,
    flavor: `A highly anticipated spinoff expanding the universe of the hit \${sourceProject.format} \${sourceProject.title}.`,
    parentProjectId: sourceProject.id,
    isSpinoff: true,
    initialBuzzBonus: 15,
  };
}
