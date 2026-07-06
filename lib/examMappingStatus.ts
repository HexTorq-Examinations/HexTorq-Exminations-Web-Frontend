import { ExamMapping } from '@/types/admin';
import { ExamHistoryEntry } from '@/store/examStore';

// An ExamMapping's own `status` field is a manual admin label (Scheduled/Cancelled/etc.)
// that's never kept in sync with real time or real attempts, so every student-facing
// page derives the actual temporal window from date+startTime+endTime instead — this
// mirrors the server-side enforcement in assertStudentHasMapping exactly, so what a
// student sees always matches what the API will actually let them do.
export function getMappingWindow(mapping: ExamMapping): { start: Date; end: Date } {
  const start = new Date(`${mapping.date}T${mapping.startTime}:00`);
  const end = new Date(`${mapping.date}T${mapping.endTime}:00`);
  return { start, end };
}

export type TemporalStatus = 'upcoming' | 'active' | 'ended';

export function getTemporalStatus(mapping: ExamMapping, now: Date): TemporalStatus {
  const { start, end } = getMappingWindow(mapping);
  if (now < start) return 'upcoming';
  if (now <= end) return 'active';
  return 'ended';
}

export function hasCompletedMapping(mapping: ExamMapping, examHistory: ExamHistoryEntry[] | null | undefined): boolean {
  return (examHistory || []).some((h) => h.examId === mapping.examId);
}
