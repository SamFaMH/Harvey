import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { AnnouncementStyle } from '@/lib/types';

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ announcements: [], success: true });
    }
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ announcements: [], success: true });
    }
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to load history.', success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({ announcements: data ?? [], success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to load history.', success: false },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Supabase not configured. Save .env.local and restart the dev server.', success: false },
        { status: 503 }
      );
    }
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured.', success: false },
        { status: 503 }
      );
    }
    const body = await request.json();
    const { text, voiceId, style, templateType, audioUrl, audioDuration } =
      body as {
        text?: string;
        voiceId?: string;
        style?: string;
        templateType?: string;
        audioUrl?: string;
        audioDuration?: number;
      };

    if (!text?.trim() || !voiceId || !style || !audioUrl) {
      return NextResponse.json(
        { error: 'Please fill all required fields.', success: false },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('announcements')
      .insert({
        text: text.trim(),
        voice_id: voiceId,
        style: style as AnnouncementStyle,
        template_type: templateType ?? 'custom',
        audio_url: audioUrl,
        audio_duration: audioDuration ?? 0,
      })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to save. Please try again.', success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: data.id, success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to save. Please try again.', success: false },
      { status: 500 }
    );
  }
}
