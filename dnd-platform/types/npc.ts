export type NPCDisposition = 'friendly' | 'neutral' | 'hostile' | 'unknown'

export interface NPC {
  id: string
  campaign_id: string
  name: string
  description: string | null
  disposition: NPCDisposition
  location: string | null
  notes: string | null
  has_quest: boolean
  is_alive: boolean
  metadata: Record<string, unknown>
  created_at: string
}