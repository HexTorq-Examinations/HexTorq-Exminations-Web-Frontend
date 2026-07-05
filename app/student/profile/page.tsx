'use client';

import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { User, Mail, Phone, MapPin, Building, Calendar, Shield, MonitorSmartphone, Clock, PlayCircle, CheckCircle2, ChevronRight, Save } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

export default function StudentProfile() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock student data
  const studentData = {
    studentId: 'STU-2024-8429',
    department: 'Computer Science',
    semester: '6th Semester',
    batch: '2021-2025',
    phone: '+1 (555) 123-4567',
    joined: 'August 2021',
  };

  return (
    <div className="space-y-6 pb-10">
      <PageHeader 
        title="Student Profile" 
        description="Manage your personal information and account settings."
        breadcrumbs={[{ label: 'Student', href: '/student/dashboard' }, { label: 'Profile' }]}
        showSearch={false}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar - Profile Card (30%) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            <CardContent className="pt-0 px-6 pb-6 text-center">
              <div className="flex justify-center -mt-12 mb-4">
                <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-950 shadow-sm">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl font-bold">{user?.name?.charAt(0) || 'S'}</AvatarFallback>
                </Avatar>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{user?.name || 'Student Name'}</h2>
              <p className="text-blue-600 dark:text-blue-400 font-medium text-sm mt-1">{studentData.studentId}</p>
              
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 border-0">{studentData.department}</Badge>
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 border-0">{studentData.semester}</Badge>
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 border-0">Batch {studentData.batch}</Badge>
              </div>

              <div className="mt-8 space-y-4 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400 truncate">{user?.email || 'student@university.edu'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400">{studentData.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400">Joined {studentData.joined}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exam Statistics */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Exam Statistics</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><Calendar className="w-4 h-4" /></div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Upcoming Exams</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-100">2</span>
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><PlayCircle className="w-4 h-4" /></div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Active Exams</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-100">0</span>
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center"><CheckCircle2 className="w-4 h-4" /></div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Completed Exams</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-100">14</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Content (70%) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Personal Information */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <CardTitle className="text-lg font-bold">Personal Information</CardTitle>
              </div>
              <Button 
                variant={isEditing ? "default" : "outline"}
                className={isEditing ? "bg-blue-600 hover:bg-blue-700" : ""}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <><Save className="mr-2 h-4 w-4" /> Save Changes</> : 'Edit Profile'}
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={user?.name || ''} disabled={!isEditing} className="bg-slate-50 dark:bg-slate-950/50 disabled:opacity-70" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue={user?.email || ''} disabled={!isEditing} className="bg-slate-50 dark:bg-slate-950/50 disabled:opacity-70" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Mobile Number</Label>
                    <Input id="phone" defaultValue={studentData.phone} disabled={!isEditing} className="bg-slate-50 dark:bg-slate-950/50 disabled:opacity-70" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input id="dob" type="date" defaultValue="2003-05-15" disabled={!isEditing} className="bg-slate-50 dark:bg-slate-950/50 disabled:opacity-70" />
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center gap-2">
              <Shield className="w-5 h-5 text-slate-500" />
              <CardTitle className="text-lg font-bold m-0">Security</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">Change Password</h4>
                    <p className="text-sm text-slate-500 mt-1">Update your password to keep your account secure. We recommend changing it every 6 months.</p>
                  </div>
                  <Button variant="outline">Update Password</Button>
                </div>
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">Two-Factor Authentication (2FA)</h4>
                    <p className="text-sm text-slate-500 mt-1">Add an extra layer of security to your account using an authenticator app.</p>
                  </div>
                  <Button className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900">Enable 2FA</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Activity */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg font-bold">Account Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                    <MonitorSmartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">Current Session</h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 mt-1">
                      <span>Windows 11 • Chrome</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> New York, USA</span>
                    </div>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 mb-1">Active Now</Badge>
                  <p className="text-xs text-slate-400 flex items-center sm:justify-end gap-1"><Clock className="w-3 h-3" /> Last login: Just now</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
