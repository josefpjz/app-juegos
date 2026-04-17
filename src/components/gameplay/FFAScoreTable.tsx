import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { ArrowRight, Trophy } from 'lucide-react';
import type { Team, RoundScore } from '../../types';

const ROUNDS_PER_TEAM = 2;

interface TeamScore {
  teamId: string;
  name: string;
  players: string;
  roundScores: (number | null)[];
  total: number;
}

interface Props {
  teams: Team[];
  allRounds: RoundScore[];
  onContinue: () => void;
  isLast: boolean;
  backLabel?: string;
  staticMode?: boolean;
}

function computeScores(teams: Team[], rounds: RoundScore[]): TeamScore[] {
  const numTeams = teams.length;
  const data: Record<string, (number | null)[]> = {};
  teams.forEach((t) => { data[t.id] = Array(ROUNDS_PER_TEAM).fill(null); });

  rounds.forEach((r, idx) => {
    const teamId = teams[idx % numTeams].id;
    const rndIdx = Math.floor(idx / numTeams);
    if (rndIdx < ROUNDS_PER_TEAM) {
      data[teamId][rndIdx] = r.points;
    }
  });

  return [...teams]
    .map((t) => ({
      teamId: t.id,
      name: t.name,
      players: t.players.map((p) => p.name).join(' & '),
      roundScores: data[t.id],
      total: data[t.id].reduce((s: number, v) => s + (v ?? 0), 0),
    }))
    .sort(
      (a, b) =>
        b.total - a.total ||
        teams.findIndex((t) => t.id === a.teamId) - teams.findIndex((t) => t.id === b.teamId)
    );
}

const MEDALS = ['🥇', '🥈', '🥉'];
const MEDAL_COLORS = [
  'var(--color-accent-gold)',
  'var(--color-text-secondary)',
  'var(--color-text-muted)',
];

export default function FFAScoreTable({ teams, allRounds, onContinue, isLast, backLabel, staticMode }: Props) {
  const prevRounds = allRounds.length > 0 ? allRounds.slice(0, -1) : [];
  const prevScores = computeScores(teams, prevRounds);
  const currScores = computeScores(teams, allRounds);

  const [displayScores, setDisplayScores] = useState<TeamScore[]>(staticMode ? currScores : prevScores);
  const [raisedIds, setRaisedIds] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(staticMode ? true : false);

  useEffect(() => {
    if (staticMode) return;
    // Short delay then animate to current order
    const t1 = setTimeout(() => {
      const raised = new Set<string>();
      currScores.forEach((cs, newIdx) => {
        const oldIdx = prevScores.findIndex((ps) => ps.teamId === cs.teamId);
        if (oldIdx !== -1 && oldIdx > newIdx) raised.add(cs.teamId);
      });
      setRaisedIds(raised);
      setDisplayScores(currScores);
      setReady(true);
    }, 500);
    return () => clearTimeout(t1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const roundHeaders = Array.from({ length: ROUNDS_PER_TEAM }, (_, i) => `R${i + 1}`);

  return (
    <motion.div
      className="flex flex-col gap-6 items-center w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Marcador
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          {isLast ? 'Resultado final' : 'Posiciones al momento'}
        </p>
      </div>

      <div className="w-full glass-card p-4">
        {/* Header */}
        <div
          className="grid text-xs font-bold uppercase tracking-wider px-3 pb-2 mb-1"
          style={{
            gridTemplateColumns: `28px 1fr ${roundHeaders.map(() => '52px').join(' ')} 64px`,
            color: 'var(--color-text-muted)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <span>#</span>
          <span>Integrantes</span>
          {roundHeaders.map((h) => (
            <span key={h} className="text-center">{h}</span>
          ))}
          <span className="text-right">Global</span>
        </div>

        {/* Animated rows */}
        <div className="flex flex-col gap-1 mt-2" style={{ position: 'relative' }}>
          {displayScores.map((score, i) => {
            const isRaised = raisedIds.has(score.teamId);
            const isLeader = i === 0;

            return (
              <motion.div
                key={score.teamId}
                layout
                layoutId={`ffa-row-${score.teamId}`}
                transition={{ duration: 0.65, type: 'spring', stiffness: 190, damping: 24 }}
                style={{
                  borderRadius: 10,
                  border: `1px solid ${isLeader ? 'var(--color-accent-gold)' : 'var(--color-border)'}`,
                  overflow: 'hidden',
                  background: isLeader ? 'rgba(245,158,11,0.06)' : 'var(--color-bg-card)',
                }}
              >
                {/* Green flash for remount */}
                {isRaised && ready && (
                  <motion.div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 10,
                      background: 'rgba(16,185,129,0.28)',
                      pointerEvents: 'none',
                    }}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 1.4, delay: 0.1 }}
                  />
                )}

                <div
                  className="grid items-center px-3 py-3 relative"
                  style={{
                    gridTemplateColumns: `28px 1fr ${roundHeaders.map(() => '52px').join(' ')} 64px`,
                  }}
                >
                  <span className="text-base">{MEDALS[i]}</span>

                  <div>
                    <div
                      className="font-bold text-sm"
                      style={{ color: MEDAL_COLORS[i] }}
                    >
                      {score.players}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {score.name}
                    </div>
                  </div>

                  {score.roundScores.map((pts, ri) => (
                    <span
                      key={ri}
                      className="text-center font-mono text-sm"
                      style={{
                        color: pts !== null ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                      }}
                    >
                      {pts !== null ? pts : '—'}
                    </span>
                  ))}

                  <span
                    className="text-right font-black text-base tabular-nums"
                    style={{ color: isLeader ? 'var(--color-accent-gold)' : 'var(--color-accent-cyan)' }}
                  >
                    {score.total}
                  </span>
                </div>

                {/* "Remontó" label */}
                {isRaised && ready && (
                  <motion.div
                    className="text-xs text-center pb-1 font-bold"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: [0, 1, 1, 0], height: 'auto' }}
                    transition={{ duration: 1.8, times: [0, 0.15, 0.7, 1] }}
                    style={{ color: 'var(--color-accent-green)' }}
                  >
                    ↑ Remontó
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.button
        onClick={onContinue}
        className="btn-primary flex items-center gap-2 text-lg px-8 py-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        {backLabel ? (
          <><Trophy size={20} /> {backLabel}</>
        ) : isLast ? (
          <><Trophy size={20} /> Ver ganador</>
        ) : (
          <>Continuar <ArrowRight size={20} /></>
        )}
      </motion.button>
    </motion.div>
  );
}
