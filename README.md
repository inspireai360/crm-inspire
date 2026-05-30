# InspireAI · Revenue CRM

Full-stack CRM built with **Next.js 14 · TypeScript · Tailwind CSS · Supabase**.

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styles | Tailwind CSS + CSS variables |
| Backend / Auth | Supabase (PostgreSQL + RLS + Realtime) |
| Drag & drop | @dnd-kit/core + @dnd-kit/sortable |

## Setup

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a new project.

### 2. Run the schema

In the Supabase SQL editor, run the contents of `supabase/schema.sql`.

### 3. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Install & run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), register, and start using the CRM.

### 5. Seed data (optional)

After your first login, run `supabase/seed.sql` in the SQL editor to populate with sample contacts, deals, and activities.

## Features

- **Auth** — Email + password via Supabase Auth, protected by Next.js middleware
- **Dashboard** — Live KPIs, pipeline-by-stage bars, activity feed (Supabase Realtime subscriptions)
- **Contacts** — Full CRUD, search, type filter (lead/prospect/customer), sortable columns
- **Contact Detail** — Sticky sidebar, open deals list, activity timeline, inline note creation
- **Pipeline** — Kanban board with drag & drop (@dnd-kit), real-time stage updates to Supabase
- **Deals** — List view, stage filter tabs, expected value column, sortable
- **Activities** — Type-filtered feed (calls, emails, meetings, notes, deals), upcoming vs recent
- **Reports** — Revenue area chart, win-rate donut, rep leaderboard, deals-by-stage bar chart
- **Inbox** — Two-pane email reader, mark-read on open, links to contact detail
- **Settings** — Profile fields, notification toggles

## Design

Dark mode exactly matching the handoff:
- Background: `#0A0A1A`
- Surfaces: `#111122` / `#1A1A2E` / `#20203a`
- Accent: `#4F6FE8`
- Typography: Inter
