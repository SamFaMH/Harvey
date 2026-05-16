'use client';

import type { AnnouncementStyle } from '@/lib/types';

interface StylePillsProps {
  selected: AnnouncementStyle;
  onSelect: (style: AnnouncementStyle) => void;
  disabled?: boolean;
}

const STYLES: { id: AnnouncementStyle; label: string }[] = [
  { id: 'formal', label: 'Formal' },
  { id: 'casual', label: 'Casual' },
  { id: 'urgent', label: 'Urgent' },
];

export default function StylePills({ selected, onSelect, disabled }: StylePillsProps) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
        Style
      </h3>
      <div className="flex flex-wrap gap-2">
        {STYLES.map((style) => {
          const isActive = selected === style.id;
          return (
            <button
              key={style.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(style.id)}
              className={`min-h-[44px] rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {style.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

