import { Project, Contract, Talent, TalentPact, GameState, StateImpact } from '@/engine/types';
import { RandomGenerator } from '../utils/rng';

export class SchedulingEngine {
  static tick(state: GameState, rng: RandomGenerator): StateImpact[] {
    const impacts: StateImpact[] = [];
    const projects = Object.values(state.studio.internal.projects) as Project[];
    const contracts = state.studio.internal.contracts;
    const talentPool = state.industry.talentPool;

    projects.forEach(project => {
      if (project.state !== 'production') return;

      const { hasConflict, conflicts } = this.evaluateSchedulingConflicts(project, contracts, talentPool);
      
      if (hasConflict) {
        impacts.push({
          type: 'PROJECT_UPDATED',
          payload: {
            projectId: project.id,
            update: { 
              weeksInPhase: Math.max(0, project.weeksInPhase - 1) // Delay progress
            }
          }
        });

        impacts.push({
          type: 'NEWS_ADDED',
          payload: {
            id: rng.uuid('news'),
            headline: `Scheduling Conflict Halts "${project.title}"`,
            description: conflicts.join('. '),
            category: 'talent'
          }
        });
      }
    });

    return impacts;
  }

  static evaluateSchedulingConflicts(
    project: Project,
    contracts: Contract[],
    talentPool: Record<string, Talent>
  ): { hasConflict: boolean; conflicts: string[] } {
    const conflicts: string[] = [];
    
    // Check all contracts for this project
    const projectContracts = contracts.filter(c => c.projectId === project.id);

    for (const contract of projectContracts) {
      const talent = talentPool[contract.talentId];
      if (!talent || !talent.commitments) continue;

      // Find other active commitments that overlap with this project's production window
      for (const commitment of talent.commitments) {
        if (commitment.projectId === project.id) continue;

        // Simple overlap check: if the talent has another project active during this production week
        const overlap = (commitment.startWeek <= project.productionWeeks + commitment.startWeek) && (commitment.endWeek >= project.weeksInPhase);
        
        if (overlap) {
          conflicts.push(`${talent.name} has a conflicting commitment on "${commitment.projectTitle}"`);
        }
      }
    }
    return { hasConflict: conflicts.length > 0, conflicts };
  }

  static processPacts(pacts: TalentPact[]): TalentPact[] {
    return (pacts || []).map(p => ({ ...p, weeksRemaining: (p as any).weeksRemaining - 1 })).filter(p => (p as any).weeksRemaining > 0);
  }

  static updateTalentFatigue(talent: Talent, isWorking: boolean): number {
    const f = talent.fatigue || 0;
    return isWorking ? Math.min(100, f + 5) : Math.max(0, f - 10);
  }
}
