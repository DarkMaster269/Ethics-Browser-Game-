import { useEffect, useRef, useState, useCallback } from 'react';

export interface UseIdleOptions {
  timeoutMs?: number; // default 30,000 ms (30 sec)
  warningMs?: number; // default 25,000 ms (warn during last 5 seconds)
  onTimeout: () => void;
  enabled?: boolean;
}

/**
 * 30-second idle timer hook for kiosk exhibition display.
 * Detects mouse, keyboard, touch, and scroll interactions.
 */
export function useIdle({
  timeoutMs = 30000,
  warningMs = 25000,
  onTimeout,
  enabled = true,
}: UseIdleOptions) {
  const [isWarning, setIsWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(Math.ceil(timeoutMs / 1000));
  const lastActivityRef = useRef<number>(Date.now());
  const timerRef = useRef<number | null>(null);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIsWarning(false);
    setSecondsRemaining(Math.ceil(timeoutMs / 1000));
  }, [timeoutMs]);

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'touchmove', 'scroll', 'wheel', 'pointerdown'];

    const handleUserActivity = () => {
      lastActivityRef.current = Date.now();
      if (isWarning) {
        setIsWarning(false);
        setSecondsRemaining(Math.ceil(timeoutMs / 1000));
      }
    };

    events.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    // Check every 500ms
    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = Math.max(0, Math.ceil((timeoutMs - elapsed) / 1000));
      setSecondsRemaining(remaining);

      if (elapsed >= warningMs && !isWarning) {
        setIsWarning(true);
      }

      if (elapsed >= timeoutMs) {
        lastActivityRef.current = Date.now(); // avoid double-triggering
        setIsWarning(false);
        onTimeoutRef.current();
      }
    }, 500);

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [enabled, timeoutMs, warningMs, isWarning]);

  return {
    isWarning,
    secondsRemaining,
    resetActivity,
  };
}
