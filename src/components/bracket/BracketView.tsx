import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { isPowerOfTwo } from '../../lib/validators';
import type { BracketRound } from '../../types';
import BracketMatch from './BracketMatch';
import RepechageView from './RepechageView';

// Layout constants
const MATCH_H = 84;   // estimated card height used to center within slot
const MATCH_W = 200;  // match card width
const CONN_W = 44;    // width of SVG connector between rounds
const SLOT_BASE = 116; // slot height for the densest round (MATCH_H + gap)
const HEADER_H = 44;  // height reserved for round labels

interface Props {
  onPlayMatch: (matchId: string) => void;
  onStartBracketRound?: () => void;
  currentBracketRound?: BracketRound | null;
  nextActionLabel?: string | null;
  hideCompleteButton?: boolean;
  liveScores?: Record<string, { team1Rounds: number[]; team2Rounds: number[] }>;
}

/** Returns the vertical center (px) of match[matchIdx] in a round with numMatches. */
function slotCenter(matchIdx: number, numMatches: number, totalHeight: number) {
  const slot = totalHeight / numMatches;
  return matchIdx * slot + slot / 2;
}

/** Returns the top offset (px) to visually center a card within its slot. */
function matchTop(matchIdx: number, numMatches: number, totalHeight: number) {
  const slot = totalHeight / numMatches;
  return matchIdx * slot + (slot - MATCH_H) / 2;
}

interface ConnectorProps {
  leftCount: number;
  rightCount: number;
  totalHeight: number;
}

/**
 * SVG bracket connector drawn between two adjacent round columns.
 * Supports:  2:1 (standard bracket),  1:1 (repechage same-count),  1:N (repechage feeds last match).
 */
function ConnectorSVG({ leftCount, rightCount, totalHeight }: ConnectorProps) {
  if (leftCount === 0 || rightCount === 0) {
    return <div style={{ width: CONN_W, flexShrink: 0 }} />;
  }

  const halfW = CONN_W / 2;
  const sw = 2;
  const lines: React.ReactNode[] = [];

  if (leftCount === rightCount * 2) {
    // Standard 2:1 — pairs of left matches connect to one right match
    for (let k = 0; k < rightCount; k++) {
      const y1 = slotCenter(2 * k, leftCount, totalHeight);
      const y2 = slotCenter(2 * k + 1, leftCount, totalHeight);
      const yOut = slotCenter(k, rightCount, totalHeight);
      lines.push(
        <line key={`a${k}`} x1={0} y1={y1} x2={halfW} y2={y1} strokeWidth={sw} />,
        <line key={`b${k}`} x1={0} y1={y2} x2={halfW} y2={y2} strokeWidth={sw} />,
        <line key={`c${k}`} x1={halfW} y1={y1} x2={halfW} y2={y2} strokeWidth={sw} />,
        <line key={`d${k}`} x1={halfW} y1={yOut} x2={CONN_W} y2={yOut} strokeWidth={sw} />,
      );
    }
  } else if (leftCount === rightCount) {
    // 1:1 — each left match connects to the corresponding right match
    for (let k = 0; k < leftCount; k++) {
      const yL = slotCenter(k, leftCount, totalHeight);
      const yR = slotCenter(k, rightCount, totalHeight);
      if (Math.abs(yL - yR) < 1) {
        lines.push(
          <line key={`s${k}`} x1={0} y1={yL} x2={CONN_W} y2={yL} strokeWidth={sw} />,
        );
      } else {
        lines.push(
          <line key={`s1${k}`} x1={0} y1={yL} x2={halfW} y2={yL} strokeWidth={sw} />,
          <line key={`s2${k}`} x1={halfW} y1={yL} x2={halfW} y2={yR} strokeWidth={sw} />,
          <line key={`s3${k}`} x1={halfW} y1={yR} x2={CONN_W} y2={yR} strokeWidth={sw} />,
        );
      }
    }
  } else if (leftCount < rightCount) {
    // Repechage feeds the last match of the next round
    for (let i = 0; i < leftCount; i++) {
      const yL = slotCenter(i, leftCount, totalHeight);
      // Map each repechage match to the last available slot in the next round
      const targetIdx = rightCount - leftCount + i;
      const yR = slotCenter(targetIdx, rightCount, totalHeight);
      lines.push(
        <line key={`r1${i}`} x1={0} y1={yL} x2={halfW} y2={yL} strokeWidth={sw} />,
        <line key={`r2${i}`} x1={halfW} y1={yL} x2={halfW} y2={yR} strokeWidth={sw} />,
        <line key={`r3${i}`} x1={halfW} y1={yR} x2={CONN_W} y2={yR} strokeWidth={sw} />,
      );
    }
  } else {
    // Unsupported ratio — render empty spacer
    return <div style={{ width: CONN_W, flexShrink: 0 }} />;
  }

  return (
    <svg
      width={CONN_W}
      height={totalHeight}
      style={{ flexShrink: 0, display: 'block', color: 'var(--color-text-muted)' }}
      stroke="currentColor"
      fill="none"
    >
      {lines}
    </svg>
  );
}

interface RoundColumnProps {
  name: string;
  matches: BracketRound['matches'];
  totalHeight: number;
  headerColor: string;
  onPlayMatch: (id: string) => void;
  liveScores?: Record<string, { team1Rounds: number[]; team2Rounds: number[] }>;
}

function RoundColumn({ name, matches, totalHeight, headerColor, onPlayMatch, liveScores }: RoundColumnProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {/* Header */}
      <div
        style={{
          height: HEADER_H,
          width: MATCH_W,
          display: 'flex',
          alignItems: 'flex-end',
          paddingBottom: 8,
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: headerColor,
          }}
        >
          {name}
        </span>
      </div>
      {/* Matches — absolutely positioned within the column */}
      <div style={{ position: 'relative', width: MATCH_W, height: totalHeight }}>
        {matches.map((match, idx) => (
          <div
            key={match.id}
            style={{
              position: 'absolute',
              top: matchTop(idx, matches.length, totalHeight),
              left: 0,
              width: MATCH_W,
            }}
          >
            <BracketMatch match={match} onPlay={onPlayMatch} hidePlayButton liveRounds={liveScores?.[match.id]} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BracketView({ onPlayMatch, onStartBracketRound, nextActionLabel, hideCompleteButton, liveScores }: Props) {
  const teams = useGameStore((s) => s.teams);
  const bracketRounds = useGameStore((s) => s.bracketRounds);
  const generateBracketTournament = useGameStore((s) => s.generateBracketTournament);
  const enableThirdPlace = useGameStore((s) => s.enableThirdPlace);
  const setEnableThirdPlace = useGameStore((s) => s.setEnableThirdPlace);
  const thirdPlaceMatch = useGameStore((s) => s.thirdPlaceMatch);

  const gameId = useGameStore((s) => s.gameId);
  const [showRepechage, setShowRepechage] = useState(false);
  const needsRepechage =
    (!isPowerOfTwo(teams.length) && teams.length > 3) ||
    (gameId === 'beerpong' && teams.length === 3);

  useEffect(() => {
    if (bracketRounds.length === 0) {
      if (teams.length === 3 && gameId !== 'beerpong') return; // FFA mode — BracketPage handles it
      if (needsRepechage) {
        setShowRepechage(true);
      } else {
        generateBracketTournament();
      }
    }
  }, []);

  if (showRepechage && bracketRounds.length === 0) {
    return (
      <RepechageView
        onComplete={() => {
          setShowRepechage(false);
          generateBracketTournament();
        }}
      />
    );
  }

  const finalRound = bracketRounds[bracketRounds.length - 1];
  const finalMatch = finalRound?.matches[0];
  const isComplete = finalMatch?.result?.winnerId != null;

  const semiRound = bracketRounds.find((r) => r.name === 'Semifinal');
  const allSemisDone = semiRound?.matches.every((m) => m.result) ?? false;
  const showThirdPlaceToggle = bracketRounds.length >= 3 && !allSemisDone;

  // Total height is determined by the round with the most matches
  const maxMatches = Math.max(...bracketRounds.map((r) => r.matches.length), 1);
  const totalHeight = maxMatches * SLOT_BASE;

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          🏆 Torneo - Brackets
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {teams.length} equipos en eliminación directa
        </p>
      </div>

      {/* Third place toggle — only before semis are done */}
      {showThirdPlaceToggle && (
        <div className="flex justify-center">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enableThirdPlace}
              onChange={(e) => setEnableThirdPlace(e.target.checked)}
              className="w-4 h-4 accent-(--color-accent-gold)"
            />
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Activar partido por 3er lugar
            </span>
          </label>
        </div>
      )}

      {/* Bracket tree with connectors */}
      <div className="overflow-x-auto pb-4">
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            paddingLeft: 16,
            paddingRight: 16,
            minWidth: 'max-content',
          }}
        >
          {bracketRounds.map((round, idx) => {
            const nextRound = idx < bracketRounds.length - 1 ? bracketRounds[idx + 1] : null;
            const roundColor =
              idx === bracketRounds.length - 1
                ? 'var(--color-accent-gold)'
                : 'var(--color-accent-cyan)';

            return (
              <React.Fragment key={round.roundNumber}>
                <RoundColumn
                  name={round.name}
                  matches={round.matches}
                  totalHeight={totalHeight}
                  headerColor={roundColor}
                  onPlayMatch={onPlayMatch}
                  liveScores={liveScores}
                />

                {/* Connector to next round */}
                {nextRound && (
                  <div style={{ flexShrink: 0, paddingTop: HEADER_H }}>
                    <ConnectorSVG
                      leftCount={round.matches.length}
                      rightCount={nextRound.matches.length}
                      totalHeight={totalHeight}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {/* Third place — separate column appended after the final, no connectors */}
          {enableThirdPlace && thirdPlaceMatch && (
            <>
              <div style={{ flexShrink: 0, width: CONN_W + 12, paddingTop: HEADER_H }} />
              <RoundColumn
                name="3er Lugar"
                matches={[thirdPlaceMatch]}
                totalHeight={totalHeight}
                headerColor="var(--color-accent-gold)"
                onPlayMatch={onPlayMatch}
              />
            </>
          )}
        </div>
      </div>

      {/* Play bracket round button */}
      {onStartBracketRound && nextActionLabel && (
        <div className="flex justify-center">
          <button onClick={onStartBracketRound} className="btn-primary text-lg px-8 py-3">
            {nextActionLabel}
          </button>
        </div>
      )}

      {/* Complete button */}
      {isComplete && !hideCompleteButton && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => useGameStore.getState().setGamePhase('final')}
            className="btn-success text-lg px-8 py-3"
          >
            🏆 Ver Resultados Finales
          </button>
        </div>
      )}
    </div>
  );
}

