import { GameState, Project } from '@/engine/types';
import { advanceRivals } from '../rivals';
import { updateBuyers } from '../buyers';
import { TalentSystem } from '../TalentSystem';
import { pick, secureRandom } from '../../utils';
import { generateHeadlines } from '../../generators/headlines';
import { runAwardsCeremony, processRazzies } from '../awards';
import { advanceTrends } from '../trends';
import { advanceMarketEvents } from '../marketEvents';
import { advanceRumors } from '../rumors';
import { resolveFestivals } from '../festivals';
import { advanceScandals, generateScandals } from '../scandals';
import { StateImpact } from '../../types/state.types';
import { mergeImpacts } from '../../utils/impactUtils';

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

/**
 * processWorldEvents simulates the behavior of the world outside the studio.
 * Returns a StateImpact representing all industrial shifts, rivals, talent, and awards.
 */
export const processWorldEvents = (
    state: GameState
): StateImpact => {
    const nextWeek = state.week + 1;

    // 1. Rivals & Buyers
    const rivalImpact = advanceRivals(state);
    const buyerImpact = updateBuyers(state.market.buyers || [], nextWeek);

    // 2. Talent & Opportunities
    const talentImpact = TalentSystem.advance(state);

    // 3. Trends & Market
    const trendImpact = state.market.trends ? advanceTrends(state.market.trends) : {};
    const marketEventImpact = advanceMarketEvents(state);

    // 4. Industry Scandals & Rumors
    const rumorImpact = advanceRumors(state);
    const scandalDecayImpact = advanceScandals(state);
    const newScandalImpact = generateScandals(state);

    // 5. Festivals & Live Events
    const festivalImpact = resolveFestivals(state);

    // 6. Awards Ceremony Logic
    const year = Math.floor(nextWeek / 52) + 1;
    const ceremonyImpact = runAwardsCeremony(state, nextWeek, year);
    
    // Razzies occur once a year
    let razzieImpact: StateImpact = {};
    if (nextWeek % 52 === 4) {
        razzieImpact = processRazzies(state, nextWeek);
    }

    // 7. General News & Random Events
    const globalImpact: StateImpact = {
        uiNotifications: [],
        newHeadlines: []
    };

    if (secureRandom() < 0.2) globalImpact.uiNotifications!.push(pick(EVENT_POOL));
    if (secureRandom() < 0.2) globalImpact.uiNotifications!.push(pick(EVENT_POOL));

    // Headlines generation (Requires the state to still be the old one, but uses the updated lists for context)
    // Note: We use the *updated* lists internally for context if possible, but keep it simple
    const dynamicHeadlines = generateHeadlines(
        nextWeek, 
        state.industry.rivals, // We haven't applied rivalImpact yet, but it's fine for headlines
        Object.values(state.studio.internal.projects),
        state.studio.internal.contracts, 
        Object.values(state.industry.talentPool)
    );
    globalImpact.newHeadlines = dynamicHeadlines.map(h => ({
        week: nextWeek,
        category: h.category,
        text: h.text
    }));

    // 8. Merge all impacts into a single result
    return mergeImpacts(
        rivalImpact,
        buyerImpact,
        talentImpact,
        trendImpact,
        marketEventImpact,
        rumorImpact,
        scandalDecayImpact,
        newScandalImpact,
        festivalImpact,
        ceremonyImpact,
        razzieImpact,
        globalImpact
    );
};
