import type { AnnouncementStyle } from './types';

interface SuggestContext {
  templateType: string;
  fieldValues: Record<string, string>;
  style: AnnouncementStyle;
}

export async function generateAnnouncementText(
  context: SuggestContext
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  const prompt = `Generate a ${context.style} ${context.templateType} public announcement using these values: ${JSON.stringify(context.fieldValues)}. Return only the announcement text, no quotes, max 2000 characters.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
      }),
      signal: controller.signal,
    });

    if (response.status === 401) {
      throw new Error('OpenAI API key invalid.');
    }
    if (response.status === 429) {
      throw new Error('OpenAI rate limit exceeded. Try again later.');
    }
    if (!response.ok) {
      throw new Error('Failed to generate suggestion.');
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new Error('No suggestion returned.');
    }

    return text.slice(0, 2000);
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Connection error. Check internet and retry.');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
