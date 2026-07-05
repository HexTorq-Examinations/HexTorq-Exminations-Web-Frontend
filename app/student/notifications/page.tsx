'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2, MessageSquare, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useMessagingStore } from '@/store/messagingStore';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  conversationId: string;
}

const timeAgo = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { openPanel, openConversation } = useMessagingStore();

  useEffect(() => {
    let cancelled = false;
    api.get('/messages/notifications')
      .then(({ data }) => { if (!cancelled) setNotifications(data); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleOpen = (conversationId: string) => {
    openPanel();
    openConversation(conversationId);
  };

  const hasNotifications = notifications.length > 0;

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Notifications"
        description="Recent activity on your account — currently, new messages you've received."
        breadcrumbs={[{ label: 'Student', href: '/student/dashboard' }, { label: 'Notifications' }]}
        showSearch={false}
      />

      <div className="max-w-3xl">
        {isLoading ? (
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="py-24 text-center text-slate-400">Loading...</CardContent>
          </Card>
        ) : !hasNotifications ? (
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm border-dashed text-center">
            <CardContent className="py-24">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">You're all caught up!</h3>
                <p className="text-slate-500 max-w-sm">There are no new notifications right now.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <Card
                key={n.id}
                className={`border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md cursor-pointer ${n.unread ? 'border-l-4 border-l-blue-600' : ''}`}
                onClick={() => handleOpen(n.conversationId)}
              >
                <CardContent className="p-0">
                  <div className="p-6 flex gap-5">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex flex-shrink-0 items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {n.unread && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">New</Badge>}
                          </div>
                          <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">{n.title}</h4>
                        </div>
                        <span className="text-sm font-medium text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {timeAgo(n.time)}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 line-clamp-2">{n.description}</p>
                      <div className="pt-2">
                        <Button variant="link" className="px-0 text-blue-600 hover:text-blue-700 h-auto">Open Conversation <ChevronRight className="w-4 h-4 ml-1" /></Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
