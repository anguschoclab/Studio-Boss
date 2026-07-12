import { MarketState, StateImpact } from "../../types/state.types";
import { Headline } from "../../types/engine.types";
import { GameState } from "../../types/studio.types";
import { clamp, rand, generateId } from "../../utils";

/**
 * Global Market Simulation: Interest Rate Simulator.
 * Handles the background "Economy" that dictates yields and debt costs.
 */
export class InterestRateSimulator {
  private static BASE_RATE_MIN = 0.0025; // 0.25%
  private static BASE_RATE_MAX = 0.15; // 15.0%
  private static VOLATILITY = 0.0015; // 0.15% max move per week

  /**
   * Initializes the market state if it doesn't exist.
   */
  static initialize(): MarketState {
    const baseRate = 0.045; // Start at 4.5%
    return {
      baseRate,
      savingsYield: baseRate - 0.02, // 2.5%
      debtRate: baseRate + 0.05, // 9.5%
      loanRate: baseRate + 0.025, // 7.0%
      rateHistory: [{ week: 1, rate: baseRate }],
    };
  }

  /**
   * Converts a week number into a readable Year/Month structure.
   */
  static getWeekDisplay(week: number): { year: number; month: number; weekInMonth: number } {
    const year = Math.floor((week - 1) / 52) + 1;
    const remainingWeeks = (week - 1) % 52;
    const month = Math.floor(remainingWeeks / 4) + 1;
    const weekInMonth = (remainingWeeks % 4) + 1;
    return { year, month, weekInMonth };
  }

  /**
   * Weekly Tick: Fluctuates the base rate and derives other rates.
   */
  static advance(state: GameState): StateImpact {
    const market = state.finance.marketState || this.initialize();
    const currentRate = market.baseRate;

    // Random Walk
    const delta = (rand() - 0.5) * this.VOLATILITY;
    const newRate = clamp(currentRate + delta, this.BASE_RATE_MIN, this.BASE_RATE_MAX);

    const updatedMarket: MarketState = {
      ...market,
      baseRate: newRate,
      savingsYield: Math.max(0.001, newRate - 0.02),
      debtRate: newRate + 0.05,
      loanRate: newRate + 0.025,
      rateHistory: [...market.rateHistory, { week: state.week, rate: newRate }].slice(-52), // Keep 1 year of history
    };

    const impact: StateImpact = {
      type: "MARKET_EVENT_UPDATED",
      payload: { marketState: updatedMarket },
    };

    // Headline generation for significant shifts
    if (rand() < 0.05) {
      // 5% chance of a "Market Analysis" headline
      const trend = newRate > currentRate ? "rising" : "falling";
      impact.newHeadlines = [
        {
          id: generateId("HL"),
          week: state.week,
          category: "market",
          text: `Market Brief: Interest rates are ${trend} as the global economy shifts.`,
        } as Headline,
      ];
    }

    return impact;
  }
}
