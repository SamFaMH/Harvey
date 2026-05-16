-- Harvey AI Announcer — run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  voice_id TEXT NOT NULL,
  style TEXT NOT NULL CHECK (style IN ('formal', 'casual', 'urgent')),
  template_type TEXT,
  audio_url TEXT,
  audio_duration FLOAT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  template_text TEXT NOT NULL,
  default_voice_id TEXT NOT NULL,
  fields JSONB NOT NULL,
  example_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO templates (name, category, template_text, default_voice_id, fields, example_values) VALUES
(
  'airport',
  'Airport Announcement',
  'Attention passengers. The flight to {{destination}} departing from gate {{gate}} at {{time}} is now {{status}}.',
  'adam',
  '[{"name":"destination","label":"Destination City","type":"text","required":true},{"name":"gate","label":"Gate Number","type":"text","required":true},{"name":"time","label":"Departure Time","type":"time","required":true},{"name":"status","label":"Status","type":"select","options":["boarding now","final boarding","delayed 15 minutes","cancelled"],"required":true}]'::jsonb,
  '{"destination":"New York","gate":"A12","time":"14:30","status":"boarding now"}'::jsonb
),
(
  'railway',
  'Railway Station',
  'Attention passengers. The {{train_type}} service to {{destination}} from platform {{platform}} is {{boarding_status}}. {{delay_message}}',
  'onyx',
  '[{"name":"train_type","label":"Train Type","type":"text","required":true},{"name":"destination","label":"Destination","type":"text","required":true},{"name":"platform","label":"Platform Number","type":"text","required":true},{"name":"boarding_status","label":"Boarding Status","type":"select","options":["now boarding","boarding in 5 minutes","delayed"],"required":true},{"name":"delay_message","label":"Delay Info","type":"text","required":false}]'::jsonb,
  '{"train_type":"Express","destination":"London","platform":"5","boarding_status":"now boarding","delay_message":"Running on time."}'::jsonb
),
(
  'event',
  'Event Venue',
  'Attention everyone. {{event_name}} is {{event_status}}. Location: {{location}}. {{additional_info}}',
  'nova',
  '[{"name":"event_name","label":"Event Name","type":"text","required":true},{"name":"event_status","label":"Status","type":"select","options":["starting in 10 minutes","starting now","in progress","ending soon"],"required":true},{"name":"location","label":"Location/Room","type":"text","required":true},{"name":"additional_info","label":"Additional Info","type":"text","required":false}]'::jsonb,
  '{"event_name":"Tech Conference 2024","event_status":"starting in 10 minutes","location":"Main Hall","additional_info":"Please silence your phones."}'::jsonb
)
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS voices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  accent TEXT,
  gender TEXT,
  language TEXT DEFAULT 'en-US'
);

INSERT INTO voices (id, name, type, accent, gender) VALUES
('adam', 'Adam', 'Professional', 'American', 'Male'),
('onyx', 'Onyx', 'Authoritative', 'American', 'Male'),
('nova', 'Nova', 'Energetic', 'American', 'Female'),
('sage', 'Sage', 'Calm', 'American', 'Female'),
('shimmer', 'Shimmer', 'Bright', 'American', 'Female'),
('echo', 'Echo', 'Deep', 'American', 'Male')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE voices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "Allow public insert announcements" ON announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update announcements" ON announcements FOR UPDATE USING (true);
CREATE POLICY "Allow public delete announcements" ON announcements FOR DELETE USING (true);

CREATE POLICY "Allow public read templates" ON templates FOR SELECT USING (true);
CREATE POLICY "Allow public read voices" ON voices FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_template_type ON announcements(template_type);
CREATE INDEX IF NOT EXISTS idx_announcements_is_favorite ON announcements(is_favorite);
