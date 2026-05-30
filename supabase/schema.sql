-- InspireAI CRM — Supabase schema
-- Run this in your Supabase SQL editor

-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- ── COMPANIES ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  website     TEXT,
  industry    TEXT,
  size        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own companies" ON companies FOR ALL USING (auth.uid() = user_id);

-- ── CONTACTS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  role        TEXT,
  type        TEXT CHECK (type IN ('lead','prospect','customer')) DEFAULT 'lead',
  company_id  UUID REFERENCES companies(id) ON DELETE SET NULL,
  owner       TEXT DEFAULT 'AR',
  location    TEXT,
  value       NUMERIC DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own contacts" ON contacts FOR ALL USING (auth.uid() = user_id);

-- ── DEALS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deals (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT NOT NULL,
  contact_id  UUID REFERENCES contacts(id) ON DELETE SET NULL,
  stage       TEXT CHECK (stage IN ('lead','qualified','proposal','negotiation','contract','won','lost')) DEFAULT 'lead',
  value       NUMERIC DEFAULT 0,
  owner       TEXT DEFAULT 'AR',
  close_date  DATE,
  position    INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own deals" ON deals FOR ALL USING (auth.uid() = user_id);

-- ── ACTIVITIES ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activities (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type         TEXT CHECK (type IN ('call','email','meeting','note','deal','demo','review')) DEFAULT 'note',
  text         TEXT NOT NULL,
  contact_id   UUID REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id      UUID REFERENCES deals(id) ON DELETE SET NULL,
  owner        TEXT DEFAULT 'AR',
  scheduled_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own activities" ON activities FOR ALL USING (auth.uid() = user_id);

-- ── MESSAGES (Inbox) ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id  UUID REFERENCES contacts(id) ON DELETE CASCADE,
  subject     TEXT NOT NULL,
  preview     TEXT,
  body        TEXT,
  unread      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own messages" ON messages FOR ALL USING (auth.uid() = user_id);

-- ── UPDATED_AT triggers ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER deals_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Enable realtime ──────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE deals;
ALTER PUBLICATION supabase_realtime ADD TABLE contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE activities;
