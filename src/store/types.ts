import type {
  Player, Team, Match, GameMode,
  GamePhase, ThemeMode, LeagueConfig, LoanRecord, BracketRound,
  GameplayState, DiceResult, LeagueStanding,
} from '../types';

export interface PlayerSlice {
  players: Player[];
  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  updatePlayerName: (id: string, name: string) => void;
  clearPlayers: () => void;
}

export interface TeamSlice {
  teams: Team[];
  generateTeams: () => void;
  shuffleTeams: () => void;
  swapPlayers: (
    playerId1: string, teamId1: string,
    playerId2: string, teamId2: string
  ) => void;
  movePlayerToTeam: (playerId: string, fromTeamId: string, toTeamId: string) => void;
  confirmTeams: () => void;
  teamsConfirmed: boolean;
  loans: LoanRecord[];
  loanPlayer: (loan: Omit<LoanRecord, 'id'>) => void;
  revertTemporaryLoans: (matchId: string) => void;
}

export interface MatchSlice {
  matches: Match[];
  currentMatchId: string | null;
  gameplay: GameplayState;
  setCurrentMatch: (matchId: string) => void;
  startRound: (teamId: string, round: number) => void;
  recordPoint: () => void;
  skipWord: () => void;
  finishRound: (penalties: number) => void;
  resetCurrentRound: () => void;
  completeMatch: () => void;
  setWord: (word: string) => void;
  decrementTimer: () => void;
  setMatches: (matches: Match[]) => void;
  addMatch: (match: Match) => void;
}

export interface BracketSlice {
  bracketRounds: BracketRound[];
  repechageMatches: Match[];
  diceResults: DiceResult[];
  thirdPlaceMatch: Match | null;
  enableThirdPlace: boolean;
  bracketAdvancingCount: number;
  generateBracketTournament: () => void;
  setDiceResults: (results: DiceResult[]) => void;
  setBracketAdvancingCount: (count: number) => void;
  advanceBracketWinner: (matchId: string, winnerId: string) => void;
  setRepechageMatches: (matches: Match[]) => void;
  setThirdPlaceMatch: (match: Match | null) => void;
  setEnableThirdPlace: (enable: boolean) => void;
}

export interface LeagueSlice {
  leagueConfig: LeagueConfig;
  leagueMatches: Match[];
  standings: LeagueStanding[];
  playoffRounds: BracketRound[];
  setLeagueConfig: (config: LeagueConfig) => void;
  generateLeague: () => void;
  updateStandings: () => void;
  generatePlayoffs: () => void;
}

export interface UISlice {
  theme: ThemeMode;
  gamePhase: GamePhase;
  gameMode: GameMode | null;
  gameId: 'password' | 'beerpong';
  toggleTheme: () => void;
  setGamePhase: (phase: GamePhase) => void;
  setGameMode: (mode: GameMode) => void;
  setGameId: (id: 'password' | 'beerpong') => void;
  resetGame: () => void;
  timerDuration: number;
  setTimerDuration: (seconds: number) => void;
}

export type GameStore = PlayerSlice & TeamSlice & MatchSlice & BracketSlice & LeagueSlice & UISlice;
