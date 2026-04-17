import Champion from '../components/final/Champion';
import MatchHistory from '../components/final/MatchHistory';
import BracketView from '../components/bracket/BracketView';
import FFAScoreTable from '../components/gameplay/FFAScoreTable';
import { useGameStore } from '../store/gameStore';
import { clearSavedState } from '../store/persistence';
import { Home, RotateCcw, Trophy } from 'lucide-react';
import { useState } from 'react';

export default function FinalPage() {
  const resetGame = useGameStore((s) => s.resetGame);
  const setGamePhase = useGameStore((s) => s.setGamePhase);
  const teams = useGameStore((s) => s.teams);
  const matches = useGameStore((s) => s.matches);
  const gameMode = useGameStore((s) => s.gameMode);
  const [showBracket, setShowBracket] = useState(false);

  const isFFA = gameMode === 'ffa';
  const ffaMatch = isFFA ? matches.find((m) => m.ffaRounds) : null;

  const handleNewGame = () => {
    clearSavedState();
    resetGame();
    setGamePhase('home');
  };

  const handleHome = () => {
    setGamePhase('home');
  };

  if (showBracket) {
    return (
      <div className="flex flex-col gap-6 items-center">
        <BracketView onPlayMatch={() => {}} hideCompleteButton />
        <button
          onClick={() => setShowBracket(false)}
          className="btn-primary flex items-center gap-2"
        >
          <Trophy size={16} />
          Volver a Campeón
        </button>
      </div>
    );
  }

  const actionButtons = (
    <div className="flex gap-3 mt-4 flex-wrap justify-center">
      {!isFFA && (
        <button onClick={() => setShowBracket(true)} className="btn-success text-lg px-8 py-3 flex items-center gap-2">
          🏅 Ver Resultados
        </button>
      )}
      <button onClick={handleHome} className="btn-secondary flex items-center gap-2">
        <Home size={16} />
        Inicio
      </button>
      <button onClick={handleNewGame} className="btn-primary flex items-center gap-2">
        <RotateCcw size={16} />
        Nuevo Juego
      </button>
    </div>
  );

  if (isFFA && ffaMatch) {
    return (
      <div className="flex flex-col gap-8 items-center">
        <Champion />
        <FFAScoreTable
          teams={teams}
          allRounds={ffaMatch.ffaRounds!}
          onContinue={handleNewGame}
          isLast={false}
          staticMode
          backLabel="Nuevo Juego"
        />
        <button onClick={handleHome} className="btn-secondary flex items-center gap-2">
          <Home size={16} />
          Inicio
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 items-center">
      <Champion />
      <MatchHistory />
      {actionButtons}
    </div>
  );
}
