'use client';

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import type { ToastState } from '@/lib/types';

interface PracticeMetrics {
  userDuration: number;
  harveyDuration: number;
  userWpm: number;
  harveyWpm: number;
  clarityScore: number;
  toneScore: number;
  feedback: string;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function PracticePage() {
  const [harveyText, setHarveyText] = useState('');
  const [harveyAudioUrl, setHarveyAudioUrl] = useState<string | null>(null);
  const [harveyDuration, setHarveyDuration] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [recording, setRecording] = useState(false);
  const [metrics, setMetrics] = useState<PracticeMetrics | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordStartRef = useRef<number>(0);

  const showToast = useCallback((message: string, type: ToastState['type']) => {
    setToast({ message, type });
  }, []);

  const handleGenerateHarvey = async () => {
    const text = harveyText.trim();
    if (!text) {
      showToast('Enter announcement text first.', 'error');
      return;
    }
    setGenerating(true);
    setMetrics(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId: 'adam', style: 'formal' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? 'Generation failed.');
      }
      setHarveyAudioUrl(data.audioUrl);
      setHarveyDuration(data.duration);
      showToast('Harvey audio ready. Now record your practice.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Generation failed.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const userDuration = (Date.now() - recordStartRef.current) / 1000;
        const words = countWords(harveyText);
        const userWpm = userDuration > 0 ? Math.round((words / userDuration) * 60) : 0;
        const harveyWpm =
          harveyDuration && harveyDuration > 0
            ? Math.round((words / harveyDuration) * 60)
            : 0;

        let feedback = 'Good pacing!';
        if (userWpm < harveyWpm - 15) {
          feedback = 'Speak a bit faster to match Harvey\'s pace.';
        } else if (userWpm > harveyWpm + 15) {
          feedback = 'Slow down slightly for clearer announcements.';
        }

        const durationDiff = Math.abs(userDuration - (harveyDuration ?? 0));
        const clarityScore = Math.max(
          1,
          Math.min(10, Math.round(10 - durationDiff))
        );
        const toneScore = Math.max(
          1,
          Math.min(10, Math.round(8 - Math.abs(userWpm - harveyWpm) / 10))
        );

        setMetrics({
          userDuration,
          harveyDuration: harveyDuration ?? 0,
          userWpm,
          harveyWpm,
          clarityScore,
          toneScore,
          feedback,
        });
        setRecording(false);
      };
      mediaRecorderRef.current = recorder;
      recordStartRef.current = Date.now();
      recorder.start();
      setRecording(true);
    } catch {
      showToast('Microphone access denied.', 'error');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="mb-4 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
      >
        ← Back to Harvey
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        Announcing Practice Analyzer
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Generate with Harvey, then record yourself and compare pacing and duration.
      </p>

      <div className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <label
          htmlFor="practice-text"
          className="block text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          Announcement text
        </label>
        <textarea
          id="practice-text"
          value={harveyText}
          onChange={(e) => setHarveyText(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />

        <button
          type="button"
          onClick={handleGenerateHarvey}
          disabled={generating}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {generating ? <LoadingSpinner size="sm" /> : null}
          {generating ? 'Generating...' : '1. Generate Harvey Audio'}
        </button>

        {harveyAudioUrl && (
          <audio controls src={harveyAudioUrl} className="w-full" />
        )}

        <div className="flex gap-2">
          {!recording ? (
            <button
              type="button"
              onClick={startRecording}
              disabled={!harveyAudioUrl}
              className="min-h-[44px] flex-1 rounded-lg border border-red-500 px-4 py-2 text-red-600 disabled:opacity-50 dark:text-red-400"
            >
              2. Record Practice
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="min-h-[44px] flex-1 animate-pulse rounded-lg bg-red-600 px-4 py-2 text-white"
            >
              Stop Recording
            </button>
          )}
        </div>

        {recording && (
          <div className="flex h-8 items-end gap-1">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="w-2 animate-pulse rounded bg-blue-500"
                style={{
                  height: `${20 + Math.random() * 80}%`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {metrics && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="font-semibold text-slate-900 dark:text-white">Results</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <li>
              Duration: You {metrics.userDuration.toFixed(1)}s vs Harvey{' '}
              {metrics.harveyDuration.toFixed(1)}s
            </li>
            <li>
              Pacing: You {metrics.userWpm} wpm vs Harvey {metrics.harveyWpm} wpm
            </li>
            <li>Clarity score: {metrics.clarityScore}/10</li>
            <li>Tone match: {metrics.toneScore}/10</li>
          </ul>
          <p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
            {metrics.feedback}
          </p>
        </div>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
