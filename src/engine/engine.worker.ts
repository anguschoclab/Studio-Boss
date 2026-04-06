import { initializeGame } from './core/gameInit';
import { advanceWeek } from './core/weekAdvance';
import { RandomGenerator } from './utils/rng';
import { GameState, ArchetypeKey } from './types';

/**
 * Universal Simulation Engine Worker
 * Offloads heavy simulation ticks and data parsing from the main UI thread.
 */

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'INIT_GAME': {
      const { studioName, archetype, seed } = payload;
      const gameState = initializeGame(studioName, archetype as ArchetypeKey, seed);
      self.postMessage({ type: 'INIT_RESULT', payload: gameState });
      break;
    }

    case 'ADVANCE_WEEK': {
      const { state } = payload;
      const rng = new RandomGenerator(state.rngState ?? state.gameSeed);
      const { newState, summary, impacts } = advanceWeek(state as GameState, rng);
      newState.rngState = rng.getState();
      self.postMessage({ type: 'ADVANCE_RESULT', payload: { newState, summary, impacts } });
      break;
    }

    default:
      console.warn('[EngineWorker] Unknown message type:', type);
  }
};
