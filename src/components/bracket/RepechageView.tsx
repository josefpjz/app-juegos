import { useState } from 'react';
import { motion } from 'motion/react';
import { Dice5 } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useDice } from '../../hooks/useDice';
import type { DiceResult } from '../../types';
import { calculateRepechageTeams } from '../../lib/bracketUtils';
import { selectRepechageTeams } from '../../lib/repechageUtils';

interface Props {
  onComplete: () => void;
}

export default function RepechageView({ onComplete }: Props) {
  const teams = useGameStore((s) => s.teams);
  const setDiceResults = useGameStore((s) => s.setDiceResults);
  const setBracketAdvancingCount = useGameStore((s) => s.setBracketAdvancingCount);
  const repechageCount = calculateRepechageTeams(teams.length);

  const [phase, setPhase] = useState<'info' | 'rolling' | 'results'>('info');
  const [results, setResults] = useState<DiceResult[]>([]);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const { rolling, displayValue, roll } = useDice();

  const handleStartRolling = () => {
    setPhase('rolling');
    setCurrentTeamIndex(0);
    setResults([]);
  };

  const handleRollForTeam = async () => {
    const value = await roll();
    const newResult: DiceResult = {
      teamId: teams[currentTeamIndex].id,
      teamName: teams[currentTeamIndex].name,
      roll: value,
    };
    const updatedResults = [...results, newResult];
    setResults(updatedResults);

    if (currentTeamIndex + 1 >= teams.length) {
      setDiceResults(updatedResults);
      setPhase('results');
    } else {
      setCurrentTeamIndex((i) => i + 1);
    }
  };

  const handleConfirm = () => {
    // Reorder teams: advancing teams first (they get byes), repechage teams last (they play round 1)
    const { advancingTeamIds, repechageTeamIds: repIds } = selectRepechageTeams(results, repechageCount);
    const advancingTeams = advancingTeamIds
      .map((id) => teams.find((t) => t.id === id)!)
      .filter(Boolean);
    const repTeams = repIds
      .map((id) => teams.find((t) => t.id === id)!)
      .filter(Boolean);
    // Store reordered: advancing first, repechage last
    useGameStore.setState({ teams: [...advancingTeams, ...repTeams] });
    setBracketAdvancingCount(advancingTeams.length);
    onComplete();
  };

  const sortedResults = [...results].sort((a, b) => b.roll - a.roll);
  const { repechageTeamIds, advancingTeamIds } = results.length === teams.length
    ? selectRepechageTeams(results, repechageCount)
    : { repechageTeamIds: [] as string[], advancingTeamIds: [] as string[] };

  const allInRepechage = results.length === teams.length && advancingTeamIds.length === 0;

  const handleReroll = () => {
    setResults([]);
    setCurrentTeamIndex(0);
    setPhase('rolling');
  };

  return (
    <div className="flex flex-col gap-6 items-center">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          🎲 Repechaje
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {teams.length} equipos no es potencia de 2. Al menos {repechageCount} equipos irán a repechaje.
        </p>
      </div>

      {phase === 'info' && (
        <div className="glass-card p-6 max-w-lg text-center">
          <Dice5 size={48} style={{ color: 'var(--color-accent-gold)' }} className="mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Modo Dado
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            Cada equipo lanzará un dado. Los {repechageCount} equipos con los
            números más bajos jugarán rondas de repechaje antes de entrar al bracket.
          </p>
          <button onClick={handleStartRolling} className="btn-primary px-6 py-3">
            🎲 Comenzar Lanzamientos
          </button>
        </div>
      )}

      {phase === 'rolling' && (
        <div className="glass-card p-8 text-center max-w-md">
          <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--color-accent-cyan)' }}>
            {teams[currentTeamIndex]?.name}
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            🎯 Tira el dado:{' '}
            <span className="font-bold" style={{ color: 'var(--color-accent-gold)' }}>
              {teams[currentTeamIndex]?.players.find(
                (p) => p.id === teams[currentTeamIndex]?.captainId
              )?.name || teams[currentTeamIndex]?.players[0]?.name}
            </span>
            {' '}(capitán)
          </p>

          <motion.div
            className={`text-7xl font-bold my-6 ${rolling ? 'dice-rolling' : ''}`}
            style={{ color: 'var(--color-accent-gold)' }}
            animate={rolling ? {} : { scale: [1, 1.2, 1] }}
            transition={{ duration: 0.3 }}
          >
            🎲 {displayValue}
          </motion.div>

          <button
            onClick={handleRollForTeam}
            disabled={rolling}
            className="btn-primary px-8 py-3 text-lg"
          >
            {rolling ? 'Lanzando...' : 'Lanzar Dado'}
          </button>

          {/* Results so far */}
          {results.length > 0 && (
            <div className="mt-6 text-left">
              <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Resultados:
              </h4>
              {results.map((r) => {
                const team = teams.find((t) => t.id === r.teamId);
                return (
                  <div key={r.teamId} className="flex justify-between text-sm py-1">
                    <div className="flex flex-col">
                      <span style={{ color: 'var(--color-text-secondary)' }}>{r.teamName}</span>
                      <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                        {team?.players.map((p) => p.name).join(', ')}
                      </span>
                    </div>
                    <span className="font-mono font-bold" style={{ color: 'var(--color-accent-gold)' }}>
                      {r.roll}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {phase === 'results' && (
        <div className="glass-card p-6 max-w-lg w-full">
          <h3 className="text-lg font-bold mb-4 text-center" style={{ color: 'var(--color-text-primary)' }}>
            Resultados del Dado
          </h3>

          <div className="flex flex-col gap-2">
            {sortedResults.map((r, i) => {
              const isRepechage = repechageTeamIds.includes(r.teamId);
              const team = teams.find((t) => t.id === r.teamId);
              return (
                <motion.div
                  key={r.teamId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between py-2 px-4 rounded-lg"
                  style={{
                    background: isRepechage ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold" style={{ color: 'var(--color-accent-gold)' }}>
                      {r.roll}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {r.teamName}
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                        {team?.players.map((p) => p.name).join(', ')}
                      </span>
                    </div>
                  </div>
                  <span
                    className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{
                      background: isRepechage ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: isRepechage ? 'var(--color-accent-red)' : 'var(--color-accent-green)',
                    }}
                  >
                    {isRepechage ? '⚔️ Repechaje' : '✓ Avanza'}
                  </span>
                </motion.div>
              );
            })}
          </div>

          <div className="flex justify-center mt-6">
            {allInRepechage ? (
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm font-medium text-center" style={{ color: 'var(--color-accent-red)' }}>
                  ⚠️ Todos los equipos empataron. Se deben relanzar los dados.
                </p>
                <button onClick={handleReroll} className="btn-primary px-8 py-3">
                  🎲 Relanzar dados
                </button>
              </div>
            ) : (
              <button onClick={handleConfirm} className="btn-success px-8 py-3">
                Continuar al Bracket →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
