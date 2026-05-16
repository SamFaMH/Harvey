import type { Template } from './types';

export function buildAnnouncementText(
  template: Template,
  values: Record<string, string>
): string {
  if (template.id === 'custom') {
    const text = values.text?.trim() ?? '';
    if (text === 'Type your announcement here...') {
      return '';
    }
    return text;
  }

  let text = template.template_text;
  for (const [key, value] of Object.entries(values)) {
    text = text.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value ?? '');
  }
  return text.trim();
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export function exportHistoryCsv(
  announcements: { text: string; voice_id: string; style: string; created_at: string; is_favorite: boolean }[]
): void {
  const header = 'text,voice,style,created_at,favorite\n';
  const rows = announcements
    .map((a) => {
      const text = `"${a.text.replace(/"/g, '""')}"`;
      return `${text},${a.voice_id},${a.style},${a.created_at},${a.is_favorite}`;
    })
    .join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `harvey-history-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
