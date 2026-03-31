import { GameState, Project, TalentProfile, ProjectFormat, BudgetTierKey, TvFormatKey, UnscriptedFormatKey, ReleaseModelKey } from '@/engine/types';
import { BUDGET_TIERS } from '@/engine/data/budgetTiers';
import { TV_FORMATS } from '@/engine/data/tvFormats';
import { UNSCRIPTED_FORMATS } from '@/engine/data/unscriptedFormats';
import { getFilmStats, getTvStats, getUnscriptedStats } from '@/engine/systems/stats';
import { randRange } from '@/engine/utils';

export interface CreateProjectParams {
    title: string;
    format: ProjectFormat;
    genre: string;
    budgetTier: BudgetTierKey;
    targetAudience: string;
    flavor: string;
    attachedTalentIds?: string[];
    tvFormat?: TvFormatKey;
    unscriptedFormat?: UnscriptedFormatKey;
    episodes?: number;
    releaseModel?: ReleaseModelKey;
    parentProjectId?: string;
    isSpinoff?: boolean;
    initialBuzzBonus?: number;
}

function getProjectStats(params: CreateProjectParams, tier: typeof BUDGET_TIERS[keyof typeof BUDGET_TIERS]) {
    if (params.format === 'tv' && params.tvFormat && params.episodes) {
        return getTvStats(tier, TV_FORMATS[params.tvFormat], params.episodes);
    } else if (params.format === 'unscripted' && params.unscriptedFormat && params.episodes) {
        return getUnscriptedStats(tier, UNSCRIPTED_FORMATS[params.unscriptedFormat], params.episodes);
    }
    return getFilmStats(tier);
}

function prepareTalentAndContracts(
    state: GameState,
    attachedTalentIds: string[] | undefined,
    projectId: string
) {
    const ids = attachedTalentIds || [];
    const talentMap = new Map();
    const talentPool = state.industry.talentPool;
    const attachedTalent: TalentProfile[] = [];
    let talentFees = 0;
    const newContracts: any[] = [];

    for (let i = 0; i < ids.length; i++) {
        const t = talentPool[ids[i]];
        if (t) {
            attachedTalent.push(t);
            talentFees += t.fee || 0;
            newContracts.push({
                id: `contract-${crypto.randomUUID()}`,
                talentId: t.id,
                projectId,
                fee: t.fee,
                backendPercent: t.prestige > 80 ? 10 : 0,
            });
        }
    }

    return { attachedTalent, talentFees, newContracts };
}

export function buildProjectAndContracts(state: GameState, params: CreateProjectParams) {
    const tier = BUDGET_TIERS[params.budgetTier];
    const stats = getProjectStats(params, tier);
    const { budget, weeklyCost, developmentWeeks, productionWeeks, renewable } = stats;

    const projectId = crypto.randomUUID();
    const { talentFees, newContracts } = prepareTalentAndContracts(state, params.attachedTalentIds, projectId);

    const totalBudget = budget + talentFees;
    const initialBuzz = Math.floor(randRange(30, 70)) + (params.initialBuzzBonus || 0);

    const project: Project = {
        id: projectId,
        ...params,
        budget: totalBudget,
        weeklyCost,
        status: 'development' as const,
        buzz: Math.min(100, initialBuzz),
        weeksInPhase: 0,
        developmentWeeks,
        productionWeeks,
        revenue: 0,
        weeklyRevenue: 0,
        releaseWeek: null,
        season: (params.format === 'tv' || params.format === 'unscripted') ? 1 : undefined,
        episodesReleased: (params.format === 'tv' || params.format === 'unscripted') ? 0 : undefined,
        renewable,
    };

    return { project, newContracts, talentFees };
}

export function applyStateImpact(state: GameState, impact: import('@/engine/types').StateImpact): GameState {
  const newState = { ...state };
  
  // 1. Update Project List
  const newProjects = { ...state.studio.internal.projects };
  let projectsChanged = false;
  
  if (impact.projectUpdates) {
    impact.projectUpdates.forEach(({ projectId, update }) => {
      const project = newProjects[projectId];
      if (project) {
        newProjects[projectId] = { ...project, ...update };
        projectsChanged = true;
      }
    });

    if (impact.cultClassicProjectIds && impact.cultClassicProjectIds.length > 0) {
        impact.cultClassicProjectIds.forEach(projectId => {
            const project = newProjects[projectId];
            if (project) {
                newProjects[projectId] = { ...project, isCultClassic: true };
                projectsChanged = true;
            }
        });
    }
  }
  
  // 2. Update Talent Pool
  const newTalentPool = { ...state.industry.talentPool };
  let talentPoolChanged = false;

  if (impact.talentUpdates && impact.talentUpdates.length > 0) {
    impact.talentUpdates.forEach(({ talentId, update }) => {
      const talent = newTalentPool[talentId];
      if (talent) {
        newTalentPool[talentId] = { ...talent, ...update };
        talentPoolChanged = true;
      }
    });
  }

  if (impact.razzieWinnerTalents && impact.razzieWinnerTalents.length > 0) {
    impact.razzieWinnerTalents.forEach(talentId => {
      const talent = newTalentPool[talentId];
      if (talent) {
        newTalentPool[talentId] = { ...talent, hasRazzie: true };
        talentPoolChanged = true;
      }
    });
  }

  // 3. Update Rivals
  let newRivals = [...state.industry.rivals];
  let rivalsChanged = false;
  if (impact.rivalUpdates && impact.rivalUpdates.length > 0) {
    const updatesMap = new Map(impact.rivalUpdates.map(u => [u.rivalId, u.update]));
    newRivals = newRivals.map(r => {
        const update = updatesMap.get(r.id);
        if (update) {
            rivalsChanged = true;
            return { ...r, ...update };
        }
        return r;
    });
  }

  // 3b. Update Buyers
  let newBuyers = [...state.market.buyers];
  let buyersChanged = false;
  if (impact.buyerUpdates && impact.buyerUpdates.length > 0) {
    const bMap = new Map(impact.buyerUpdates.map(u => [u.buyerId, u.update]));
    newBuyers = newBuyers.map(b => {
      const up = bMap.get(b.id);
      if (up) {
        buyersChanged = true;
        return { ...b, ...up };
      }
      return b;
    });
  }

  // 4. Update Contracts
  let newContracts = [...state.studio.internal.contracts];
  if (impact.removeContracts && impact.removeContracts.length > 0) {
    const toRemove = new Set(impact.removeContracts.map(c => `${c.talentId}-${c.projectId}`));
    newContracts = newContracts.filter(c => !toRemove.has(`${c.talentId}-${c.projectId}`));
  }
  if (impact.removeContract) { // Legacy
    const { talentId, projectId } = impact.removeContract;
    newContracts = newContracts.filter(c => !(c.talentId === talentId && c.projectId === projectId));
  }
  
  // 5. Update Cash & Prestige
  const cashChange = impact.cashChange || 0;
  const prestigeChange = impact.prestigeChange || 0;
  
  // 6. Update Headlines & News History
  let newHeadlines = [...(state.industry.headlines || [])];
  if (impact.newHeadlines && impact.newHeadlines.length > 0) {
    const hlines = impact.newHeadlines.map(h => ({
      id: h.id || `h-${crypto.randomUUID()}`,
      week: h.week || state.week,
      category: h.category || 'general',
      text: h.text || ''
    } as import('@/engine/types').Headline));
    newHeadlines = [...hlines, ...newHeadlines].slice(0, 100);
  }
  
  let newNewsHistory = [...(state.industry.newsHistory || [])];
  if (impact.newsEvents && impact.newsEvents.length > 0) {
    const events = impact.newsEvents.map(e => ({
      ...e,
      id: e.id || `ne-${crypto.randomUUID()}`,
      week: e.week || state.week,
      type: e.type || 'STUDIO_EVENT',
      headline: e.headline || '',
      description: e.description || ''
    } as import('@/engine/types').NewsEvent));
    newNewsHistory = [...events, ...newNewsHistory].slice(0, 100);
  }

  const newAwards = impact.newAwards ? [...(state.industry.awards || []), ...impact.newAwards] : state.industry.awards;

  let newScandals = [...(state.industry.scandals || [])];
  let scandalsChanged = false;

  if (impact.newScandals && impact.newScandals.length > 0) {
      newScandals = [...newScandals, ...impact.newScandals];
      scandalsChanged = true;
  }

  if (impact.scandalUpdates && impact.scandalUpdates.length > 0) {
      const sMap = new Map(impact.scandalUpdates.map(u => [u.scandalId, u.update]));
      newScandals = newScandals.map(s => {
          const up = sMap.get(s.id);
          if (up) {
              scandalsChanged = true;
              return { ...s, ...up };
          }
          return s;
      });
  }
  if (impact.removeScandalIds && impact.removeScandalIds.length > 0) {
      const toRemove = new Set(impact.removeScandalIds);
      newScandals = newScandals.filter(s => !toRemove.has(s.id));
      scandalsChanged = true;
  }

  // UI Notifications (Add to events list or handle however your system prefers. Since we don't have an explicit 'events' array in State outside of ui, we'll assume it goes to a slice. Let's make sure it's valid).
  // The UI often pulls directly from `newsHistory` or `headlines`, but here we can add generic notifications to `newsHistory` if they are raw strings:
  if (impact.uiNotifications && impact.uiNotifications.length > 0) {
      const notifs = impact.uiNotifications.map(text => ({
          id: `ne-${crypto.randomUUID()}`,
          week: state.week,
          type: 'STUDIO_EVENT',
          headline: 'Notification',
          description: text
      } as import('@/engine/types').NewsEvent));
      newNewsHistory = [...notifs, ...newNewsHistory].slice(0, 100);
  }
  // Assemble final state
  return {
    ...newState,
    cash: state.cash + cashChange,
    studio: {
      ...state.studio,
      prestige: Math.max(0, state.studio.prestige + prestigeChange),
      internal: {
        ...state.studio.internal,
        projects: projectsChanged ? newProjects : state.studio.internal.projects,
        contracts: newContracts,
        financeHistory: impact.newFinanceHistory || state.studio.internal.financeHistory,
      }
    },
    industry: {
      ...state.industry,
      talentPool: talentPoolChanged ? newTalentPool : state.industry.talentPool,
      rivals: rivalsChanged ? newRivals : state.industry.rivals,
      awards: newAwards,
      scandals: scandalsChanged ? newScandals : state.industry.scandals,
      headlines: newHeadlines,
      newsHistory: newNewsHistory,
      rumors: impact.newRumors || state.industry.rumors,
      festivalSubmissions: impact.newFestivalSubmissions || state.industry.festivalSubmissions
    },
    market: {
      ...state.market,
      buyers: buyersChanged ? newBuyers : state.market.buyers,
      opportunities: impact.newOpportunities || state.market.opportunities,
      trends: impact.newTrends || state.market.trends,
      activeMarketEvents: impact.newMarketEvents || state.market.activeMarketEvents
    }
  };
}
