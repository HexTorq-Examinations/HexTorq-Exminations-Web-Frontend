'use client';

import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Calendar, Clock, AlertCircle, FileText, Settings, CheckCircle2, Megaphone, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

export default function StudentNotifications() {
  const [activeFilter, setActiveFilter] = useState('All');

  const notifications = [
    {
      id: 1,
      title: 'Mathematics Exam Scheduled',
      type: 'Exam Updates',
      time: 'Tomorrow, 10:00 AM',
      description: 'Your final examination for Mathematics has been scheduled. Please ensure your system meets the requirements.',
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      unread: true
    },
    {
      id: 2,
      title: 'System Maintenance',
      type: 'Maintenance',
      time: 'Oct 20, 2:00 AM',
      description: 'The platform will undergo scheduled maintenance for 2 hours. Access will be temporarily disabled.',
      icon: Settings,
      color: 'text-slate-600',
      bg: 'bg-slate-100',
      unread: true
    },
    {
      id: 3,
      title: 'Science Midterm Results',
      type: 'General Announcements',
      time: '2 days ago',
      description: 'The results for the Science Midterm have been published by your instructor.',
      icon: Megaphone,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      unread: false
    },
    {
      id: 4,
      title: 'Schedule Change: History',
      type: 'Schedule Changes',
      time: '1 week ago',
      description: 'The History assessment has been moved to July 5th. Please check your updated calendar.',
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
      unread: false
    }
  ];

  const filters = ['All', 'Unread', 'Exams', 'Announcements'];

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Unread') return n.unread;
    if (activeFilter === 'Exams') return n.type === 'Exam Updates' || n.type === 'Schedule Changes';
    if (activeFilter === 'Announcements') return n.type === 'General Announcements' || n.type === 'Maintenance';
    return true;
  });

  const hasNotifications = filteredNotifications.length > 0;

  return (
    <div className="space-y-6 pb-10">
      <PageHeader 
        title="Notifications" 
        description="Stay updated with examination announcements and alerts."
        breadcrumbs={[{ label: 'Student', href: '/student/dashboard' }, { label: 'Notifications' }]}
        showSearch={false}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content (70%) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Top Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {filters.map((filter) => (
              <Button 
                key={filter} 
                variant={activeFilter === filter ? 'default' : 'outline'}
                className={activeFilter === filter ? 'bg-blue-600 hover:bg-blue-700' : 'text-slate-600 dark:text-slate-300'}
                onClick={() => setActiveFilter(filter)}
                size="sm"
              >
                {filter}
              </Button>
            ))}
          </div>

          {!hasNotifications ? (
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm border-dashed text-center">
              <CardContent className="py-24">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">You're all caught up!</h3>
                  <p className="text-slate-500 max-w-sm">There are no new notifications matching your current filter.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <Card key={notification.id} className={`border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md ${notification.unread ? 'border-l-4 border-l-blue-600' : ''}`}>
                  <CardContent className="p-0">
                    <div className="p-6 flex flex-col sm:flex-row gap-5">
                      <div className={`w-12 h-12 rounded-full ${notification.bg} dark:bg-opacity-20 flex flex-shrink-0 items-center justify-center`}>
                        <notification.icon className={`h-6 w-6 ${notification.color} dark:text-opacity-80`} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 border-0">{notification.type}</Badge>
                              {notification.unread && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">New</Badge>}
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">{notification.title}</h4>
                          </div>
                          <span className="text-sm font-medium text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {notification.time}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">{notification.description}</p>
                        <div className="pt-2">
                          <Button variant="link" className="px-0 text-blue-600 hover:text-blue-700 h-auto">Read More <ChevronRight className="w-4 h-4 ml-1" /></Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar (30%) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Exam Updates</span>
                  <Badge variant="outline">2</Badge>
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Schedule Changes</span>
                  <Badge variant="outline">1</Badge>
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer">
                  <span className="font-medium text-slate-700 dark:text-slate-300">New Exams</span>
                  <Badge variant="outline">0</Badge>
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Maintenance</span>
                  <Badge variant="outline">1</Badge>
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer">
                  <span className="font-medium text-slate-700 dark:text-slate-300">General Announcements</span>
                  <Badge variant="outline">1</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
