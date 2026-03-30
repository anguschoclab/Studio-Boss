import { GameState, Project } from '@/engine/types';
import { StateImpact } from '../../types/state.types';
import { groupContractsByProject } from '../../utils';
import { advanceProject } from '../projects';
import { checkAndTriggerCrisis } from '../crises';
import { generateAwardsProfile } from '../awards';
import { calculateBoxOfficeRanks, BoxOfficeEntry } from '../releaseSimulation';
import { processDirectorDisputes } from '../directors';
import { getTrendMultiplier } from '../trends';

/**
 * processProduction simulates the weekly advancement of all studio projects.
 * Now returns a StateImpact to be applied by the unified simulation pipeline.
 */
export const processProduction = (
    state: GameState
): StateImpact => {
    const impact: StateImpact = {
        projectUpdates: [],
        talentUpdates: [],
        newsEvents: [],
        uiNotifications: []
    };

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

    const awardsByProject = new Map<string, typeof state.industry.awards>();
    if (state.industry.awards) {
        for (let i = 0; i < state.industry.awards.length; i++) {
            const a = state.industry.awards[i];
            if (!awardsByProject.has(a.projectId)) awardsByProject.set(a.projectId, []);
            awardsByProject.get(a.projectId)!.push(a);
        }
    }

    const boxOfficeEntries: BoxOfficeEntry[] = [];
    const projectUpdatesMap = new Map<string, Partial<Project>>();

    for (let i = 0; i < state.studio.internal.projects.length; i++) {
        const p = state.studio.internal.projects[i];

        if (p.activeCrisis && !p.activeCrisis.resolved) {
            impact.uiNotifications!.push(`"${p.title}" production is halted until the active crisis is resolved.`);
            continue;
        }

        const projectContracts = contractsByProject.get(p.id) || [];
        const trendMult = getTrendMultiplier(p, state);
        const { project: updatedProj, update: logMessage, talentUpdates } = advanceProject(
            p, 
            nextWeek, 
            state.studio.prestige, 
            projectContracts, 
            talentPoolMap, 
            rivalAvgStrength, 
            awardsByProject.get(p.id) || [],
            trendMult
        );

        if (logMessage) impact.uiNotifications!.push(logMessage);
        
        // Accumulate talent updates
        talentUpdates.forEach(t => {
            impact.talentUpdates!.push({ talentId: t.id, update: t });
        });

        // Track released project for box office ranks
        if (updatedProj.status === 'released') {
            boxOfficeEntries.push({ 
                projectId: updatedProj.id, 
                studioName: state.studio.name, 
                weeklyRevenue: updatedProj.weeklyRevenue 
            });
        }

        // Project lifecycle headlines/events
        if (updatedProj.status === 'released' && p.status !== 'released') {
            if (!updatedProj.awardsProfile) {
                updatedProj.awardsProfile = generateAwardsProfile(updatedProj);
            }
            impact.newsEvents!.push({
                type: 'RELEASE',
                headline: `${updatedProj.title} Hits Theaters!`,
                description: `The highly anticipated "${updatedProj.title}" has officially released. Initial buzz is ${updatedProj.buzz}.`,
                impact: `Genre Trend Multiplier: ${trendMult.toFixed(2)}x`
            });
        }

        if (updatedProj.status === 'marketing' && p.status === 'production') {
            impact.newsEvents!.push({
                type: 'STUDIO_EVENT',
                headline: `${updatedProj.title} Wraps Production`,
                description: `Principal photography has concluded on "${updatedProj.title}". The film now moves into post-production and marketing preparation.`,
                impact: 'Wrap milestone reached'
            });
        }

        // Crisis generation
        if (updatedProj.status === 'production' && (!updatedProj.activeCrisis || updatedProj.activeCrisis.resolved)) {
            const crisisImpact = checkAndTriggerCrisis(updatedProj);
            if (crisisImpact) {
                // Merge into main impact
                if (crisisImpact.projectUpdates) impact.projectUpdates!.push(...crisisImpact.projectUpdates);
                if (crisisImpact.uiNotifications) impact.uiNotifications!.push(...crisisImpact.uiNotifications);
                
                // Update local variable for subsequent checks in this loop (e.g. director disputes)
                const crisisUpdate = crisisImpact.projectUpdates?.[0]?.update;
                if (crisisUpdate) {
                    Object.assign(updatedProj, crisisUpdate);
                }
            }
        }

        // Director disputes
        if (updatedProj.status === 'production') {
            const dirDisputeArgs = processDirectorDisputes(updatedProj, projectContracts, talentPoolMap);
            if (dirDisputeArgs.newCrises.length > 0 && (!updatedProj.activeCrisis || updatedProj.activeCrisis.resolved)) {
                updatedProj.activeCrisis = dirDisputeArgs.newCrises[0].crisis;
                impact.uiNotifications!.push(...dirDisputeArgs.updates);
            }
        }

        projectUpdatesMap.set(updatedProj.id, updatedProj);
    }

    // Apply Box Office Ranks
    const ranks = calculateBoxOfficeRanks(boxOfficeEntries);
    ranks.forEach((rank, projectId) => {
        const up = projectUpdatesMap.get(projectId);
        if (up) {
            up.boxOfficeRank = rank;
        }
    });

    // Convert map to projectUpdates array
    projectUpdatesMap.forEach((update, projectId) => {
        impact.projectUpdates!.push({ projectId, update });
    });

    return impact;
};

