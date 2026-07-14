import { GameState } from "../../types";
import { TickContext, WeekFilter } from "./types";

// System Imports
import { advanceRumors } from "../../systems/rumors";
import { advanceDeals } from "../../systems/deals";

/**
 * Media Filter
 * Handles rumors and deal advancement
 */
export const MediaFilter: WeekFilter = {
  name: "MediaFilter",

  execute(state: GameState, context: TickContext): void {
    context.impacts.push(advanceRumors(state));

    // Process all active first-look deals
    const firstLookDeals = state.studio.internal?.firstLookDeals;
    if (firstLookDeals && firstLookDeals.length > 0) {
      const dealImpacts = advanceDeals(firstLookDeals);
      dealImpacts.forEach((i) => context.impacts.push(i));
    }
  },
};
