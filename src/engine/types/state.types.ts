import { NewsEvent, Headline, Project } from './index';

export interface StateImpact {
  cashChange?: number;
  prestigeChange?: number;
  projectUpdates?: Array<{
    projectId: string;
    update: Partial<Project>;
  }>;
  removeContract?: {
    talentId: string;
    projectId: string;
  };
  newHeadlines?: Headline[];
  newsEvents?: NewsEvent[];
  cultClassicProjectId?: string;
  razzieWinnerTalents?: string[];
}
