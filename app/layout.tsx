import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/providers/ThemeProvider';
import QueryProvider from '@/providers/QueryProvider';
import { ExamSyncProvider } from '@/providers/ExamSyncProvider';
import { Toaster } from 'sonner';
import { NetworkPing } from '@/components/common/NetworkPing';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Enterprise Assessment Platform',
  description: 'Enterprise Online Assessment Platform for Super Admins, Admins, and Students.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <ExamSyncProvider />
            {children}
            <NetworkPing />
            <Toaster richColors position="top-right" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
