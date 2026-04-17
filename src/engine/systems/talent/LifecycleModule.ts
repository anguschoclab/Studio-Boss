import { GameState, Talent } from '@/engine/types';
import { TalentUpdate } from '../../types/state.types';
import { SchedulingEngine } from '../schedulingEngine';
import { BardResolver } from '../bardResolver';
import { RandomGenerator } from '../../utils/rng';

export function advanceTalentLifecycle(state: GameState, rng: RandomGenerator): TalentUpdate[] {
  const talentUpdates: TalentUpdate[] = [];
  
  for (const id in state.entities.talents) {
    const talent = state.entities.talents[id];
    const update: Partial<Talent> = {};
    let changed = false;

    if (talent.onMedicalLeave) {
      if (state.week >= (talent.medicalLeaveEndsWeek || 0)) {
        update.onMedicalLeave = false;
        update.fatigue = 20;
        changed = true;
      }
    } else if ((talent.fatigue || 0) > 95) {
      update.onMedicalLeave = true;
      update.medicalLeaveEndsWeek = state.week + 12;
      changed = true;
    }

    if (!update.onMedicalLeave && !talent.onMedicalLeave) {
      const nextFatigue = SchedulingEngine.updateTalentFatigue(talent, false);
      if (nextFatigue !== (talent.fatigue || 0)) {
        update.fatigue = nextFatigue;
        changed = true;
      }
    }
    
    let nextCommitments = talent.commitments;
    if (talent.commitments && talent.commitments.length > 0) {
      let hasExpired = false;
      for (let i = 0; i < talent.commitments.length; i++) {
        if (talent.commitments[i].endWeek < state.week) {
          hasExpired = true;
          break;
        }
      }

      if (hasExpired) {
        nextCommitments = talent.commitments.filter(c => c.endWeek >= state.week);
        update.commitments = nextCommitments;
        changed = true;
      }
    }
    
    if (changed) {
      talentUpdates.push({
        talentId: id,
        update
      });
    }
  }

  return talentUpdates;
}
