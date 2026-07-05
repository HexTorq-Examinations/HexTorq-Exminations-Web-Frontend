'use client';

import { useEffect } from 'react';
import { useExamStore } from '@/store/examStore';

// Keeps retrying any unsynced exam answers/violations/submit for as long as the app is
// open, independent of which page is mounted. This is what lets an exam submission that
// happened while offline (e.g. the timer ran out with no connection) keep retrying even
// after the student has navigated away from the exam page back to their dashboard.
export function ExamSyncProvider() {
  useEffect(() => {
    const { setOnlineStatus, flushPending } = useExamStore.getState();

    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(() => {
      useExamStore.getState().flushPending();
    }, 4000);

    // Catch up immediately on load in case something was left unsynced from a
    // previous session (e.g. the tab was closed before reconnecting).
    flushPending();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return null;
}
