import { NewsEvent, Headline, Project, Scandal, Opportunity, GenreTrend, MarketEvent, Rumor, Buyer, FestivalSubmission, FinanceRecord } from './index';

export interface WeeklyFinancialReport {
  week: number;
  year: number;
  startingCash: number;
  revenue: {
    boxOffice: number;
    distribution: number;
    other: number;
  };
  expenses: {
    production: number;
    marketing: number;
    overhead: number;
  };
  endingCash: number;
  netProfit: number;
}

export interface FinanceState {
  cash: number;
  ledger: WeeklyFinancialReport[];
}

export interface NewsState {
  headlines: Headline[];
}

export interface StateImpact {
  cashChange?: number;
  prestigeChange?: number;
  projectUpdates?: Array<{
    projectId: string;
    update: Partial<Project>;
  }>;
  rivalProjectUpdates?: Array<{
    rivalId: string;
    projectId: string;
    update: Partial<Project>;
  }>;
  talentUpdates?: Array<{
    talentId: string;
    update: any; // Partial<TalentProfile>
  }>;
  rivalUpdates?: Array<{
    rivalId: string;
    update: any; // Partial<RivalStudio>
  }>;
  buyerUpdates?: Array<{
    buyerId: string;
    update: Partial<Buyer>;
  }>;
  removeContracts?: Array<{
    talentId: string;
    projectId: string;
  }>;
  removeContract?: { // Keep this for backward compat temporarily
    talentId: string;
    projectId: string;
  };
  newHeadlines?: Array<Partial<Headline>>;
  newsEvents?: Array<Partial<NewsEvent>>;
  newAwards?: any[];
  newScandals?: Scandal[];
  scandalUpdates?: Array<{
    scandalId: string;
    update: Partial<Scandal>;
  }>;
  newOpportunities?: Opportunity[];
  newTrends?: GenreTrend[];
  newMarketEvents?: MarketEvent[];
  newRumors?: Rumor[];
  newFestivalSubmissions?: FestivalSubmission[];
  newFinanceHistory?: FinanceRecord[];
  cultClassicProjectIds?: string[];
  razzieWinnerTalents?: string[];
  removeScandalIds?: string[];
  opportunityUpdates?: Array<{
    opportunityId: string;
    update: Partial<Opportunity>;
  }>;
  removeOpportunityIds?: string[];
  uiNotifications?: string[]; // Generic log for the UI 'events' list
}

