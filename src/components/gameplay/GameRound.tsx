import { useEffect, useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, SkipForward } from 'lucide-react';
import { useTimer } from '../../hooks/useTimer';
import { useWords } from '../../hooks/useWords';
import { useSoundFx } from '../../hooks/useSoundFx';
import { useGameStore } from '../../store/gameStore';

interface LogEntry {
  id: number;
  word: string;
  result: 'correct' | 'skip';
}

interface Props {
  onFinish: () => void;
}

export default function GameRound({ onFinish }: Props) {
  const gameplay = useGameStore((s) => s.gameplay);
  const recordPoint = useGameStore((s) => s.recordPoint);
  const skipWord = useGameStore((s) => s.skipWord);
  const setWord = useGameStore((s) => s.setWord);
  const timerDuration = useGameStore((s) => s.timerDuration);
  const teams = useGameStore((s) => s.teams);

  const team = teams.find((t) => t.id === gameplay.currentTeamId);
  const { getNextWord } = useWords();
  const { playCorrect, playSkip, playWarning, playBuzzer } = useSoundFx();

  const [wordLog, setWordLog] = useState<LogEntry[]>([]);
  const logIdRef = useRef(0);

  const addToLog = useCallback((word: string, result: 'correct' | 'skip') => {
    setWordLog((prev) => {
      const next = [...prev, { id: ++logIdRef.current, word, result }];
      return next.slice(-3);
    });
  }, []);

  const handleTimerFinish = useCallback(() => {
    playBuzzer();
    onFinish();
  }, [playBuzzer, onFinish]);

  const { seconds, percentage, start } = useTimer(
    timerDuration,
    (s) => {
      if (s === 10 || s === 5 || s === 3 || s === 2 || s === 1) {
        playWarning();
      }
    },
    handleTimerFinish
  );

  useEffect(() => {
    const word = getNextWord();
    setWord(word);
    start();
  }, []);

  const handleCorrect = () => {
    playCorrect();
    addToLog(gameplay.currentWord ?? '', 'correct');
    recordPoint();
    const word = getNextWord();
    setWord(word);
  };

  const handleSkip = () => {
    playSkip();
    addToLog(gameplay.currentWord ?? '', 'skip');
    skipWord();
    const word = getNextWord();
    setWord(word);
  };

  const timerColor =
    percentage > 50 ? 'timer-bar--green' : percentage > 20 ? 'timer-bar--yellow' : 'timer-bar--red';

  const textColor =
    seconds > 30 ? 'var(--color-accent-green)' : seconds > 10 ? 'var(--color-accent-gold)' : 'var(--color-accent-red)';

  return (
    <div className="flex-1 flex flex-col">
      {/* Timer bar */}
      <div
        className="w-full h-2 rounded-full overflow-hidden mb-2"
        style={{ background: 'var(--color-bg-tertiary)' }}
      >
        <div
          className={`timer-bar h-full ${timerColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Header info */}
      <div className="flex items-center justify-between px-4 py-2">
        <div>
          <span className="text-sm font-medium" style={{ color: 'var(--color-accent-cyan)' }}>
            {team?.name}
          </span>
          <span className="text-sm ml-2" style={{ color: 'var(--color-text-muted)' }}>
            Ronda {gameplay.currentRound}
          </span>
        </div>
        <div className="font-mono text-2xl font-bold" style={{ color: textColor }}>
          {seconds}s
        </div>
      </div>

      {/* Word display */}
      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          key={gameplay.currentWord}
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="word-display text-center"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {gameplay.currentWord}
        </motion.div>
      </div>

      {/* Score */}
      <div className="text-center mb-2">
        <span className="score-display" style={{ color: 'var(--color-accent-cyan)' }}>
          {gameplay.roundScore}
        </span>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          aciertos
        </p>
      </div>

      {/* Word log */}
      <div
        className="mx-4 mb-3 rounded-xl overflow-hidden"
        style={{
          minHeight: 96,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          gap: 4,
        }}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {wordLog.map((entry, idx) => {
            const isLast = idx === wordLog.length - 1;
            const opacity = idx === wordLog.length - 1 ? 1 : idx === wordLog.length - 2 ? 0.55 : 0.28;
            const scale = isLast ? 1 : idx === wordLog.length - 2 ? 0.95 : 0.9;
            const isCorrect = entry.result === 'correct';

            return (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.85 }}
                animate={{ opacity, y: 0, scale }}
                exit={{ opacity: 0, y: -12, scale: 0.88, transition: { duration: 0.25 } }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  borderRadius: 10,
                  background: isLast
                    ? isCorrect
                      ? 'rgba(16,185,129,0.12)'
                      : 'rgba(100,100,120,0.10)'
                    : 'transparent',
                  border: isLast
                    ? `1px solid ${isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(139,140,168,0.2)'}`
                    : '1px solid transparent',
                }}
              >
                {isCorrect ? (
                  <Check size={14} style={{ color: 'var(--color-accent-green)', flexShrink: 0 }} />
                ) : (
                  <SkipForward size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                )}
                <span
                  style={{
                    fontSize: isLast ? 14 : 12,
                    fontWeight: isLast ? 700 : 500,
                    color: isCorrect ? 'var(--color-accent-green)' : 'var(--color-text-muted)',
                    letterSpacing: isLast ? '0.04em' : '0.02em',
                    textTransform: 'uppercase',
                  }}
                >
                  {entry.word}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 justify-center pb-8">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSkip}
          className="flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-bold cursor-pointer transition-all"
          style={{
            background: 'var(--color-bg-tertiary)',
            color: 'var(--color-text-secondary)',
            border: '2px solid var(--color-border)',
          }}
        >
          <SkipForward size={24} />
          Pasar
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleCorrect}
          className="flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-bold cursor-pointer transition-all"
          style={{
            background: 'linear-gradient(135deg, #059669, var(--color-accent-green))',
            color: 'white',
            border: 'none',
            boxShadow: 'var(--shadow-glow-cyan)',
          }}
        >
          <Check size={24} />
          ¡Acierto!
        </motion.button>
      </div>
    </div>
  );
}
