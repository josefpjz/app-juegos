import { useGameStore } from '../../store/gameStore';

export default function LeagueTable() {
  const standings = useGameStore((s) => s.standings);
  const leagueConfig = useGameStore((s) => s.leagueConfig);

  if (standings.length === 0) {
    return (
      <div className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
        Juega partidos para ver la tabla de posiciones.
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr
              style={{ background: 'var(--color-bg-tertiary)' }}
            >
              <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-text-muted)' }}>#</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-text-muted)' }}>Equipo</th>
              <th className="text-center px-3 py-3 font-semibold" style={{ color: 'var(--color-text-muted)' }}>PJ</th>
              <th className="text-center px-3 py-3 font-semibold" style={{ color: 'var(--color-text-muted)' }}>PG</th>
              <th className="text-center px-3 py-3 font-semibold" style={{ color: 'var(--color-text-muted)' }}>PP</th>
              <th className="text-center px-3 py-3 font-semibold" style={{ color: 'var(--color-text-muted)' }}>PE</th>
              <th className="text-center px-3 py-3 font-semibold" style={{ color: 'var(--color-text-muted)' }}>PF</th>
              <th className="text-center px-3 py-3 font-semibold" style={{ color: 'var(--color-text-muted)' }}>PC</th>
              <th className="text-center px-3 py-3 font-semibold" style={{ color: 'var(--color-accent-gold)' }}>PTS</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing, index) => {
              const isPlayoffZone =
                leagueConfig.type === 'playoffs' && index < leagueConfig.playoffSize;
              return (
                <tr
                  key={standing.teamId}
                  className="transition-colors"
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    background: isPlayoffZone ? 'rgba(6, 182, 212, 0.05)' : undefined,
                  }}
                >
                  <td className="px-4 py-3">
                    <span
                      className="w-6 h-6 inline-flex items-center justify-center rounded-full text-xs font-bold"
                      style={{
                        background: index === 0
                          ? 'var(--color-accent-gold)'
                          : index === 1
                            ? 'var(--color-text-muted)'
                            : index === 2
                              ? '#cd7f32'
                              : 'var(--color-bg-tertiary)',
                        color: index < 3 ? 'white' : 'var(--color-text-muted)',
                      }}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {standing.teamName}
                    {isPlayoffZone && (
                      <span className="ml-2 text-xs" style={{ color: 'var(--color-accent-cyan)' }}>
                        ★
                      </span>
                    )}
                  </td>
                  <td className="text-center px-3 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                    {standing.played}
                  </td>
                  <td className="text-center px-3 py-3" style={{ color: 'var(--color-accent-green)' }}>
                    {standing.won}
                  </td>
                  <td className="text-center px-3 py-3" style={{ color: 'var(--color-accent-red)' }}>
                    {standing.lost}
                  </td>
                  <td className="text-center px-3 py-3" style={{ color: 'var(--color-text-muted)' }}>
                    {standing.drawn}
                  </td>
                  <td className="text-center px-3 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                    {standing.pointsFor}
                  </td>
                  <td className="text-center px-3 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                    {standing.pointsAgainst}
                  </td>
                  <td className="text-center px-3 py-3 font-bold text-lg" style={{ color: 'var(--color-accent-gold)' }}>
                    {standing.totalPoints}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
