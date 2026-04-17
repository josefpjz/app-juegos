import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { Shuffle, Check, ArrowRight } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import TeamCard from './TeamCard';

export default function TeamGrid() {
  const teams = useGameStore((s) => s.teams);
  const shuffleTeams = useGameStore((s) => s.shuffleTeams);
  const swapPlayers = useGameStore((s) => s.swapPlayers);
  const movePlayerToTeam = useGameStore((s) => s.movePlayerToTeam);
  const confirmTeams = useGameStore((s) => s.confirmTeams);
  const setGamePhase = useGameStore((s) => s.setGamePhase);

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeData = active.data.current as { playerId: string; teamId: string };
    const overId = over.id as string;

    // Check if dropped on a team container
    const overTeam = teams.find((t) => t.id === overId);
    if (overTeam && activeData.teamId !== overId) {
      // Moving to a different team — if target has 2 players, swap with first
      if (overTeam.players.length >= 2) {
        const targetPlayer = overTeam.players[0];
        swapPlayers(activeData.playerId, activeData.teamId, targetPlayer.id, overId);
      } else {
        movePlayerToTeam(activeData.playerId, activeData.teamId, overId);
      }
      return;
    }

    // Check if dropped on another player's sortable id (format: teamId::playerId)
    if (overId.includes('::')) {
      const [overTeamId, overPlayerId] = overId.split('::');
      if (activeData.teamId !== overTeamId) {
        swapPlayers(activeData.playerId, activeData.teamId, overPlayerId, overTeamId);
      }
    }
  };

  const handleConfirm = () => {
    confirmTeams();
    setGamePhase('mode');
  };

  const activePlayerData = activeId
    ? (() => {
      const [teamId, playerId] = (activeId as string).split('::');
      const team = teams.find((t) => t.id === teamId);
      return team?.players.find((p) => p.id === playerId);
    })()
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Previsualización de Equipos
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Arrastra jugadores entre equipos para reorganizar
        </p>
      </div>

      <div className="flex justify-center gap-3">
        <button onClick={shuffleTeams} className="btn-secondary flex items-center gap-2">
          <Shuffle size={16} />
          Mezclar de nuevo
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>

        <DragOverlay>
          {activePlayerData && (
            <div
              className="px-3 py-2 rounded-lg text-sm font-medium shadow-lg"
              style={{
                background: 'var(--color-accent-indigo)',
                color: 'white',
              }}
            >
              {activePlayerData.name}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <div className="flex justify-center mt-4">
        <button onClick={handleConfirm} className="btn-success flex items-center gap-2 text-lg px-8 py-3">
          <Check size={20} />
          Confirmar Equipos
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
