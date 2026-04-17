import type { Team, Match, LeagueStanding } from '../types';

let leagueMatchId = 1000;

function nextLeagueMatchId(): string {
  return `league-match-${++leagueMatchId}`;
}

export function resetLeagueMatchIdCounter(): void {
  leagueMatchId = 1000;
}

export function generateRoundRobin(teams: Team[]): Match[] {
  resetLeagueMatchIdCounter();
  const matches: Match[] = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({
        id: nextLeagueMatchId(),
        team1Id: teams[i].id,
        team2Id: teams[j].id,
        result: null,
      });
    }
  }
  return matches;
}

export function calculateStandings(
  teams: Team[],
  matches: Match[]
): LeagueStanding[] {
  const standingsMap = new Map<string, LeagueStanding>();

  for (const team of teams) {
    standingsMap.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      played: 0,
      won: 0,
      lost: 0,
      drawn: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      totalPoints: 0,
    });
  }

  for (const match of matches) {
    if (!match.result) continue;

    const s1 = standingsMap.get(match.team1Id);
    const s2 = standingsMap.get(match.team2Id);
    if (!s1 || !s2) continue;

    s1.played++;
    s2.played++;
    s1.pointsFor += match.result.team1Total;
    s1.pointsAgainst += match.result.team2Total;
    s2.pointsFor += match.result.team2Total;
    s2.pointsAgainst += match.result.team1Total;

    if (match.result.team1Total > match.result.team2Total) {
      s1.won++;
      s1.totalPoints += 3;
      s2.lost++;
    } else if (match.result.team2Total > match.result.team1Total) {
      s2.won++;
      s2.totalPoints += 3;
      s1.lost++;
    } else {
      s1.drawn++;
      s2.drawn++;
      s1.totalPoints += 1;
      s2.totalPoints += 1;
    }
  }

  return Array.from(standingsMap.values()).sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    const diffA = a.pointsFor - a.pointsAgainst;
    const diffB = b.pointsFor - b.pointsAgainst;
    if (diffB !== diffA) return diffB - diffA;
    return b.pointsFor - a.pointsFor;
  });
}
