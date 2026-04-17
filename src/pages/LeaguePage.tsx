import { useGameStore } from '../store/gameStore';
import LeagueTable from '../components/league/LeagueTable';
import LeagueOptions from '../components/league/LeagueOptions';
import { useState } from 'react';

export default function LeaguePage() {
  const setGamePhase = useGameStore((s) => s.setGamePhase);
  const setCurrentMatch = useGameStore((s) => s.setCurrentMatch);
  const leagueConfig = useGameStore((s) => s.leagueConfig);
  const matches = useGameStore((s) => s.matches);
  const [showOptions, setShowOptions] = useState(!leagueConfig);

  const handlePlayMatch = (matchId: string) => {
    setCurrentMatch(matchId);
    setGamePhase('pre-round');
  };

  if (showOptions) {
    return <LeagueOptions onConfirm={() => setShowOptions(false)} />;
  }

  const pendingMatches = matches.filter((m) => !m.result && !m.isBye && m.bracketRound === undefined);

  return (
    <div className="flex flex-col gap-6">
      <LeagueTable />

      {pendingMatches.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Partidos pendientes
          </h3>
          <div className="flex flex-col gap-2">
            {pendingMatches.map((match) => {
              const teams = useGameStore.getState().teams;
              const t1 = teams.find((t) => t.id === match.team1Id);
              const t2 = teams.find((t) => t.id === match.team2Id);
              return (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: 'var(--color-bg-tertiary)' }}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {t1?.name} vs {t2?.name}
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                      {t1?.players.map((p) => p.name).join(', ')} — {t2?.players.map((p) => p.name).join(', ')}
                    </span>
                  </div>
                  <button
                    onClick={() => handlePlayMatch(match.id)}
                    className="btn-primary text-xs px-3 py-1"
                  >
                    Jugar
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
