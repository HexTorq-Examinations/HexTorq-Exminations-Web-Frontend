'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Monitor, Wifi, ShieldAlert } from 'lucide-react';

export default function SystemCheckPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get('examId') || 'ex_1';

  const [checks, setChecks] = useState({
    fullscreen: false,
    internet: true, // Assuming true if page loaded, could do ping test
    declaration: false,
  });

  const requestFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setChecks(prev => ({ ...prev, fullscreen: true }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Listen for fullscreen exit during check
  useEffect(() => {
    const handleFullscreenChange = () => {
      setChecks(prev => ({ ...prev, fullscreen: !!document.fullscreenElement }));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const allChecksPassed = checks.fullscreen && checks.internet && checks.declaration;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg border-0">
        <CardHeader className="text-center space-y-2 pb-6 border-b">
          <ShieldAlert className="w-12 h-12 text-blue-600 mx-auto" />
          <CardTitle className="text-2xl font-bold text-slate-900">System Compatibility Check</CardTitle>
          <CardDescription className="text-base">
            Please complete the following checks to ensure a smooth and secure examination experience.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-4">

            {/* Fullscreen Check */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-slate-500" />
                <div>
                  <h4 className="font-semibold text-slate-900">Fullscreen Mode</h4>
                  <p className="text-sm text-slate-500">Required for secure exam environment</p>
                </div>
              </div>
              {checks.fullscreen ? (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              ) : (
                <Button variant="outline" size="sm" onClick={requestFullscreen}>Enable</Button>
              )}
            </div>

            {/* Internet Check */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <Wifi className="w-5 h-5 text-slate-500" />
                <div>
                  <h4 className="font-semibold text-slate-900">Internet Connection</h4>
                  <p className="text-sm text-slate-500">Stable connection detected</p>
                </div>
              </div>
              {checks.internet ? (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500" />
              )}
            </div>

            {/* Declaration */}
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-blue-50/50 border-blue-100 mt-2">
              <input
                type="checkbox"
                id="declaration"
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                checked={checks.declaration}
                onChange={(e) => setChecks(prev => ({ ...prev, declaration: e.target.checked }))}
              />
              <label htmlFor="declaration" className="text-sm text-slate-700 leading-snug cursor-pointer">
                I hereby declare that I will not use any unfair means during the examination. I understand that my activities are being monitored, and any violation will result in immediate termination of the exam.
              </label>
            </div>

          </div>
        </CardContent>

        <CardFooter className="pt-2 pb-6 border-t mt-6 bg-slate-50/50 rounded-b-xl flex justify-end gap-3">
          <Button variant="ghost" onClick={() => router.push('/student/dashboard')}>Cancel</Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
            disabled={!allChecksPassed}
            onClick={() => router.push(`/exam?id=${examId}`)}
          >
            Start Exam
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
