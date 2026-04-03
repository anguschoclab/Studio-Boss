import { Project, Contract } from '../types/project.types';
import { Talent, TalentPact } from '../types/talent.types';
import { RandomGenerator } from '../utils/rng';

export class SchedulingEngine {
  static evaluateSchedulingConflicts(
    project: Project,
    contracts: Contract[],
    talentPool: Record<string, Talent>
  ): { hasConflict: boolean; conflicts: string[] } {
    const conflicts: string[] = [];
    const window = project.estimatedWindow;
    if (!window) return { hasConflict: false, conflicts: [] };

    for (const contract of contracts) {
      if (contract.projectId !== project.id) continue;
      const talent = talentPool[contract.talentId];
      if (!talent || !talent.commitments) continue;
      for (const commitment of talent.commitments) {
        const overlap = (window.startWeek < commitment.endWeek) && (window.endWeek > commitment.startWeek);
        if (overlap) {
          conflicts.push(`Talent ${talent.name} has conflict with ${commitment.projectId}`);
        }
      }
    }
    return { hasConflict: conflicts.length > 0, conflicts };
  }

  static processPacts(pacts: TalentPact[]): TalentPact[] {
    return (pacts || []).map(p => ({ ...p, weeksRemaining: p.weeksRemaining - 1 })).filter(p => p.weeksRemaining > 0);
  }

  static updateTalentFatigue(talent: Talent, isWorking: boolean): number {
    const f = talent.fatigue || 0;
    return isWorking ? Math.min(100, f + 5) : Math.max(0, f - 10);
  }
}
