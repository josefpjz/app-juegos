import { useCallback } from 'react';

// Single shared AudioContext across all hook instances
let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!sharedCtx || sharedCtx.state === 'closed') {
    sharedCtx = new AudioContext();
  }
  // Resume if suspended (e.g. after user interaction policy)
  if (sharedCtx.state === 'suspended') {
    sharedCtx.resume();
  }
  return sharedCtx;
}

export function useSoundFx() {

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine') => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);

      // Clean up nodes after they finish to avoid memory leaks
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
    } catch {
      // Audio not supported
    }
  }, []);

  const playCorrect = useCallback(() => {
    playTone(880, 0.15, 'sine');
    setTimeout(() => playTone(1100, 0.2, 'sine'), 150);
  }, [playTone]);

  const playSkip = useCallback(() => {
    playTone(300, 0.2, 'triangle');
  }, [playTone]);

  const playBuzzer = useCallback(() => {
    playTone(200, 0.5, 'sawtooth');
  }, [playTone]);

  const playCountdownTick = useCallback(() => {
    playTone(600, 0.1, 'square');
  }, [playTone]);

  const playFanfare = useCallback(() => {
    playTone(523, 0.2, 'sine');
    setTimeout(() => playTone(659, 0.2, 'sine'), 200);
    setTimeout(() => playTone(784, 0.2, 'sine'), 400);
    setTimeout(() => playTone(1047, 0.4, 'sine'), 600);
  }, [playTone]);

  const playWarning = useCallback(() => {
    playTone(440, 0.15, 'square');
  }, [playTone]);

  return {
    playCorrect,
    playSkip,
    playBuzzer,
    playCountdownTick,
    playFanfare,
    playWarning,
  };
}
