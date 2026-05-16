export type AnnouncementStyle = 'formal' | 'casual' | 'urgent';

export interface Announcement {
  id: string;
  text: string;
  voice_id: string;
  style: AnnouncementStyle;
  template_type: string | null;
  audio_url: string | null;
  audio_duration: number | null;
  is_favorite: boolean;
  created_at: string;
}

export interface TemplateField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'time' | 'textarea';
  options?: string[];
  required?: boolean;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  template_text: string;
  default_voice_id: string;
  fields: TemplateField[];
  example_values: Record<string, string> | null;
}

export interface Voice {
  id: string;
  name: string;
  type: string;
  accent: string | null;
  gender: string | null;
  language: string;
}

export interface GenerateRequest {
  text: string;
  voiceId: string;
  style: AnnouncementStyle;
}

export interface GenerateResponse {
  audioUrl?: string;
  duration?: number;
  error?: string;
  success?: boolean;
}

export interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface SaveAnnouncementPayload {
  text: string;
  voiceId: string;
  style: AnnouncementStyle;
  templateType: string;
  audioUrl: string;
  audioDuration: number;
}
