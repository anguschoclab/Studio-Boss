import { GameState } from '@/engine/types';
import { groupContractsByProject } from '../../utils';
import { advanceProject } from '../projects';
import { checkAndTriggerCrisis } from '../crises';
import { generateAwardsProfile } from '../awards';
import { calculateBoxOfficeRanks, BoxOfficeEntry } from '../releaseSimulation';
import { processDirectorDisputes } from '../directors';
import { getTrendMultiplier } from '../trends';
import { StateImpact } from '../../types/state.types';

/**
 * processProduction simulates the weekly advancement of all studio projects.
 * Returns a StateImpact to be applied by the unified simulation pipeline.
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

    // O(1) lookup map for talent
    const talentPool = state.industry.talentPool;

    let rivalStrengthSum = 0;
    const rivals = state.industry.rivals || [];
    for (let i = 0; i < rivals.length; i++) {
        rivalStrengthSum += rivals[i].strength;
    }
    const rivalAvgStrength = rivalStrengthSum / Math.max(1, rivals.length);

    const awardsByProject = new Map<string, unknown[]>();
    const awards = state.industry.awards || [];
    for (let i = 0; i < awards.length; i++) {
        const a = awards[i];
        if (!awardsByProject.has(a.projectId)) awardsByProject.set(a.projectId, []);
        awardsByProject.get(a.projectId)!.push(a);
    }

    const boxOfficeEntries: BoxOfficeEntry[] = [];

    // Create map once outside the loop instead of inside per project to avoid repeated Map allocations
    const talentMap = new Map(Object.entries(talentPool));
    const projects = state.studio.internal.projects;

    // O(N) iteration over projects Record
    for (const key in projects) {
        const p = projects[key];
        if (p.activeCrisis && !p.activeCrisis.resolved) {
            impact.uiNotifications!.push(`"${p.title}" production is halted until the active crisis is resolved.`);
            continue;
        }

        const projectContracts = contractsByProject.get(p.id) || [];
        const trendMult = getTrendMultiplier(p, state);
        
        // advanceProject returns a new copy and the update log
        const { project: updatedProj, update: logMessage, talentUpdates } = advanceProject(
            p, 
            nextWeek, 
            state.studio.prestige, 
            projectContracts, 
            talentMap,
            rivalAvgStrength, 
            awardsByProject.get(p.id) || [],
            trendMult
        );

        if (logMessage) impact.uiNotifications!.push(logMessage);
        
        // Accumulate talent updates
        talentUpdates?.forEach(t => {
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

        // Project lifecycle events
        if (updatedProj.status === 'released' && p.status !== 'released') {
            if (!updatedProj.awardsProfile) {
                updatedProj.awardsProfile = generateAwardsProfile(updatedProj);
            }
            impact.newsEvents!.push({
                type: 'RELEASE',
                headline: `${updatedProj.title} Hits Theaters!`,
                description: `The highly anticipated "${updatedProj.title}" has officially released. Initial buzz is ${updatedProj.buzz}.`,
            });
        }

        if (updatedProj.status === 'marketing' && p.status === 'production') {
            impact.newsEvents!.push({
                type: 'STUDIO_EVENT',
                headline: `${updatedProj.title} Wraps Production`,
                description: `Principal photography has concluded on "${updatedProj.title}". The film now moves into post-production and marketing preparation.`,
            });
        }

        // Crisis generation
        if (updatedProj.status === 'production' && (!updatedProj.activeCrisis || updatedProj.activeCrisis.resolved)) {
            const crisisImpact = checkAndTriggerCrisis(updatedProj);
            if (crisisImpact) {
                if (crisisImpact.projectUpdates) impact.projectUpdates!.push(...crisisImpact.projectUpdates);
                if (crisisImpact.uiNotifications) impact.uiNotifications!.push(...crisisImpact.uiNotifications);
                
                // Update local copy for subsequent checks
                const crisisUpdate = crisisImpact.projectUpdates?.[0]?.update;
                if (crisisUpdate) Object.assign(updatedProj, crisisUpdate);
            }
        }

        // Director disputes
        if (updatedProj.status === 'production') {
            const dirDisputeArgs = processDirectorDisputes(updatedProj, projectContracts, talentMap);
            if (dirDisputeArgs.newCrises.length > 0 && (!updatedProj.activeCrisis || updatedProj.activeCrisis.resolved)) {
                updatedProj.activeCrisis = dirDisputeArgs.newCrises[0].crisis;
                impact.uiNotifications!.push(...dirDisputeArgs.updates);
            }
        }

        impact.projectUpdates!.push({ projectId: updatedProj.id, update: updatedProj });
    }

    // Apply Box Office Ranks
    const ranks = calculateBoxOfficeRanks(boxOfficeEntries);
    impact.projectUpdates!.forEach(up => {
        const rank = ranks.get(up.projectId);
        if (rank !== undefined) {
            up.update.boxOfficeRank = rank;
        }
    });

    return impact;
};
