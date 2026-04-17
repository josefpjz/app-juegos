import type { StateCreator } from 'zustand';
import type { GameStore, BracketSlice } from '../types';
import type { DiceResult, Match } from '../../types';
import { generateBracket, advanceWinnerInBracket } from '../../lib/bracketUtils';

export const createBracketSlice: StateCreator<GameStore, [], [], BracketSlice> = (set, get) => ({
  bracketRounds: [],
  repechageMatches: [],
  diceResults: [],
  thirdPlaceMatch: null,
  enableThirdPlace: false,
  bracketAdvancingCount: 0,

  generateBracketTournament: () => {
    const { teams, bracketAdvancingCount } = get();
    const rounds = generateBracket(teams, bracketAdvancingCount);
    // Flatten all matches from rounds into main matches array
    const allMatches = rounds.flatMap((r) => r.matches);
    set({
      bracketRounds: rounds,
      matches: allMatches,
    });
  },

  setDiceResults: (results: DiceResult[]) =>
    set({ diceResults: results }),

  setBracketAdvancingCount: (count: number) =>
    set({ bracketAdvancingCount: count }),

  advanceBracketWinner: (matchId, winnerId) => {
    const { bracketRounds } = get();
    const updatedRounds = advanceWinnerInBracket(bracketRounds, matchId, winnerId);
    const allMatches = updatedRounds.flatMap((r) => r.matches);
    set({
      bracketRounds: updatedRounds,
      matches: allMatches,
    });
  },

  setRepechageMatches: (matches: Match[]) =>
    set({ repechageMatches: matches }),

  setThirdPlaceMatch: (match) =>
    set({ thirdPlaceMatch: match }),

  setEnableThirdPlace: (enable) =>
    set({ enableThirdPlace: enable }),
});
