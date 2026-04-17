import { useState } from 'react';
import { ArrowLeftRight, X } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

interface Props {
  matchId: string;
  onClose: () => void;
}

export default function PlayerLoan({ matchId, onClose }: Props) {
  const teams = useGameStore((s) => s.teams);
  const matches = useGameStore((s) => s.matches);
  const loanPlayer = useGameStore((s) => s.loanPlayer);

  const [fromTeamId, setFromTeamId] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [replacePlayerId, setReplacePlayerId] = useState('');
  const [loanType, setLoanType] = useState<'temporary' | 'permanent'>('temporary');

  // Get the two teams participating in this match
  const currentMatch = matches.find((m) => m.id === matchId);
  const matchTeamIds = [currentMatch?.team1Id, currentMatch?.team2Id].filter(Boolean) as string[];

  const fromTeam = teams.find((t) => t.id === fromTeamId);
  const player = fromTeam?.players.find((p) => p.id === playerId);

  // Players available to replace: belong to match teams, but NOT origin team
  const replacablePlayers = teams
    .filter((t) => matchTeamIds.includes(t.id) && t.id !== fromTeamId)
    .flatMap((t) => t.players.map((p) => ({ ...p, teamId: t.id, teamName: t.name })));

  const selectedReplacement = replacablePlayers.find((p) => p.id === replacePlayerId);
  const toTeamId = selectedReplacement?.teamId ?? '';

  const canConfirm = fromTeamId && playerId && toTeamId && fromTeamId !== toTeamId;

  const handleConfirm = () => {
    if (!canConfirm || !player) return;
    loanPlayer({
      playerId,
      playerName: player.name,
      fromTeamId,
      toTeamId,
      type: loanType,
      matchId,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'var(--color-bg-overlay)' }}
    >
      <div className="glass-card p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <ArrowLeftRight size={20} style={{ color: 'var(--color-accent-gold)' }} />
            Préstamo de Jugador
          </h3>
          <button onClick={onClose} className="p-1 cursor-pointer" style={{ color: 'var(--color-text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Source team — shows members in parentheses */}
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--color-text-secondary)' }}>
              Equipo origen:
            </label>
            <select
              value={fromTeamId}
              onChange={(e) => { setFromTeamId(e.target.value); setPlayerId(''); setReplacePlayerId(''); }}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{
                background: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
              }}
            >
              <option value="">Seleccionar equipo...</option>
              {teams.filter((t) => t.players.length > 1 && !matchTeamIds.includes(t.id)).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.players.map((p) => p.name).join(' - ')})
                </option>
              ))}
            </select>
          </div>

          {/* Player to loan */}
          {fromTeamId && (
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--color-text-secondary)' }}>
                Jugador:
              </label>
              <select
                value={playerId}
                onChange={(e) => { setPlayerId(e.target.value); setReplacePlayerId(''); }}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: 'var(--color-bg-tertiary)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <option value="">Seleccionar jugador...</option>
                {fromTeam?.players.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Replacement player — shows players from the other match team */}
          {playerId && (
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--color-text-secondary)' }}>
                ¿Por qué jugador reemplazar?
              </label>
              <select
                value={replacePlayerId}
                onChange={(e) => setReplacePlayerId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: 'var(--color-bg-tertiary)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <option value="">Seleccionar jugador...</option>
                {replacablePlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.teamName})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Loan type */}
          {replacePlayerId && (
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--color-text-secondary)' }}>
                Tipo de préstamo:
              </label>
              <div className="flex gap-3">
                <label
                  className="flex-1 flex items-center gap-2 p-3 rounded-lg cursor-pointer text-sm"
                  style={{
                    background: loanType === 'temporary' ? 'rgba(6, 182, 212, 0.1)' : 'var(--color-bg-tertiary)',
                    border: `1px solid ${loanType === 'temporary' ? 'var(--color-accent-cyan)' : 'var(--color-border)'}`,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <input
                    type="radio"
                    checked={loanType === 'temporary'}
                    onChange={() => setLoanType('temporary')}
                  />
                  Temporal
                </label>
                <label
                  className="flex-1 flex items-center gap-2 p-3 rounded-lg cursor-pointer text-sm"
                  style={{
                    background: loanType === 'permanent' ? 'rgba(236, 72, 153, 0.1)' : 'var(--color-bg-tertiary)',
                    border: `1px solid ${loanType === 'permanent' ? 'var(--color-accent-magenta)' : 'var(--color-border)'}`,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <input
                    type="radio"
                    checked={loanType === 'permanent'}
                    onChange={() => setLoanType('permanent')}
                  />
                  Permanente
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="btn-primary flex-1"
          >
            Confirmar Préstamo
          </button>
        </div>
      </div>
    </div>
  );
}
