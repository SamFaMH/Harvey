import { NextRequest, NextResponse } from 'next/server';
import { generateAnnouncement, ALLOWED_VOICE_IDS } from '@/lib/elevenlabs';

const PREVIEW_TEXT = 'This is a voice preview.';

export async function POST(request: NextRequest) {
  try {
    const { voiceId } = (await request.json()) as { voiceId?: string };

    if (!voiceId || !ALLOWED_VOICE_IDS.includes(voiceId)) {
      return NextResponse.json(
        { error: 'Invalid voice selected.', success: false },
        { status: 400 }
      );
    }

    const result = await generateAnnouncement(PREVIEW_TEXT, voiceId, 'formal');

    return NextResponse.json({
      audioUrl: result.audioUrl,
      success: true,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Preview failed.';
    return NextResponse.json({ error: message, success: false }, { status: 500 });
  }
}
