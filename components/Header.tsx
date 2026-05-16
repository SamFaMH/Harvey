'use client';

import Link from 'next/link';
import { useTheme } from './ThemeProvider';

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <span aria-hidden>🎙️</span>
          Harvey
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/practice"
            className="min-h-[44px] rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Practice
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            className="min-h-[44px] min-w-[44px] rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:hover:bg-slate-800"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </nav>
      </div>
    </header>
  );
}
