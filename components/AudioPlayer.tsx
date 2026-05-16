'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { formatDuration } from '@/lib/utils';

interface AudioPlayerProps {
  audioUrl: string | null;
  duration: number | null;
  announcementText?: string;
  onDownload?: () => void;
  onCopyUrl?: () => void;
  onCopyText?: () => void;
}

async function downloadAudio(audioUrl: string, filename: string) {
  const response = await fetch(audioUrl);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'announcement.mp3';
  a.click();
  window.URL.revokeObjectURL(url);
}

export default function AudioPlayer({
  audioUrl,
  duration,
  announcementText,
  onDownload,
  onCopyUrl,
  onCopyText,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    setPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  }, [audioUrl]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !audioUrl) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  }, [playing, audioUrl]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const t = audioRef.current.currentTime;
    const d = audioRef.current.duration || duration || 1;
    setCurrentTime(t);
    setProgress((t / d) * 100);
  };

  const handleEnded = () => {
    setPlaying(false);
    setProgress(100);
  };

  const handleDownload = async () => {
    if (!audioUrl) return;
    try {
      const filename = `harvey-${Date.now()}.mp3`;
      await downloadAudio(audioUrl, filename);
      onDownload?.();
    } catch {
      onDownload?.();
    }
  };

  const handleCopyUrl = async () => {
    if (!audioUrl) return;
    try {
      await navigator.clipboard.writeText(audioUrl);
      onCopyUrl?.();
    } catch {
      onCopyUrl?.();
    }
  };

  const handleShare = async () => {
    if (!audioUrl || !navigator.share) return;
    try {
      await navigator.share({
        title: 'Harvey Announcement',
        text: announcementText ?? 'AI announcement',
      });
    } catch {
      /* user cancelled */
    }
  };

  if (!audioUrl) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-600 dark:bg-slate-800/50">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No audio generated yet. Fill the form and click Generate.
        </p>
      </div>
    );
  }

  const displayDuration = duration ?? 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        preload="metadata"
      />
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-12 w-12 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <div className="flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
            <div
              className="h-full bg-blue-600 transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {formatDuration(currentTime)} / {formatDuration(displayDuration)}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleDownload}
          className="min-h-[44px] rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
        >
          Download Audio
        </button>
        <button
          type="button"
          onClick={handleCopyUrl}
          className="min-h-[44px] rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
        >
          Copy URL
        </button>
        {announcementText && onCopyText && (
          <button
            type="button"
            onClick={onCopyText}
            className="min-h-[44px] rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            Copy Text
          </button>
        )}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            type="button"
            onClick={handleShare}
            className="min-h-[44px] rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            Share
          </button>
        )}
      </div>
    </div>
  );
}
