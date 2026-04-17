import { StateImpact, Talent } from '@/engine/types';

export function createTalentUpdateImpact(talentId: string, update: Partial<Talent>): StateImpact {
  return {
    type: 'TALENT_UPDATED',
    payload: { talentId, update }
  };
}

export function createProjectUpdateImpact(projectId: string, update: any): StateImpact {
  return {
    type: 'PROJECT_UPDATED',
    payload: { projectId, update }
  };
}
