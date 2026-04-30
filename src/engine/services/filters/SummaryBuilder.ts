import { GameState, WeekSummary } from '../../types';
import { TickContext } from './types';

/**
 * Summary Builder
 * Builds the weekly summary from state changes and impacts
 */
export const SummaryBuilder = {
  /**
   * Build a week summary from before/after states and context impacts
   */
  build(before: GameState, after: GameState, context: TickContext): WeekSummary {
    const allHeadlines: import('../../types/engine.types').Headline[] = [];
    const newsEvents: import('../../types/engine.types').NewsEvent[] = [];
    
    let ledgerImpact: import('../../types/state.types').StateImpact | undefined;
    // ⚡ The Framerate Fanatic: Refactored array .push() and Set conversion to direct Set accumulation, improving performance from O(n^2) to O(n).
    const projectUpdates = new Set<string>();

    for (let i = 0; i < context.impacts.length; i++) {
      const impact = context.impacts[i];

      if (impact.type === 'LEDGER_UPDATED') ledgerImpact = impact;
      
      if (impact.type === 'PROJECT_UPDATED') {
        const payload = impact.payload as import('../../types/state.types').ProjectUpdate;
        projectUpdates.add(payload.projectId);
      }
      if (impact.projectUpdates) {
        for (let j = 0; j < impact.projectUpdates.length; j++) {
          projectUpdates.add(impact.projectUpdates[j].projectId);
        }
      }

      if (impact.type === 'NEWS_ADDED') {
        const payload = impact.payload as import('../../types/state.types').NewsImpact;
        allHeadlines.push({
          id: context.rng.uuid('NWS'),
          text: payload.headline || 'Breaking News',
          week: context.week,
          category: payload.category || 'general',
          publication: payload.publication || 'Variety'
        });
      }
      
      if (impact.newHeadlines) {
        for (let j = 0; j < impact.newHeadlines.length; j++) {
          allHeadlines.push(impact.newHeadlines[j]);
        }
      }
      if (impact.newsEvents) {
        for (let j = 0; j < impact.newsEvents.length; j++) {
          newsEvents.push(impact.newsEvents[j]);
        }
      }
    }

    for (let i = 0; i < newsEvents.length; i++) {
       const e = newsEvents[i];
       allHeadlines.push({
         id: e.id,
         text: `${e.headline}: ${e.description}`,
         week: e.week || context.week,
         category: (e.type?.toLowerCase() === 'crisis' ? 'talent' : 'general') as import('../../types/engine.types').HeadlineCategory
       });
    }

    let totalRevenue = 0;
    let totalCosts = 0;

    if (ledgerImpact && ledgerImpact.type === 'LEDGER_UPDATED') {
       const report = ledgerImpact.payload.report;
       totalRevenue = report.revenue.boxOffice + report.revenue.distribution + report.revenue.other;
       totalCosts = report.expenses.production + report.expenses.marketing + report.expenses.overhead + report.expenses.pacts;
    }

    const eventTitles: string[] = [];
    for (let i = 0; i < context.events.length; i++) {
      eventTitles.push(context.events[i].title);
    }

    return {
      id: context.rng.uuid('WSM'),
      fromWeek: before.week,
      toWeek: after.week,
      cashBefore: before.finance.cash,
      cashAfter: after.finance.cash,
      totalRevenue,
      totalCosts,
      projectUpdates: Array.from(projectUpdates),
      newHeadlines: allHeadlines,
      events: eventTitles,
    };
  }
}
