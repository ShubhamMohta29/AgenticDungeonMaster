export type CombatStatus = 'active' | 'completed'

export interface Combatant {
  id: string
  name: string
  type: 'player' | 'monster'
  initiative: number
  hp: number
  max_hp: number
  ac: number
  conditions: string[]
  character_id?: string
}

export interface Monster {
  name: string
  cr: number
  hp: number
  max_hp: number
  ac: number
  speed: number
  ability_scores: Record<string, number>
  attacks: { name: string; bonus: number; damage: string; damage_type: string }[]
  special_abilities?: { name: string; description: string }[]
  xp: number
}

export interface CombatEncounter {
  id: string
  campaign_id: string
  status: CombatStatus
  round: number
  turn_order: Combatant[]
  current_turn_index: number
  monsters: Monster[]
  loot_table: { item: string; quantity: number }[]
  created_at: string
  updated_at: string
}