import type { Template, Voice } from './types';

export const FALLBACK_VOICES: Voice[] = [
  { id: 'adam', name: 'Adam', type: 'Professional', accent: 'American', gender: 'Male', language: 'en-US' },
  { id: 'onyx', name: 'Onyx', type: 'Authoritative', accent: 'American', gender: 'Male', language: 'en-US' },
  { id: 'nova', name: 'Nova', type: 'Energetic', accent: 'American', gender: 'Female', language: 'en-US' },
  { id: 'sage', name: 'Sage', type: 'Calm', accent: 'American', gender: 'Female', language: 'en-US' },
  { id: 'shimmer', name: 'Shimmer', type: 'Bright', accent: 'American', gender: 'Female', language: 'en-US' },
  { id: 'echo', name: 'Echo', type: 'Deep', accent: 'American', gender: 'Male', language: 'en-US' },
];

export const FALLBACK_TEMPLATES: Template[] = [
  {
    id: 'fallback-airport',
    name: 'airport',
    category: 'Airport Announcement',
    template_text:
      'Attention passengers. The flight to {{destination}} departing from gate {{gate}} at {{time}} is now {{status}}.',
    default_voice_id: 'adam',
    fields: [
      { name: 'destination', label: 'Destination City', type: 'text', required: true },
      { name: 'gate', label: 'Gate Number', type: 'text', required: true },
      { name: 'time', label: 'Departure Time', type: 'time', required: true },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: ['boarding now', 'final boarding', 'delayed 15 minutes', 'cancelled'],
        required: true,
      },
    ],
    example_values: {
      destination: 'New York',
      gate: 'A12',
      time: '14:30',
      status: 'boarding now',
    },
  },
  {
    id: 'fallback-railway',
    name: 'railway',
    category: 'Railway Station',
    template_text:
      'Attention passengers. The {{train_type}} service to {{destination}} from platform {{platform}} is {{boarding_status}}. {{delay_message}}',
    default_voice_id: 'onyx',
    fields: [
      { name: 'train_type', label: 'Train Type', type: 'text', required: true },
      { name: 'destination', label: 'Destination', type: 'text', required: true },
      { name: 'platform', label: 'Platform Number', type: 'text', required: true },
      {
        name: 'boarding_status',
        label: 'Boarding Status',
        type: 'select',
        options: ['now boarding', 'boarding in 5 minutes', 'delayed'],
        required: true,
      },
      { name: 'delay_message', label: 'Delay Info', type: 'text', required: false },
    ],
    example_values: {
      train_type: 'Express',
      destination: 'London',
      platform: '5',
      boarding_status: 'now boarding',
      delay_message: 'Running on time.',
    },
  },
  {
    id: 'fallback-event',
    name: 'event',
    category: 'Event Venue',
    template_text:
      'Attention everyone. {{event_name}} is {{event_status}}. Location: {{location}}. {{additional_info}}',
    default_voice_id: 'nova',
    fields: [
      { name: 'event_name', label: 'Event Name', type: 'text', required: true },
      {
        name: 'event_status',
        label: 'Status',
        type: 'select',
        options: ['starting in 10 minutes', 'starting now', 'in progress', 'ending soon'],
        required: true,
      },
      { name: 'location', label: 'Location/Room', type: 'text', required: true },
      { name: 'additional_info', label: 'Additional Info', type: 'text', required: false },
    ],
    example_values: {
      event_name: 'Tech Conference 2024',
      event_status: 'starting in 10 minutes',
      location: 'Main Hall',
      additional_info: 'Please silence your phones.',
    },
  },
];

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  return (
    url.length > 0 &&
    key.length > 0 &&
    !url.includes('your-project') &&
    url.startsWith('https://')
  );
}
