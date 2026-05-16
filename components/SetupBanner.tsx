'use client';

interface SetupBannerProps {
  supabaseOk: boolean;
  supabaseError: string | null;
}

export default function SetupBanner({ supabaseOk, supabaseError }: SetupBannerProps) {
  if (supabaseOk && !supabaseError) {
    return null;
  }

  return (
    <div
      className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
      role="status"
    >
      {!supabaseOk ? (
        <>
          <strong>Setup needed:</strong> Save{' '}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.local</code> with your
          Supabase URL and anon key, then restart{' '}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">npm run dev</code>. Templates
          and voices work offline; history needs Supabase.
        </>
      ) : (
        <>
          <strong>Database:</strong> {supabaseError ?? 'Could not load history.'} Run{' '}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">supabase/schema.sql</code>{' '}
          in the Supabase SQL Editor, then refresh.
        </>
      )}
    </div>
  );
}
