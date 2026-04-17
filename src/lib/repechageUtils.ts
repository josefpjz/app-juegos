import type { Team, DiceResult } from '../types';
import { shuffle } from './shuffle';

export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function rollDiceForTeams(teams: Team[]): DiceResult[] {
  return teams.map(team => ({
    teamId: team.id,
    teamName: team.name,
    roll: rollDice(),
  }));
}

export function selectRepechageTeams(
  diceResults: DiceResult[],
  repechageCount: number
): { repechageTeamIds: string[]; advancingTeamIds: string[] } {
  // Sort descending by roll (highest rolls advance)
  const sorted = [...diceResults].sort((a, b) => b.roll - a.roll);

  // Base split: first (n - repechageCount) advance, rest go to repechage
  const baseRepechage = sorted.slice(sorted.length - repechageCount);

  if (baseRepechage.length === 0) {
    return { repechageTeamIds: [], advancingTeamIds: sorted.map(r => r.teamId) };
  }

  // The highest roll among base repechage teams is the cutoff
  // Any advancing team with the same roll gets pulled into repechage too
  const cutoffRoll = Math.max(...baseRepechage.map(r => r.roll));

  const advancingTeamIds: string[] = [];
  const repechageTeamIds: string[] = [];

  for (const r of sorted) {
    if (r.roll > cutoffRoll) {
      advancingTeamIds.push(r.teamId);
    } else {
      repechageTeamIds.push(r.teamId);
    }
  }

  return { repechageTeamIds, advancingTeamIds };
}

export function createRepechageMatches(
  repechageTeamIds: string[]
): { team1Id: string; team2Id: string }[] {
  const matches: { team1Id: string; team2Id: string }[] = [];
  const shuffled = shuffle(repechageTeamIds);
  for (let i = 0; i < shuffled.length; i += 2) {
    if (shuffled[i + 1]) {
      matches.push({
        team1Id: shuffled[i],
        team2Id: shuffled[i + 1],
      });
    }
  }
  return matches;
}
