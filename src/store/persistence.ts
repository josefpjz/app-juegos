import type { GameStore } from './types';

export type GameId = 'password' | 'beerpong';

const STORAGE_KEYS: Record<GameId, string> = {
  password: 'inngames-password-state',
  beerpong: 'inngames-beerpong-state',
};

// Module-level active game — set before save/load operations
let _activeGame: GameId = 'password';

export function setActiveGame(id: GameId): void {
  _activeGame = id;
}

export function getActiveGame(): GameId {
  return _activeGame;
}

// Keys to persist (exclude functions, only data)
const PERSIST_KEYS: string[] = [
  'players', 'teams', 'teamsConfirmed', 'loans',
  'matches', 'currentMatchId', 'gameplay',
  'bracketRounds', 'repechageMatches', 'diceResults',
  'thirdPlaceMatch', 'enableThirdPlace',
  'leagueConfig', 'leagueMatches', 'standings', 'playoffRounds',
  'theme', 'gamePhase', 'gameMode', 'timerDuration',
];

export function saveState(state: GameStore): void {
  try {
    const data: Record<string, unknown> = {};
    for (const key of PERSIST_KEYS) {
      data[key] = (state as unknown as Record<string, unknown>)[key];
    }
    localStorage.setItem(STORAGE_KEYS[_activeGame], JSON.stringify(data));
  } catch {
    // localStorage might be full or unavailable
  }
}

export function loadState(gameId?: GameId): Partial<GameStore> | null {
  try {
    const key = STORAGE_KEYS[gameId ?? _activeGame];
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<GameStore>;
  } catch {
    return null;
  }
}

export function clearSavedState(gameId?: GameId): void {
  localStorage.removeItem(STORAGE_KEYS[gameId ?? _activeGame]);
}

export function hasSavedState(gameId?: GameId): boolean {
  return localStorage.getItem(STORAGE_KEYS[gameId ?? _activeGame]) !== null;
}
