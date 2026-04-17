import type { StateCreator } from 'zustand';
import type { GameStore, MatchSlice } from '../types';
import type { RoundScore } from '../../types';

const initialGameplay = {
  currentMatchId: null,
  currentTeamId: null,
  currentRound: 1,
  currentWord: null,
  wordsUsed: [] as string[],
  roundScore: 0,
  roundSkips: 0,
  isPlaying: false,
  timerSeconds: 60,
  roundsCompleted: [] as RoundScore[],
};

export const createMatchSlice: StateCreator<GameStore, [], [], MatchSlice> = (set, get) => ({
  matches: [],
  currentMatchId: null,
  gameplay: { ...initialGameplay },

  setCurrentMatch: (matchId) =>
    set({
      currentMatchId: matchId,
      gameplay: { ...initialGameplay, currentMatchId: matchId, timerSeconds: get().timerDuration },
    }),

  startRound: (teamId, round) =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        currentTeamId: teamId,
        currentRound: round,
        roundScore: 0,
        roundSkips: 0,
        isPlaying: true,
        timerSeconds: state.timerDuration,
        currentWord: null,
      },
    })),

  recordPoint: () =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        roundScore: state.gameplay.roundScore + 1,
      },
    })),

  skipWord: () =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        roundSkips: state.gameplay.roundSkips + 1,
      },
    })),

  finishRound: (penalties) => {
    const { gameplay } = get();
    const roundScore: RoundScore = {
      roundNumber: gameplay.currentRound,
      points: Math.max(0, gameplay.roundScore - penalties),
      penalties,
      wordsCorrect: gameplay.roundScore,
      wordsSkipped: gameplay.roundSkips,
    };
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        isPlaying: false,
        roundsCompleted: [...state.gameplay.roundsCompleted, roundScore],
      },
    }));
  },

  resetCurrentRound: () =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        roundScore: 0,
        roundSkips: 0,
        isPlaying: false,
        timerSeconds: state.timerDuration,
        currentWord: null,
      },
    })),

  completeMatch: () => {
    const { gameplay, matches, currentMatchId } = get();
    if (!currentMatchId) return;

    const roundsCompleted = gameplay.roundsCompleted;
    // Split rounds: team1 played rounds at indices 0,1; team2 at 2,3
    // Actually each team plays 2 rounds interleaved
    const match = matches.find((m) => m.id === currentMatchId);
    if (!match) return;

    const team1Scores = roundsCompleted.filter(
      (_, i) => i % 2 === 0
    ).slice(0, 2);
    const team2Scores = roundsCompleted.filter(
      (_, i) => i % 2 === 1
    ).slice(0, 2);

    const team1Total = team1Scores.reduce((sum, s) => sum + s.points, 0);
    const team2Total = team2Scores.reduce((sum, s) => sum + s.points, 0);

    const winnerId =
      team1Total > team2Total
        ? match.team1Id
        : team2Total > team1Total
          ? match.team2Id
          : null; // draw

    set((state) => ({
      matches: state.matches.map((m) =>
        m.id === currentMatchId
          ? {
            ...m,
            result: {
              team1Scores,
              team2Scores,
              team1Total,
              team2Total,
              winnerId,
            },
          }
          : m
      ),
      gameplay: { ...initialGameplay },
      currentMatchId: null,
    }));
  },

  setWord: (word) =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        currentWord: word,
        wordsUsed: [...state.gameplay.wordsUsed, word],
      },
    })),

  decrementTimer: () =>
    set((state) => ({
      gameplay: {
        ...state.gameplay,
        timerSeconds: Math.max(0, state.gameplay.timerSeconds - 1),
      },
    })),

  setMatches: (matches) => set({ matches }),

  addMatch: (match) =>
    set((state) => ({ matches: [...state.matches, match] })),
});
