import type { Match, BracketRound, Team } from '../types';

let matchIdCounter = 0;

function nextMatchId(): string {
  return `match-${++matchIdCounter}`;
}

export function resetMatchIdCounter(): void {
  matchIdCounter = 0;
}

export function getNextPowerOfTwo(n: number): number {
  return Math.pow(2, Math.ceil(Math.log2(n)));
}

export function getPrevPowerOfTwo(n: number): number {
  if (isPow2(n)) return n;
  return Math.pow(2, Math.floor(Math.log2(n)));
}

function isPow2(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

export function calculateByesNeeded(teamCount: number): number {
  const nextPow2 = getNextPowerOfTwo(teamCount);
  return nextPow2 - teamCount;
}

export function calculateRepechageTeams(teamCount: number): number {
  // Number of teams that need to play in repechage
  // repechage teams = 2 * (teamCount - prevPow2)
  // if teamCount is already pow2, no repechage needed
  if (isPow2(teamCount)) return 0;
  const prevPow2 = getPrevPowerOfTwo(teamCount);
  return (teamCount - prevPow2) * 2;
}

export function getRoundName(roundNumber: number, totalRounds: number, hasByes = false): string {
  if (roundNumber === 1 && hasByes) return 'Repechaje';
  const fromFinal = totalRounds - roundNumber;
  switch (fromFinal) {
    case 0: return 'Final';
    case 1: return 'Semifinal';
    case 2: return 'Cuartos de Final';
    case 3: return 'Octavos de Final';
    default: return `Ronda ${roundNumber}`;
  }
}

export function generateBracket(teams: Team[], advancingCount = 0): BracketRound[] {
  resetMatchIdCounter();
  const n = teams.length;
  if (n < 2) return [];

  // Teams are ordered: advancing first, repechage last
  const byeTeams = teams.slice(0, advancingCount);
  const playingTeams = teams.slice(advancingCount);

  const rounds: BracketRound[] = [];

  // Round 1 (Repechaje): matches among playing teams
  const firstRoundMatches: Match[] = [];
  for (let i = 0; i < playingTeams.length; i += 2) {
    const match: Match = {
      id: nextMatchId(),
      team1Id: playingTeams[i].id,
      team2Id: playingTeams[i + 1]?.id || '',
      result: null,
      bracketRound: 1,
      bracketPosition: firstRoundMatches.length,
      isBye: !playingTeams[i + 1],
    };
    firstRoundMatches.push(match);
  }

  // After round 1: advancing teams + round 1 winners
  const teamsAfterR1 = advancingCount + firstRoundMatches.length;
  const bracketSize = getNextPowerOfTwo(teamsAfterR1);
  // If only 1 team advances from round 1 (2-team bracket), round 1 IS the final
  const bracketRoundsCount = teamsAfterR1 <= 1 ? 0 : Math.max(1, Math.log2(bracketSize));
  const totalRounds = (firstRoundMatches.length > 0 ? 1 : 0) + bracketRoundsCount;

  // If no advancing teams (power of 2), use standard bracket naming
  const hasByes = advancingCount > 0;

  if (firstRoundMatches.length > 0) {
    rounds.push({
      roundNumber: 1,
      matches: firstRoundMatches,
      name: hasByes ? 'Repechaje' : getRoundName(1, totalRounds),
    });
  }

  // Generate subsequent rounds
  for (let round = 2; round <= totalRounds; round++) {
    const roundFromBracketStart = round - 1; // round 2 = bracket round 1
    const matchCount = bracketSize / Math.pow(2, roundFromBracketStart);
    const roundMatches: Match[] = [];
    for (let i = 0; i < matchCount; i++) {
      roundMatches.push({
        id: nextMatchId(),
        team1Id: '',
        team2Id: '',
        result: null,
        bracketRound: round,
        bracketPosition: i,
      });
    }
    rounds.push({
      roundNumber: round,
      matches: roundMatches,
      name: getRoundName(round, totalRounds),
    });
  }

  // Place bye teams into round 2 — distribute across matches (one per match first)
  if (rounds.length >= 2 && byeTeams.length > 0) {
    const secondRound = rounds[1];
    const numMatches = secondRound.matches.length;
    for (let i = 0; i < byeTeams.length; i++) {
      const matchIdx = i % numMatches;
      const isSecondPass = i >= numMatches;
      if (secondRound.matches[matchIdx]) {
        if (isSecondPass) {
          secondRound.matches[matchIdx].team2Id = byeTeams[i].id;
        } else {
          secondRound.matches[matchIdx].team1Id = byeTeams[i].id;
        }
      }
    }
  }

  return rounds;
}

export function advanceWinnerInBracket(
  rounds: BracketRound[],
  matchId: string,
  winnerId: string
): BracketRound[] {
  const updatedRounds = rounds.map(r => ({
    ...r,
    matches: r.matches.map(m => ({ ...m })),
  }));

  // Find the match
  let matchRoundIndex = -1;
  let matchIndex = -1;
  for (let ri = 0; ri < updatedRounds.length; ri++) {
    const mi = updatedRounds[ri].matches.findIndex(m => m.id === matchId);
    if (mi !== -1) {
      matchRoundIndex = ri;
      matchIndex = mi;
      break;
    }
  }

  if (matchRoundIndex === -1 || matchIndex === -1) return updatedRounds;

  // Check if there's a next round
  const nextRoundIndex = matchRoundIndex + 1;
  if (nextRoundIndex >= updatedRounds.length) return updatedRounds;

  const nextRound = updatedRounds[nextRoundIndex];

  // For round 1 → round 2 when there are byes:
  // Find the first empty slot in the next round for this winner
  if (matchRoundIndex === 0) {
    // Fill half-filled bye slots (team1 set, team2 empty) first, then empty slots
    for (const nm of nextRound.matches) {
      if (nm.team1Id && !nm.team2Id && !nm.result) {
        nm.team2Id = winnerId;
        return updatedRounds;
      }
    }
    for (const nm of nextRound.matches) {
      if (!nm.team1Id) {
        nm.team1Id = winnerId;
        return updatedRounds;
      }
      if (!nm.team2Id) {
        nm.team2Id = winnerId;
        return updatedRounds;
      }
    }
  } else {
    // Standard: pair matches from current round into next
    const nextMatchIndex = Math.floor(matchIndex / 2);
    const nextMatch = nextRound.matches[nextMatchIndex];
    if (!nextMatch) return updatedRounds;

    if (matchIndex % 2 === 0) {
      nextMatch.team1Id = winnerId;
    } else {
      nextMatch.team2Id = winnerId;
    }
  }

  return updatedRounds;
}

export function createThirdPlaceMatch(
  rounds: BracketRound[],
  _teams: Team[]
): Match | null {
  // Find semifinal losers
  const semiFinalRound = rounds.find(r => r.name === 'Semifinal');
  if (!semiFinalRound) return null;

  const losers: string[] = [];
  for (const match of semiFinalRound.matches) {
    if (match.result?.winnerId) {
      const loserId = match.result.winnerId === match.team1Id
        ? match.team2Id
        : match.team1Id;
      if (loserId) losers.push(loserId);
    }
  }

  if (losers.length < 2) return null;

  return {
    id: nextMatchId(),
    team1Id: losers[0],
    team2Id: losers[1],
    result: null,
    isThirdPlace: true,
  };
}
