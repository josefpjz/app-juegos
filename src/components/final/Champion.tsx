import { motion } from 'motion/react';
import { Trophy } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useSoundFx } from '../../hooks/useSoundFx';
import { useEffect } from 'react';

export default function Champion() {
  const teams = useGameStore((s) => s.teams);
  const bracketRounds = useGameStore((s) => s.bracketRounds);
  const gameMode = useGameStore((s) => s.gameMode);
  const standings = useGameStore((s) => s.standings);
  const { playFanfare } = useSoundFx();

  useEffect(() => {
    const timer = setTimeout(playFanfare, 500);
    return () => clearTimeout(timer);
  }, []);

  // Determine champion
  let championTeamId: string | null = null;

  if (gameMode === 'bracket') {
    const finalRound = bracketRounds[bracketRounds.length - 1];
    const finalMatch = finalRound?.matches[0];
    championTeamId = finalMatch?.result?.winnerId || null;
  } else if (gameMode === 'ffa') {
    const finalRound = bracketRounds[bracketRounds.length - 1];
    const finalMatch = finalRound?.matches[0];
    championTeamId = finalMatch?.result?.winnerId || null;
  } else {
    championTeamId = standings[0]?.teamId || null;
  }

  const champion = teams.find((t) => t.id === championTeamId);

  if (!champion) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
        No se pudo determinar al campeón.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 items-center py-8">
      {/* Trophy */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        className="trophy-glow"
      >
        <Trophy size={120} style={{ color: 'var(--color-accent-gold)' }} />
      </motion.div>

      {/* Champion text */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <div className="text-sm uppercase tracking-widest font-bold mb-2"
          style={{ color: 'var(--color-accent-gold)' }}>
          🏆 Campeón 🏆
        </div>
        {/* Player names big */}
        <h1 className="text-5xl font-black neon-gold mb-2">
          {champion.players.map((p) => p.name).join(' - ')}
        </h1>
        {/* Team number small */}
        <p className="text-lg font-bold mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          {champion.name}
        </p>
        {/* <div className="flex items-center justify-center gap-2 neon-gold">
          {champion.players.map((player) => (
            <motion.span
              key={player.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="text-5xl inline-flex items-center gap-1 px-3 py-3 neon-gold rounded-full font-medium"
              style={{
                background: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--color-accent-gold)',
              }}
            >
              <Star size={30} className="neon-gold " />
              {player.name}
            </motion.span>
          ))}
        </div> */}
      </motion.div>
    </div>
  );
}
