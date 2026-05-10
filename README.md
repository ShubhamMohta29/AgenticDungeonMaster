# ⚔️ AgenticDungeonMaster

> A multiplayer D&D 5e platform with an AI Dungeon Master. Join a campaign, forge your character, and play through fully narrated adventures — complete with live combat, dice rolls, and a world that remembers what you've done.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)
![Groq](https://img.shields.io/badge/AI-Groq%20%2F%20Llama%203.3-F55036)

---

## Features

- 🧙 **AI Dungeon Master** — Groq (Llama 3.3 70B) narrates your campaign, reacts to player actions, and drives the story autonomously
- ⚔️ **Full D&D 5e combat** — initiative tracking, attack rolls, damage, conditions, temp HP, and monster AI
- 🎲 **Dice rolling** — all standard dice with advantage/disadvantage support
- 🗺️ **World memory** — session history is summarised every 20 messages so context never runs dry on long campaigns
- 👥 **Multiplayer** — multiple players per campaign with live sync via Supabase Realtime
- 🎭 **Human DM mode** — a human DM can type narration while an AI copilot suggests what to say next
- 📜 **Persistent world** — NPCs, quests, scene state, and XP all persist across sessions
- 🔒 **Row Level Security** — every query is scoped to the authenticated user via Supabase RLS

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| State | Zustand |
| Database & Auth | Supabase (PostgreSQL + RLS) |
| Realtime | Supabase Realtime |
| AI — narration | Groq `llama-3.3-70b-versatile` |
| AI — quick tasks | Groq `llama-3.1-8b-instant` |
| AI — DM copilot | Anthropic Claude (wired, optional) |

---

## Getting started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Groq](https://console.groq.com) API key

### 1. Install dependencies

```bash
cd dnd-platform
npm install
```

### 2. Set up environment variables

```bash
cp dnd-platform/.env.example dnd-platform/.env.local
```

Then fill in `dnd-platform/.env.local`:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API *(keep secret)* |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) → API Keys |
| `ANTHROPIC_API_KEY` | Optional — for the human DM copilot |

### 3. Run database migrations

From the `dnd-platform` folder:

```bash
npx supabase db push
```

Or apply manually in order via the Supabase SQL editor:

```
dnd-platform/supabase/migrations/001_users.sql
dnd-platform/supabase/migrations/002_campaigns.sql
dnd-platform/supabase/migrations/003_characters.sql
dnd-platform/supabase/migrations/004_messages.sql
dnd-platform/supabase/migrations/005_game_tables.sql
dnd-platform/supabase/migrations/006_realtime.sql
dnd-platform/supabase/migrations/007_fix_rls.sql
dnd-platform/supabase/migrations/008_fix_rls_recursion.sql
```

### 4. Start the dev server

```bash
cd dnd-platform
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and create your first campaign.

---

## How the AI DM works

```
Player action
     │
     ▼
POST /api/dm
     │  builds system prompt from:
     │  campaign setting · active characters · NPCs · quests · world memory
     │
     ▼
Groq (Llama 3.3 70B)
     │  returns narration + embedded XML game event tags:
     │  <game_event type='damage' target='Aria' amount='8' damage_type='fire'/>
     │  <start_combat monsters='Goblin,Goblin,Hobgoblin'/>
     │
     ▼
parseGameEvents()
     │  strips tags from narration text
     │  extracts structured events
     │
     ▼
applyEvents()
     │  writes HP/XP changes, new NPCs, quest updates,
     │  scene descriptions to the database
     │
     ▼
Supabase Realtime → all connected players see the update instantly
```

Every 20 narration messages a background job summarises the session history so the prompt stays within token limits on long campaigns.

---

## DM modes

| Mode | How it works |
|---|---|
| **AI** | Groq runs the full campaign — players interact and the AI narrates everything |
| **Human** | A human DM types narration; an AI copilot at `/api/dm-console/assist` suggests what to say next |

---

## Repository structure

```
dnd-platform/    Next.js app — all source code, migrations, and config
venv/            Python virtual environment (local tooling, not part of the app)
```

---

## Scripts

From the `dnd-platform` folder:

```bash
npm run dev      # Development server with hot reload
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

---

## Contributing

1. Fork the repo and create a feature branch
2. Make your changes and ensure `npm run lint` passes
3. Open a pull request with a clear description of what changed and why

---

*Built with [Next.js](https://nextjs.org), [Supabase](https://supabase.com), and [Groq](https://groq.com).*
