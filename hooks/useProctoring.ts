'use client';

import { useEffect, useCallback } from 'react';
import { useExamStore } from '@/store/examStore';
import { toast } from 'sonner';

export const useProctoring = () => {
  const { status, recordViolation, violations, maxViolations, setIsPaused } = useExamStore();

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'hidden') {
      recordViolation('TAB_SWITCH', 'Candidate switched tabs or minimized the browser.');
      setIsPaused(true);
      toast.warning('Warning: You left the exam window.', { duration: 5000 });
    }
  }, [recordViolation, setIsPaused]);

  // A tab switch/minimize fires both `visibilitychange` (hidden) and `blur` for the
  // same action — recording both would double-count one violation as two. Only treat
  // blur as its own violation when the tab is still visible (e.g. focus moved to
  // another application window without switching tabs), since visibilitychange
  // already covers the hidden case.
  const handleBlur = useCallback(() => {
    if (document.visibilityState === 'hidden') return;
    recordViolation('BLUR', 'Exam window lost focus.');
    setIsPaused(true);
    toast.warning('Warning: Exam window lost focus.', { duration: 5000 });
  }, [recordViolation, setIsPaused]);

  const handleFullscreenChange = useCallback(() => {
    if (!document.fullscreenElement) {
      recordViolation('FULLSCREEN_EXIT', 'Candidate exited fullscreen mode.');
      setIsPaused(true);
      toast.error('Warning: You exited fullscreen mode. Please return immediately.');
    }
  }, [recordViolation, setIsPaused]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

    // Block Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+P, Ctrl+S, Ctrl+U
    if (cmdOrCtrl && ['c', 'v', 'x', 'p', 's', 'u'].includes(e.key.toLowerCase())) {
      e.preventDefault();
      recordViolation('SHORTCUT_USED', `Blocked attempt to use shortcut: ${isMac ? 'Cmd' : 'Ctrl'}+${e.key.toUpperCase()}`);
      toast.error('Keyboard shortcuts are disabled during the exam.');
      return;
    }

    // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (DevTools)
    if (e.key === 'F12' || (cmdOrCtrl && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))) {
      e.preventDefault();
      recordViolation('SHORTCUT_USED', 'Blocked attempt to open Developer Tools.');
      toast.error('Developer tools are disabled.');
      return;
    }
  }, [recordViolation]);

  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (status === 'IN_PROGRESS') {
      e.preventDefault();
      e.returnValue = ''; // Standard for most browsers to show a warning dialog
    }
  }, [status]);

  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
  }, []);

  const handleDragDrop = useCallback((e: Event) => {
    e.preventDefault();
  }, []);

  const handleSelectStart = useCallback((e: Event) => {
    e.preventDefault();
  }, []);

  const handlePopState = useCallback((e: PopStateEvent) => {
    window.history.pushState(null, '', window.location.href);
  }, []);

  useEffect(() => {
    if (status !== 'IN_PROGRESS') return;

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragDrop);
    document.addEventListener('drop', handleDragDrop);
    document.addEventListener('selectstart', handleSelectStart);
    window.addEventListener('popstate', handlePopState);
    
    // Prevent back navigation natively by pushing state
    window.history.pushState(null, '', window.location.href);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragDrop);
      document.removeEventListener('drop', handleDragDrop);
      document.removeEventListener('selectstart', handleSelectStart);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [status, handleVisibilityChange, handleBlur, handleFullscreenChange, handleKeyDown, handleBeforeUnload, handleContextMenu, handleDragDrop, handleSelectStart, handlePopState]);

  // Request fullscreen utility
  const requestFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.error('Error attempting to enable fullscreen:', err);
      toast.error('Failed to enter fullscreen mode. Please allow permissions.');
    }
  };

  return {
    violationsCount: violations.length,
    maxViolations,
    requestFullscreen,
    hasExceededViolations: violations.length >= maxViolations,
    isTerminated: status === 'TERMINATED'
  };
};
