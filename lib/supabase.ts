import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { FALLBACK_TEMPLATES, FALLBACK_VOICES, isSupabaseConfigured } from './fallback-data';
import type { Announcement, Template, Voice } from './types';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return supabaseInstance;
}

export const CUSTOM_TEMPLATE: Template = {
  id: 'custom',
  name: 'custom',
  category: 'Custom Announcement',
  template_text: '{text}',
  default_voice_id: 'adam',
  fields: [
    {
      name: 'text',
      label: 'Your Announcement',
      type: 'textarea',
      required: true,
    },
  ],
  example_values: { text: 'Type your announcement here...' },
};

export async function getTemplates(): Promise<Template[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return [...FALLBACK_TEMPLATES, CUSTOM_TEMPLATE];
  }

  const { data, error } = await supabase.from('templates').select('*').order('name');

  if (error || !data?.length) {
    return [...FALLBACK_TEMPLATES, CUSTOM_TEMPLATE];
  }

  const templates = data.map((row) => ({
    ...row,
    fields: row.fields as Template['fields'],
    example_values: row.example_values as Record<string, string> | null,
  }));

  return [...templates, CUSTOM_TEMPLATE];
}

export async function getVoices(): Promise<Voice[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return FALLBACK_VOICES;
  }

  const { data, error } = await supabase.from('voices').select('*').order('name');

  if (error || !data?.length) {
    return FALLBACK_VOICES;
  }

  return data as Voice[];
}

export async function getAnnouncements(limit = 20): Promise<Announcement[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    if (
      error.code === 'PGRST205' ||
      error.message.includes('does not exist') ||
      error.message.includes('schema cache')
    ) {
      throw new Error('Database tables missing. Run supabase/schema.sql in Supabase SQL Editor.');
    }
    return [];
  }

  return (data ?? []) as Announcement[];
}

export async function saveAnnouncement(
  payload: Omit<Announcement, 'id' | 'created_at' | 'is_favorite'> & {
    is_favorite?: boolean;
  }
): Promise<Announcement | null> {
  const supabase = getSupabase();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('announcements')
    .insert({
      text: payload.text,
      voice_id: payload.voice_id,
      style: payload.style,
      template_type: payload.template_type,
      audio_url: payload.audio_url,
      audio_duration: payload.audio_duration,
      is_favorite: payload.is_favorite ?? false,
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to save. Please try again.');
  }

  return data as Announcement;
}

export async function toggleFavorite(id: string, current: boolean): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('History requires Supabase. Run schema.sql in your project.');
  }

  const { error } = await supabase
    .from('announcements')
    .update({ is_favorite: !current })
    .eq('id', id);

  if (error) {
    throw new Error('Failed to update favorite.');
  }
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('History requires Supabase. Run schema.sql in your project.');
  }

  const { error } = await supabase.from('announcements').delete().eq('id', id);

  if (error) {
    throw new Error('Failed to delete announcement.');
  }
}

export { isSupabaseConfigured };
