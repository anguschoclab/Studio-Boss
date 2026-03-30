import { AwardBody, AwardCategory, Project } from '@/engine/types';

interface AwardConfig {
  body: AwardBody;
  category: AwardCategory;
  format: 'film' | 'tv' | 'both';
  evaluator: (p: Project) => number;
}

export const AWARDS_CALENDAR: Record<number, AwardBody[];

const AWARD_CONFIGS: AwardConfig[];
