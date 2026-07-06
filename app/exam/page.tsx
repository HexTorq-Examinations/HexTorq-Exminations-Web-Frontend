'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useExamStore } from '@/store/examStore';
import { useProctoring } from '@/hooks/useProctoring';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Monitor, Wifi, Calculator, AlertTriangle, ChevronRight, ChevronLeft, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { NetworkPing } from '@/components/common/NetworkPing';
import { FloatingCalculator } from '@/components/common/FloatingCalculator';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

interface ExamQuestion {
  id: string;
  text: string;
  options: string[];
}

function SecureExamInterface() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentExamId = searchParams.get('id') || '';
  const {
    status, examId: storeExamId, startExam, refreshAttemptStatus, endExam, timeRemaining, tickTimer, answers, saveAnswer,
    violations, clearSession, isPaused, setIsPaused, isOnline, unsyncedQuestionIds,
    unsyncedViolationIds, pendingSubmitStatus, submissionReceipt, calculatorEnabled,
  } = useExamStore();
  const { violationsCount, maxViolations, requestFullscreen, hasExceededViolations, isTerminated } = useProctoring();
  const pendingSyncCount = unsyncedQuestionIds.length + unsyncedViolationIds.length + (pendingSubmitStatus ? 1 : 0);

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [lastViolationCount, setLastViolationCount] = useState(0);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [isLoadingExam, setIsLoadingExam] = useState(true);
  const [examLoadError, setExamLoadError] = useState<string | null>(null);
  const [examLoadAttempt, setExamLoadAttempt] = useState(0);
  
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [showCalculator, setShowCalculator] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Clear session if opening a different exam
  useEffect(() => {
    if (storeExamId && storeExamId !== currentExamId) {
      clearSession();
    }
  }, [storeExamId, currentExamId, clearSession]);

  // Load the exam's real question set
  useEffect(() => {
    if (!currentExamId) return;
    let cancelled = false;
    setIsLoadingExam(true);
    setExamLoadError(null);
    api.get(`/exams/${currentExamId}/take`)
      .then(({ data }) => {
        if (cancelled) return;

        const loadedQuestions = Array.isArray(data?.questions)
          ? data.questions.filter((question: unknown): question is ExamQuestion => {
              if (!question || typeof question !== 'object') return false;
              const candidate = question as Partial<ExamQuestion>;
              return typeof candidate.id === 'string'
                && typeof candidate.text === 'string'
                && Array.isArray(candidate.options);
            })
          : [];

        setQuestions(loadedQuestions);
        setCurrentQuestionIdx(0);
        if (loadedQuestions.length === 0) {
          setExamLoadError('This exam does not have any available questions. Please contact your exam administrator.');
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setQuestions([]);
          setExamLoadError(error instanceof Error ? error.message : 'Unable to load this exam.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingExam(false);
      });
    return () => { cancelled = true; };
  }, [currentExamId, examLoadAttempt]);

  const handleStartExam = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      const startedAttempt = await startExam(currentExamId);
      if (startedAttempt.questions.length > 0) {
        setQuestions(startedAttempt.questions);
        setCurrentQuestionIdx(0);
      }
    } catch (err) {
      // The server is the source of truth for the exam's time window and re-attempt
      // rules — the api client already toasts the rejection reason (too early,
      // already ended, already attempted); just send the student back instead of
      // leaving them stuck on a dead "Start Exam" screen.
      router.push('/student/upcoming-exams');
    }
  };

  // Timer tick
  useEffect(() => {
    if (status !== 'IN_PROGRESS') return;
    refreshAttemptStatus().catch(() => {});
    const timer = setInterval(() => tickTimer(), 1000);
    const catchUp = () => {
      tickTimer();
      refreshAttemptStatus().catch(() => {});
    };
    document.addEventListener('visibilitychange', catchUp);
    window.addEventListener('focus', catchUp);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', catchUp);
      window.removeEventListener('focus', catchUp);
    };
  }, [status, tickTimer, refreshAttemptStatus]);

  // Monitor violations for termination
  useEffect(() => {
    if (violationsCount > lastViolationCount) {
      setLastViolationCount(violationsCount);
      if (hasExceededViolations || isTerminated) {
        // Auto submit logic
        endExam('TERMINATED');
      }
    }
  }, [violationsCount, lastViolationCount, hasExceededViolations, isTerminated, endExam]);

  // Format time
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIdx];

  if (!currentExamId) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-400 mb-4" />
        <h2 className="text-xl font-bold mb-2">No exam selected</h2>
        <p className="text-slate-400 mb-6">This page needs an exam to load, e.g. /exam?id=&lt;examId&gt;.</p>
        <Button onClick={() => router.push('/student/active-exams')}>Back to Active Exams</Button>
      </div>
    );
  }

  if (isLoadingExam) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900">
        <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (examLoadError || questions.length === 0) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-400 mb-4" />
        <h2 className="text-xl font-bold mb-2">Unable to open exam</h2>
        <p className="text-slate-400 mb-6 max-w-lg">
          {examLoadError || 'No questions are available for this exam.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => setExamLoadAttempt((attempt) => attempt + 1)}>Try Again</Button>
          <Button variant="outline" onClick={() => router.push('/student/active-exams')}>Back to Active Exams</Button>
        </div>
      </div>
    );
  }

  if (status === 'NOT_STARTED') {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 p-6 text-white select-none">
        <Card className="p-10 max-w-lg w-full text-center shadow-2xl border-none bg-slate-800 text-white">
          <div className="flex justify-center mb-6">
            <Monitor className="w-16 h-16 text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Secure Exam Mode</h2>
          <p className="text-slate-300 mb-8 text-lg">
            This examination requires a secure fullscreen environment. By clicking "Start Exam", your browser will enter fullscreen mode. Exiting fullscreen or switching tabs will result in a security violation.
          </p>
          <div className="space-y-4 text-left bg-slate-900 p-4 rounded-lg mb-8 text-sm text-slate-400">
            <p className="flex items-center gap-2"><Monitor className="w-4 h-4 text-emerald-400" /> Fullscreen mode enforced</p>
            <p className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400" /> Shortcuts and right-click disabled</p>
          </div>
          <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg h-14 font-bold" onClick={handleStartExam}>
            Start Exam
          </Button>
        </Card>
      </div>
    );
  }

  if (status === 'TERMINATED' || status === 'COMPLETED') {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <Card className="p-8 max-w-md text-center shadow-xl border-t-4 border-t-blue-600">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Exam {status === 'TERMINATED' ? 'Terminated' : 'Submitted'}</h2>
          <p className="text-slate-600 mb-6">
            {status === 'TERMINATED'
              ? 'Your exam was automatically submitted due to exceeding the maximum allowed security violations.'
              : 'Your exam has been successfully submitted.'}
          </p>
          {pendingSubmitStatus && (
            <div className="mb-6 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm flex items-center justify-center gap-2">
              <span className="h-3 w-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shrink-0" />
              Waiting for a connection to confirm your submission with the server. Your answers are saved on this device and will sync automatically — keep this tab open.
            </div>
          )}
          {submissionReceipt && !pendingSubmitStatus && (
            <dl className="mb-6 rounded-lg border bg-slate-50 p-4 text-left text-sm" aria-label="Server submission receipt">
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Attempt ID</dt><dd className="font-mono break-all text-right">{submissionReceipt.attemptId}</dd></div>
              <div className="mt-2 flex justify-between gap-4"><dt className="text-slate-500">Submitted</dt><dd>{new Date(submissionReceipt.submittedAt).toLocaleString()}</dd></div>
              <div className="mt-2 flex justify-between gap-4"><dt className="text-slate-500">Server confirmed</dt><dd>{new Date(submissionReceipt.serverConfirmedAt).toLocaleString()}</dd></div>
            </dl>
          )}
          <div className="space-y-3">
            <Button className="w-full" onClick={() => router.push('/student/dashboard')}>Return to Dashboard</Button>
            {status === 'TERMINATED' && (
              <Button
                variant="outline"
                className="w-full text-slate-500"
                disabled={!!pendingSubmitStatus}
                onClick={() => { clearSession(); router.push('/student/active-exams'); }}
              >
                {pendingSubmitStatus ? 'Waiting for sync before restart...' : 'Restart Mock Exam'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-400 mb-4" />
        <h2 className="text-xl font-bold mb-2">Question unavailable</h2>
        <p className="text-slate-400 mb-6">The selected question could not be loaded. Reload the exam to continue.</p>
        <Button onClick={() => setExamLoadAttempt((attempt) => attempt + 1)}>Reload Exam</Button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col overflow-hidden select-none">

      {/* Top Security & Info Bar */}
      <header className="h-14 bg-[#1E3A8A] text-white flex items-center justify-between px-4 md:px-6 shadow-md z-10 shrink-0">
        <div className="flex items-center gap-2 md:gap-6">
          <span className="font-bold text-sm md:text-lg tracking-wide hidden sm:block">Enterprise Assessment</span>
          <span className="font-bold text-sm tracking-wide sm:hidden">EA</span>
          <div className="hidden md:block h-4 w-px bg-white/20"></div>
          <div className="hidden md:flex items-center gap-4 text-sm font-medium">
            <span className="flex items-center gap-1.5"><Monitor className="w-4 h-4 text-green-400" /> Fullscreen</span>
            <span className={`flex items-center gap-1.5 ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
              {!isOnline ? (
                <>
                  <Wifi className="w-4 h-4" />
                  <span>Offline</span>
                </>
              ) : pendingSyncCount > 0 ? (
                <>
                  <Wifi className="w-4 h-4 animate-pulse" />
                  <span>Syncing...</span>
                </>
              ) : (
                <NetworkPing variant="transparent" />
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          {!isOnline && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs md:text-sm font-bold bg-red-500/20 text-red-300 animate-pulse">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">No connection — saving locally</span>
              <span className="sm:hidden">Offline</span>
            </div>
          )}
          <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${violationsCount > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-white/10'}`}>
            <AlertTriangle className="w-4 h-4" />
            Violations: {violationsCount}/{maxViolations}
          </div>
          <div className="text-lg md:text-xl font-mono font-bold tracking-wider tabular-nums">
            <span role="timer" aria-live="polite" aria-label={`${timeRemaining} seconds remaining`}>{formatTime(timeRemaining)}</span>
          </div>
          <Button variant="destructive" size="sm" onClick={() => setShowSubmitConfirm(true)} className="font-bold px-2 md:px-4 text-xs md:text-sm">
            Submit
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* Left: Question Panel */}
        <main className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Question {currentQuestionIdx + 1}</h2>
            <div className="flex gap-2">
            {calculatorEnabled && <Button variant="outline" size="sm" onClick={() => setShowCalculator(!showCalculator)} className="bg-white px-2 md:px-3 text-xs md:text-sm">
              <Calculator className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Calculator</span>
            </Button>}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  if (!currentQuestion) return;
                  setMarkedForReview(prev => {
                    const next = new Set(prev);
                    if (next.has(currentQuestion.id)) next.delete(currentQuestion.id);
                    else next.add(currentQuestion.id);
                    return next;
                  });
                }}
                className={`bg-white border-amber-200 hover:bg-amber-50 px-2 md:px-3 text-xs md:text-sm transition-colors ${
                  currentQuestion && markedForReview.has(currentQuestion.id) ? 'bg-amber-100 text-amber-700 font-bold' : 'text-amber-600'
                }`}
              >
                <Flag className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">
                  {currentQuestion && markedForReview.has(currentQuestion.id) ? 'Marked' : 'Mark for Review'}
                </span>
              </Button>
            </div>
          </div>

          <Card className="flex-1 p-4 md:p-8 shadow-sm border-slate-200 bg-white">
            <p className="text-base md:text-lg text-slate-800 leading-relaxed mb-6 md:mb-8">{currentQuestion.text}</p>

            <div className="space-y-3">
              {currentQuestion.options.map((opt, i) => {
                const isSelected = answers[currentQuestion.id] === opt;
                return (
                  <label
                    key={i}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                      isSelected ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-600"
                      checked={isSelected}
                      onChange={() => saveAnswer(currentQuestion.id, opt)}
                    />
                    <span className="ml-3 text-slate-700 font-medium">{opt}</span>
                  </label>
                );
              })}
            </div>
          </Card>

          {/* Navigation Footer */}
          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIdx === 0}
              className="bg-white text-xs md:text-sm px-3 md:px-8"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 mr-1" /> Previous
            </Button>
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-xs md:text-sm px-3 md:px-8"
              onClick={() => setCurrentQuestionIdx(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentQuestionIdx === questions.length - 1}
            >
              Save & Next <ChevronRight className="w-4 h-4 md:w-5 md:h-5 ml-1" />
            </Button>
          </div>
        </main>

        {/* Right: Question Palette */}
        <aside className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-4 md:p-6 flex flex-col shrink-0 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] overflow-y-auto max-h-[30vh] lg:max-h-none">
          <h3 className="font-bold text-slate-900 mb-4">Question Palette</h3>

          <div className="grid grid-cols-4 gap-2 mb-8">
            {questions.map((q, i) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = currentQuestionIdx === i;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIdx(i)}
                  className={`h-10 rounded-md text-sm font-semibold transition-all border ${
                    isCurrent ? 'ring-2 ring-blue-600 ring-offset-1 border-transparent' : ''
                  } ${
                    markedForReview.has(q.id)
                      ? 'bg-amber-500 text-white border-amber-600'
                      : isAnswered
                        ? 'bg-green-500 text-white border-green-600'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-auto space-y-3 text-sm font-medium text-slate-600 border-t pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded-sm"></div> Answered</div>
              <span>{Object.keys(answers).length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white border border-slate-300 rounded-sm"></div> Not Answered</div>
              <span>{questions.length - Object.keys(answers).length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-amber-500 rounded-sm"></div> Marked</div>
              <span>{markedForReview.size}</span>
            </div>
          </div>
        </aside>
      </div>
      
      {calculatorEnabled && <FloatingCalculator isOpen={showCalculator} onClose={() => setShowCalculator(false)} />}

      <ConfirmDialog
        open={showSubmitConfirm}
        onOpenChange={setShowSubmitConfirm}
        title="Submit Exam"
        description={
          questions.length - Object.keys(answers).length > 0
            ? `You have ${questions.length - Object.keys(answers).length} unanswered question${questions.length - Object.keys(answers).length > 1 ? 's' : ''}. Once submitted, you cannot make any further changes. Are you sure you want to submit?`
            : 'Once submitted, you cannot make any further changes. Are you sure you want to submit?'
        }
        onConfirm={() => { setShowSubmitConfirm(false); endExam('COMPLETED'); }}
        destructive={false}
      />

      {/* Security Warning Overlay (Blocks UI when isPaused is true) */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 backdrop-blur-md select-none"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-red-500/30 rounded-xl shadow-[0_0_50px_rgba(239,68,68,0.2)] max-w-lg w-full overflow-hidden text-white"
            >
              <div className="bg-red-600 p-6 flex flex-col items-center justify-center text-white">
                <AlertTriangle className="w-16 h-16 mb-4 animate-pulse" />
                <h2 className="text-3xl font-bold uppercase tracking-wider">Security Alert</h2>
              </div>
              <div className="p-8 text-center space-y-6">
                <p className="text-xl font-medium">
                  Secure Exam Mode was interrupted.
                </p>
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg text-red-400 font-bold text-xl">
                  Violation {violationsCount} of {maxViolations}
                  {violationsCount === maxViolations - 1 && <span className="block text-sm mt-1">FINAL WARNING</span>}
                </div>
                <p className="text-slate-400">
                  You must return to fullscreen mode to continue your exam. Do not leave the exam window.
                </p>
                <div className="pt-4 flex flex-col gap-3">
                  <Button
                    size="lg"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-14 text-lg"
                    onClick={async () => {
                      try {
                        await document.documentElement.requestFullscreen();
                        setIsPaused(false);
                      } catch (err) {
                        // Stay paused if failed
                      }
                    }}
                  >
                    Return to Fullscreen
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => endExam('COMPLETED')}
                  >
                    End Exam Now
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ExamPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900">
        <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SecureExamInterface />
    </Suspense>
  );
}
