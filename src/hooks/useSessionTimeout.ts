'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/store/authContext';
import api from '@/services/api';

const WARNING_AFTER = 25 * 60 * 1000;
const COUNTDOWN_DURATION = 5 * 60 * 1000;

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

  const startTimers = useCallback(() => {
    clearAllTimers();

    warningStartRef.current = null;
    setShowWarning(false);
    setCountdown(0);

    if (!user) return;

    warningTimerRef.current = setTimeout(() => {
      warningStartRef.current = Date.now();
      setShowWarning(true);
      setCountdown(300);

      countdownTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - warningStartRef.current!;
        const remaining = Math.max(0, Math.ceil((COUNTDOWN_DURATION - elapsed) / 1000));
        setCountdown(remaining);
      }, 1000);

      timeoutTimerRef.current = setTimeout(() => {
        clearAllTimers();
        setShowWarning(false);
        setCountdown(0);
        api.post('/auth/logout');
        window.location.href = '/login';
      }, COUNTDOWN_DURATION);
    }, WARNING_AFTER);
  }, [user, clearAllTimers, logout]);

  const resetTimers = useCallback(() => {
    clearAllTimers();
    warningStartRef.current = null;
    setShowWarning(false);
    setCountdown(0);
    startTimers();
  }, [clearAllTimers, startTimers]);

  useEffect(() => {
    if (!user) {
      clearAllTimers();
      setShowWarning(false);
      setCountdown(0);
      return;
    }

    startTimers();

    const events = ['mousedown', 'keydown', 'mousemove', 'scroll', 'touchstart'];
    const handler = () => resetTimers();
    events.forEach((event) => window.addEventListener(event, handler));

    return () => {
      clearAllTimers();
      events.forEach((event) => window.removeEventListener(event, handler));
    };
  }, [user, startTimers, resetTimers, clearAllTimers]);

  const keepAlive = useCallback(() => {
    clearAllTimers();
    warningStartRef.current = null;
    setShowWarning(false);
    setCountdown(0);
    startTimers();
  }, [clearAllTimers, startTimers]);

  return { showWarning, countdown, keepAlive };
}
