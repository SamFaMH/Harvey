import type { AnnouncementStyle } from './types';

const VOICE_ID_MAP: Record<string, string> = {
  adam: 'pNInz6obpgDQGcFmaJgB',
  onyx: 'VR6AewLTigWG4xSOukaG',
  nova: 'EXAVITQu4vr4xnSDxMaL',
  sage: 'MF3mGyEYCl7XYWbV9V6O',
  shimmer: 'AZnzlk1XvdvUeBnXmlld',
  echo: 'TxGEqnHWrfWFTfGW9XjX',
};

const STYLE_SETTINGS: Record<
  AnnouncementStyle,
  { stability: number; similarity_boost: number }
> = {
  formal: { stability: 0.75, similarity_boost: 0.8 },
  casual: { stability: 0.5, similarity_boost: 0.75 },
  urgent: { stability: 0.3, similarity_boost: 0.85 },
};

export const ALLOWED_VOICE_IDS = Object.keys(VOICE_ID_MAP);

function estimateDuration(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round((words / 2.5) * 10) / 10);
}

export async function generateAnnouncement(
  text: string,
  voiceId: string,
  style: AnnouncementStyle
): Promise<{ audioUrl: string; duration: number }> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('Invalid ElevenLabs API key');
  }

  const elevenLabsVoiceId = VOICE_ID_MAP[voiceId];
  if (!elevenLabsVoiceId) {
    throw new Error('Invalid voice selected.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: STYLE_SETTINGS[style],
        }),
        signal: controller.signal,
      }
    );

    if (response.status === 401) {
      throw new Error('Invalid ElevenLabs API key');
    }
    if (response.status === 429) {
      throw new Error('API quota exceeded. Try again tomorrow.');
    }
    if (response.status === 400) {
      throw new Error('Text too long. Max 2000 characters.');
    }
    if (!response.ok) {
      throw new Error('Failed to generate audio. Please try again.');
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${base64}`;
    const duration = estimateDuration(text);

    return { audioUrl, duration };
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error('Connection error. Check internet and retry.');
      }
      throw err;
    }
    throw new Error('Connection error. Check internet and retry.');
  } finally {
    clearTimeout(timeout);
  }
}
