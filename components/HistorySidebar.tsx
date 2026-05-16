'use client';

import { useMemo, useState } from 'react';
import type { Announcement, Voice } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils';

interface HistorySidebarProps {
  announcements: Announcement[];
  voices: Voice[];
  onSelect: (announcement: Announcement) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
  onExportCsv?: () => void;
  loadError?: string | null;
}

const STYLE_LABELS: Record<string, string> = {
  formal: 'Formal',
  casual: 'Casual',
  urgent: 'Urgent',
};

function HistoryItem({
  announcement,
  voiceName,
  onSelect,
  onDelete,
  onToggleFavorite,
}: {
  announcement: Announcement;
  voiceName: string;
  onSelect: (a: Announcement) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
}) {
  return (
    <li className="group rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800">
      <button
        type="button"
        onClick={() => onSelect(announcement)}
        className="w-full text-left"
      >
        <p className="line-clamp-2 text-sm text-slate-800 dark:text-slate-100">
          {announcement.text.slice(0, 50)}
          {announcement.text.length > 50 ? '…' : ''}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>{formatRelativeTime(announcement.created_at)}</span>
          <span>{voiceName}</span>
          <span className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-700">
            {STYLE_LABELS[announcement.style] ?? announcement.style}
          </span>
        </div>
      </button>
      <div className="mt-1 flex items-center justify-between">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(announcement.id, announcement.is_favorite);
          }}
          className="min-h-[44px] min-w-[44px] p-2 text-lg"
          aria-label={
            announcement.is_favorite ? 'Remove from favorites' : 'Add to favorites'
          }
        >
          {announcement.is_favorite ? '★' : '☆'}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(announcement.id);
          }}
          className="min-h-[44px] min-w-[44px] rounded p-2 text-slate-400 hover:text-red-500"
          aria-label="Delete announcement"
        >
          ✕
        </button>
      </div>
    </li>
  );
}

export default function HistorySidebar({
  announcements,
  voices,
  onSelect,
  onDelete,
  onToggleFavorite,
  onExportCsv,
  loadError,
}: HistorySidebarProps) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(false);

  const voiceMap = useMemo(
    () => Object.fromEntries(voices.map((v) => [v.id, v.name])),
    [voices]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return announcements;
    const q = search.toLowerCase();
    return announcements.filter((a) => a.text.toLowerCase().includes(q));
  }, [announcements, search]);

  const favorites = filtered.filter((a) => a.is_favorite);
  const rest = filtered.filter((a) => !a.is_favorite);

  const content = (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          type="search"
          placeholder="Search history..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          aria-label="Search announcements"
        />
        {onExportCsv && announcements.length > 0 && (
          <button
            type="button"
            onClick={onExportCsv}
            className="min-h-[44px] shrink-0 rounded-lg border border-slate-300 px-2 text-xs dark:border-slate-600"
            aria-label="Export history as CSV"
          >
            CSV
          </button>
        )}
      </div>

      {loadError && (
        <p className="text-sm text-red-500">{loadError}</p>
      )}

      {!loadError && filtered.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {search
            ? 'No matches found.'
            : 'No announcements yet. Create your first one!'}
        </p>
      )}

      {favorites.length > 0 && (
        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase text-amber-600 dark:text-amber-400">
            Favorites
          </h3>
          <ul className="space-y-2">
            {favorites.map((a) => (
              <HistoryItem
                key={a.id}
                announcement={a}
                voiceName={voiceMap[a.voice_id] ?? a.voice_id}
                onSelect={onSelect}
                onDelete={onDelete}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </ul>
        </div>
      )}

      {rest.length > 0 && (
        <ul className="max-h-64 space-y-2 overflow-y-auto">
          {rest.map((a) => (
            <HistoryItem
              key={a.id}
              announcement={a}
              voiceName={voiceMap[a.voice_id] ?? a.voice_id}
              onSelect={onSelect}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-700">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full min-h-[44px] items-center justify-between md:hidden"
        aria-expanded={expanded}
      >
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          History ({announcements.length})
        </h2>
        <span>{expanded ? '▲' : '▼'}</span>
      </button>
      <h2 className="mb-2 hidden text-sm font-semibold text-slate-700 dark:text-slate-200 md:block">
        History ({announcements.length})
      </h2>
      <div className={`${expanded ? 'block' : 'hidden'} md:block`}>{content}</div>
    </div>
  );
}
