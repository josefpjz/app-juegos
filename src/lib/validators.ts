export function isEvenCount(n: number): boolean {
  return n % 2 === 0;
}

export function hasMinPlayers(n: number): boolean {
  return n >= 4;
}

export function canGenerateTeams(n: number): boolean {
  return isEvenCount(n) && hasMinPlayers(n);
}

export function isValidPlayerName(name: string): boolean {
  return name.trim().length >= 1;
}

export function getMaxPlayoffSize(teamCount: number): number {
  if (teamCount >= 8) return 8;
  if (teamCount >= 4) return 4;
  if (teamCount >= 2) return 2;
  return 0;
}

export function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}
