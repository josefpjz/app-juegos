import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { GameStore } from './types';
import { createPlayerSlice } from './slices/playerSlice';
import { createTeamSlice } from './slices/teamSlice';
import { createMatchSlice } from './slices/matchSlice';
import { createBracketSlice } from './slices/bracketSlice';
import { createLeagueSlice } from './slices/leagueSlice';
import { createUISlice } from './slices/uiSlice';
import { saveState, loadState, setActiveGame } from './persistence';
import type { GameId } from './persistence';

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((...a) => ({
    ...createPlayerSlice(...a),
    ...createTeamSlice(...a),
    ...createMatchSlice(...a),
    ...createBracketSlice(...a),
    ...createLeagueSlice(...a),
    ...createUISlice(...a),
  }))
);

// Auto-save to localStorage (debounced)
let saveTimeout: ReturnType<typeof setTimeout>;
useGameStore.subscribe(
  (state) => state,
  (state) => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => saveState(state), 500);
  }
);

// Hydrate from localStorage for a specific game
export function hydrateStore(gameId?: GameId): boolean {
  if (gameId) setActiveGame(gameId);
  const saved = loadState(gameId);
  if (saved) {
    useGameStore.setState(saved);
    return true;
  }
  return false;
}
