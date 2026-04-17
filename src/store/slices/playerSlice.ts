import type { StateCreator } from 'zustand';
import type { GameStore, PlayerSlice } from '../types';
import { generateId } from '../../lib/utils';

export const createPlayerSlice: StateCreator<GameStore, [], [], PlayerSlice> = (set) => ({
  players: [],

  addPlayer: (name: string) =>
    set((state) => ({
      players: [...state.players, { id: generateId(), name: name.trim() }],
    })),

  removePlayer: (id: string) =>
    set((state) => ({
      players: state.players.filter((p) => p.id !== id),
    })),

  updatePlayerName: (id: string, name: string) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.id === id ? { ...p, name: name.trim() } : p
      ),
    })),

  clearPlayers: () => set({ players: [] }),
});
