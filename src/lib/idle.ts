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
  const isWarningRef = useRef<boolean>(false);
  const lastShownSecRef = useRef<number>(Math.ceil(timeoutMs / 1000));
  const timerRef = useRef<number | null>(null);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (isWarningRef.current) {
      isWarningRef.current = false;
      setIsWarning(false);
    }
    const fullSec = Math.ceil(timeoutMs / 1000);
    if (lastShownSecRef.current !== fullSec) {
      lastShownSecRef.current = fullSec;
      setSecondsRemaining(fullSec);
    }
  }, [timeoutMs]);

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const events = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'touchmove',
      'scroll',
      'wheel',
      'pointerdown',
    ];

    const handleUserActivity = () => {
      lastActivityRef.current = Date.now();
      if (isWarningRef.current) {
        isWarningRef.current = false;
        setIsWarning(false);
        const fullSec = Math.ceil(timeoutMs / 1000);
        lastShownSecRef.current = fullSec;
        setSecondsRemaining(fullSec);
      }
    };

    events.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;

      if (elapsed >= timeoutMs) {
        lastActivityRef.current = Date.now();
        isWarningRef.current = false;
        setIsWarning(false);
        onTimeoutRef.current();
        return;
      }

      if (elapsed >= warningMs) {
        const remaining = Math.max(1, Math.ceil((timeoutMs - elapsed) / 1000));
        if (!isWarningRef.current) {
          isWarningRef.current = true;
          setIsWarning(true);
        }
        if (lastShownSecRef.current !== remaining) {
          lastShownSecRef.current = remaining;
          setSecondsRemaining(remaining);
        }
      }
    }, 500);

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled, timeoutMs, warningMs]);

  return {
    isWarning,
    secondsRemaining,
    resetActivity,
  };
}