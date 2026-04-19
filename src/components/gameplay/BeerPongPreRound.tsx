import { motion } from 'motion/react';
import { Play, Beer } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useCountdown } from '../../hooks/useCountdown';

interface Props {
  matchId: string;
  teamId: string;
  roundNumber: number;
  onStart: () => void;
  onLoan: () => void;
}

export default function BeerPongPreRound({ matchId, teamId, roundNumber, onStart }: Props) {
  const teams = useGameStore((s) => s.teams);
  const matches = useGameStore((s) => s.matches);

  const team = teams.find((t) => t.id === teamId);
  const match = matches.find((m) => m.id === matchId);

  const { count, isActive, start: startCountdown } = useCountdown(5, () => {
    onStart();
  });

  if (!team || !match) return null;

  const otherTeamId = match.team1Id === teamId ? match.team2Id : match.team1Id;
  const otherTeam = teams.find((t) => t.id === otherTeamId);

  const handlePlay = () => {
    startCountdown();
  };

  if (isActive) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          key={count}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          className="text-center"
        >
          <div
            className="text-9xl font-black"
            style={{ color: 'var(--color-accent-gold)' }}
          >
            {count === 0 ? '¡YA!' : count}
          </div>
          <p className="text-xl mt-4" style={{ color: 'var(--color-text-secondary)' }}>
            {count > 0 ? 'Prepárense...' : ''}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 items-center">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
          🍺 Preparación
        </h2>

        {/* Teams */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {/* Current team */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-2xl font-black">
              {team.players.map((p, i) => (
                <span key={p.id}>
                  <span className="neon-cyan">{p.name}</span>
                  {i < team.players.length - 1 && (
                    <span style={{ color: 'var(--color-text-muted)' }}> &amp; </span>
                  )}
                </span>
              ))}
            </div>
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              {team.name}
            </span>
          </div>

          {/* VS + other team */}
          {otherTeam && (
            <>
              <span className="text-lg font-bold" style={{ color: 'var(--color-text-muted)' }}>VS</span>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2 text-2xl font-black">
                  {otherTeam.players.map((p, i) => (
                    <span key={p.id}>
                      <span style={{ color: 'var(--color-accent-magenta)', textShadow: '0 0 18px rgba(236,72,153,0.5)' }}>{p.name}</span>
                      {i < (otherTeam?.players.length ?? 0) - 1 && (
                        <span style={{ color: 'var(--color-text-muted)' }}> &amp; </span>
                      )}
                    </span>
                  ))}
                </div>
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  {otherTeam.name}
                </span>
              </div>
            </>
          )}
        </div>

        <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
          Ronda {roundNumber} de 2
        </p>
      </div>

      {/* Match info */}
      <div className="glass-card p-6 max-w-md w-full">
        <h3
          className="text-center text-sm font-bold uppercase tracking-wider mb-4"
          style={{ color: 'var(--color-accent-gold)' }}
        >
          <Beer size={14} className="inline mr-1" />
          Beer Pong
        </h3>

        <div className="flex flex-col gap-3 text-center">
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Preparen las copas y la pelota.
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Equipo visitante lanza primero en la Ronda 1.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={handlePlay} className="btn-success flex items-center gap-2 text-lg px-8 py-3">
          <Play size={20} />
          ¡Jugar!
        </button>
      </div>
    </div>
  );
}
