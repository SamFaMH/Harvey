'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import AudioPlayer from '@/components/AudioPlayer';
import DynamicFormFields from '@/components/DynamicFormFields';
import HistorySidebar from '@/components/HistorySidebar';
import LoadingSpinner from '@/components/LoadingSpinner';
import StylePills from '@/components/StylePills';
import TemplateSelector from '@/components/TemplateSelector';
import Toast from '@/components/Toast';
import VoiceGrid from '@/components/VoiceGrid';
import SetupBanner from '@/components/SetupBanner';
import {
  deleteAnnouncement,
  getAnnouncements,
  getTemplates,
  getVoices,
  isSupabaseConfigured,
  toggleFavorite,
} from '@/lib/supabase';
import type {
  Announcement,
  AnnouncementStyle,
  Template,
  ToastState,
  Voice,
} from '@/lib/types';
import { buildAnnouncementText, exportHistoryCsv } from '@/lib/utils';

export default function HomePage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('adam');
  const [selectedStyle, setSelectedStyle] = useState<AnnouncementStyle>('formal');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [previewText, setPreviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [previewLoading, setPreviewLoading] = useState<string | null>(null);
  const [batchProgress, setBatchProgress] = useState<string | null>(null);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [supabaseOk, setSupabaseOk] = useState(true);

  const showToast = useCallback((message: string, type: ToastState['type']) => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const configured = isSupabaseConfigured();
      setSupabaseOk(configured);

      try {
        const [t, v] = await Promise.all([getTemplates(), getVoices()]);
        if (cancelled) return;
        setTemplates(t);
        setVoices(v);
        if (t.length > 0) {
          const first = t[0];
          setSelectedTemplate(first);
          setFormValues(first.example_values ?? {});
          setSelectedVoice(first.default_voice_id);
        }

        if (configured) {
          try {
            const a = await getAnnouncements(20);
            if (!cancelled) {
              setAnnouncements(a);
              setHistoryError(null);
            }
          } catch (err) {
            if (!cancelled) {
              const msg =
                err instanceof Error ? err.message : 'Failed to load history';
              setHistoryError(msg);
            }
          }
        }
      } catch {
        if (!cancelled) {
          showToast('Failed to load templates. Refresh the page.', 'error');
        }
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const handleTemplateSelect = useCallback((template: Template) => {
    setSelectedTemplate(template);
    setFormValues(template.example_values ?? {});
    setFormErrors({});
    setSelectedVoice(template.default_voice_id);
    setAudioUrl(null);
    setDuration(null);
    setPreviewText('');
  }, []);

  const handleFieldChange = useCallback((name: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const validateForm = useCallback((): boolean => {
    if (!selectedTemplate) return false;
    const errors: Record<string, string> = {};
    const text = buildAnnouncementText(selectedTemplate, formValues);

    for (const field of selectedTemplate.fields) {
      if (field.required && !formValues[field.name]?.trim()) {
        errors[field.name] = 'This field is required';
      }
    }

    if (!text.trim()) {
      errors.text = errors.text ?? 'Announcement text is required';
    }
    if (text.length > 2000) {
      errors.text = 'Text too long. Max 2000 characters.';
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      showToast('Please fill all required fields.', 'error');
      return false;
    }
    return true;
  }, [selectedTemplate, formValues, showToast]);

  const handleGenerate = useCallback(async () => {
    if (!selectedTemplate || !validateForm()) return;

    const text = buildAnnouncementText(selectedTemplate, formValues);
    setPreviewText(text);
    setLoading(true);
    setAudioUrl(null);

    try {
      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceId: selectedVoice,
          style: selectedStyle,
        }),
      });

      const genData = await genRes.json();

      if (!genRes.ok || !genData.success) {
        throw new Error(genData.error ?? 'Failed to generate audio.');
      }

      setAudioUrl(genData.audioUrl);
      setDuration(genData.duration);

      const saveRes = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceId: selectedVoice,
          style: selectedStyle,
          templateType: selectedTemplate.name,
          audioUrl: genData.audioUrl,
          audioDuration: genData.duration,
        }),
      });

      const saveData = await saveRes.json();
      if (!saveRes.ok || !saveData.success) {
        showToast('Failed to save. Please try again.', 'error');
      } else {
        const updated = await getAnnouncements(20);
        setAnnouncements(updated);
        showToast(
          `Announcement ready (${genData.duration?.toFixed(1)}s)`,
          'success'
        );
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Connection failed. Check internet.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [
    selectedTemplate,
    formValues,
    selectedVoice,
    selectedStyle,
    validateForm,
    showToast,
  ]);

  const handleBatchGenerate = useCallback(async () => {
    if (!selectedTemplate || selectedTemplate.id !== 'custom') return;
    const baseText = formValues.text?.trim();
    if (!baseText) {
      showToast('Enter base text for batch generation.', 'error');
      return;
    }

    const variants = [
      baseText,
      `${baseText} Please proceed immediately.`,
      `Attention: ${baseText}`,
      `Important notice: ${baseText}`,
      `Final call: ${baseText}`,
    ].slice(0, 5);

    setLoading(true);
    for (let i = 0; i < variants.length; i++) {
      setBatchProgress(`${i + 1}/5`);
      setFormValues((prev) => ({ ...prev, text: variants[i] }));
      const text = variants[i];
      if (text.length > 2000) continue;

      try {
        const genRes = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voiceId: selectedVoice,
            style: selectedStyle,
          }),
        });
        const genData = await genRes.json();
        if (genRes.ok && genData.success) {
          await fetch('/api/announcements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text,
              voiceId: selectedVoice,
              style: selectedStyle,
              templateType: 'custom',
              audioUrl: genData.audioUrl,
              audioDuration: genData.duration,
            }),
          });
        }
      } catch {
        /* continue batch */
      }
    }

    const updated = await getAnnouncements(20);
    setAnnouncements(updated);
    setBatchProgress(null);
    setLoading(false);
    showToast('Batch generation complete.', 'success');
  }, [selectedTemplate, formValues, selectedVoice, selectedStyle, showToast]);

  const handleSuggest = useCallback(async () => {
    if (!selectedTemplate) return;
    setSuggestLoading(true);
    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateType: selectedTemplate.name,
          fieldValues: formValues,
          style: selectedStyle,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? 'Suggestion failed.');
      }
      setFormValues((prev) => ({ ...prev, text: data.suggestedText }));
      showToast('Suggestion applied. Edit as needed.', 'info');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Suggestion failed.',
        'error'
      );
    } finally {
      setSuggestLoading(false);
    }
  }, [selectedTemplate, formValues, selectedStyle, showToast]);

  const handleVoicePreview = useCallback(
    async (voiceId: string) => {
      setPreviewLoading(voiceId);
      try {
        const res = await fetch('/api/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ voiceId }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error ?? 'Preview failed.');
        }
        setAudioUrl(data.audioUrl);
        setDuration(2);
        showToast('Voice preview playing.', 'info');
      } catch (err) {
        showToast(
          err instanceof Error ? err.message : 'Preview failed.',
          'error'
        );
      } finally {
        setPreviewLoading(null);
      }
    },
    [showToast]
  );

  const handleAnnouncementSelect = useCallback((ann: Announcement) => {
    const template =
      templates.find((t) => t.name === ann.template_type) ??
      templates.find((t) => t.id === 'custom');
    if (template) {
      setSelectedTemplate(template);
    }
    setSelectedVoice(ann.voice_id);
    setSelectedStyle(ann.style);
    setPreviewText(ann.text);
    if (template?.id === 'custom') {
      setFormValues({ text: ann.text });
    }
    setAudioUrl(ann.audio_url);
    setDuration(ann.audio_duration);
    showToast('Loaded from history.', 'info');
  }, [templates, showToast]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteAnnouncement(id);
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        showToast('Deleted', 'success');
      } catch {
        showToast('Failed to delete.', 'error');
      }
    },
    [showToast]
  );

  const handleToggleFavorite = useCallback(
    async (id: string, current: boolean) => {
      try {
        await toggleFavorite(id, current);
        setAnnouncements((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, is_favorite: !current } : a
          )
        );
        showToast(
          current ? 'Removed from favorites' : 'Added to favorites',
          'success'
        );
      } catch {
        showToast('Failed to update favorite.', 'error');
      }
    },
    [showToast]
  );

  const isFormValid = useMemo(() => {
    if (!selectedTemplate) return false;
    const text = buildAnnouncementText(selectedTemplate, formValues);
    if (!text.trim() || text.length > 2000) return false;
    return selectedTemplate.fields
      .filter((f) => f.required)
      .every((f) => formValues[f.name]?.trim());
  }, [selectedTemplate, formValues]);

  if (initialLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <SetupBanner supabaseOk={supabaseOk} supabaseError={historyError} />
      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-64">
          <TemplateSelector
            templates={templates}
            selected={selectedTemplate}
            onSelect={handleTemplateSelect}
          />
          <HistorySidebar
            announcements={announcements}
            voices={voices}
            onSelect={handleAnnouncementSelect}
            onDelete={handleDelete}
            onToggleFavorite={handleToggleFavorite}
            onExportCsv={() => {
              exportHistoryCsv(announcements);
              showToast('History exported.', 'success');
            }}
            loadError={historyError}
          />
        </aside>

        <div className="flex flex-1 flex-col gap-6 lg:grid lg:grid-cols-2">
          <section className="space-y-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {selectedTemplate?.category ?? 'Announcement'}
            </h2>

            {Object.keys(formErrors).length > 0 && (
              <div
                className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
                role="alert"
              >
                Please fix the errors below before generating.
              </div>
            )}

            <DynamicFormFields
              template={selectedTemplate}
              values={formValues}
              onChange={handleFieldChange}
              errors={formErrors}
              disabled={loading}
            />

            {selectedTemplate?.id === 'custom' && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSuggest}
                  disabled={suggestLoading || loading}
                  className="min-h-[44px] rounded-lg border border-blue-600 px-4 py-2 text-sm text-blue-600 disabled:opacity-50 dark:text-blue-400"
                >
                  {suggestLoading ? 'Suggesting...' : 'Suggest Text'}
                </button>
                <button
                  type="button"
                  onClick={handleBatchGenerate}
                  disabled={loading}
                  className="min-h-[44px] rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-slate-600"
                >
                  Batch (5)
                </button>
              </div>
            )}

            <VoiceGrid
              voices={voices}
              selected={selectedVoice}
              onSelect={setSelectedVoice}
              onPreview={handleVoicePreview}
              previewLoading={previewLoading}
            />

            <StylePills
              selected={selectedStyle}
              onSelect={setSelectedStyle}
              disabled={loading}
            />

            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || !isFormValid}
              className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  {batchProgress ? `Generating ${batchProgress}...` : 'Generating...'}
                </>
              ) : (
                'Generate Announcement'
              )}
            </button>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Preview
            </h2>

            {loading && (
              <div className="space-y-2">
                <div className="h-20 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            )}

            {!loading && previewText && (
              <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {previewText}
              </p>
            )}

            <AudioPlayer
              audioUrl={loading ? null : audioUrl}
              duration={duration}
              announcementText={previewText}
              onDownload={() => showToast('Download started.', 'success')}
              onCopyUrl={() => showToast('Copied!', 'success')}
              onCopyText={async () => {
                try {
                  await navigator.clipboard.writeText(previewText);
                  showToast('Text copied!', 'success');
                } catch {
                  showToast('Copy failed.', 'error');
                }
              }}
            />
          </section>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
