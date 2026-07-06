import { Suspense } from 'react';
import { MessagingView } from '@/components/common/MessagingView';

export default function SuperAdminMessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagingView role="super-admin" />
    </Suspense>
  );
}
