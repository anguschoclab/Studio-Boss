import { GameState, Project, Talent, ProjectFormat, BudgetTierKey, TvFormatKey, UnscriptedFormatKey, ReleaseModelKey, StateImpact } from '@/engine/types';
import { BUDGET_TIERS } from '@/engine/data/budgetTiers';
import { TV_FORMATS } from '@/engine/data/tvFormats';
import { UNSCRIPTED_FORMATS } from '@/engine/data/unscriptedFormats';
import { getFilmStats, getTvStats, getUnscriptedStats } from '@/engine/systems/stats';
import { randRange } from '@/engine/utils';
import { applyImpacts } from '@/engine/core/impactReducer';

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
    franchiseId?: string;
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
    const talentPool = state.industry.talentPool;
    const attachedTalent: Talent[] = [];
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
        state: 'development' as const,
        renewable,
        activeCrisis: null,
        momentum: 50,
        progress: 0,
        accumulatedCost: 0,
        releaseWeek: null,
        buzz: Math.min(100, initialBuzz),
        revenue: 0,
        weeklyRevenue: 0,
        weeksInPhase: 0,
        developmentWeeks,
        productionWeeks,
        ...( (params.format === 'tv' || params.format === 'unscripted') ? {
            tvDetails: {
                currentSeason: 1,
                episodesOrdered: params.episodes || 0,
                episodesCompleted: 0,
                episodesAired: 0,
                averageRating: 0,
                status: 'IN_DEVELOPMENT'
            }
        } : {} )
    } as Project;

    return { project, newContracts, talentFees };
}

/**
 * Bridge to the engine's impact reducer.
 * Supports passing multiple impacts for convenience in the store.
 */
export function applyStateImpact(state: GameState, impacts: StateImpact | StateImpact[]): GameState {
  const impactsArray = Array.isArray(impacts) ? impacts : [impacts];
  return applyImpacts(state, impactsArray);
}
