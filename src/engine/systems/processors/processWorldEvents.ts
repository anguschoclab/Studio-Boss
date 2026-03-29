import { GameState, Headline, NewsEvent, Project, ActiveCrisis } from '@/engine/types';
import { advanceRivals } from '../rivals';
import { updateBuyers } from '../buyers';
import { TalentSystem } from '../TalentSystem';
import { groupContractsByProject, pick } from '../../utils';
import { generateHeadlines } from '../../generators/headlines';
import { runAwardsCeremony, processRazzies } from '../awards';
import { advanceTrends } from '../trends';
import { advanceMarketEvents } from '../marketEvents';
import { advanceRumors } from '../rumors';
import { resolveFestivals } from '../festivals';
import { advanceScandals, generateScandals } from '../scandals';

const EVENT_POOL = [
    'Market analysts upgrade entertainment sector outlook.',
    'A high-profile talent dispute makes industry headlines.',
    'Streaming platform announces major content budget increase.',
    'International box office sets new quarterly record.',
    'Film festival announces lineup — buzz is building.',
    'Regulators announce new content distribution guidelines.',
    'A viral social media trend boosts genre film interest.',
    'Nepotism debate dominates the weekly trades.',
    'Sibling duo announces unexpected co-production.',
    'Famous dynasty patriarch announces retirement.',
    'Former child star attempts a serious prestige comeback.',
    'Public family feud leaks during an awards press tour.'
];

export interface WeeklyChanges {
    projectUpdates: string[];
    events: string[];
    newHeadlines: Headline[];
    costs: number;
    revenue: number;
    newsEvents: Omit<NewsEvent, 'id' | 'week'>[];
}

export const processWorldEvents = (
    state: GameState,
    weeklyChanges: WeeklyChanges
): GameState => {
    const nextWeek = state.week + 1;

    // Simulate Rivals
    const { updatedRivals, newsEvents: rivalNewsEvents } = advanceRivals(state);
    weeklyChanges.newsEvents.push(...rivalNewsEvents);

    // Update Buyers
    const { updatedBuyers, newHeadlines: buyerHeadlines } = updateBuyers(state.market.buyers || [], nextWeek);

    const formattedBuyerHeadlines: Headline[] = new Array(buyerHeadlines.length);
    for (let i = 0; i < buyerHeadlines.length; i++) {
        formattedBuyerHeadlines[i] = {
            id: `bh-${crypto.randomUUID()}`,
            text: buyerHeadlines[i],
            week: nextWeek,
            category: 'market' as const,
        };
    }

    // Simulate Talent & Opportunities via TalentSystem
    const { updatedOpportunities: updatedOpportunitiesCopy, events: talentEvents } = TalentSystem.advance(state);
    weeklyChanges.events.push(...talentEvents);

    // Random World Events
    if (Math.random() < 0.2) {
        weeklyChanges.events.push(pick(EVENT_POOL));
    }
    if (Math.random() < 0.2) {
        weeklyChanges.events.push(pick(EVENT_POOL));
    }

    const newHeadlines = generateHeadlines(
        nextWeek, 
        updatedRivals, 
        state.studio.internal.projects, 
        state.studio.internal.contracts, 
        state.industry.talentPool
    );
    newHeadlines.push(...formattedBuyerHeadlines);

    const year = Math.floor(nextWeek / 52) + 1;
    const ceremonyResult = runAwardsCeremony(state, nextWeek, year);
    if (ceremonyResult.newsEvents) {
        weeklyChanges.newsEvents.push(...ceremonyResult.newsEvents);
    }

    let prestigeChange = ceremonyResult.prestigeChange;

    if (nextWeek % 52 === 4) {
        const razzies = processRazzies(state, nextWeek);
        if (razzies.projectUpdates.length > 0) {
            weeklyChanges.projectUpdates.push(...razzies.projectUpdates);
            weeklyChanges.newHeadlines.push(...razzies.newHeadlines);
            if (razzies.newsEvents) {
                weeklyChanges.newsEvents.push(...razzies.newsEvents);
            }
            prestigeChange -= razzies.studioPrestigePenalty;

            if (razzies.cultClassicProjectIds.length > 0) {
                for (const p of state.studio.internal.projects) {
                    if (razzies.cultClassicProjectIds.includes(p.id)) {
                        p.isCultClassic = true;
                    }
                }
            }

            if (razzies.razzieWinnerTalentIds.length > 0) {
                for (const t of state.industry.talentPool) {
                    if (razzies.razzieWinnerTalentIds.includes(t.id)) {
                        t.hasRazzie = true;
                        const relatedProject = state.studio.internal.projects.find(p => p.id === razzies.cultClassicProjectIds[0]);
                        if (relatedProject && !relatedProject.activeCrisis) {
                            relatedProject.activeCrisis = {
                                description: `The Razzies have destroyed ${t.name}'s ego. They are having a meltdown on set of their next project, or refusing to promote this one.`,
                                resolved: false,
                                severity: 'high',
                                options: [
                                    { text: 'Apologize for being "misunderstood"', effectDescription: 'Lose 10 buzz.', buzzPenalty: 10 },
                                    { text: 'Ignore the noise', effectDescription: 'Lose $500k in PR damage.', cashPenalty: 500000 }
                                ]
                            };
                            weeklyChanges.events.push(`CRISIS: "${relatedProject.title}" - ${relatedProject.activeCrisis.description}`);
                        }
                    }
                }
            }
        }
    }

    const newAwards = ceremonyResult.newAwards;

    if (newAwards.length > 0) {
        weeklyChanges.projectUpdates.push(...ceremonyResult.projectUpdates);
        const uniqueBodiesSet = new Set<string>();
        for (let i = 0; i < newAwards.length; i++) {
            uniqueBodiesSet.add(newAwards[i].body);
        }
        const uniqueBodies = Array.from(uniqueBodiesSet);
        weeklyChanges.events.push(`The ${uniqueBodies.join(' and ')} took place this week!`);
    }

    let newState: GameState = {
        ...state,
        market: {
            ...state.market,
            opportunities: updatedOpportunitiesCopy,
            buyers: updatedBuyers,
            trends: state.market.trends ? advanceTrends(state.market.trends) : [],
        },
        studio: {
            ...state.studio,
            prestige: state.studio.prestige + prestigeChange
        },
        industry: {
            ...state.industry,
            rivals: updatedRivals,
            awards: (() => {
                const oldAwards = state.industry.awards || [];
                const combined = new Array(oldAwards.length + newAwards.length);
                for (let i = 0; i < oldAwards.length; i++) combined[i] = oldAwards[i];
                for (let i = 0; i < newAwards.length; i++) combined[oldAwards.length + i] = newAwards[i];
                return combined;
            })(),
            newsHistory: [
                ...weeklyChanges.newsEvents.map(ne => ({
                    ...ne,
                    id: `ne-${crypto.randomUUID()}`,
                    week: nextWeek
                })),
                ...(state.industry.newsHistory || [])
            ].slice(0, 100),
            headlines: (() => {
                const oldHeadlines = state.industry.headlines || [];
                const totalLen = Math.min(50, newHeadlines.length + oldHeadlines.length);
                const combined = new Array(totalLen);
                let idx = 0;
                for (let i = 0; i < newHeadlines.length && idx < 50; i++) combined[idx++] = newHeadlines[i];
                for (let i = 0; i < oldHeadlines.length && idx < 50; i++) combined[idx++] = oldHeadlines[i];
                return combined;
            })()
        }
    };

    newState = advanceMarketEvents(newState);
    newState = advanceRumors(newState);
    newState = resolveFestivals(newState);
    newState = advanceScandals(newState);
    
    const scandalResult = generateScandals(newState);
    if (scandalResult.newScandals.length > 0) {
        const oldScandals = newState.industry.scandals || [];
        const combinedScandals = new Array(oldScandals.length + scandalResult.newScandals.length);
        for(let i = 0; i < oldScandals.length; i++) combinedScandals[i] = oldScandals[i];
        for(let i = 0; i < scandalResult.newScandals.length; i++) combinedScandals[oldScandals.length + i] = scandalResult.newScandals[i];

        newHeadlines.push(...scandalResult.headlines);
        
        // ⚡ Bolt: Optimize scandal project updates by pre-indexing updates and using O(n) mapping for immutability
        const updatesMap = new Map<string, ActiveCrisis>();
        for (const update of scandalResult.projectUpdates) {
            if (!updatesMap.has(update.projectId)) {
                updatesMap.set(update.projectId, update.crisis);
            }
        }

        const currentProjects = newState.studio.internal.projects;
        let updatedProjects = currentProjects;

        if (updatesMap.size > 0) {
            updatedProjects = new Array(currentProjects.length);
            for (let i = 0; i < currentProjects.length; i++) {
                const p = currentProjects[i];
                const crisis = updatesMap.get(p.id);
                if (crisis && !p.activeCrisis) {
                    weeklyChanges.events.push(`CRISIS: "${p.title}" - ${crisis.description}`);
                    updatedProjects[i] = { ...p, activeCrisis: crisis };
                } else {
                    updatedProjects[i] = p;
                }
            }
        }

        newState = {
            ...newState,
            industry: {
                ...newState.industry,
                scandals: combinedScandals
            },
            studio: {
                ...newState.studio,
                internal: {
                    ...newState.studio.internal,
                    projects: updatedProjects
                }
            }
        };
    }

    weeklyChanges.newHeadlines.push(...newHeadlines);

    return newState;
};
