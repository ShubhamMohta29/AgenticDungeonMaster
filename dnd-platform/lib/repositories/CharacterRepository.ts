// Façade: domain-level character persistence methods.
// Callers never know whether it's Postgres, a file, or an in-memory store.

import { supabaseAdmin } from '@/lib/supabaseServer'
import type { Character } from '@/types/character'

export const CharacterRepository = {
  /** Fetch all characters for a campaign */
  async findByCampaign(campaignId: string): Promise<Character[]> {
    const { data } = await supabaseAdmin
      .from('characters')
      .select('*')
      .eq('campaign_id', campaignId)
    return (data as Character[]) ?? []
  },

  /** Apply a partial update to a character */
  async update(characterId: string, patch: Partial<Character>) {
    return supabaseAdmin
      .from('characters')
      .update(patch)
      .eq('id', characterId)
  },

  /** Bulk-update HP for a set of characters */
  async bulkUpdateHp(updates: { id: string; hp: number }[]) {
    return Promise.all(
      updates.map(u => supabaseAdmin.from('characters').update({ hp: u.hp }).eq('id', u.id))
    )
  }
}
