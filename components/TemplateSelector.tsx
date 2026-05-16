'use client';

import type { Template } from '@/lib/types';

interface TemplateSelectorProps {
  templates: Template[];
  selected: Template | null;
  onSelect: (template: Template) => void;
}

const TEMPLATE_ICONS: Record<string, string> = {
  airport: '✈️',
  railway: '🚆',
  event: '🎪',
  custom: '✏️',
};

export default function TemplateSelector({
  templates,
  selected,
  onSelect,
}: TemplateSelectorProps) {
  return (
    <nav className="space-y-1" aria-label="Announcement templates">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Templates
      </h2>
      {templates.map((template) => {
        const isActive = selected?.id === template.id;
        const icon = TEMPLATE_ICONS[template.name] ?? '📢';
        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template)}
            className={`flex w-full min-h-[44px] items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <span className="text-lg" aria-hidden>
              {icon}
            </span>
            <span>
              <span className="block text-sm font-medium capitalize">
                {template.name === 'custom' ? 'Custom' : template.name}
              </span>
              <span
                className={`block text-xs ${
                  isActive ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {template.category}
              </span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}
