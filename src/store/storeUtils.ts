import { GameState, Project, ProjectFormat, BudgetTierKey, TvFormatKey, UnscriptedFormatKey, ReleaseModelKey } from '@/engine/types';
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
    for (let i = 0; i < talentPool.length; i++) {
        const t = talentPool[i];
        talentMap.set(t.id, t);
    }

    const attachedTalent: typeof talentPool = [];
    let talentFees = 0;
    const newContracts: any[] = [];

    for (let i = 0; i < ids.length; i++) {
        const t = talentMap.get(ids[i]);
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
  }
  
  // 2. Remove Contracts
  let newContracts = [...state.studio.internal.contracts];
  if (impact.removeContract) {
    const { talentId, projectId } = impact.removeContract;
    newContracts = newContracts.filter(c => !(c.talentId === talentId && c.projectId === projectId));
  }
  
  // 3. Update Cash
  const cashChange = impact.cashChange || 0;
  
  // 4. Update Studio Prestige
  const prestigeChange = impact.prestigeChange || 0;
  
  // 5. Update Headlines & News History
  let newHeadlines = [...(state.industry.headlines || [])];
  if (impact.newHeadlines) {
    newHeadlines = [...impact.newHeadlines, ...newHeadlines].slice(0, 100);
  }
  
  let newNewsHistory = [...(state.industry.newsHistory || [])];
  if (impact.newsEvents) {
    const events = impact.newsEvents.map(e => ({
      ...e,
      id: `ne-${crypto.randomUUID()}`,
      week: state.week
    }));
    newNewsHistory = [...events, ...newNewsHistory].slice(0, 100);
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
      }
    },
    industry: {
      ...state.industry,
      headlines: newHeadlines,
      newsHistory: newNewsHistory
    }
  };
}
