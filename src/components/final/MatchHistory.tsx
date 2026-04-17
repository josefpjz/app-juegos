import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export default function MatchHistory() {
  const matches = useGameStore((s) => s.matches);
  const teams = useGameStore((s) => s.teams);
  const bracketRounds = useGameStore((s) => s.bracketRounds);
  const gameMode = useGameStore((s) => s.gameMode);
  const standings = useGameStore((s) => s.standings);
  const thirdPlaceMatch = useGameStore((s) => s.thirdPlaceMatch);

  // Determine champion
  let championTeamId: string | null = null;
  if (gameMode === 'bracket') {
    const finalRound = bracketRounds[bracketRounds.length - 1];
    const finalMatch = finalRound?.matches[0];
    championTeamId = finalMatch?.result?.winnerId || null;
  } else {
    championTeamId = standings[0]?.teamId || null;
  }

  // Get all completed matches including 3rd place
  const allCompleted = [
    ...matches.filter((m) => m.result && !m.isBye),
    ...(thirdPlaceMatch?.result ? [thirdPlaceMatch] : []),
  ];

  // Only show matches involving the champion
  const championMatches = championTeamId
    ? allCompleted.filter((m) => m.team1Id === championTeamId || m.team2Id === championTeamId)
    : allCompleted;

  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Build a map from matchId to round name
  const roundNameMap = new Map<string, string>();
  for (const round of bracketRounds) {
    for (const m of round.matches) {
      roundNameMap.set(m.id, round.name);
    }
  }
  if (thirdPlaceMatch) {
    roundNameMap.set(thirdPlaceMatch.id, '3er Lugar');
  }

  if (championMatches.length === 0) return null;

  return (
    <div className="glass-card p-6 max-w-2xl mx-auto w-full">
      <h3 className="text-lg font-bold mb-4 text-center" style={{ color: 'var(--color-text-primary)' }}>
        📋 Historial de Enfrentamientos
      </h3>

      <div className="flex flex-col gap-2">
        {championMatches.map((match) => {
          const team1 = teams.find((t) => t.id === match.team1Id);
          const team2 = teams.find((t) => t.id === match.team2Id);
          const isExpanded = expandedId === match.id;
          const isWinner1 = match.result?.winnerId === match.team1Id;
          const isWinner2 = match.result?.winnerId === match.team2Id;
          const roundName = roundNameMap.get(match.id);

          return (
            <div key={match.id}>
              <button
                onClick={() => setExpandedId(isExpanded ? null : match.id)}
                className="w-full flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer"
                style={{ background: 'var(--color-bg-tertiary)' }}
              >
                <div className="flex items-center gap-3 text-sm">
                  <span
                    className="font-bold"
                    style={{ color: isWinner1 ? 'var(--color-accent-green)' : 'var(--color-text-primary)' }}
                  >
                    {team1?.name || 'Equipo ?'}
                  </span>
                  <span className="font-mono font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {match.result?.team1Total}
                  </span>
                  <span style={{ color: 'var(--color-text-muted)' }}>-</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {match.result?.team2Total}
                  </span>
                  <span
                    className="font-bold"
                    style={{ color: isWinner2 ? 'var(--color-accent-green)' : 'var(--color-text-primary)' }}
                  >
                    {team2?.name || 'Equipo ?'}
                  </span>
                  {roundName && (
                    <span className="ml-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      ({roundName})
                    </span>
                  )}
                </div>
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {isExpanded && match.result && (
                <div className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-bold">{team1?.name}</span>
                      {match.result.team1Scores.map((s, i) => (
                        <div key={i} className="flex justify-between">
                          <span>Ronda {s.roundNumber}:</span>
                          <span className="font-mono">{s.points} pts ({s.penalties} pen)</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <span className="font-bold">{team2?.name}</span>
                      {match.result.team2Scores.map((s, i) => (
                        <div key={i} className="flex justify-between">
                          <span>Ronda {s.roundNumber}:</span>
                          <span className="font-mono">{s.points} pts ({s.penalties} pen)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
