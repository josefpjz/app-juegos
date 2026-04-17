import { useGameStore } from '../../store/gameStore';

interface Props {
  onConfirm: () => void;
}

export default function LeagueOptions({ onConfirm }: Props) {
  const teams = useGameStore((s) => s.teams);
  const leagueConfig = useGameStore((s) => s.leagueConfig);
  const setLeagueConfig = useGameStore((s) => s.setLeagueConfig);

  const playoffOptions = [2, 4, 8].filter((n) => n <= teams.length);

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto w-full">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          📊 Configurar Liga
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {teams.length} equipos jugarán todos contra todos
        </p>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          Tipo de campeón
        </h3>

        <div className="flex flex-col gap-3">
          <label
            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all"
            style={{
              background: leagueConfig.type === 'points' ? 'rgba(236, 72, 153, 0.1)' : 'var(--color-bg-tertiary)',
              border: `1px solid ${leagueConfig.type === 'points' ? 'var(--color-accent-magenta)' : 'var(--color-border)'}`,
            }}
          >
            <input
              type="radio"
              name="league-type"
              checked={leagueConfig.type === 'points'}
              onChange={() => setLeagueConfig({ ...leagueConfig, type: 'points' })}
              className="accent-[var(--color-accent-magenta)]"
            />
            <div>
              <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                Solo por puntos
              </span>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                El equipo con más puntos en la tabla es el campeón
              </p>
            </div>
          </label>

          <label
            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all"
            style={{
              background: leagueConfig.type === 'playoffs' ? 'rgba(236, 72, 153, 0.1)' : 'var(--color-bg-tertiary)',
              border: `1px solid ${leagueConfig.type === 'playoffs' ? 'var(--color-accent-magenta)' : 'var(--color-border)'}`,
            }}
          >
            <input
              type="radio"
              name="league-type"
              checked={leagueConfig.type === 'playoffs'}
              onChange={() => setLeagueConfig({ ...leagueConfig, type: 'playoffs' })}
              className="accent-[var(--color-accent-magenta)]"
            />
            <div>
              <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                Liga + Playoffs
              </span>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Fase de liga + eliminación directa entre los mejores
              </p>
            </div>
          </label>
        </div>

        {leagueConfig.type === 'playoffs' && (
          <div className="mt-4">
            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--color-text-secondary)' }}>
              Equipos clasificados a Playoffs:
            </label>
            <div className="flex gap-3">
              {playoffOptions.map((n) => (
                <button
                  key={n}
                  onClick={() => setLeagueConfig({ ...leagueConfig, playoffSize: n as 2 | 4 | 8 })}
                  className="px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer"
                  style={{
                    background: leagueConfig.playoffSize === n
                      ? 'var(--color-accent-magenta)'
                      : 'var(--color-bg-tertiary)',
                    color: leagueConfig.playoffSize === n
                      ? 'white'
                      : 'var(--color-text-primary)',
                    border: `1px solid ${leagueConfig.playoffSize === n ? 'var(--color-accent-magenta)' : 'var(--color-border)'}`,
                  }}
                >
                  Top {n}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button onClick={onConfirm} className="btn-success px-8 py-3 text-lg">
          Comenzar Liga →
        </button>
      </div>
    </div>
  );
}
