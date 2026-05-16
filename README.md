# Harvey — AI Announcer

Professional text-to-speech announcements for airports, railways, and events. Built with Next.js 14, Supabase, and ElevenLabs.

## Quick start

### 1. Install

```bash
npm install
```

### 2. Environment

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `ELEVENLABS_API_KEY` — ElevenLabs API key (server-side only)
- `OPENAI_API_KEY` — optional, for “Suggest Text”

### 3. Database

Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL Editor.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. Pick a template (Airport, Railway, Event, or Custom).
2. Fill in the form fields and choose voice + style.
3. Click **Generate Announcement** — audio plays in the preview panel and saves to history.

## API tests

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"Hello world\",\"voiceId\":\"adam\",\"style\":\"formal\"}"

curl http://localhost:3000/api/announcements
```

## Voice IDs

App voice names (`adam`, `onyx`, etc.) map to ElevenLabs voice IDs in [`lib/elevenlabs.ts`](lib/elevenlabs.ts). Update `VOICE_ID_MAP` if you change voices in ElevenLabs.

## Features

- Template-based announcements with dynamic forms
- Custom free-text announcements (2000 char limit)
- Voice preview, batch generation (5), history search, favorites, CSV export
- Dark mode, mobile-responsive UI
- Practice analyzer at `/practice`
- Optional OpenAI text suggestions

## Deploy

```bash
npm run build
npm run start
```

Set the same environment variables in your hosting provider (Vercel, etc.).
