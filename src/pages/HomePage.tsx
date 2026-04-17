import { motion } from 'motion/react';
import { Play, RotateCcw, Zap, Users, Trophy, Tv } from 'lucide-react';
import { useGameStore, hydrateStore } from '../store/gameStore';
import { hasSavedState, clearSavedState } from '../store/persistence';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const setGamePhase = useGameStore((s) => s.setGamePhase);
  const [showResume, setShowResume] = useState(false);

  useEffect(() => {
    if (hasSavedState()) {
      setShowResume(true);
    }
  }, []);

  const handleNewGame = () => {
    clearSavedState();
    useGameStore.getState().resetGame();
    setGamePhase('registration');
  };

  const handleResume = () => {
    hydrateStore();
    // Navigate to whatever phase was saved
    const phase = useGameStore.getState().gamePhase;
    if (phase === 'home') {
      setGamePhase('registration');
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8">
      {/* Logo / Title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Tv size={40} style={{ color: 'var(--color-accent-cyan)' }} />
          <h1 className="text-6xl font-black tracking-tight neon-cyan m-0">
            PASSWORD
          </h1>
        </div>
        <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          El juego de palabras para reuniones con amigos
        </p>
      </motion.div>

      {/* Feature cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl"
      >
        {[
          { icon: Users, label: 'Equipos', color: 'var(--color-accent-cyan)' },
          { icon: Zap, label: 'Rondas rápidas', color: 'var(--color-accent-magenta)' },
          { icon: Trophy, label: 'Torneo', color: 'var(--color-accent-gold)' },
          { icon: Tv, label: 'Estilo TV', color: 'var(--color-accent-green)' },
        ].map(({ icon: Icon, label, color }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2 p-4 rounded-xl"
            style={{ background: 'var(--color-bg-tertiary)' }}
          >
            <Icon size={24} style={{ color }} />
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              {label}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col items-center gap-3"
      >
        <button
          onClick={handleNewGame}
          className="btn-primary flex items-center gap-3 text-xl px-10 py-4"
        >
          <Play size={24} />
          Nuevo Juego
        </button>

        {showResume && (
          <button
            onClick={handleResume}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <RotateCcw size={16} />
            Continuar partida anterior
          </button>
        )}
      </motion.div>

      {/* Footer tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-xs text-center"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Crea equipos • Elige modo de juego • ¡Adivina las palabras!
      </motion.p>
    </div>
  );
}
