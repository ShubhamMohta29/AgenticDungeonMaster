export interface AbilityScores {
  str: number
  dex: number
  con: number
  int: number
  wis: number
  cha: number
}

export interface SpellSlots {
  [level: string]: number
}

export interface Spells {
  known: string[]
  prepared: string[]
  slots: SpellSlots
  slot_max: SpellSlots
}

export interface InventoryItem {
  name: string
  quantity: number
  weight: number
  value: number
  equipped: boolean
  attuned: boolean
  description?: string
  rarity?: 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary'
}

export interface DeathSaves {
  successes: number
  failures: number
}

export interface Character {
  id: string
  campaign_id: string
  user_id: string
  name: string
  race: string
  class: string
  subclass: string | null
  level: number
  xp: number
  hp: number
  max_hp: number
  temp_hp: number
  ac: number
  speed: number
  initiative_bonus: number
  proficiency_bonus: number
  ability_scores: AbilityScores
  saving_throws: Record<string, boolean>
  skills: Record<string, boolean>
  death_saves: DeathSaves
  conditions: string[]
  inventory: InventoryItem[]
  spells: Spells
  features: { name: string; description: string }[]
  backstory: string | null
  notes: string | null
  portrait_url: string | null
  is_alive: boolean
  created_at: string
  updated_at: string
}