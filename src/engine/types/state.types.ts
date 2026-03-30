import { NewsEvent, Headline, Project } from './index';

export interface StateImpact {
  cashChange?: number;
  prestigeChange?: number;
  projectUpdates?: Array<{
    projectId: string;
    update: Partial<Project>;
  }>;
  talentUpdates?: Array<{
    talentId: string;
    update: any; // Using any temporarily for talent partials
  }>;
  rivalUpdates?: Array<{
    rivalId: string;
    update: any;
  }>;
  removeContract?: {
    talentId: string;
    projectId: string;
  };
  newHeadlines?: Headline[];
  newsEvents?: NewsEvent[];
  newAwards?: any[];
  cultClassicProjectId?: string;
  razzieWinnerTalents?: string[];
  uiNotifications?: string[]; // Generic log for the UI 'events' list
}
