import { useState } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, ArrowRight, AlertTriangle, Minus, Plus, LayoutDashboard } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

interface Props {
  onContinue: () => void;
  onRepeat: () => void;
  onViewBracket?: () => void;
}

export default function RoundResult({ onContinue, onRepeat, onViewBracket }: Props) {
  const gameplay = useGameStore((s) => s.gameplay);
  const finishRound = useGameStore((s) => s.finishRound);
  const teams = useGameStore((s) => s.teams);

  const [hasPenalty, setHasPenalty] = useState(false);
  const [penaltyAmount, setPenaltyAmount] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  const team = teams.find((t) => t.id === gameplay.currentTeamId);
  const finalScore = Math.max(0, gameplay.roundScore - penaltyAmount);

  const handleConfirm = () => {
    finishRound(penaltyAmount);
    setConfirmed(true);
  };

  const handleContinue = () => {
    onContinue();
  };

  const handleRepeat = () => {
    onRepeat();
  };

  return (
    <div className="flex flex-col gap-6 items-center">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Resultado de la Ronda
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {team?.name} — Ronda {gameplay.currentRound}
        </p>
      </div>

      {/* Score display */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card p-8 text-center"
      >
        <div className="score-display mb-2" style={{ color: 'var(--color-accent-cyan)' }}>
          {confirmed ? finalScore : gameplay.roundScore}
        </div>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          puntos esta ronda
        </p>

        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div>
            <span className="font-bold" style={{ color: 'var(--color-accent-green)' }}>
              {gameplay.roundScore}
            </span>
            <span className="ml-1" style={{ color: 'var(--color-text-muted)' }}>aciertos</span>
          </div>
          <div>
            <span className="font-bold" style={{ color: 'var(--color-text-muted)' }}>
              {gameplay.roundSkips}
            </span>
            <span className="ml-1" style={{ color: 'var(--color-text-muted)' }}>pasados</span>
          </div>
        </div>
      </motion.div>

      {/* Penalty section */}
      {!confirmed && (
        <div className="glass-card p-4 max-w-md w-full">
          <label className="flex items-center gap-2 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={hasPenalty}
              onChange={(e) => {
                setHasPenalty(e.target.checked);
                if (!e.target.checked) setPenaltyAmount(0);
              }}
              className="w-4 h-4 accent-[var(--color-accent-red)]"
            />
            <AlertTriangle size={16} style={{ color: 'var(--color-accent-gold)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              ¿Hubo error o penalización?
            </span>
          </label>

          {hasPenalty && (
            <div className="flex items-center gap-3 justify-center">
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Restar puntos:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPenaltyAmount(Math.max(0, penaltyAmount - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
                  style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)' }}
                >
                  <Minus size={14} />
                </button>
                <span className="font-mono text-xl font-bold w-8 text-center"
                  style={{ color: 'var(--color-accent-red)' }}>
                  {penaltyAmount}
                </span>
                <button
                  onClick={() => setPenaltyAmount(Math.min(gameplay.roundScore, penaltyAmount + 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
                  style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)' }}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}

          {hasPenalty && penaltyAmount > 0 && (
            <div className="text-center mt-2 text-sm">
              <span style={{ color: 'var(--color-text-muted)' }}>Puntuación final: </span>
              <span className="font-bold" style={{ color: 'var(--color-accent-cyan)' }}>
                {finalScore}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        {!confirmed ? (
          <>
            <button onClick={handleRepeat} className="btn-secondary flex items-center gap-2">
              <RotateCcw size={16} />
              Repetir Ronda
            </button>
            <button onClick={handleConfirm} className="btn-success flex items-center gap-2 px-6">
              Confirmar Puntos
            </button>
          </>
        ) : (
          <div className="flex gap-3 flex-wrap justify-center">
            <button onClick={handleContinue} className="btn-primary flex items-center gap-2 text-lg px-8 py-3">
              Continuar
              <ArrowRight size={20} />
            </button>
            {onViewBracket && (
              <button onClick={onViewBracket} className="btn-secondary flex items-center gap-2">
                <LayoutDashboard size={16} />
                Ver bracket
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
