// High-performance animation hook using requestAnimationFrame
import { useEffect, useRef, useCallback } from 'react';

interface AnimationOptions {
  duration: number;
  easing?: (t: number) => number;
  onUpdate?: (progress: number) => void;
}

export function useRafAnimation(options: AnimationOptions) {
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);

  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

  const animate = useCallback((currentTime: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = currentTime;
    }

    const elapsed = currentTime - startTimeRef.current;
    const progress = Math.min(elapsed / options.duration, 1);
    const eased = (options.easing || easeOutCubic)(progress);

    options.onUpdate?.(eased);

    if (progress < 1) {
      frameRef.current = requestAnimationFrame(animate);
    } else {
      isRunningRef.current = false;
    }
  }, [options]);

  const start = useCallback(() => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    startTimeRef.current = null;
    frameRef.current = requestAnimationFrame(animate);
  }, [animate]);

  const stop = useCallback(() => {
    isRunningRef.current = false;
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return { start, stop, isRunning: isRunningRef.current };
}

// Throttle hook for rapid updates
export function useThrottle<T>(value: T, delay: number): T {
  const throttledRef = useRef(value);
  const lastUpdateRef = useRef(Date.now());

  useEffect(() => {
    const now = Date.now();
    if (now >= lastUpdateRef.current + delay) {
      lastUpdateRef.current = now;
      throttledRef.current = value;
    }
  }, [value, delay]);

  return throttledRef.current;
}
