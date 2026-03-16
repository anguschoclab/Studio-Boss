import { Project } from "../types";
import { generateTalentPool } from "../generators/talent";

/**
 * Exploits an existing IP to create a spinoff project.
 * @param sourceProject The successful released project to spin off from.
 * @returns A new Project in development, or null if requirements aren't met.
 */
export function exploitIP(sourceProject: Project): Project | null {
  if (sourceProject.state !== 'released') {
    return null; // Can only exploit released projects
  }

  // Ensure it was a financial success (revenue > budget * 1.5)
  if (sourceProject.revenue < sourceProject.budget * 1.5) {
    return null; // Not successful enough to spin off
  }

  // Create spinoff project
  // +20% base budget, +15 starting hype
  const baseBudget = sourceProject.budget * 1.2;
  const initialHype = 15;

  return {
    id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    title: `${sourceProject.title}: Origins`, // Simple generic title generation for now
    genre: sourceProject.genre,
    archetype: sourceProject.archetype,
    state: 'development',
    budget: baseBudget,
    revenue: 0,
    progress: 0,
    hype: initialHype,
    quality: 0,
    weeksInDevelopment: 0,
    talentIds: [], // Needs fresh talent packaging
    parentProjectId: sourceProject.id,
    isSpinoff: true
  };
}
