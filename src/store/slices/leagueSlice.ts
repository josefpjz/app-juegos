import type { StateCreator } from 'zustand';
import type { GameStore, LeagueSlice } from '../types';
import type { LeagueConfig } from '../../types';
import { generateRoundRobin, calculateStandings } from '../../lib/leagueUtils';
import { generateBracket } from '../../lib/bracketUtils';

export const createLeagueSlice: StateCreator<GameStore, [], [], LeagueSlice> = (set, get) => ({
  leagueConfig: { type: 'points', playoffSize: 4 },
  leagueMatches: [],
  standings: [],
  playoffRounds: [],

  setLeagueConfig: (config: LeagueConfig) =>
    set({ leagueConfig: config }),

  generateLeague: () => {
    const { teams } = get();
    const matches = generateRoundRobin(teams);
    set({
      leagueMatches: matches,
      matches: matches,
      standings: [],
      playoffRounds: [],
    });
  },

  updateStandings: () => {
    const { teams, leagueMatches } = get();
    const standings = calculateStandings(teams, leagueMatches);
    set({ standings });
  },

  generatePlayoffs: () => {
    const { standings, teams, leagueConfig } = get();
    const topTeamIds = standings.slice(0, leagueConfig.playoffSize).map((s) => s.teamId);
    const playoffTeams = topTeamIds
      .map((id) => teams.find((t) => t.id === id))
      .filter(Boolean) as typeof teams;

    const rounds = generateBracket(playoffTeams);
    const allMatches = rounds.flatMap((r) => r.matches);
    set({
      playoffRounds: rounds,
      matches: allMatches,
    });
  },
});
