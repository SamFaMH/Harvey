import { NextRequest, NextResponse } from 'next/server';
import { generateAnnouncement, ALLOWED_VOICE_IDS } from '@/lib/elevenlabs';
import { checkRateLimit } from '@/lib/rate-limit';
import type { AnnouncementStyle } from '@/lib/types';

const STYLES: AnnouncementStyle[] = ['formal', 'casual', 'urgent'];

export async function POST(request: NextRequest) {
  if (!process.env.ELEVENLABS_API_KEY?.trim()) {
    return NextResponse.json(
      {
        error:
          'ElevenLabs API key missing. Save ELEVENLABS_API_KEY in .env.local and restart npm run dev.',
        success: false,
      },
      { status: 503 }
    );
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a minute.', success: false },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { text, voiceId, style } = body as {
      text?: string;
      voiceId?: string;
      style?: string;
    };

    if (!text?.trim()) {
      return NextResponse.json(
        { error: 'Please fill all required fields.', success: false },
        { status: 400 }
      );
    }

    if (text.length > 2000) {
      return NextResponse.json(
        { error: 'Text too long. Max 2000 characters.', success: false },
        { status: 400 }
      );
    }

    if (!voiceId || !ALLOWED_VOICE_IDS.includes(voiceId)) {
      return NextResponse.json(
        { error: 'Invalid voice selected.', success: false },
        { status: 400 }
      );
    }

    if (!style || !STYLES.includes(style as AnnouncementStyle)) {
      return NextResponse.json(
        { error: 'Invalid style selected.', success: false },
        { status: 400 }
      );
    }

    const result = await generateAnnouncement(
      text.trim(),
      voiceId,
      style as AnnouncementStyle
    );

    return NextResponse.json({
      audioUrl: result.audioUrl,
      duration: result.duration,
      success: true,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to generate audio.';
    const status =
      message.includes('quota') || message.includes('Too many')
        ? 429
        : message.includes('API key')
          ? 401
          : message.includes('too long')
            ? 400
            : 500;

    return NextResponse.json({ error: message, success: false }, { status });
  }
}
