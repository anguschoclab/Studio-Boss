import { MarketState, StateImpact } from '../../types/state.types';
import { Headline } from '../../types/engine.types';
import { GameState } from '../../types/studio.types';
import { clamp } from '../../utils';
import { RandomGenerator } from '../../utils/rng';

/**
 * Global Market Simulation: Interest Rate Simulator.
 * Handles the background "Economy" that dictates yields and debt costs.
 */
export class InterestRateSimulator {
  private static BASE_RATE_MIN = 0.0025; // 0.25%
  private static BASE_RATE_MAX = 0.15;   // 15.0%
  private static VOLATILITY = 0.0015;    // 0.15% max move per week

  /**
   * Initializes the market state if it doesn't exist.
   */
  static initialize(): MarketState {
    const baseRate = 0.045; // Start at 4.5%
    return {
      baseRate,
      savingsYield: baseRate - 0.02, // 2.5%
      debtRate: baseRate + 0.05,     // 9.5%
      loanRate: baseRate + 0.025,    // 7.0%
      rateHistory: [{ week: 1, rate: baseRate }],
      sentiment: 50,
      cycle: 'STABLE'
    };
  }

  /**
   * Weekly Tick: Fluctuates the base rate and derives other rates.
   */
  static advance(state: GameState, rng: RandomGenerator): StateImpact {
    const market = state.finance.marketState || this.initialize();
    const currentRate = market.baseRate;
    
    // Random Walk
    const delta = ((rng && rng.next ? rng.next() : Math.random()) - 0.5) * this.VOLATILITY;
    const newRate = clamp(currentRate + delta, this.BASE_RATE_MIN, this.BASE_RATE_MAX);
    
    const updatedMarket: MarketState = {
      ...market,
      baseRate: newRate,
      savingsYield: Math.max(0.001, newRate - 0.02),
      debtRate: newRate + 0.05,
      loanRate: newRate + 0.025,
      rateHistory: [
        ...market.rateHistory,
        { week: state.week, rate: newRate }
      ].slice(-52) // Keep 1 year of history
    };

    const impact: StateImpact = {
      type: 'MARKET_EVENT_UPDATED',
      payload: { marketState: updatedMarket }
    };

    // Headline generation for significant shifts (cumulative > 0.5% shift or crossing thresholds)
    if (Math.abs(newRate - currentRate) > 0.001) {
       // Only add a headline if it's a "big" enough weekly move (rare for random walk, usually via events)
       // But for now, let's just trigger a notification if we hit historical highs/lows
    }

    if ((rng && rng.next ? rng.next() : Math.random()) < 0.05) { // 5% chance of a "Market Analysis" headline
      const trend = newRate > currentRate ? 'rising' : 'falling';
      impact.newHeadlines = [{
        id: crypto.randomUUID(),
        week: state.week,
        category: 'market',
        text: `Market Brief: Interest rates are ${trend} as the global economy shifts.`
      } as Headline];
    }

    return impact;
  }

  /**
   * Helper: Returns week and year for display.
   */
  static getWeekDisplay(week: number): { week: number; year: number } {
    const year = Math.floor((week - 1) / 52) + 1;
    const weekInYear = ((week - 1) % 52) + 1;
    return { week: weekInYear, year };
  }
}
