import { motion } from 'motion/react';
import { GitBranch, BarChart3, Timer, Swords } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export default function ModeSelector() {
  const setGameMode = useGameStore((s) => s.setGameMode);
  const setGamePhase = useGameStore((s) => s.setGamePhase);
  const teams = useGameStore((s) => s.teams);
  const timerDuration = useGameStore((s) => s.timerDuration);
  const setTimerDuration = useGameStore((s) => s.setTimerDuration);

  const handleBracket = () => {
    setGameMode('bracket');
    setGamePhase('bracket');
  };

  const handleFFA = () => {
    setGameMode('ffa');
    setGamePhase('bracket');
  };

  const LockedOverlay = ({ label }: { label: string }) => (
    <div
      className="absolute inset-0 rounded-2xl flex items-center justify-center z-10"
      style={{ background: 'rgba(10,12,28,0.72)', backdropFilter: 'blur(2px)' }}
    >
      <span
        className="text-xs font-semibold text-center px-4"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Modo de Juego
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {teams.length} equipos listos. Elige cómo competir.
        </p>
      </div>

      {/* Timer config */}
      <div className="flex justify-center">
        <div className="glass-card p-4 flex items-center gap-4">
          <Timer size={20} style={{ color: 'var(--color-accent-gold)' }} />
          <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Duración por ronda:
          </label>
          <select
            value={timerDuration}
            onChange={(e) => setTimerDuration(Number(e.target.value))}
            className="px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
            style={{
              background: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
            }}
          >
            <option value={10}>10 segundos</option>
            <option value={30}>30 segundos</option>
            <option value={45}>45 segundos</option>
            <option value={60}>60 segundos</option>
            <option value={90}>90 segundos</option>
            <option value={120}>120 segundos</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full">
        {/* Bracket Mode */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBracket}
            className="glass-card p-8 text-left w-full"
            style={{ cursor: 'pointer' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(6, 182, 212, 0.15)' }}
              >
                <GitBranch size={24} style={{ color: 'var(--color-accent-cyan)' }} />
              </div>
              <div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Brackets
                </h3>
                <span className="text-xs" style={{ color: 'var(--color-accent-cyan)' }}>
                  Eliminación directa
                </span>
              </div>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Torneo de eliminación directa tipo Champions League.
              Cada enfrentamiento a 2 rondas. Pierde y te vas.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}>
                🏆 Repechaje si no es potencia de 2
              </span>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}>
                🎲 Modo dado
              </span>
            </div>
          </motion.button>
        </div>

        {/* FFA / Modo Libre */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleFFA}
            className="glass-card p-8 text-left w-full"
            style={{ cursor: 'pointer' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(245, 158, 11, 0.15)' }}
              >
                <Swords size={24} style={{ color: 'var(--color-accent-gold)' }} />
              </div>
              <div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Modo Libre
                </h3>
                <span className="text-xs" style={{ color: 'var(--color-accent-gold)' }}>
                  Todos compiten juntos
                </span>
              </div>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Cada equipo juega su turno. Se acumulan puntos por ronda.
              Gana quien más puntaje total consiga.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}>
                🏅 Tabla de posiciones en vivo
              </span>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}>
                ↑ Animación de remontada
              </span>
            </div>
          </motion.button>
        </div>

        {/* League Mode */}
        <div className="relative">
          <LockedOverlay label="No implementado por el momento" />
          <motion.button
            className="glass-card p-8 text-left w-full"
            style={{ cursor: 'default', opacity: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(236, 72, 153, 0.15)' }}
              >
                <BarChart3 size={24} style={{ color: 'var(--color-accent-magenta)' }} />
              </div>
              <div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Liga
                </h3>
                <span className="text-xs" style={{ color: 'var(--color-accent-magenta)' }}>
                  Tabla de puntos
                </span>
              </div>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Todos contra todos. Tabla general de posiciones.
              Opción de Playoffs al final.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}>
                📊 Tabla general
              </span>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}>
                🏅 Playoffs opcionales
              </span>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
