'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/store/authContext';

const WARNING_AFTER = 25 * 60 * 1000;
const TIMEOUT_AFTER = 30 * 60 * 1000;
const COUNTDOWN_INTERVAL = 1000;

export function useSessionTimeout() {
  const { user, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const warningStartRef = useRef<number | null>(null);

  const clearAllTimers = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  const getRemainingMs = useCallback(() => {
    if (!warningStartRef.current) return 5 * 60 * 1000;
    return Math.max(0, TIMEOUT_AFTER - (Date.now() - warningStartRef.current));
  }, []);

  const startTimers = useCallback(() => {
    clearAllTimers();

    warningStartRef.current = null;
    setShowWarning(false);
    setCountdown(0);

    if (!user) return;

    warningTimerRef.current = setTimeout(() => {
      warningStartRef.current = Date.now();
      setShowWarning(true);
      setCountdown(5 * 60);

      countdownTimerRef.current = setInterval(() => {
        const remaining = Math.ceil(getRemainingMs() / 1000);
        setCountdown(remaining);

        if (remaining <= 0) {
          clearAllTimers();
        }
      }, COUNTDOWN_INTERVAL);

      timeoutTimerRef.current = setTimeout(() => {
        clearAllTimers();
        setShowWarning(false);
        setCountdown(0);
        logout();
      }, 5 * 60 * 1000);
    }, WARNING_AFTER);
  }, [user, clearAllTimers, getRemainingMs, logout]);

  const handleActivity = useCallback(() => {
    if (!user) return;

    if (showWarning) {
      clearAllTimers();
      warningStartRef.current = null;
      setShowWarning(false);
      setCountdown(0);
      startTimers();
    } else {
      clearAllTimers();
      startTimers();
    }
  }, [user, showWarning, clearAllTimers, startTimers]);

  useEffect(() => {
    if (!user) {
      clearAllTimers();
      setShowWarning(false);
      setCountdown(0);
      return;
    }

    startTimers();

    const events = ['mousedown', 'keydown', 'mousemove', 'scroll', 'touchstart'];
    const handleUserActivity = () => handleActivity();

    events.forEach((event) => window.addEventListener(event, handleUserActivity));

    return () => {
      clearAllTimers();
      events.forEach((event) => window.removeEventListener(event, handleUserActivity));
    };
  }, [user, startTimers, handleActivity, clearAllTimers]);

  const keepAlive = useCallback(() => {
    handleActivity();
  }, [handleActivity]);

  return { showWarning, countdown, keepAlive };
}
