import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import PreRound from '../components/gameplay/PreRound';
import GameRound from '../components/gameplay/GameRound';
import RoundResult from '../components/gameplay/RoundResult';
import PlayerLoan from '../components/loan/PlayerLoan';

type GameSubPhase = 'pre' | 'playing' | 'result';

const ROUNDS_PER_TEAM = 2;

export default function GameplayPage() {
  const setGamePhase = useGameStore((s) => s.setGamePhase);
  const startRound = useGameStore((s) => s.startRound);
  const completeMatch = useGameStore((s) => s.completeMatch);
  const resetCurrentRound = useGameStore((s) => s.resetCurrentRound);
  const matches = useGameStore((s) => s.matches);
  const gameMode = useGameStore((s) => s.gameMode);
  const advanceBracketWinner = useGameStore((s) => s.advanceBracketWinner);
  const roundsCompleted = useGameStore((s) => s.gameplay.roundsCompleted);

  const currentMatchId = useGameStore((s) => s.currentMatchId);

  const [subPhase, setSubPhase] = useState<GameSubPhase>('pre');
  const [showLoan, setShowLoan] = useState(false);

  const match = matches.find((m) => m.id === currentMatchId);
  if (!match) return null;

  // Rounds are interleaved: team1 plays even indices (0,2), team2 plays odd (1,3)
  const team1Rounds = roundsCompleted.filter((_, i) => i % 2 === 0).length;
  const team2Rounds = roundsCompleted.filter((_, i) => i % 2 === 1).length;
  const isTeam1Turn = team1Rounds <= team2Rounds;
  const currentTeamId = isTeam1Turn ? match.team1Id : match.team2Id;
  const teamRoundNum = isTeam1Turn ? team1Rounds + 1 : team2Rounds + 1;

  const handlePreRoundDone = () => {
    startRound(currentTeamId, teamRoundNum);
    setSubPhase('playing');
  };

  const handleRoundFinish = () => {
    setSubPhase('result');
  };

  const handleResultContinue = () => {
    // Re-read from store since finishRound just updated it
    const updatedRounds = useGameStore.getState().gameplay.roundsCompleted;
    const t1 = updatedRounds.filter((_, i) => i % 2 === 0).length;
    const t2 = updatedRounds.filter((_, i) => i % 2 === 1).length;
    const done = t1 >= ROUNDS_PER_TEAM && t2 >= ROUNDS_PER_TEAM;

    if (done) {
      completeMatch();
      if (gameMode === 'bracket') {
        const m = useGameStore.getState().matches.find((m) => m.id === currentMatchId);
        if (m?.result?.winnerId) {
          advanceBracketWinner(m.id, m.result.winnerId);
        }
      }
      setGamePhase(gameMode === 'bracket' ? 'bracket' : 'league');
    } else {
      setSubPhase('pre');
    }
  };

  const handleRepeat = () => {
    resetCurrentRound();
    setSubPhase('pre');
  };

  return (
    <div className="flex flex-col gap-4">
      {subPhase === 'pre' && (
        <PreRound
          matchId={match.id}
          teamId={currentTeamId}
          roundNumber={teamRoundNum}
          onStart={handlePreRoundDone}
          onLoan={() => setShowLoan(true)}
        />
      )}
      {subPhase === 'playing' && (
        <GameRound onFinish={handleRoundFinish} />
      )}
      {subPhase === 'result' && (
        <RoundResult onContinue={handleResultContinue} onRepeat={handleRepeat} />
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
