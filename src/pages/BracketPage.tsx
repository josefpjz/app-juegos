import { useState, useMemo, useEffect } from 'react';
import type { RoundScore } from '../types';
import { motion } from 'motion/react';
import { useGameStore } from '../store/gameStore';
import { createThirdPlaceMatch } from '../lib/bracketUtils';
import BracketView from '../components/bracket/BracketView';
import PreRound from '../components/gameplay/PreRound';
import BeerPongPreRound from '../components/gameplay/BeerPongPreRound';
import GameRound from '../components/gameplay/GameRound';
import BeerPongGameRound from '../components/gameplay/BeerPongGameRound';
import RoundResult from '../components/gameplay/RoundResult';
import PlayerLoan from '../components/loan/PlayerLoan';
import FFAScoreTable from '../components/gameplay/FFAScoreTable';

const ROUNDS_PER_TEAM = 2;

/**
 * A "turn" is one team playing one game round within a match.
 * The bracket round queue interleaves all matches:
 *   Game Round 1: match1-team1, match1-team2, match2-team1, match2-team2, ...
 *   Game Round 2: match1-team1, match1-team2, match2-team1, match2-team2, ...
 */
interface Turn {
  matchId: string;
  teamId: string;
  gameRound: number; // 1 or 2
}

type SubPhase = 'bracket-view' | 'pre' | 'playing' | 'result' | 'suspense' | 'bracket-mid' | 'ffa' | 'ffa-scores';

function SuspenseWinner({ winnerId }: { winnerId: string | null }) {
  const teams = useGameStore((s) => s.teams);
  const winner = teams.find((t) => t.id === winnerId);

  useEffect(() => {
    const timer = setTimeout(() => {
      useGameStore.getState().setGamePhase('final');
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="flex flex-col gap-10 items-center justify-center"
      style={{ minHeight: '60vh' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.p
        className="text-2xl font-medium"
        style={{ color: 'var(--color-text-muted)' }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Y el ganador es...
      </motion.p>
      <motion.div
        className="text-5xl font-black text-center px-4"
        style={{ color: 'var(--color-accent-gold)' }}
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.8, duration: 0.8, type: 'spring', stiffness: 180 }}
      >
        🏆 {winner?.name ?? '???'}
      </motion.div>
    </motion.div>
  );
}

export default function BracketPage() {
  const setCurrentMatch = useGameStore((s) => s.setCurrentMatch);
  const startRound = useGameStore((s) => s.startRound);
  const resetCurrentRound = useGameStore((s) => s.resetCurrentRound);
  const advanceBracketWinner = useGameStore((s) => s.advanceBracketWinner);
  const bracketRounds = useGameStore((s) => s.bracketRounds);
  const matches = useGameStore((s) => s.matches);
  const enableThirdPlace = useGameStore((s) => s.enableThirdPlace);
  const thirdPlaceMatch = useGameStore((s) => s.thirdPlaceMatch);
  const setThirdPlaceMatch = useGameStore((s) => s.setThirdPlaceMatch);
  const teams = useGameStore((s) => s.teams);
  const gameMode = useGameStore((s) => s.gameMode);
  const gameId = useGameStore((s) => s.gameId);

  const [subPhase, setSubPhase] = useState<SubPhase>('bracket-view');
  const [turnIndex, setTurnIndex] = useState(0);
  const [turnQueue, setTurnQueue] = useState<Turn[]>([]);
  const [suspenseWinnerId, setSuspenseWinnerId] = useState<string | null>(null);
  const [showLoan, setShowLoan] = useState(false);
  const [ffaNextIdx, setFfaNextIdx] = useState(0);

  const isFFA = gameMode === 'ffa';
  const roundsPerTeam = gameId === 'beerpong' ? 1 : ROUNDS_PER_TEAM;
  const [ffaMatchId] = useState(() => `ffa-${Date.now()}`);

  // FFA initialization
  useEffect(() => {
    if (!isFFA) return;
    const ffaMatch = {
      id: ffaMatchId,
      team1Id: teams[0].id,
      team2Id: teams[1].id,
      result: null,
    };
    useGameStore.getState().addMatch(ffaMatch);
    const queue: Turn[] = [];
    for (let gr = 1; gr <= roundsPerTeam; gr++) {
      for (const team of teams) {
        queue.push({ matchId: ffaMatchId, teamId: team.id, gameRound: gr });
      }
    }
    setTurnQueue(queue);
    setTurnIndex(0);
    setCurrentMatch(ffaMatchId);
    setSubPhase('ffa');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Find the current bracket round (first round with unfinished playable matches)
  const currentBracketRound = useMemo(() => {
    for (const round of bracketRounds) {
      const playable = round.matches.filter(
        (m) => m.team1Id && m.team2Id && !m.result && !m.isBye
      );
      if (playable.length > 0) return round;
    }
    return null;
  }, [bracketRounds]);

  // Check if 3rd place match needs to be played before the final
  const needsThirdPlaceFirst = useMemo(() => {
    if (!enableThirdPlace) return false;
    // If there's already a 3rd place match that's not completed, it must be played
    if (thirdPlaceMatch && !thirdPlaceMatch.result) return true;
    // If semifinals are done but 3rd place match hasn't been created yet
    const semiRound = bracketRounds.find(r => r.name === 'Semifinal');
    if (!semiRound) return false;
    const allSemisDone = semiRound.matches.every(m => m.result);
    const finalRound = bracketRounds[bracketRounds.length - 1];
    const finalNotPlayed = finalRound && !finalRound.matches[0]?.result;
    return allSemisDone && finalNotPlayed && !thirdPlaceMatch;
  }, [enableThirdPlace, thirdPlaceMatch, bracketRounds]);

  // The label for the next action button
  const nextActionLabel = useMemo(() => {
    if (needsThirdPlaceFirst) return '▶ Jugar 3er Lugar';
    if (currentBracketRound) return `▶ Jugar ${currentBracketRound.name}`;
    return null;
  }, [needsThirdPlaceFirst, currentBracketRound]);

  // Build the turn queue for the bracket round
  const buildTurnQueue = (): Turn[] => {
    if (!currentBracketRound) return [];
    const playable = currentBracketRound.matches.filter(
      (m) => m.team1Id && m.team2Id && !m.result && !m.isBye
    );
    const turns: Turn[] = [];
    for (let gr = 1; gr <= roundsPerTeam; gr++) {
      for (const match of playable) {
        turns.push({ matchId: match.id, teamId: match.team1Id, gameRound: gr });
        turns.push({ matchId: match.id, teamId: match.team2Id, gameRound: gr });
      }
    }
    return turns;
  };

  const handleStartBracketRound = () => {
    // Handle 3rd place match
    if (needsThirdPlaceFirst) {
      let tpMatch = thirdPlaceMatch;
      if (!tpMatch) {
        // Generate the 3rd place match from semifinal losers
        tpMatch = createThirdPlaceMatch(bracketRounds, teams);
        if (!tpMatch) return;
        setThirdPlaceMatch(tpMatch);
        // Also add it to the matches array
        useGameStore.getState().addMatch(tpMatch);
      }
      // Build a turn queue for just the 3rd place match
      const turns: Turn[] = [];
      for (let gr = 1; gr <= roundsPerTeam; gr++) {
        turns.push({ matchId: tpMatch.id, teamId: tpMatch.team1Id, gameRound: gr });
        turns.push({ matchId: tpMatch.id, teamId: tpMatch.team2Id, gameRound: gr });
      }
      setTurnQueue(turns);
      setTurnIndex(0);
      setCurrentMatch(tpMatch.id);
      setSubPhase('pre');
      return;
    }

    if (!currentBracketRound) return;

    // Auto-advance bye matches (only one team, no opponent)
    for (const match of currentBracketRound.matches) {
      if (match.isBye && match.team1Id && !match.team2Id && !match.result) {
        // Set a dummy result and advance
        useGameStore.setState((state) => ({
          matches: state.matches.map((m) =>
            m.id === match.id
              ? { ...m, result: { team1Scores: [], team2Scores: [], team1Total: 0, team2Total: 0, winnerId: match.team1Id } }
              : m
          ),
          bracketRounds: state.bracketRounds.map((r) => ({
            ...r,
            matches: r.matches.map((m) =>
              m.id === match.id
                ? { ...m, result: { team1Scores: [], team2Scores: [], team1Total: 0, team2Total: 0, winnerId: match.team1Id } }
                : m
            ),
          })),
        }));
        advanceBracketWinner(match.id, match.team1Id);
      }
    }

    const queue = buildTurnQueue();
    if (queue.length === 0) {
      // All matches were byes — go back to bracket view to show next round
      setSubPhase('bracket-view');
      return;
    }
    setTurnQueue(queue);
    setTurnIndex(0);
    const first = queue[0];
    setCurrentMatch(first.matchId);
    setSubPhase('pre');
  };

  const currentTurn = turnQueue[turnIndex] || null;

  const handlePreRoundDone = () => {
    if (!currentTurn) return;
    startRound(currentTurn.teamId, currentTurn.gameRound);
    setSubPhase('playing');
  };

  const handleRoundFinish = () => {
    setSubPhase('result');
  };

  const handleBeerPongFinish = (winnerId: string, team1Cups: number, team2Cups: number) => {
    if (!currentTurn) return;
    const matchId = currentTurn.matchId;
    const match = matches.find((m) => m.id === matchId);
    if (!match) return;

    const makeScore = (pts: number): RoundScore => ({
      roundNumber: 1, points: pts, penalties: 0, wordsCorrect: pts, wordsSkipped: 0,
    });
    const result = {
      team1Scores: [makeScore(team1Cups)],
      team2Scores: [makeScore(team2Cups)],
      team1Total: team1Cups,
      team2Total: team2Cups,
      winnerId,
    };

    useGameStore.setState((state) => ({
      matches: state.matches.map((m) => m.id === matchId ? { ...m, result } : m),
      bracketRounds: state.bracketRounds.map((r) => ({
        ...r,
        matches: r.matches.map((m) => m.id === matchId ? { ...m, result } : m),
      })),
      thirdPlaceMatch: state.thirdPlaceMatch?.id === matchId
        ? { ...state.thirdPlaceMatch, result }
        : state.thirdPlaceMatch,
    }));

    if (winnerId && !(match as any).isThirdPlace) {
      advanceBracketWinner(matchId, winnerId);
    }

    // Skip all remaining turns for this match
    let nextIdx = turnIndex + 1;
    while (nextIdx < turnQueue.length && turnQueue[nextIdx].matchId === matchId) {
      nextIdx++;
    }

    useGameStore.setState((state) => ({
      gameplay: {
        currentMatchId: null, currentTeamId: null, currentRound: 1,
        currentWord: null, wordsUsed: [], roundScore: 0, roundSkips: 0,
        isPlaying: false, timerSeconds: state.timerDuration, roundsCompleted: [],
      },
      currentMatchId: null,
    }));

    const updatedState = useGameStore.getState();
    const finalRound = updatedState.bracketRounds[updatedState.bracketRounds.length - 1];
    const finalMatch = finalRound?.matches[0];
    if (finalMatch?.result?.winnerId) {
      setSuspenseWinnerId(finalMatch.result.winnerId);
      setSubPhase('suspense');
      return;
    }

    if (nextIdx >= turnQueue.length) {
      setTurnIndex(0);
      setTurnQueue([]);
      setSubPhase('bracket-view');
    } else {
      const nextTurn = turnQueue[nextIdx];
      setCurrentMatch(nextTurn.matchId);
      setTurnIndex(nextIdx);
      setSubPhase('pre');
    }
  };

  const handleResultContinue = () => {
    // Save current match rounds immediately
    const currentRounds = useGameStore.getState().gameplay.roundsCompleted;
    const updatedMap = { ...matchRoundsMap, [currentTurn!.matchId]: currentRounds };
    setMatchRoundsMap(updatedMap);

    const nextIdx = turnIndex + 1;

    // FFA: go to score table between rounds, but skip it on the very last turn
    if (isFFA) {
      if (nextIdx >= turnQueue.length) {
        finalizeFFA(updatedMap);
      } else {
        setFfaNextIdx(nextIdx);
        setSubPhase('ffa-scores');
      }
      return;
    }

    if (nextIdx >= turnQueue.length) {
      finalizeMatchesWithMap(updatedMap);
      return;
    }

    const nextTurn = turnQueue[nextIdx];
    // If switching to a different match, restore its rounds
    if (nextTurn.matchId !== currentTurn?.matchId) {
      setCurrentMatch(nextTurn.matchId);
      // setCurrentMatch resets gameplay.roundsCompleted, so restore immediately
      const saved = updatedMap[nextTurn.matchId] || [];
      useGameStore.setState((state) => ({
        gameplay: { ...state.gameplay, roundsCompleted: saved },
      }));
    }

    setTurnIndex(nextIdx);
    setSubPhase('pre');
  };

  const handleFfaScoresContinue = () => {
    if (ffaNextIdx >= turnQueue.length) {
      finalizeFFA(matchRoundsMap);
    } else {
      setTurnIndex(ffaNextIdx);
      setSubPhase('pre');
    }
  };

  // Temporary storage for per-match round scores during the bracket round
  const [matchRoundsMap, setMatchRoundsMap] = useState<Record<string, import('../types').RoundScore[]>>({});

  const finalizeMatchesWithMap = (allMatchRounds: Record<string, import('../types').RoundScore[]>) => {
    // Get unique match IDs from the queue
    const matchIds = [...new Set(turnQueue.map((t) => t.matchId))];

    for (const matchId of matchIds) {
      const rounds = allMatchRounds[matchId] || [];
      const match = useGameStore.getState().matches.find((m) => m.id === matchId);
      if (!match) continue;

      const team1Scores = rounds.filter((_, i) => i % 2 === 0).slice(0, roundsPerTeam);
      const team2Scores = rounds.filter((_, i) => i % 2 === 1).slice(0, roundsPerTeam);
      const team1Total = team1Scores.reduce((sum, s) => sum + s.points, 0);
      const team2Total = team2Scores.reduce((sum, s) => sum + s.points, 0);

      const winnerId =
        team1Total > team2Total
          ? match.team1Id
          : team2Total > team1Total
            ? match.team2Id
            : null;

      // Update match result directly
      useGameStore.setState((state) => ({
        matches: state.matches.map((m) =>
          m.id === matchId
            ? {
                ...m,
                result: { team1Scores, team2Scores, team1Total, team2Total, winnerId },
              }
            : m
        ),
      }));

      // Also update the bracket rounds
      useGameStore.setState((state) => ({
        bracketRounds: state.bracketRounds.map((r) => ({
          ...r,
          matches: r.matches.map((m) =>
            m.id === matchId
              ? {
                  ...m,
                  result: { team1Scores, team2Scores, team1Total, team2Total, winnerId },
                }
              : m
          ),
        })),
        // Also update thirdPlaceMatch if this is it
        thirdPlaceMatch: state.thirdPlaceMatch?.id === matchId
          ? { ...state.thirdPlaceMatch, result: { team1Scores, team2Scores, team1Total, team2Total, winnerId } }
          : state.thirdPlaceMatch,
      }));

      // Advance winner in bracket (skip for 3rd place match)
      if (winnerId && !match.isThirdPlace) {
        advanceBracketWinner(matchId, winnerId);
      }
    }

    // Reset gameplay
    useGameStore.setState((state) => ({
      gameplay: {
        currentMatchId: null,
        currentTeamId: null,
        currentRound: 1,
        currentWord: null,
        wordsUsed: [],
        roundScore: 0,
        roundSkips: 0,
        isPlaying: false,
        timerSeconds: state.timerDuration,
        roundsCompleted: [],
      },
      currentMatchId: null,
    }));

    setMatchRoundsMap({});
    setTurnQueue([]);
    setTurnIndex(0);

    // Check if the final was just completed — show suspense screen then go to champion
    const state = useGameStore.getState();
    const finalRound = state.bracketRounds[state.bracketRounds.length - 1];
    const finalMatch = finalRound?.matches[0];
    if (finalMatch?.result?.winnerId) {
      setSuspenseWinnerId(finalMatch.result.winnerId);
      setSubPhase('suspense');
      return;
    }

    setSubPhase('bracket-view');
  };

  const handleRepeat = () => {
    resetCurrentRound();
    setSubPhase('pre');
  };

  const finalizeFFA = (allMatchRounds: Record<string, import('../types').RoundScore[]>) => {
    const rounds = allMatchRounds[ffaMatchId] || [];
    // rounds interleaved: [t0r1, t1r1, t2r1, t0r2, t1r2, t2r2]
    const numTeams = teams.length;
    const totals: Record<string, number> = {};
    const teamScores: Record<string, import('../types').RoundScore[]> = {};
    teams.forEach((t) => { totals[t.id] = 0; teamScores[t.id] = []; });
    rounds.forEach((r, idx) => {
      const teamId = teams[idx % numTeams].id;
      totals[teamId] += r.points;
      teamScores[teamId].push(r);
    });
    const sorted = [...teams].sort((a, b) => totals[b.id] - totals[a.id]);
    const winnerId = sorted[0].id;

    // Store result as a fake Final round so Champion/MatchHistory work
    const ffaResult = {
      team1Scores: teamScores[teams[0].id] || [],
      team2Scores: teamScores[teams[1].id] || [],
      team1Total: totals[teams[0].id],
      team2Total: totals[teams[1].id],
      winnerId,
    };
    useGameStore.setState((state) => ({
      matches: state.matches.map((m) =>
        m.id === ffaMatchId ? { ...m, result: ffaResult, ffaRounds: rounds } : m
      ),
      bracketRounds: [{
        roundNumber: 1,
        name: 'Final',
        matches: [{ id: ffaMatchId, team1Id: teams[0].id, team2Id: teams[1].id, result: ffaResult }],
      }],
      currentMatchId: null,
      gameplay: {
        currentMatchId: null, currentTeamId: null, currentRound: 1,
        currentWord: null, wordsUsed: [], roundScore: 0, roundSkips: 0,
        isPlaying: false, timerSeconds: useGameStore.getState().timerDuration,
        roundsCompleted: [],
      },
    }));
    setMatchRoundsMap({});
    setTurnQueue([]);
    setTurnIndex(0);
    setSuspenseWinnerId(winnerId);
    setSubPhase('suspense');
  };

  const handleViewBracketMid = () => {
    const currentRounds = useGameStore.getState().gameplay.roundsCompleted;
    const updatedMap = { ...matchRoundsMap, [currentTurn!.matchId]: currentRounds };
    setMatchRoundsMap(updatedMap);

    const nextIdx = turnIndex + 1;
    if (nextIdx >= turnQueue.length) return;

    const nextTurn = turnQueue[nextIdx];
    if (nextTurn.matchId !== currentTurn?.matchId) {
      setCurrentMatch(nextTurn.matchId);
      const saved = updatedMap[nextTurn.matchId] || [];
      useGameStore.setState((state) => ({
        gameplay: { ...state.gameplay, roundsCompleted: saved },
      }));
    }

    setTurnIndex(nextIdx);
    setSubPhase(isFFA ? 'ffa-scores' : 'bracket-mid');
  };

  const handlePlayMatch = (_matchId: string) => {
    // Individual play is no longer used; the bracket round orchestrator handles it
    handleStartBracketRound();
  };

  if (subPhase === 'ffa') {
    return (
      <div className="flex flex-col gap-6 items-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>🎮 Partida libre</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {teams.length} equipos compiten juntos — {ROUNDS_PER_TEAM} rondas por equipo — gana el que más puntos acumule
          </p>
        </div>
        <div className="glass-card p-6 max-w-md w-full flex flex-col gap-2">
          {teams.map((t) => (
            <div key={t.id} className="flex justify-between items-center py-2 px-3 rounded-lg"
              style={{ background: 'rgba(6,182,212,0.07)' }}>
              <span className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>{t.players.map(p => p.name).join(' & ')}</span>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.name}</span>
            </div>
          ))}
        </div>
        <button className="btn-primary text-lg px-8 py-3" onClick={() => setSubPhase('pre')}>
          ▶ Comenzar partida
        </button>
      </div>
    );
  }

  if (subPhase === 'ffa-scores') {
    return (
      <FFAScoreTable
        teams={teams}
        allRounds={matchRoundsMap[ffaMatchId] || []}
        onContinue={handleFfaScoresContinue}
        isLast={ffaNextIdx >= turnQueue.length}
      />
    );
  }

  if (subPhase === 'suspense') {
    return <SuspenseWinner winnerId={suspenseWinnerId} />;
  }

  if (subPhase === 'bracket-mid') {
    // Compute partial live scores from matchRoundsMap
    const liveScores: Record<string, { team1Rounds: number[]; team2Rounds: number[] }> = {};
    for (const [matchId, rounds] of Object.entries(matchRoundsMap)) {
      liveScores[matchId] = {
        team1Rounds: rounds.filter((_, i) => i % 2 === 0).map((r) => r.points),
        team2Rounds: rounds.filter((_, i) => i % 2 === 1).map((r) => r.points),
      };
    }

    return (
      <BracketView
        onPlayMatch={() => {}}
        onStartBracketRound={() => setSubPhase('pre')}
        currentBracketRound={currentBracketRound}
        nextActionLabel="▶ Continuar partida"
        hideCompleteButton
        liveScores={liveScores}
      />
    );
  }

  if (subPhase === 'bracket-view') {
    const showAction = nextActionLabel != null;
    return (
      <BracketView
        onPlayMatch={handlePlayMatch}
        onStartBracketRound={showAction ? handleStartBracketRound : undefined}
        currentBracketRound={currentBracketRound}
        nextActionLabel={nextActionLabel}
      />
    );
  }

  // Gameplay sub-phases
  const match = matches.find((m) => m.id === currentTurn?.matchId);
  if (!match || !currentTurn) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Progress indicator */}
      <div className="text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
        Turno {turnIndex + 1} de {turnQueue.length}
      </div>

      {subPhase === 'pre' && gameId !== 'beerpong' && (
        <PreRound
          matchId={match.id}
          teamId={currentTurn.teamId}
          roundNumber={currentTurn.gameRound}
          onStart={handlePreRoundDone}
          onLoan={() => setShowLoan(true)}
          isFFA={isFFA}
        />
      )}
      {subPhase === 'pre' && gameId === 'beerpong' && (
        <BeerPongPreRound
          matchId={match.id}
          teamId={currentTurn.teamId}
          roundNumber={currentTurn.gameRound}
          onStart={handlePreRoundDone}
          onLoan={() => setShowLoan(true)}
        />
      )}
      {subPhase === 'playing' && gameId !== 'beerpong' && (
        <GameRound onFinish={handleRoundFinish} />
      )}
      {subPhase === 'playing' && gameId === 'beerpong' && match && (
        <BeerPongGameRound
          matchId={match.id}
          team1Id={match.team1Id}
          team2Id={match.team2Id}
          onFinish={handleBeerPongFinish}
        />
      )}
      {subPhase === 'result' && (
        <RoundResult
          onContinue={handleResultContinue}
          onRepeat={handleRepeat}
          onViewBracket={!isFFA && turnIndex + 1 < turnQueue.length ? handleViewBracketMid : undefined}
        />
      )}

      {showLoan && (
        <PlayerLoan
          matchId={match.id}
          onClose={() => setShowLoan(false)}
        />
      )}
    </div>
  );
}
