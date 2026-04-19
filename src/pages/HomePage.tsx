import { motion } from 'motion/react';
import { Play, RotateCcw } from 'lucide-react';
import { useGameStore, hydrateStore } from '../store/gameStore';
import { hasSavedState, clearSavedState, setActiveGame } from '../store/persistence';
import { useState, useEffect } from 'react';
import innsolutionsLogo from '../assets/innsolutions-logo.png';

type GameId = 'password' | 'beerpong';

export default function HomePage() {
  const setGamePhase = useGameStore((s) => s.setGamePhase);
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    if (selectedGame) {
      setHasSaved(hasSavedState(selectedGame));
    } else {
      setHasSaved(false);
    }
  }, [selectedGame]);

  const handleNewGame = () => {
    if (!selectedGame) return;
    setActiveGame(selectedGame);
    clearSavedState(selectedGame);
    useGameStore.getState().resetGame();
    useGameStore.getState().setGameId(selectedGame);
    setGamePhase('registration');
  };

  const handleResume = () => {
    if (!selectedGame) return;
    setActiveGame(selectedGame);
    hydrateStore(selectedGame);
    useGameStore.getState().setGameId(selectedGame);
    const phase = useGameStore.getState().gamePhase;
    if (phase === 'home') {
      setGamePhase('registration');
    }
  };

  const games = [
    {
      id: 'password' as const,
      emoji: '🗣️',
      name: 'Password',
      description: 'Da pistas de una sola palabra para que tu equipo adivine. Turnos, rondas y torneo.',
      available: true,
      accent: 'var(--color-accent-cyan)',
      accentBg: 'rgba(6,182,212,0.12)',
    },
    {
      id: 'beerpong' as const,
      emoji: '🍺',
      name: 'Beer Pong',
      description: 'Lanza, apunta y elimina. Compite en brackets contra los demás equipos.',
      available: true,
      accent: 'var(--color-accent-gold)',
      accentBg: 'rgba(245,158,11,0.08)',
    },
  ];

  const canStart = selectedGame !== null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8">
      {/* Logo / Title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="flex flex-col items-center gap-2 mb-4">
          <img src={innsolutionsLogo} alt="Inngames" className="h-24 w-auto" />
          <span
            className="text-5xl font-black tracking-tight"
            style={{
              background: 'linear-gradient(90deg, #ff1870, #a018f0, #0090ff, #00d8ff)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              display: 'inline-block',
              paddingBottom: '0.15em',
              lineHeight: 1.2,
            }}
          >
            Inngames
          </span>
        </div>
        <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          Juegos para reuniones con amigos
        </p>
      </motion.div>

      {/* Game selection */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col items-center gap-3 w-full max-w-xl px-4"
      >
        <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
          Elige un juego
        </p>
        <div className="grid grid-cols-2 gap-4 w-full">
          {games.map((game) => {
            const isSelected = selectedGame === game.id;
            return (
              <button
                key={game.id}
                onClick={() => game.available && setSelectedGame(game.id)}
                className="relative flex flex-col items-center gap-3 p-6 rounded-2xl text-center transition-all duration-200"
                style={{
                  background: isSelected ? game.accentBg : 'var(--color-bg-tertiary)',
                  border: `2px solid ${isSelected ? game.accent : game.available ? 'var(--color-border)' : 'transparent'}`,
                  cursor: game.available ? 'pointer' : 'default',
                  opacity: game.available ? 1 : 0.45,
                  boxShadow: isSelected ? `0 0 20px ${game.accentBg}` : 'none',
                }}
              >
                {!game.available && (
                  <span
                    className="absolute top-2 right-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)' }}
                  >
                    Próx.
                  </span>
                )}
                <span className="text-4xl">{game.emoji}</span>
                <span className="text-lg font-bold" style={{ color: isSelected ? game.accent : 'var(--color-text-primary)' }}>
                  {game.name}
                </span>
                <span className="text-xs leading-snug" style={{ color: 'var(--color-text-muted)' }}>
                  {game.description}
                </span>
              </button>
            );
          })}
        </div>
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
          disabled={!canStart}
          className="btn-primary flex items-center gap-3 text-xl px-10 py-4"
          style={{ opacity: canStart ? 1 : 0.4, cursor: canStart ? 'pointer' : 'default' }}
        >
          <Play size={24} />
          Nuevo Juego
        </button>

        {hasSaved && selectedGame && (
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
