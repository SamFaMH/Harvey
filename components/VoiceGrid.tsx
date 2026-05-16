'use client';

import type { Voice } from '@/lib/types';
import LoadingSpinner from './LoadingSpinner';

interface VoiceGridProps {
  voices: Voice[];
  selected: string;
  onSelect: (voiceId: string) => void;
  onPreview?: (voiceId: string) => void;
  previewLoading?: string | null;
}

export default function VoiceGrid({
  voices,
  selected,
  onSelect,
  onPreview,
  previewLoading,
}: VoiceGridProps) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
        Voice
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {voices.map((voice) => {
          const isActive = selected === voice.id;
          return (
            <div key={voice.id} className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => onSelect(voice.id)}
                className={`min-h-[44px] rounded-lg border px-3 py-2 text-left transition-colors ${
                  isActive
                    ? 'border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-950'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-slate-500'
                }`}
              >
                <span className="block text-sm font-medium text-slate-900 dark:text-slate-100">
                  {voice.name}
                </span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">
                  {voice.type}
                </span>
              </button>
              {onPreview && (
                <button
                  type="button"
                  onClick={() => onPreview(voice.id)}
                  disabled={previewLoading === voice.id}
                  className="min-h-[36px] rounded text-xs text-blue-600 hover:underline disabled:opacity-50 dark:text-blue-400"
                  aria-label={`Preview ${voice.name} voice`}
                >
                  {previewLoading === voice.id ? (
                    <span className="flex items-center justify-center gap-1">
                      <LoadingSpinner size="sm" />
                      Preview...
                    </span>
                  ) : (
                    'Preview'
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
