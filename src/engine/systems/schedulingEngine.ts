import { Project, Contract, Talent, TalentPact, GameState, StateImpact } from '@/engine/types';
import { RandomGenerator } from '../utils/rng';
import { getContractsByProjectId } from '@/engine/utils';

export const SchedulingEngine = {
  tick(state: GameState, rng: RandomGenerator): StateImpact[] {
    const impacts: StateImpact[] = [];
    const talentPool = state.entities.talents;
    // ⚡ Bolt: Replaced Object.values().forEach() with a direct for...in loop
    for (const projectId in state.entities.projects) {
      const project = state.entities.projects[projectId];
      if (project.state !== 'production') continue;

      const projectContracts = getContractsByProjectId(state.entities.contractsByProjectId, state.entities.contracts, project.id);
      const { hasConflict, conflicts } = this.evaluateSchedulingConflicts(project, projectContracts, talentPool, state.week);
      
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
            id: rng.uuid('NWS'),
            headline: `Scheduling Conflict Halts "${project.title}"`,
            description: conflicts.join('. '),
            category: 'talent'
          }
        });
      }
    }

    return impacts;
  },

  evaluateSchedulingConflicts(
    project: Project,
    projectContracts: Contract[],
    talentPool: Record<string, Talent>,
    currentWeek: number
  ): { hasConflict: boolean; conflicts: string[] } {
    const conflicts: string[] = [];
    
    const contractsLen = projectContracts.length;
    for (let i = 0; i < contractsLen; i++) {
      const contract = projectContracts[i];
      // Safety check in case unfiltered contracts are passed
      if (contract.projectId !== project.id) continue;

      const talent = talentPool[contract.talentId];
      if (!talent || !talent.commitments) continue;

      const commitments = talent.commitments;
      const commitmentsLen = commitments.length;

      // Find other active commitments that overlap with THE CURRENT WEEK
      for (let j = 0; j < commitmentsLen; j++) {
        const commitment = commitments[j];

        // ⚡ Bolt: Fast integer bounds check BEFORE string/object property check
        if (currentWeek < commitment.startWeek || currentWeek > commitment.endWeek) continue;
        if (commitment.projectId === project.id) continue;

        conflicts.push(`${talent.name} is currently filming "${commitment.projectTitle}" (Week ${currentWeek} overlap)`);
      }
    }
    return { hasConflict: conflicts.length > 0, conflicts };
  },

  processPacts(pacts: TalentPact[]): TalentPact[] {
    return (pacts || []).map(p => ({ ...p, weeksRemaining: p.weeksRemaining - 1 })).filter(p => p.weeksRemaining > 0);
  },

  updateTalentFatigue(talent: Talent, isWorking: boolean): number {
    const f = talent.fatigue || 0;
    return isWorking ? Math.min(100, f + 5) : Math.max(0, f - 10);
  }
};
