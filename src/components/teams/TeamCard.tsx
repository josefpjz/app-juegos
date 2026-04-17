import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Team } from '../../types';
import PlayerChip from './PlayerChip';

interface Props {
  team: Team;
}

export default function TeamCard({ team }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: team.id,
    data: { teamId: team.id },
  });

  const sortableIds = team.players.map((p) => `${team.id}::${p.id}`);

  return (
    <div
      ref={setNodeRef}
      className="glass-card p-4 transition-all"
      style={{
        borderColor: isOver ? 'var(--color-accent-cyan)' : undefined,
        boxShadow: isOver ? 'var(--shadow-glow-cyan)' : undefined,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold" style={{ color: 'var(--color-accent-cyan)' }}>
          {team.name}
        </h3>
        <span
          className="text-xs px-2 py-1 rounded-full"
          style={{
            background: 'var(--color-bg-tertiary)',
            color: 'var(--color-text-muted)',
          }}
        >
          {team.players.length} jugador{team.players.length !== 1 ? 'es' : ''}
        </span>
      </div>
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-1">
          {team.players.map((player) => (
            <PlayerChip
              key={player.id}
              player={player}
              isCaptain={player.id === team.captainId}
              teamId={team.id}
            />
          ))}
        </div>
      </SortableContext>
      {team.players.length === 0 && (
        <div
          className="text-center py-4 text-sm rounded-lg border-2 border-dashed"
          style={{
            color: 'var(--color-text-muted)',
            borderColor: 'var(--color-border)',
          }}
        >
          Arrastra un jugador aquí
        </div>
      )}
    </div>
  );
}
