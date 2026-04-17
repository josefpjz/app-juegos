import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Crown } from 'lucide-react';
import type { Player } from '../../types';

interface Props {
  player: Player;
  isCaptain: boolean;
  teamId: string;
}

export default function PlayerChip({ player, isCaptain, teamId }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `${teamId}::${player.id}`,
    data: { playerId: player.id, teamId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-grab active:cursor-grabbing transition-all"
      {...attributes}
      {...listeners}
    >
      <GripVertical size={14} style={{ color: 'var(--color-text-muted)' }} />
      {isCaptain && <Crown size={14} style={{ color: 'var(--color-accent-gold)' }} />}
      <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
        {player.name}
      </span>
    </div>
  );
}
