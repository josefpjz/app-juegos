import { useState, useCallback, useRef } from 'react';

export function useDice() {
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [displayValue, setDisplayValue] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const roll = useCallback((): Promise<number> => {
    return new Promise((resolve) => {
      setRolling(true);
      setResult(null);

      let ticks = 0;
      const maxTicks = 15;

      intervalRef.current = setInterval(() => {
        ticks++;
        setDisplayValue(Math.floor(Math.random() * 6) + 1);

        if (ticks >= maxTicks) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          const finalValue = Math.floor(Math.random() * 6) + 1;
          setDisplayValue(finalValue);
          setResult(finalValue);
          setRolling(false);
          resolve(finalValue);
        }
      }, 100);
    });
  }, []);

  const reset = useCallback(() => {
    setRolling(false);
    setResult(null);
    setDisplayValue(1);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  return { rolling, result, displayValue, roll, reset };
}
