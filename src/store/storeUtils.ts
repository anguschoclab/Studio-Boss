import { GameState, Project, Talent, ProjectFormat, BudgetTierKey, TvFormatKey, UnscriptedFormatKey, ReleaseModelKey, StateImpact, Contract } from '@/engine/types';
import { BUDGET_TIERS } from '@/engine/data/budgetTiers';
import { TV_FORMATS } from '@/engine/data/tvFormats';
import { UNSCRIPTED_FORMATS } from '@/engine/data/unscriptedFormats';
import { getFilmStats, getTvStats, getUnscriptedStats } from '@/engine/systems/stats';
import { RandomGenerator } from '@/engine/utils/rng';
import { applyImpacts } from '@/engine/core/impactReducer';

import { 
  type ProjectId, 
  type TalentId, 
  type StudioId, 
  type FranchiseId, 
  type AssetId, 
  type ContractId 
} from '@/engine/types/shared.types';

export interface CreateProjectParams {
    title: string;
    format: ProjectFormat;
    genre: string;
    budgetTier: BudgetTierKey;
    targetAudience: string;
    flavor: string;
    attachedTalentIds?: TalentId[];
    tvFormat?: TvFormatKey;
    unscriptedFormat?: UnscriptedFormatKey;
    episodes?: number;
    releaseModel?: ReleaseModelKey;
    parentProjectId?: ProjectId;
    isSpinoff?: boolean;
    initialBuzzBonus?: number;
    franchiseId?: FranchiseId;
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
    attachedTalentIds: TalentId[] | undefined,
    projectId: ProjectId,
    rng: RandomGenerator
) {
    const ids = attachedTalentIds || [];
    const talentPool = state.entities.talents;
    const attachedTalent: Talent[] = [];
    let talentFees = 0;
    const newContracts: Contract[] = [];

    for (let i = 0; i < ids.length; i++) {
        const t = talentPool[ids[i]];
        if (t) {
            attachedTalent.push(t);
            talentFees += t.fee || 0;
            newContracts.push({
                id: rng.uuid('CON') as ContractId,
                talentId: t.id,
                projectId,
                fee: t.fee,
                backendPercent: t.prestige > 80 ? 10 : 0,
                role: t.role as any // Default to their base type
            });
        }
    }

    return { attachedTalent, talentFees, newContracts };
}

export function buildProjectAndContracts(state: GameState, params: CreateProjectParams, rng: RandomGenerator): { project: Project; newContracts: Contract[]; talentFees: number } {
    const tier = BUDGET_TIERS[params.budgetTier];
    const stats = getProjectStats(params, tier);
    const { budget, weeklyCost, developmentWeeks, productionWeeks, renewable } = stats;

    const projectId = rng.uuid('PRJ') as ProjectId;
    const { talentFees, newContracts } = prepareTalentAndContracts(state, params.attachedTalentIds, projectId, rng);

    const totalBudget = budget + talentFees;
    const initialBuzz = Math.floor(rng.range(30, 70)) + (params.initialBuzzBonus || 0);

    const projectBase = {
        id: projectId,
        title: params.title,
        genre: params.genre,
        budgetTier: params.budgetTier,
        targetAudience: params.targetAudience,
        flavor: params.flavor,
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
        contentFlags: [],
        franchiseId: params.franchiseId,
        parentProjectId: params.parentProjectId,
        isSpinoff: params.isSpinoff,
        isRecasting: false,
        turnaroundStartWeek: undefined,
        estimatedWindow: { startWeek: state.week + 1, endWeek: state.week + 1 + developmentWeeks + productionWeeks }
    };

    if (params.format === 'film') {
        const project: Project = {
            ...projectBase,
            type: 'FILM',
            format: 'film',
            scriptHeat: 50,
            activeRoles: [],
            scriptEvents: []
        };
        return { project, newContracts, talentFees };
    }

    if (params.format === 'tv') {
        const project: Project = {
            ...projectBase,
            type: 'SERIES',
            format: 'tv',
            scriptHeat: 50,
            activeRoles: [],
            scriptEvents: [],
            tvFormat: params.tvFormat,
            tvDetails: {
                currentSeason: 1,
                episodesOrdered: params.episodes || 0,
                episodesCompleted: 0,
                episodesAired: 0,
                averageRating: 0,
                status: 'IN_DEVELOPMENT'
            },
            releaseModel: params.releaseModel
        };
        return { project, newContracts, talentFees };
    }

    // Unscripted
    const project: Project = {
        ...projectBase,
        type: 'SERIES',
        format: 'unscripted',
        unscriptedFormat: params.unscriptedFormat || 'competition',
        tvDetails: {
            currentSeason: 1,
            episodesOrdered: params.episodes || 0,
            episodesCompleted: 0,
            episodesAired: 0,
            averageRating: 0,
            status: 'IN_DEVELOPMENT'
        }
    };
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
