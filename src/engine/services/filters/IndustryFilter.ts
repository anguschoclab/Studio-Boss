import { GameState } from '../../types';
import { TickContext, WeekFilter } from './types';

// System Imports
import { advanceRivals } from '../../systems/rivals';
import { runAwardsCeremony, processRazzies } from '../../systems/awards';
import { resolveFestivals } from '../../systems/festivals';
import { RegulatorSystem } from '../../systems/industry/RegulatorSystem';
import { runFestivalMarket } from '../../systems/festivals/festivalAuctionEngine';
import { runUpfronts } from '../../systems/television/upfrontsEngine';
import { AnnualScans } from './AnnualScans';
import { InterestRateSimulator } from '../../systems/market/InterestRateSimulator';

/**
 * Industry Filter
 * Handles industry-wide events including rival advancement, awards, festivals, and annual scans
 */
export class IndustryFilter implements WeekFilter {
  name = 'IndustryFilter';

  execute(state: GameState, context: TickContext): void {
    // Advance rival studios (cash, strength, revenue, poaching)
    const rivalImpacts = advanceRivals(context.rng, state);
    context.impacts.push(rivalImpacts);

    const { year } = InterestRateSimulator.getWeekDisplay(context.week);
    const awardsImpacts = runAwardsCeremony(state, context.week, year, context.rng);
    context.impacts.push(...awardsImpacts);
    
    const allNewAwards = awardsImpacts.reduce((acc, imp) => [...acc, ...(imp.newAwards || [])], [] as import('../../types').Award[]);
    
    if (allNewAwards.length > 0) {
      context.impacts.push({
        type: 'MODAL_TRIGGERED',
        payload: {
          modalType: 'AWARDS',
          priority: 50,
          payload: { 
            week: context.week,
            year,
            awards: allNewAwards,
            body: allNewAwards[0]?.body || 'Annual Industry Awards'
          }
        }
      });
    }
    
    const weekDisplay = context.week % 52 === 0 ? 52 : context.week % 52;
    if (weekDisplay === 4) {
      context.impacts.push(...processRazzies(state, context.week, context.rng));
    }

    context.impacts.push(...resolveFestivals(state, context.rng));
    context.impacts.push(...RegulatorSystem.tick(state, context.rng));

    // Festival market auction at Sundance (w4), Cannes (w20), TIFF (w36)
    const weekOfYear = context.week % 52 || 52;
    if (weekOfYear === 4 || weekOfYear === 20 || weekOfYear === 36) {
      context.impacts.push(...runFestivalMarket(state, context.rng));
    }

    // Upfronts — week 20 of each year
    if (weekOfYear === 20) {
      context.impacts.push(...runUpfronts(state, context.rng));
    }

    // Annual scans
    AnnualScans.execute(state, context);
  }
}
