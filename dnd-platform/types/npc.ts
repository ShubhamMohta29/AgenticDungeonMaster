export type NPCDisposition = 'friendly' | 'neutral' | 'hostile' | 'unknown'
export type QuestStatus = 'active' | 'completed' | 'failed' | 'hidden'

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

export interface QuestObjective {
  description: string
  completed: boolean
}

export interface Quest {
  id: string
  campaign_id: string
  title: string
  description: string | null
  status: QuestStatus
  objectives: QuestObjective[]
  xp_reward: number
  loot_reward: { item: string; quantity: number }[]
  giver_npc_id: string | null
  created_at: string
  updated_at: string
}