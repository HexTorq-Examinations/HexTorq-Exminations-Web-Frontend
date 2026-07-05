'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ExamQuestionsView } from '@/components/admin-views/ExamQuestionsView';

function ExamQuestionsPageInner() {
  const searchParams = useSearchParams();
  const examId = searchParams.get('examId') || '';

  if (!examId) {
    return <p className="text-slate-500">No exam selected. Go back to Exams and choose "Manage Questions".</p>;
  }

  return <ExamQuestionsView examId={examId} role="super-admin" />;
}

export default function SuperAdminExamQuestionsPage() {
  return (
    <Suspense fallback={null}>
      <ExamQuestionsPageInner />
    </Suspense>
  );
}
