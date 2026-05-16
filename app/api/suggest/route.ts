import { NextRequest, NextResponse } from 'next/server';
import { generateAnnouncementText } from '@/lib/openai';
import type { AnnouncementStyle } from '@/lib/types';

const STYLES: AnnouncementStyle[] = ['formal', 'casual', 'urgent'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateType, fieldValues, style } = body as {
      templateType?: string;
      fieldValues?: Record<string, string>;
      style?: string;
    };

    if (!templateType || !fieldValues || !style || !STYLES.includes(style as AnnouncementStyle)) {
      return NextResponse.json(
        { error: 'Invalid request.', success: false },
        { status: 400 }
      );
    }

    const suggestedText = await generateAnnouncementText({
      templateType,
      fieldValues,
      style: style as AnnouncementStyle,
    });

    return NextResponse.json({ suggestedText, success: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to generate suggestion.';
    return NextResponse.json({ error: message, success: false }, { status: 500 });
  }
}
