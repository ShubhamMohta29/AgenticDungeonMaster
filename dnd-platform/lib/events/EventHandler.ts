// EventHandler interface (ISP + OCP):
// Each concrete handler is responsible for exactly ONE event type (SRP).
// Adding a new event type never modifies existing handlers — only adds a new class.

import type { SupabaseClient } from '@supabase/supabase-js'

export interface EventContext {
  campaignId: string
  characters: { id: string; name: string; hp: number; max_hp: number; xp: number; inventory?: unknown[] }[]
  db: SupabaseClient
}

export interface EventHandler {
  handle(data: Record<string, string>, context: EventContext): Promise<void>
}
