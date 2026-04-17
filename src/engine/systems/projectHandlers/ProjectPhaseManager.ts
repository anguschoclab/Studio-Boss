import { Project, StateImpact } from '@/engine/types';

export function handleDevelopmentPhase(p: Project): StateImpact[] {
  const impacts: StateImpact[] = [];
  let newState: string;
  if (p.format === 'tv' || p.format === 'unscripted') {
    newState = 'pitching';
  } else {
    newState = 'needs_greenlight';
  }
  
  impacts.push({
    type: 'PROJECT_UPDATED',
    payload: {
      projectId: p.id,
      update: {
        state: newState as any,
        weeksInPhase: 0
      }
    }
  });
  
  return impacts;
}
