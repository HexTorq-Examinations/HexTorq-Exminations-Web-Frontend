import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple pass-through proxy.
// Route protection is handled client-side by DashboardLayout (Zustand stores auth in localStorage, not cookies).
export function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
