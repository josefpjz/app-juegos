import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Plus, Minus } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

interface Props {
  matchId: string;
  team1Id: string;
  team2Id: string;
  onFinish: (winnerId: string, team1Cups: number, team2Cups: number) => void;
}

export default function BeerPongGameRound({ team1Id, team2Id, onFinish }: Props) {
  const teams = useGameStore((s) => s.teams);

  const [cups, setCups] = useState<Record<string, number>>({
    [team1Id]: 0,
    [team2Id]: 0,
  });
  const [declaringWinner, setDeclaringWinner] = useState(false);

  const adjust = (teamId: string, delta: number) => {
    if (declaringWinner) return;
    setCups((prev) => ({ ...prev, [teamId]: Math.max(0, prev[teamId] + delta) }));
  };

  const handleDeclare = (winnerId: string) => {
    onFinish(winnerId, cups[team1Id], cups[team2Id]);
  };

  const TeamCard = ({ teamId, color }: { teamId: string; color: 'cyan' | 'magenta' }) => {
    const team = teams.find((t) => t.id === teamId);
    const count = cups[teamId];
    const accent = color === 'cyan' ? 'var(--color-accent-cyan)' : 'var(--color-accent-magenta)';
    const bg = color === 'cyan' ? 'rgba(6,182,212,0.08)' : 'rgba(236,72,153,0.08)';
    const border = color === 'cyan' ? 'rgba(6,182,212,0.3)' : 'rgba(236,72,153,0.3)';

    return (
      <motion.div
        className="glass-card p-6 flex flex-col items-center gap-5 flex-1"
        style={{
          border: declaringWinner ? `2px solid ${accent}` : `1px solid ${border}`,
          background: bg,
          cursor: declaringWinner ? 'pointer' : 'default',
          boxShadow: declaringWinner ? `0 0 24px ${accent}30` : undefined,
        }}
        whileHover={declaringWinner ? { scale: 1.03 } : {}}
        whileTap={declaringWinner ? { scale: 0.97 } : {}}
        onClick={declaringWinner ? () => handleDeclare(teamId) : undefined}
      >
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-muted)' }}>
            {team?.name}
          </p>
          <div className="text-xl font-black" style={{ color: accent }}>
            {team?.players.map((p) => p.name).join(' & ')}
          </div>
        </div>

        <AnimatePresence>
          {declaringWinner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
              style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}
            >
              <Trophy size={14} />
              Declarar ganador
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-5">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={(e) => { e.stopPropagation(); adjust(teamId, -1); }}
            disabled={count === 0 || declaringWinner}
            className="w-11 h-11 rounded-full flex items-center justify-center cursor-pointer"
            style={{
              background: count === 0 || declaringWinner ? 'var(--color-bg-tertiary)' : 'rgba(236,72,153,0.15)',
              border: `1px solid ${count === 0 || declaringWinner ? 'var(--color-border)' : 'rgba(236,72,153,0.35)'}`,
              color: count === 0 || declaringWinner ? 'var(--color-text-muted)' : 'var(--color-accent-magenta)',
              opacity: count === 0 || declaringWinner ? 0.35 : 1,
            }}
          >
            <Minus size={18} />
          </motion.button>

          <AnimatePresence mode="wait">
            <motion.span
              key={count}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.4, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 22 }}
              className="text-7xl font-black"
              style={{ color: accent, minWidth: 72, textAlign: 'center' }}
            >
              {count}
            </motion.span>
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={(e) => { e.stopPropagation(); adjust(teamId, 1); }}
            disabled={declaringWinner}
            className="w-11 h-11 rounded-full flex items-center justify-center cursor-pointer"
            style={{
              background: declaringWinner ? 'var(--color-bg-tertiary)' : 'rgba(16,185,129,0.15)',
              border: `1px solid ${declaringWinner ? 'var(--color-border)' : 'rgba(16,185,129,0.35)'}`,
              color: declaringWinner ? 'var(--color-text-muted)' : 'var(--color-accent-green)',
              opacity: declaringWinner ? 0.35 : 1,
            }}
          >
            <Plus size={18} />
          </motion.button>
        </div>

        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>copas hundidas</p>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => setDeclaringWinner((v) => !v)}
        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm cursor-pointer"
        style={{
          background: declaringWinner ? 'rgba(245,158,11,0.15)' : 'var(--color-bg-tertiary)',
          border: `2px solid ${declaringWinner ? 'var(--color-accent-gold)' : 'var(--color-border)'}`,
          color: declaringWinner ? 'var(--color-accent-gold)' : 'var(--color-text-secondary)',
        }}
      >
        <Trophy size={16} />
        {declaringWinner ? 'Cancelar — seguir contando' : 'Declarar ganador'}
      </motion.button>

      <AnimatePresence>
        {declaringWinner && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-center"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Haz clic en el card del equipo ganador
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex gap-6 w-full max-w-2xl">
        <TeamCard teamId={team1Id} color="cyan" />
        <TeamCard teamId={team2Id} color="magenta" />
      </div>
    </div>
  );
}
