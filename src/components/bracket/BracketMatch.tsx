import type { Match, Team } from '../../types';
import { useGameStore } from '../../store/gameStore';

interface Props {
  match: Match;
  onPlay: (matchId: string) => void;
  hidePlayButton?: boolean;
  liveRounds?: { team1Rounds: number[]; team2Rounds: number[] };
}

interface TeamRowProps {
  team: Team | undefined;
  isWinner: boolean;
  total?: number;
  roundScores?: number[];
  isTop: boolean;
}

function TeamRow({ team, isWinner, total, roundScores, isTop }: TeamRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '5px 8px 5px 10px',
        minHeight: 36,
        background: isWinner ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
        borderLeft: `3px solid ${isWinner ? 'var(--color-accent-green)' : 'transparent'}`,
        borderRadius: isTop ? '6px 6px 0 0' : '0 0 6px 6px',
      }}
    >
      <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: isWinner ? 700 : 500,
            color: isWinner
              ? 'var(--color-accent-green)'
              : team
              ? 'var(--color-text-primary)'
              : 'var(--color-text-muted)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {team ? team.players.map((p) => p.name).join(', ') : 'Por definir'}
        </div>
        {team && (
          <div
            style={{
              fontSize: 9,
              color: 'var(--color-text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {team?.name}
          </div>
        )}
      </div>
      {roundScores && roundScores.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginLeft: 6 }}>
          {roundScores.map((s, i) => (
            <span
              key={i}
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--color-accent-cyan)',
                background: 'rgba(6,182,212,0.12)',
                borderRadius: 4,
                padding: '1px 5px',
                minWidth: 22,
                textAlign: 'center',
              }}
            >
              {s}
            </span>
          ))}
        </div>
      )}
      {total !== undefined && !roundScores && (
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            flexShrink: 0,
            marginLeft: 6,
            color: isWinner ? 'var(--color-accent-green)' : 'var(--color-text-secondary)',
          }}
        >
          {total}
        </span>
      )}
    </div>
  );
}

export default function BracketMatch({ match, onPlay, hidePlayButton, liveRounds }: Props) {
  const teams = useGameStore((s) => s.teams);
  const team1 = teams.find((t) => t.id === match.team1Id);
  const team2 = teams.find((t) => t.id === match.team2Id);

  const isPlayable = team1 && team2 && !match.result && !match.isBye;
  const isCompleted = !!match.result;
  const winner1 = match.result?.winnerId === match.team1Id;
  const winner2 = match.result?.winnerId === match.team2Id;

  const borderColor = isCompleted
    ? 'var(--color-accent-green)'
    : isPlayable
    ? 'var(--color-accent-cyan)'
    : 'var(--color-border)';

  return (
    <div
      style={{
        border: `1px solid ${borderColor}`,
        borderRadius: 7,
        overflow: 'hidden',
        background: 'var(--color-bg-card)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'border-color 0.2s',
      }}
    >
      <TeamRow
        team={team1}
        isWinner={winner1}
        total={isCompleted ? match.result!.team1Total : undefined}
        roundScores={liveRounds?.team1Rounds}
        isTop
      />
      <div style={{ height: 1, background: 'var(--color-border)' }} />
      <TeamRow
        team={team2}
        isWinner={winner2}
        total={isCompleted ? match.result!.team2Total : undefined}
        roundScores={liveRounds?.team2Rounds}
        isTop={false}
      />
      {match.isBye && !isCompleted && (
        <div
          style={{
            textAlign: 'center',
            fontSize: 10,
            padding: '3px 8px',
            color: 'var(--color-text-muted)',
            background: 'var(--color-bg-tertiary)',
          }}
        >
          Avanza automáticamente
        </div>
      )}
      {isCompleted && (
        <div
          style={{
            textAlign: 'center',
            fontSize: 10,
            padding: '3px',
            color: 'var(--color-accent-green)',
            fontWeight: 600,
          }}
        >
          ✓ Completado
        </div>
      )}
      {isPlayable && !hidePlayButton && (
        <div style={{ padding: '4px 6px' }}>
          <button
            onClick={() => onPlay(match.id)}
            className="btn-primary w-full text-xs py-1"
          >
            ▶ Jugar
          </button>
        </div>
      )}
    </div>
  );
}
