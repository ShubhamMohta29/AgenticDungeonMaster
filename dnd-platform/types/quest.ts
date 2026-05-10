export type QuestStatus = 'active' | 'completed' | 'failed' | 'hidden'

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
