import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

export type ExamStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'TERMINATED';

export interface Violation {
  id: string;
  clientViolationId: string;
  timestamp: number;
  type: 'TAB_SWITCH' | 'BLUR' | 'FULLSCREEN_EXIT' | 'SHORTCUT_USED';
  description: string;
}

export interface ExamHistoryEntry {
  examId: string;
  status: 'COMPLETED' | 'TERMINATED';
  score: number;
  date: number;
}

const genId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

interface ExamState {
  examId: string | null;
  status: ExamStatus;
  startTime: number | null;
  endTime: number | null;
  timeRemaining: number; // in seconds
  isPaused: boolean;
  violations: Violation[];
  maxViolations: number;
  answers: Record<string, string>; // questionId -> answer text
  examHistory: ExamHistoryEntry[];

  // Offline-resilience bookkeeping. Everything the student enters is applied to local
  // state immediately; these track what still needs to reach the server. All of this
  // is persisted, so progress survives a reload or a dropped connection.
  unsyncedQuestionIds: string[];
  unsyncedViolationIds: string[];
  pendingSubmitStatus: ExamStatus | null;
  isOnline: boolean;
  isSyncing: boolean;

  // Actions
  startExam: (examId: string) => Promise<number>;
  endExam: (status?: ExamStatus) => void;
  setIsPaused: (paused: boolean) => void;
  tickTimer: () => void;
  recordViolation: (type: Violation['type'], description: string) => void;
  saveAnswer: (questionId: string, answer: string) => void;
  clearSession: () => void;
  fetchExamHistory: () => Promise<void>;
  setOnlineStatus: (online: boolean) => void;
  flushPending: () => Promise<void>;
}

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      examId: null,
      status: 'NOT_STARTED',
      startTime: null,
      endTime: null,
      timeRemaining: 0,
      isPaused: false,
      violations: [],
      maxViolations: 5, // 5 warnings allowed; the 6th auto-terminates
      answers: {},
      examHistory: [],

      unsyncedQuestionIds: [],
      unsyncedViolationIds: [],
      pendingSubmitStatus: null,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      isSyncing: false,

      startExam: async (examId: string) => {
        const { data } = await api.post(`/exams/${examId}/start`);
        set({
          examId,
          status: 'IN_PROGRESS',
          startTime: Date.now(),
          timeRemaining: data.durationSeconds,
          violations: (data.violations || []).map((v: any) => ({ ...v, clientViolationId: v.clientViolationId || v.id })),
          answers: data.answers || {},
          isPaused: false,
          unsyncedQuestionIds: [],
          unsyncedViolationIds: [],
          pendingSubmitStatus: null,
        });
        return data.durationSeconds;
      },

      // Optimistic: flips local status immediately so the UI (and the student) treat the
      // exam as finished right away, even with no connection. The actual submit is queued
      // and retried via flushPending() until the server confirms it — no answer is lost and
      // no window is left open for the student to keep answering past the deadline.
      endExam: (status: ExamStatus = 'COMPLETED') => {
        const { examId } = get();
        if (!examId) {
          set({ status, endTime: Date.now() });
          return;
        }
        set({ status, endTime: Date.now(), pendingSubmitStatus: status });
        get().flushPending();
      },

      setIsPaused: (paused: boolean) => {
        set({ isPaused: paused });
      },

      tickTimer: () => {
        const { timeRemaining, status, isPaused } = get();
        if (status === 'IN_PROGRESS' && !isPaused && timeRemaining > 0) {
          set({ timeRemaining: timeRemaining - 1 });
          if (timeRemaining - 1 === 0) {
            get().endExam('COMPLETED');
          }
        }
      },

      // Violations are decided locally (so a lost connection can't let a student dodge
      // the warning/termination policy by being offline) and synced in the background.
      recordViolation: (type: Violation['type'], description: string) => {
        const { status, violations, maxViolations } = get();
        if (status !== 'IN_PROGRESS') return;

        const violation: Violation = {
          id: genId(),
          clientViolationId: genId(),
          timestamp: Date.now(),
          type,
          description,
        };
        const updatedViolations = [...violations, violation];
        const shouldTerminate = updatedViolations.length > maxViolations;

        set((state) => ({
          violations: updatedViolations,
          unsyncedViolationIds: [...state.unsyncedViolationIds, violation.clientViolationId],
          ...(shouldTerminate ? { status: 'TERMINATED', endTime: Date.now(), pendingSubmitStatus: 'TERMINATED' } : {}),
        }));

        get().flushPending();
      },

      // Local-first: the answer is applied to state immediately regardless of connectivity;
      // syncing to the server happens in the background and is retried until confirmed.
      saveAnswer: (questionId: string, answer: string) => {
        set((state) => ({
          answers: { ...state.answers, [questionId]: answer },
          unsyncedQuestionIds: state.unsyncedQuestionIds.includes(questionId)
            ? state.unsyncedQuestionIds
            : [...state.unsyncedQuestionIds, questionId],
        }));
        get().flushPending();
      },

      setOnlineStatus: (online: boolean) => {
        set({ isOnline: online });
        if (online) get().flushPending();
      },

      // Drains whatever hasn't reached the server yet: answers, then violations, then a
      // queued submit (only once every answer/violation has landed, so the score the
      // server computes reflects everything the student actually did). Safe to call
      // repeatedly/concurrently — network calls are idempotent on the backend, and a
      // single in-flight flush is enforced via isSyncing.
      flushPending: async () => {
        const { examId, isSyncing } = get();
        if (!examId || isSyncing) return;
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          set({ isOnline: false });
          return;
        }

        set({ isSyncing: true });
        try {
          // 1) Answers
          for (const questionId of [...get().unsyncedQuestionIds]) {
            const answer = get().answers[questionId];
            try {
              await api.post(`/exams/${examId}/answer`, { questionId, answer });
              set((state) => ({
                unsyncedQuestionIds: state.unsyncedQuestionIds.filter((q) => q !== questionId),
              }));
              set({ isOnline: true });
            } catch {
              set({ isOnline: false });
              return; // likely offline — stop and let the next trigger retry from here
            }
          }

          // 2) Violations, oldest first, so server-side chronology matches what happened
          for (const clientViolationId of [...get().unsyncedViolationIds]) {
            const violation = get().violations.find((v) => v.clientViolationId === clientViolationId);
            if (!violation) continue;
            try {
              const { data } = await api.post(`/exams/${examId}/violation`, {
                type: violation.type,
                description: violation.description,
                clientViolationId,
              });
              set((state) => ({
                unsyncedViolationIds: state.unsyncedViolationIds.filter((id) => id !== clientViolationId),
                ...(data.status === 'TERMINATED' ? { status: 'TERMINATED' as ExamStatus } : {}),
              }));
              set({ isOnline: true });
            } catch {
              set({ isOnline: false });
              return;
            }
          }

          // 3) Submit, only once everything above has synced
          const { pendingSubmitStatus, unsyncedQuestionIds, unsyncedViolationIds } = get();
          if (pendingSubmitStatus && unsyncedQuestionIds.length === 0 && unsyncedViolationIds.length === 0) {
            try {
              await api.post(`/exams/${examId}/submit`, { status: pendingSubmitStatus });
              set({ pendingSubmitStatus: null, isOnline: true });
              await get().fetchExamHistory();
            } catch {
              set({ isOnline: false });
            }
          }
        } finally {
          set({ isSyncing: false });
        }
      },

      fetchExamHistory: async () => {
        const { data } = await api.get('/exams/history/me');
        set({ examHistory: data });
      },

      clearSession: () => {
        set({
          status: 'NOT_STARTED',
          examId: null,
          startTime: null,
          endTime: null,
          timeRemaining: 0,
          isPaused: false,
          violations: [],
          answers: {},
          unsyncedQuestionIds: [],
          unsyncedViolationIds: [],
          pendingSubmitStatus: null,
        });
      }
    }),
    {
      name: 'secure-exam-storage',
      partialize: (state) => ({
        examId: state.examId,
        status: state.status,
        startTime: state.startTime,
        endTime: state.endTime,
        timeRemaining: state.timeRemaining,
        isPaused: state.isPaused,
        violations: state.violations,
        answers: state.answers,
        unsyncedQuestionIds: state.unsyncedQuestionIds,
        unsyncedViolationIds: state.unsyncedViolationIds,
        pendingSubmitStatus: state.pendingSubmitStatus,
      }),
    }
  )
);
