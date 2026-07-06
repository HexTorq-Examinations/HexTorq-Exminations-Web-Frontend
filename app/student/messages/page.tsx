import { Suspense } from 'react';
import { MessagingView } from '@/components/common/MessagingView';

export default function StudentMessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagingView role="student" />
    </Suspense>
  );
}
