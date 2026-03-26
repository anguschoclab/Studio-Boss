import { GameState, Project } from '@/engine/types';
import { groupContractsByProject } from '../../utils';
import { advanceProject } from '../projects';
import { checkAndTriggerCrisis } from '../crises';
import { generateAwardsProfile } from '../awards';
import { calculateBoxOfficeRanks, BoxOfficeEntry } from '../releaseSimulation';
import { processDirectorDisputes } from '../directors';
import { getTrendMultiplier } from '../trends';

export interface WeeklyChanges {
    projectUpdates: string[];
    events: string[];
    newHeadlines: any[]; // Use any for now or types/engine.types.Headline
    costs: number;
    revenue: number;
    newsEvents: any[];
}

export const processProduction = (
    state: GameState,
    weeklyChanges: WeeklyChanges
): GameState => {
    const nextWeek = state.week + 1;
    const contractsByProject = groupContractsByProject(state.studio.internal.contracts);

    const talentPoolMap = new Map<string, typeof state.industry.talentPool[0]>();
    for (const talent of state.industry.talentPool) {
        talentPoolMap.set(talent.id, talent);
    }

    let rivalStrengthSum = 0;
    for (let i = 0; i < state.industry.rivals.length; i++) {
        rivalStrengthSum += state.industry.rivals[i].strength;
    }
    const rivalAvgStrength = rivalStrengthSum / Math.max(1, state.industry.rivals.length);

    const updatedProjects: Project[] = [];
    const boxOfficeEntries: BoxOfficeEntry[] = [];
    const allTalentUpdates = new Map<string, typeof state.industry.talentPool[0]>();

    const mockStateForDisputes = {
        ...state,
        studio: {
            ...state.studio,
            internal: {
                ...state.studio.internal,
                projects: [] as Project[],
            }
        }
    };

    for (let i = 0; i < state.studio.internal.projects.length; i++) {
        const p = state.studio.internal.projects[i];

        if (p.activeCrisis && !p.activeCrisis.resolved) {
            weeklyChanges.projectUpdates.push(`"${p.title}" production is halted until the active crisis is resolved.`);
            updatedProjects.push(p);
            continue;
        }

        const projectContracts = contractsByProject.get(p.id) || [];
        const trendMult = getTrendMultiplier(p, state);
        const { project, update, talentUpdates } = advanceProject(
            p, 
            nextWeek, 
            state.studio.prestige, 
            projectContracts, 
            talentPoolMap, 
            rivalAvgStrength, 
            state.industry.awards || [], 
            trendMult
        );

        if (update) weeklyChanges.projectUpdates.push(update);
        talentUpdates.forEach(t => allTalentUpdates.set(t.id, t));

        if (project.status === 'released' && p.status !== 'released') {
            if (!project.awardsProfile) {
                project.awardsProfile = generateAwardsProfile(project);
            }
            weeklyChanges.newsEvents.push({
                type: 'RELEASE',
                headline: `${project.title} Hits Theaters!`,
                description: `The highly anticipated "${project.title}" has officially released. Initial buzz is ${project.buzz}.`,
                impact: `Genre Trend Multiplier: ${trendMult.toFixed(2)}x`
            });
        }

        if (project.status === 'marketing' && p.status === 'production') {
            weeklyChanges.newsEvents.push({
                type: 'STUDIO_EVENT',
                headline: `${project.title} Wraps Production`,
                description: `Principal photography has concluded on "${project.title}". The film now moves into post-production and marketing preparation.`,
                impact: 'Wrap milestone reached'
            });
        }

        if (project.status === 'production' && (!project.activeCrisis || project.activeCrisis.resolved)) {
            const newCrisis = checkAndTriggerCrisis(project);
            if (newCrisis) {
                project.activeCrisis = newCrisis;
                weeklyChanges.events.push(`CRISIS: "${project.title}" - ${newCrisis.description}`);
            }
        }

        if (project.status === 'production') {
            mockStateForDisputes.studio.internal.projects = [project];
            const dirDisputeArgs = processDirectorDisputes(mockStateForDisputes);
            if (dirDisputeArgs.newCrises.length > 0 && (!project.activeCrisis || project.activeCrisis.resolved)) {
                project.activeCrisis = dirDisputeArgs.newCrises[0].crisis;
                weeklyChanges.projectUpdates.push(...dirDisputeArgs.updates);
            }
        }

        updatedProjects.push(project);

        if (project.status === 'released') {
            boxOfficeEntries.push({ projectId: project.id, studioName: state.studio.name, weeklyRevenue: project.weeklyRevenue });
        }
    }

    const ranks = calculateBoxOfficeRanks(boxOfficeEntries);
    for (let i = 0; i < updatedProjects.length; i++) {
        const p = updatedProjects[i];
        if (p.status === 'released' && ranks.has(p.id)) {
            p.boxOfficeRank = ranks.get(p.id);
        }
    }

    const updatedTalentPool = new Array(state.industry.talentPool.length);
    for (let i = 0; i < state.industry.talentPool.length; i++) {
        const t = state.industry.talentPool[i];
        updatedTalentPool[i] = allTalentUpdates.get(t.id) || t;
    }

    return {
        ...state,
        studio: { ...state.studio, internal: { ...state.studio.internal, projects: updatedProjects } },
        industry: { ...state.industry, talentPool: updatedTalentPool }
    };
};
