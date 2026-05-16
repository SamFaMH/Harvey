import type { Metadata } from 'next';
import './globals.css';
import ErrorBoundary from '@/components/ErrorBoundary';
import Header from '@/components/Header';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'Harvey - AI Announcer',
  description:
    'Professional announcements for airports, railways, and events',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <ThemeProvider>
          <ErrorBoundary>
            <Header />
            <main>{children}</main>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
