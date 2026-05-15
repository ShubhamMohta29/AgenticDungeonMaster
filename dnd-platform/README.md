# RealmForge — AI-Powered D&D 5e

Play Dungeons & Dragons 5th Edition online with an AI Dungeon Master. No prep, no scheduling around a DM required. Start a campaign with friends in minutes.

**Live app:** deployed on Vercel.

---

## What it does

- **AI Dungeon Master** — Groq Llama 3.3 70B narrates the story, enforces D&D 5e rules, and drives the world in real time based on player actions.
- **Human DM mode** — A person can run the game with an AI copilot (Claude Haiku) suggesting narration.
- **Full D&D 5e rules** — All 12 core classes, 8 races, combat system with initiative/attack rolls/death saves, spell slots, XP and leveling.
- **Real-time multiplayer** — Supabase Realtime keeps all players in sync instantly. No polling.
- **Persistent campaigns** — NPCs, quests, world state, and character progress persist across sessions.
- **Age-gated content** — Content filtering applied automatically based on player date of birth.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.4 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| State | Zustand 5 |
| Database / Auth | Supabase (PostgreSQL + Auth + Realtime) |
| AI — Narration | Groq Llama 3.3 70B |
| AI — Summaries | Groq Llama 3.1 8B Instant |
| AI — DM Copilot | Anthropic Claude Haiku |
| Deployment | Vercel |

---

## Quick start (local)

```bash
cd dnd-platform
npm install
cp .env.example .env.local   # fill in your keys (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Required environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=         # from your Supabase project settings
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # public anon key
SUPABASE_SERVICE_ROLE_KEY=        # secret — server-side only, never exposed to client
GROQ_API_KEY=                     # for AI narration (Llama 3.3 70B + 3.1 8B)
ANTHROPIC_API_KEY=                # for DM copilot (Claude Haiku)
```

`NEXTAUTH_SECRET` and `NEXTAUTH_URL` are legacy remnants and not actively used.

---

## Database setup

The app uses Supabase with 11 SQL migrations in `supabase/migrations/`. Apply them in order via the Supabase dashboard SQL editor or CLI:

```bash
npx supabase db push
```

Key tables: `users`, `campaigns`, `campaign_members`, `characters`, `messages`, `npcs`, `quests`, `world_memory_summaries`, `combat_encounters`.

Row Level Security is enabled on all tables. The service role key (used only in API routes) bypasses RLS. The anon key (used in the browser) is always subject to RLS.

---

## Supabase configuration (required for email confirmation)

In your Supabase project → **Authentication → URL Configuration**, add these to **Redirect URLs**:

```
http://localhost:3000/**
https://your-app.vercel.app/**
```

The email confirmation link uses `window.location.origin` dynamically, so it works on both local dev and production without extra env vars — but Supabase validates the redirect URL against this allowlist.

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/register` | Create account (name, email, password, date of birth) |
| `/login` | Sign in |
| `/auth/callback` | Supabase email confirmation handler → redirects to `/dashboard` |
| `/dashboard` | Campaign list — create or join campaigns |
| `/create-campaign` | Campaign creation wizard |
| `/campaign/[id]/create-character` | Character builder (once per user per campaign) |
| `/campaign/[id]/play` | Main game screen |
| `/campaign/[id]/dm-console` | Human DM only — narration input, AI copilot, party overview |

---

## API routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/dm` | Main AI DM endpoint — builds prompt, calls Groq, parses XML events, applies to DB |
| POST | `/api/dm-console/narrate` | Human DM broadcast — applies game events, pushes to Realtime |
| POST | `/api/dm-console/assist` | Claude Haiku DM copilot suggestion (DM-only, not stored) |
| POST | `/api/campaign/create` | Create campaign + generate invite code |
| POST | `/api/campaign/end` | Generate AI campaign epilogue (Groq 70B) |
| POST | `/api/campaign/archive` | Set campaign status to completed |
| POST | `/api/combat/start` | Roll initiative, create combat encounter |
| POST | `/api/combat/action` | Resolve player combat turn |
| POST | `/api/dice` | Server-authoritative dice roll |
| GET | `/auth/callback` | Supabase email confirmation code exchange |

---

## AI game event system

The AI DM embeds structured XML tags inside its narrative prose. The server parses these tags and applies them atomically to the database before returning the response to clients.

Supported event tags:

```xml
<damage target="CharacterName" amount="8" type="fire" />
<heal target="CharacterName" amount="6" />
<xp amount="150" />
<loot item="Shortsword" rarity="common" />
<condition_add target="CharacterName" condition="poisoned" />
<start_combat monsters="Goblin,Goblin,Hobgoblin" />
<new_npc name="Mira" description="A nervous innkeeper" />
<scene_update description="The party enters the ancient crypt" />
<new_quest title="The Missing Merchant" description="..." xp_reward="200" />
<quest_update title="The Missing Merchant" status="completed" />
<spell_learn target="CharacterName" spell="Fireball" />
```

---

## Content age-gating

Date of birth is collected at registration and stored in `users.date_of_birth`. The AI DM system prompt is modified server-side based on the player's age:

- **Under 16** — no gore, no sexual content, no profanity (child-safe)
- **16–17** — vivid violence allowed, no sexual content
- **18+** — no restriction

This is enforced server-side in `lib/contentRating.ts` + `lib/systemPrompt.ts` and cannot be bypassed by the client.

---

## Key library files

| File | Purpose |
|---|---|
| `lib/supabase.ts` | Browser-side Supabase client |
| `lib/supabaseServer.ts` | Server-side Supabase (service role + auth helpers) |
| `lib/systemPrompt.ts` | Builds the DM system prompt from campaign context |
| `lib/gameEvents.ts` | Parses XML event tags from AI narration |
| `lib/gameEventApplier.ts` | Writes parsed events to Supabase |
| `lib/combatEngine.ts` | D&D 5e combat resolution (attack rolls, crits, death saves) |
| `lib/worldMemory.ts` | Session summarisation (every 20 messages) |
| `lib/monsterAI.ts` | Monster tactical decisions |
| `lib/rateLimiter.ts` | In-memory rate limiter (1 DM call per 3s per campaign) |
| `lib/contentRating.ts` | Age-based content rating from date of birth |
| `lib/dnd5e/classes.ts` | All 12 classes + subclasses + feature descriptions |
| `lib/dnd5e/races.ts` | All 8 races + sub-races + ability bonuses |
| `lib/dnd5e/spells.ts` | Starting spells per class + ~80 SRD spell descriptions |
| `lib/dnd5e/conditions.ts` | All 15 D&D 5e conditions with mechanical effects |
| `lib/dnd5e/leveling.ts` | XP thresholds + level-up logic |
| `lib/dnd5e/monsters.ts` | Monster stat blocks |
| `store/gameStore.ts` | Zustand store — campaign, characters, messages, combat |
| `store/toastStore.ts` | Zustand toast queue (auto-dismiss 4 seconds) |

---

## Design system

Dark-fantasy glass morphism. Dark mode only — `class="dark"` is hardcoded on `<html>`. No ThemeProvider.

- **Background** — `#1a1510` warm near-black with a dungeon background image
- **Accent** — amber/gold only (`#E2C086` highlight, `#B58B4C` main) — never blue or purple
- **Panels** — glass morphism (`rgba(20,14,8,0.52)` + `backdrop-filter: blur(24px)`)
- **Fonts** — Geist Sans (UI), Geist Mono (dice/numbers), Ibarra Real Nova (atmospheric headings)
- **Minimum width** — 1024px (desktop-first; mobile layout is future scope)

See `TXT/DESIGN_BRIEF.txt` for the full design system specification.

---

## What's built vs. what's next

**Complete:** auth, campaigns, character creation, AI DM, game event system, combat, multiplayer realtime sync, human DM console, campaign archive/end flow, toast notifications, age-gating, mana bar, character sheet (all tabs).

**In progress:**
- Spell casting mechanics (`canCastSpell`, `expendSpellSlot`, short/long rest)

**Planned:**
- Level-up UI wizard (logic exists in `lib/dnd5e/leveling.ts`, needs modal UI)
- DM advanced tool panels (NPC manager, quest tracker, monster lookup)
- Equipment/item mechanics (equipping weapons/armour, consumables, attunement)
- Session log page
- Mobile layout

See `TXT/IMPLEMENTATION_PLAN.txt` for the full phase-by-phase breakdown.
