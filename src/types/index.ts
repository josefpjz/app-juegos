// ============================================================
// PASSWORD GAME - Type Definitions
// ============================================================

export interface Player {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  captainId: string;
}

export interface RoundScore {
  roundNumber: number;
  points: number;
  penalties: number;
  wordsCorrect: number;
  wordsSkipped: number;
}

export interface MatchResult {
  team1Scores: RoundScore[];
  team2Scores: RoundScore[];
  team1Total: number;
  team2Total: number;
  winnerId: string | null;
}

export interface Match {
  id: string;
  team1Id: string;
  team2Id: string;
  result: MatchResult | null;
  bracketRound?: number;
  bracketPosition?: number;
  isBye?: boolean;
  isRepechage?: boolean;
  isThirdPlace?: boolean;
  ffaRounds?: RoundScore[];
}

export type GameMode = 'bracket' | 'league' | 'ffa';

export type LeagueType = 'points' | 'playoffs';

export interface LeagueConfig {
  type: LeagueType;
  playoffSize: 2 | 4 | 8;
}

export type GamePhase =
  | 'home'
  | 'registration'
  | 'teams'
  | 'team-setup'
  | 'mode'
  | 'mode-select'
  | 'repechage'
  | 'bracket'
  | 'bracket-view'
  | 'league'
  | 'league-view'
  | 'pre-round'
  | 'playing'
  | 'round-result'
  | 'loan'
  | 'final';

export type ThemeMode = 'light' | 'dark';

export interface LoanRecord {
  id: string;
  playerId: string;
  playerName: string;
  fromTeamId: string;
  toTeamId: string;
  type: 'temporary' | 'permanent';
  matchId: string;
}

export interface DiceResult {
  teamId: string;
  teamName: string;
  roll: number;
}

export interface LeagueStanding {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  lost: number;
  drawn: number;
  pointsFor: number;
  pointsAgainst: number;
  totalPoints: number;
}

export interface BracketRound {
  roundNumber: number;
  matches: Match[];
  name: string; // "Octavos", "Cuartos", "Semifinal", "Final"
}

export interface GameplayState {
  currentMatchId: string | null;
  currentTeamId: string | null;
  currentRound: number; // 1 or 2
  currentWord: string | null;
  wordsUsed: string[];
  roundScore: number;
  roundSkips: number;
  isPlaying: boolean;
  timerSeconds: number;
  roundsCompleted: RoundScore[];
}
