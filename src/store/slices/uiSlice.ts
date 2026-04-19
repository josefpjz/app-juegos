import type { StateCreator } from 'zustand';
import type { GameStore, UISlice } from '../types';
import type { GameMode, GamePhase, ThemeMode } from '../../types';

export const createUISlice: StateCreator<GameStore, [], [], UISlice> = (set) => ({
  theme: (typeof window !== 'undefined' && localStorage.getItem('password-theme') as ThemeMode) || 'dark',
  gamePhase: 'home',
  gameMode: null,
  gameId: 'password',
  timerDuration: 60,

  toggleTheme: () =>
    set((state) => {
      const next: ThemeMode = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('password-theme', next);
      return { theme: next };
    }),

  setGamePhase: (phase: GamePhase) => set({ gamePhase: phase }),

  setGameMode: (mode: GameMode) => set({ gameMode: mode }),

  setGameId: (id) => set({ gameId: id }),

  resetGame: () =>
    set({
      players: [],
      teams: [],
      teamsConfirmed: false,
      matches: [],
      currentMatchId: null,
      gameplay: {
        currentMatchId: null,
        currentTeamId: null,
        currentRound: 1,
        currentWord: null,
        wordsUsed: [],
        roundScore: 0,
        roundSkips: 0,
        isPlaying: false,
        timerSeconds: 60,
        roundsCompleted: [],
      },
      bracketRounds: [],
      repechageMatches: [],
      diceResults: [],
      thirdPlaceMatch: null,
      enableThirdPlace: false,
      leagueConfig: { type: 'points', playoffSize: 4 },
      leagueMatches: [],
      standings: [],
      playoffRounds: [],
      gamePhase: 'home',
      gameMode: null,
      loans: [],
    }),

  setTimerDuration: (seconds: number) => set({ timerDuration: seconds }),
});
