import { motion } from 'motion/react';
import { Play, Mic, Ear, ArrowLeftRight } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useCountdown } from '../../hooks/useCountdown';

interface Props {
  matchId: string;
  teamId: string;
  roundNumber: number;
  onStart: () => void;
  onLoan: () => void;
  isFFA?: boolean;
}

export default function PreRound({ matchId, teamId, roundNumber, onStart, onLoan, isFFA }: Props) {
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

  // Determine roles based on round
  const clueGiver = roundNumber === 1 ? team.players[0] : team.players[1];
  const guesser = roundNumber === 1 ? team.players[1] : team.players[0];

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
            style={{ color: 'var(--color-accent-cyan)' }}
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
          Preparación
        </h2>

        {/* Players highlighted */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {/* Current team players */}
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
          {!isFFA && (
            <>
              <span className="text-lg font-bold" style={{ color: 'var(--color-text-muted)' }}>VS</span>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2 text-2xl font-black">
                  {otherTeam?.players.map((p, i) => (
                    <span key={p.id}>
                      <span style={{ color: 'var(--color-accent-magenta)', textShadow: '0 0 18px rgba(236,72,153,0.5)' }}>{p.name}</span>
                      {i < (otherTeam?.players.length ?? 0) - 1 && (
                        <span style={{ color: 'var(--color-text-muted)' }}> &amp; </span>
                      )}
                    </span>
                  ))}
                </div>
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  {otherTeam?.name}
                </span>
              </div>
            </>
          )}
        </div>

        <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
          Ronda {roundNumber} de 2
        </p>
      </div>

      {/* Team roles */}
      <div className="glass-card p-6 max-w-md w-full">
        <h3 className="text-center text-sm font-bold uppercase tracking-wider mb-4"
          style={{ color: 'var(--color-accent-cyan)' }}>
          Roles esta ronda
        </h3>

        <div className="flex flex-col gap-4">
          <div
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{ background: 'rgba(6, 182, 212, 0.1)' }}
          >
            <Mic size={20} style={{ color: 'var(--color-accent-cyan)' }} />
            <div>
              <span className="text-xs font-medium" style={{ color: 'var(--color-accent-cyan)' }}>
                Da las pistas
              </span>
              <p className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {clueGiver?.name || 'Jugador 1'}
              </p>
            </div>
          </div>

          <div
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{ background: 'rgba(236, 72, 153, 0.1)' }}
          >
            <Ear size={20} style={{ color: 'var(--color-accent-magenta)' }} />
            <div>
              <span className="text-xs font-medium" style={{ color: 'var(--color-accent-magenta)' }}>
                Adivina
              </span>
              <p className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {guesser?.name || 'Jugador 2'}
              </p>
            </div>
          </div>
        </div>

        {roundNumber === 2 && (
          <div className="flex items-center justify-center gap-2 mt-3 text-xs"
            style={{ color: 'var(--color-accent-gold)' }}>
            <ArrowLeftRight size={14} />
            Roles intercambiados respecto a la ronda anterior
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={onLoan} className="btn-secondary flex items-center gap-2">
          <ArrowLeftRight size={16} />
          Préstamo de Jugador
        </button>
        <button onClick={handlePlay} className="btn-success flex items-center gap-2 text-lg px-8 py-3">
          <Play size={20} />
          ¡Jugar!
        </button>
      </div>
    </div>
  );
}
