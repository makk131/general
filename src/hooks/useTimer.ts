import { useState, useCallback, useRef, useEffect } from 'react';

export interface TimerState {
  isRunning: boolean;
  remainingSeconds: number;
  totalSeconds: number;
  progress: number; // 0-100
}

export interface UseTimerReturn {
  state: TimerState;
  start: () => void;
  pause: () => void;
  reset: () => void;
  setDuration: (minutes: number) => void;
}

export function useTimer(
  initialMinutes: number,
  onComplete?: () => void
): UseTimerReturn {
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    remainingSeconds: initialMinutes * 60,
    totalSeconds: initialMinutes * 60,
    progress: 100,
  });

  const intervalRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);

  // Keep callback ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const start = useCallback(() => {
    if (state.remainingSeconds <= 0) return;

    setState(prev => ({ ...prev, isRunning: true }));

    intervalRef.current = window.setInterval(() => {
      setState(prev => {
        const newRemaining = prev.remainingSeconds - 1;

        if (newRemaining <= 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          onCompleteRef.current?.();
          return {
            ...prev,
            isRunning: false,
            remainingSeconds: 0,
            progress: 0,
          };
        }

        return {
          ...prev,
          remainingSeconds: newRemaining,
          progress: (newRemaining / prev.totalSeconds) * 100,
        };
      });
    }, 1000);
  }, [state.remainingSeconds]);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState(prev => ({
      isRunning: false,
      remainingSeconds: prev.totalSeconds,
      totalSeconds: prev.totalSeconds,
      progress: 100,
    }));
  }, []);

  const setDuration = useCallback((minutes: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const totalSeconds = minutes * 60;
    setState({
      isRunning: false,
      remainingSeconds: totalSeconds,
      totalSeconds,
      progress: 100,
    });
  }, []);

  return { state, start, pause, reset, setDuration };
}

// Format seconds to MM:SS display
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
