import { Sun, Moon, RotateCcw, Home } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { clearSavedState } from '../../store/persistence';
import innsolutionsLogo from '../../assets/innsolutions-logo.png';

export default function Header() {
  const theme = useGameStore((s) => s.theme);
  const toggleTheme = useGameStore((s) => s.toggleTheme);
  const resetGame = useGameStore((s) => s.resetGame);
  const gamePhase = useGameStore((s) => s.gamePhase);

  const handleReset = () => {
    if (window.confirm('¿Estás seguro? Se perderá todo el progreso.')) {
      clearSavedState();
      resetGame();
    }
  };

  return (
    <header
      className="flex items-center justify-between px-6 py-3 border-b"
      style={{
        background: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex items-center gap-3">
        <img src={innsolutionsLogo} alt="Inngames" className="h-7 w-auto" />
        <h1
          className="text-xl font-bold tracking-tight m-0"
          style={{
            background: 'linear-gradient(90deg, #ff1870, #a018f0, #0090ff, #00d8ff)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Inngames
        </h1>
        {gamePhase !== 'home' && (
          <span
            className="text-xs px-2 py-1 rounded-full font-medium"
            style={{
              background: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-muted)',
            }}
          >
            {phaseLabel(gamePhase)}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {gamePhase !== 'home' && (
          <>
            <button
              onClick={() => useGameStore.getState().setGamePhase('home')}
              className="p-2 rounded-lg transition-colors cursor-pointer"
              style={{
                background: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-secondary)',
              }}
              title="Inicio"
            >
              <Home size={18} />
            </button>
            <button
              onClick={handleReset}
              className="p-2 rounded-lg transition-colors cursor-pointer"
              style={{
                background: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-secondary)',
              }}
              title="Reiniciar juego"
            >
              <RotateCcw size={18} />
            </button>
          </>
        )}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg transition-colors cursor-pointer"
          style={{
            background: 'var(--color-bg-tertiary)',
            color: 'var(--color-accent-gold)',
          }}
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}

function phaseLabel(phase: string): string {
  const labels: Record<string, string> = {
    registration: 'Registro',
    teams: 'Equipos',
    mode: 'Modo de juego',
    repechage: 'Repechaje',
    bracket: 'Brackets',
    league: 'Liga',
    'pre-round': 'Preparación',
    playing: 'Jugando',
    'round-result': 'Resultado',
    loan: 'Préstamo',
    final: 'Final',
  };
  return labels[phase] || phase;
}
