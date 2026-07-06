import { Suspense } from 'react';
import { MessagingView } from '@/components/common/MessagingView';

export default function AdminMessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagingView role="admin" />
    </Suspense>
  );
}
