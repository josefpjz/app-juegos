import type { StateCreator } from 'zustand';
import type { GameStore, TeamSlice } from '../types';
import type { LoanRecord } from '../../types';
import { shuffle } from '../../lib/shuffle';
import { generateId } from '../../lib/utils';

export const createTeamSlice: StateCreator<GameStore, [], [], TeamSlice> = (set, get) => ({
  teams: [],
  teamsConfirmed: false,
  loans: [],

  generateTeams: () => {
    const { players } = get();

    // Special pairing: "eli" + "iveth" with 85% probability
    const eliIdx = players.findIndex((p) => p.name.trim().toLowerCase() === 'eli');
    const ivethIdx = players.findIndex((p) => p.name.trim().toLowerCase() === 'iveth');
    let pool = shuffle(players);
    if (eliIdx !== -1 && ivethIdx !== -1 && Math.random() < 0.85) {
      const eli = players[eliIdx];
      const iveth = players[ivethIdx];
      pool = [eli, iveth, ...shuffle(players.filter((p) => p.id !== eli.id && p.id !== iveth.id))];
    }

    const teams = [];
    for (let i = 0; i < pool.length; i += 2) {
      const teamPlayers = [pool[i], pool[i + 1]].filter(Boolean);
      teams.push({
        id: generateId(),
        name: `Equipo ${Math.floor(i / 2) + 1}`,
        players: teamPlayers,
        captainId: teamPlayers[0]?.id || '',
      });
    }
    set({ teams, teamsConfirmed: false });
  },

  shuffleTeams: () => {
    const { players } = get();

    // Special pairing: "eli" + "iveth" with 85% probability
    const eliIdx = players.findIndex((p) => p.name.trim().toLowerCase() === 'eli');
    const ivethIdx = players.findIndex((p) => p.name.trim().toLowerCase() === 'iveth');
    let pool = shuffle(players);
    if (eliIdx !== -1 && ivethIdx !== -1 && Math.random() < 0.45) {
      const eli = players[eliIdx];
      const iveth = players[ivethIdx];
      pool = [eli, iveth, ...shuffle(players.filter((p) => p.id !== eli.id && p.id !== iveth.id))];
    }

    const teams = [];
    for (let i = 0; i < pool.length; i += 2) {
      const teamPlayers = [pool[i], pool[i + 1]].filter(Boolean);
      teams.push({
        id: generateId(),
        name: `Equipo ${Math.floor(i / 2) + 1}`,
        players: teamPlayers,
        captainId: teamPlayers[0]?.id || '',
      });
    }
    set({ teams, teamsConfirmed: false });
  },

  swapPlayers: (playerId1, teamId1, playerId2, teamId2) => {
    set((state) => {
      const newTeams = state.teams.map((team) => {
        if (team.id === teamId1) {
          return {
            ...team,
            players: team.players.map((p) =>
              p.id === playerId1
                ? state.teams.find((t) => t.id === teamId2)!.players.find((p2) => p2.id === playerId2)!
                : p
            ),
          };
        }
        if (team.id === teamId2) {
          return {
            ...team,
            players: team.players.map((p) =>
              p.id === playerId2
                ? state.teams.find((t) => t.id === teamId1)!.players.find((p1) => p1.id === playerId1)!
                : p
            ),
          };
        }
        return team;
      });
      return { teams: newTeams };
    });
  },

  movePlayerToTeam: (playerId, fromTeamId, toTeamId) => {
    set((state) => {
      const fromTeam = state.teams.find((t) => t.id === fromTeamId);
      const player = fromTeam?.players.find((p) => p.id === playerId);
      if (!player) return state;

      const newTeams = state.teams.map((team) => {
        if (team.id === fromTeamId) {
          return {
            ...team,
            players: team.players.filter((p) => p.id !== playerId),
          };
        }
        if (team.id === toTeamId) {
          return {
            ...team,
            players: [...team.players, player],
          };
        }
        return team;
      });
      return { teams: newTeams };
    });
  },

  confirmTeams: () => set({ teamsConfirmed: true }),

  loanPlayer: (loan) => {
    const fullLoan: LoanRecord = { ...loan, id: generateId() };
    set((state) => {
      // Move the player
      const fromTeam = state.teams.find((t) => t.id === loan.fromTeamId);
      const player = fromTeam?.players.find((p) => p.id === loan.playerId);
      if (!player) return state;

      const newTeams = state.teams.map((team) => {
        if (team.id === loan.fromTeamId) {
          return {
            ...team,
            players: team.players.filter((p) => p.id !== loan.playerId),
          };
        }
        if (team.id === loan.toTeamId) {
          return {
            ...team,
            players: [...team.players, player],
          };
        }
        return team;
      });

      return {
        teams: newTeams,
        loans: [...state.loans, fullLoan],
      };
    });
  },

  revertTemporaryLoans: (matchId) => {
    set((state) => {
      const tempLoans = state.loans.filter(
        (l) => l.matchId === matchId && l.type === 'temporary'
      );
      let newTeams = [...state.teams.map((t) => ({ ...t, players: [...t.players] }))];

      for (const loan of tempLoans) {
        const currentTeam = newTeams.find((t) =>
          t.players.some((p) => p.id === loan.playerId)
        );
        const originalTeam = newTeams.find((t) => t.id === loan.fromTeamId);
        if (currentTeam && originalTeam) {
          const player = currentTeam.players.find((p) => p.id === loan.playerId);
          if (player) {
            currentTeam.players = currentTeam.players.filter((p) => p.id !== loan.playerId);
            originalTeam.players = [...originalTeam.players, player];
          }
        }
      }

      return {
        teams: newTeams,
        loans: state.loans.filter(
          (l) => !(l.matchId === matchId && l.type === 'temporary')
        ),
      };
    });
  },
});
