import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Users, ArrowRight, AlertCircle } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { canGenerateTeams, isValidPlayerName } from '../../lib/validators';

export default function PlayerInput() {
  const [newName, setNewName] = useState('');
  const players = useGameStore((s) => s.players);
  const addPlayer = useGameStore((s) => s.addPlayer);
  const removePlayer = useGameStore((s) => s.removePlayer);
  const updatePlayerName = useGameStore((s) => s.updatePlayerName);
  const generateTeams = useGameStore((s) => s.generateTeams);
  const setGamePhase = useGameStore((s) => s.setGamePhase);

  const canGenerate = canGenerateTeams(players.length);
  const isOdd = players.length > 0 && players.length % 2 !== 0;

  const isDuplicate = isValidPlayerName(newName) &&
    players.some((p) => p.name.trim().toLowerCase() === newName.trim().toLowerCase());

  const handleAdd = () => {
    if (isValidPlayerName(newName) && !isDuplicate) {
      addPlayer(newName);
      setNewName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  const handleGenerate = () => {
    generateTeams();
    setGamePhase('teams');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Registro de Jugadores
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Agrega los nombres de todos los participantes
        </p>
      </div>

      {/* Player count badge */}
      <div className="flex justify-center">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
          style={{
            background: canGenerate ? 'rgba(16, 185, 129, 0.15)' : isOdd ? 'rgba(239, 68, 68, 0.15)' : 'var(--color-bg-tertiary)',
            color: canGenerate ? 'var(--color-accent-green)' : isOdd ? 'var(--color-accent-red)' : 'var(--color-text-muted)',
          }}
        >
          <Users size={16} />
          {players.length} jugador{players.length !== 1 ? 'es' : ''}
          {isOdd && (
            <span className="flex items-center gap-1">
              <AlertCircle size={14} />
              (necesitas número par)
            </span>
          )}
          {players.length > 0 && players.length < 4 && !isOdd && (
            <span>(mínimo 4)</span>
          )}
        </div>
      </div>

      {/* Add player input */}
      <div className="flex gap-3 max-w-md mx-auto w-full">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nombre del jugador..."
          className="flex-1 px-4 py-3 rounded-lg text-base outline-none transition-all"
          style={{
            background: 'var(--color-bg-tertiary)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
          }}
          autoFocus
        />
        <button
          onClick={handleAdd}
          disabled={!isValidPlayerName(newName) || isDuplicate}
          className="btn-primary flex items-center gap-2 px-5"
        >
          <Plus size={18} />
          Agregar
        </button>
      </div>

      {/* Duplicate warning */}
      {isDuplicate && (
        <p className="text-center text-sm" style={{ color: 'var(--color-accent-red)', marginTop: '-12px' }}>
          Ya existe un jugador con ese nombre
        </p>
      )}
      <div className="max-w-md mx-auto w-full">
        <AnimatePresence>
          {players.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 mb-2"
            >
              <span
                className="w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold shrink-0"
                style={{
                  background: 'var(--color-accent-indigo)',
                  color: 'white',
                }}
              >
                {index + 1}
              </span>
              <input
                type="text"
                value={player.name}
                onChange={(e) => updatePlayerName(player.id, e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg text-sm outline-none transition-all"
                style={{
                  background: 'var(--color-bg-tertiary)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                }}
              />
              <button
                onClick={() => removePlayer(player.id)}
                className="p-2 rounded-lg transition-colors cursor-pointer hover:opacity-80"
                style={{ color: 'var(--color-accent-red)' }}
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Generate teams button */}
      {players.length >= 2 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="btn-success flex items-center gap-2 text-lg px-8 py-3"
          >
            <Users size={20} />
            Generar Equipos
            <ArrowRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
