import { useEffect, useState, useCallback, useRef } from 'react';

export function useCountdown(
  from: number = 5,
  onFinish?: () => void
) {
  const [count, setCount] = useState(from);
  const [isActive, setIsActive] = useState(false);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const start = useCallback(() => {
    setCount(from);
    setIsActive(true);
  }, [from]);

  const cancel = useCallback(() => {
    setIsActive(false);
    setCount(from);
  }, [from]);

  useEffect(() => {
    if (!isActive) return;

    if (count <= 0) {
      setIsActive(false);
      onFinishRef.current?.();
      return;
    }

    const timer = setTimeout(() => {
      setCount((c) => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isActive, count]);

  return { count, isActive, start, cancel };
}
