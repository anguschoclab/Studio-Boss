import { Project, Contract, Talent, TalentPact, GameState, StateImpact } from '@/engine/types';
import { RandomGenerator } from '../utils/rng';

export const SchedulingEngine = {
  tick(state: GameState, rng: RandomGenerator): StateImpact[] {
    const impacts: StateImpact[] = [];
    const projects = Object.values(state.entities.projects);
    const contractsList = Object.values(state.entities.contracts || {});
    const talentPool = state.entities.talents;

    // ⚡ Bolt: Pre-group contracts by projectId to avoid O(N) filter in O(M) loop (O(N*M) total)
    const contractsByProject: Record<string, Contract[]> = {};
    for (const contract of contractsList) {
      if (!contractsByProject[contract.projectId]) {
        contractsByProject[contract.projectId] = [];
      }
      contractsByProject[contract.projectId].push(contract);
    }

    projects.forEach(project => {
      if (project.state !== 'production') return;

      const projectContracts = contractsByProject[project.id] || [];
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
    });

    return impacts;
  },

  evaluateSchedulingConflicts(
    project: Project,
    projectContracts: Contract[],
    talentPool: Record<string, Talent>,
    currentWeek: number
  ): { hasConflict: boolean; conflicts: string[] } {
    const conflicts: string[] = [];
    
    for (const contract of projectContracts) {
      const talent = talentPool[contract.talentId];
      if (!talent || !talent.commitments) continue;

      // Find other active commitments that overlap with THE CURRENT WEEK
      for (const commitment of talent.commitments) {
        if (commitment.projectId === project.id) continue;

        // Deterministic check: Is the talent working on ANOTHER project THIS week?
        const isWorkingElsewhere = currentWeek >= commitment.startWeek && currentWeek <= commitment.endWeek;
        
        if (isWorkingElsewhere) {
          conflicts.push(`${talent.name} is currently filming "${commitment.projectTitle}" (Week ${currentWeek} overlap)`);
        }
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
