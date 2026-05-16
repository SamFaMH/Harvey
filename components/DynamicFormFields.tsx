'use client';

import type { Template } from '@/lib/types';

interface DynamicFormFieldsProps {
  template: Template | null;
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  errors: Record<string, string>;
  disabled?: boolean;
}

export default function DynamicFormFields({
  template,
  values,
  onChange,
  errors,
  disabled = false,
}: DynamicFormFieldsProps) {
  if (!template) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Select a template to begin.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {template.fields.map((field) => {
        const id = `field-${field.name}`;
        const error = errors[field.name];
        const value = values[field.name] ?? '';

        if (field.type === 'textarea') {
          const len = value.length;
          return (
            <div key={field.name}>
              <label
                htmlFor={id}
                className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                {field.label}
                {field.required && <span className="text-red-500"> *</span>}
              </label>
              <textarea
                id={id}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(field.name, e.target.value)}
                rows={4}
                className="w-full min-h-[100px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
              <p
                className={`mt-1 text-xs ${
                  len > 1800 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'
                }`}
              >
                {len}/2000{len > 1800 ? ' — Getting close to limit' : ''}
              </p>
              {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>
          );
        }

        return (
          <div key={field.name}>
            <label
              htmlFor={id}
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              {field.label}
              {field.required ? (
                <span className="text-red-500"> *</span>
              ) : (
                <span className="text-slate-400"> (optional)</span>
              )}
            </label>
            {field.type === 'select' ? (
              <select
                id={id}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(field.name, e.target.value)}
                className="w-full min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">Select...</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={id}
                type={field.type === 'time' ? 'time' : 'text'}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(field.name, e.target.value)}
                className="w-full min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            )}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>
        );
      })}
    </div>
  );
}

