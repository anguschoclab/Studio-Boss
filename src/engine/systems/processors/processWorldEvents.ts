import { GameState, Headline, NewsEvent, Project, ActiveCrisis } from '@/engine/types';
import { StateImpact } from '../../types/state.types';
import { mergeImpacts } from '../../utils/impactUtils';
import { advanceRivals } from '../rivals';
import { updateBuyers } from '../buyers';
import { TalentSystem } from '../TalentSystem';
import { groupContractsByProject, pick, secureRandom } from '../../utils';
import { generateHeadlines } from '../../generators/headlines';
import { runAwardsCeremony, processRazzies } from '../awards';
import { advanceTrends } from '../trends';
import { advanceMarketEvents } from '../marketEvents';
import { advanceRumors } from '../rumors';
import { resolveFestivals } from '../festivals';
import { advanceScandals, generateScandals } from '../scandals';
import { WORLD_EVENT_POOL } from '../../data/worldEvents.data';

/**
 * processWorldEvents orchestrates all simulated events in the game world 
 * outside of the studio's direct production pipeline.
 * Returns a StateImpact for unified pipeline application.
 */
export const processWorldEvents = (
    state: GameState
): StateImpact => {
    const nextWeek = state.week + 1;
    const year = Math.floor(nextWeek / 52) + 1;

    // Aggregate sub-system impacts
    const rivalImpact = advanceRivals(state);
    const buyerImpact = updateBuyers(state.market.buyers || [], nextWeek);
    const talentImpact = TalentSystem.advance(state);
    const trendImpact = state.market.trends ? advanceTrends(state.market.trends) : {};
    const marketEventImpact = advanceMarketEvents(state);
    const rumorImpact = advanceRumors(state);
    const festivalImpact = resolveFestivals(state);
    const scandalAdvanceImpact = advanceScandals(state);
    const scandalGenImpact = generateScandals(state);
    const awardsImpact = runAwardsCeremony(state, nextWeek, year);
    
    // Process Razzies (Annual event in week 4)
    let razzieImpact: StateImpact = {};
    if (nextWeek % 52 === 4) {
        razzieImpact = processRazzies(state, nextWeek);
    }

    // Random generic world events for the "events" notification list
    const genericEvents: string[] = [];
    if (secureRandom() < 0.2) genericEvents.push(pick(WORLD_EVENT_POOL));
    if (secureRandom() < 0.2) genericEvents.push(pick(WORLD_EVENT_POOL));

    // Generate industry headlines
    const proceduralHeadlines = generateHeadlines(
        nextWeek, 
        state.industry.rivals, 
        state.studio.internal.projects, 
        state.studio.internal.contracts, 
        state.industry.talentPool
    );

    const proceduralHeadlineImpact: StateImpact = {
        newHeadlines: proceduralHeadlines.map(h => ({
            ...h,
            id: h.id || `h-${crypto.randomUUID()}`,
            week: nextWeek
        })),
        uiNotifications: genericEvents
    };

    // Merge all impacts into one megalithic result
    return mergeImpacts(
        rivalImpact,
        buyerImpact,
        talentImpact,
        trendImpact,
        marketEventImpact,
        rumorImpact,
        festivalImpact,
        scandalAdvanceImpact,
        scandalGenImpact,
        awardsImpact,
        razzieImpact,
        proceduralHeadlineImpact
    );
};
