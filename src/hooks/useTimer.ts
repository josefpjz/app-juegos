import { useEffect, useRef, useCallback, useState } from 'react';

export function useTimer(
  initialSeconds: number,
  onTick?: (seconds: number) => void,
  onFinish?: () => void
) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onFinishRef = useRef(onFinish);
  const onTickRef = useRef(onTick);

  onFinishRef.current = onFinish;
  onTickRef.current = onTick;

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback((newSeconds?: number) => {
    setIsRunning(false);
    setSeconds(newSeconds ?? initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        const next = prev - 1;
        onTickRef.current?.(next);
        if (next <= 0) {
          setIsRunning(false);
          onFinishRef.current?.();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  const percentage = (seconds / initialSeconds) * 100;

  return { seconds, isRunning, start, pause, reset, percentage };
}
