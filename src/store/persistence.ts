import type { GameStore } from './types';

const STORAGE_KEY = 'password-game-state';

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage might be full or unavailable
  }
}

export function loadState(): Partial<GameStore> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<GameStore>;
  } catch {
    return null;
  }
}

export function clearSavedState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function hasSavedState(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}
