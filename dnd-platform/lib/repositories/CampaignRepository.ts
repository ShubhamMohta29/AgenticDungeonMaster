// Façade: hides the details of multi-table Supabase queries behind
// simple, domain-meaningful method names (DIP: routes depend on this, not on the DB client).

import { supabaseAdmin } from '@/lib/supabaseServer'
import type { Campaign, WorldState } from '@/types/campaign'

export const CampaignRepository = {
  /** Fetch a campaign with its full context (characters, npcs, quests) */
  async getWithContext(campaignId: string) {
    const [campaignRes, charactersRes, npcsRes, questsRes] = await Promise.all([
      supabaseAdmin.from('campaigns').select('*').eq('id', campaignId).single(),
      supabaseAdmin.from('characters').select('*').eq('campaign_id', campaignId),
      supabaseAdmin.from('npcs').select('*').eq('campaign_id', campaignId),
      supabaseAdmin.from('quests').select('*').eq('campaign_id', campaignId),
    ])
    return {
      campaign:   campaignRes.data  as Campaign | null,
      characters: charactersRes.data ?? [],
      npcs:       npcsRes.data      ?? [],
      quests:     questsRes.data    ?? [],
    }
  },

  /** Persist a scene description update */
  async updateScene(campaignId: string, description: string) {
    return supabaseAdmin
      .from('campaigns')
      .update({ current_scene: description })
      .eq('id', campaignId)
  },

  /** Persist a world state patch */
  async updateWorldState(campaignId: string, worldState: WorldState) {
    return supabaseAdmin
      .from('campaigns')
      .update({ world_state: worldState })
      .eq('id', campaignId)
  },

  /** Increment the session counter */
  async incrementSession(campaignId: string) {
    const { data } = await supabaseAdmin
      .from('campaigns')
      .select('session_count')
      .eq('id', campaignId)
      .single()
    return supabaseAdmin
      .from('campaigns')
      .update({ session_count: (data?.session_count ?? 0) + 1 })
      .eq('id', campaignId)
  },

  /** Check if user is a member of a campaign */
  async isMember(campaignId: string, userId: string): Promise<boolean> {
    const { data } = await supabaseAdmin
      .from('campaign_members')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('user_id', userId)
      .single()
    return !!data
  }
}
