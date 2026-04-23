export type CombatStatus = 'active' | 'completed'

export type CombatState =
  | 'OUT_OF_COMBAT'
  | 'ROLLING_INITIATIVE'
  | 'ACTIVE_COMBAT'
  | 'PLAYER_TURN'
  | 'MONSTER_TURN'
  | 'RESOLVING_ACTION'
  | 'COMBAT_ENDED'

export type ActionType =
  | 'attack'
  | 'cast_spell'
  | 'dash'
  | 'disengage'
  | 'dodge'
  | 'help'
  | 'hide'
  | 'use_item'
  | 'grapple'
  | 'shove'
  | 'end_turn'

export type DamageType =
  | 'slashing' | 'piercing' | 'bludgeoning'
  | 'fire' | 'cold' | 'lightning' | 'thunder'
  | 'acid' | 'poison' | 'necrotic' | 'radiant'
  | 'force' | 'psychic'

export type Condition =
  | 'blinded' | 'charmed' | 'deafened' | 'exhaustion'
  | 'frightened' | 'grappled' | 'incapacitated' | 'invisible'
  | 'paralyzed' | 'petrified' | 'poisoned' | 'prone'
  | 'restrained' | 'stunned' | 'unconscious'

export interface Combatant {
  id: string
  name: string
  type: 'player' | 'monster'
  initiative: number
  hp: number
  max_hp: number
  ac: number
  speed: number
  conditions: Condition[]
  character_id?: string
  has_acted: boolean
  has_bonus_action: boolean
  has_reaction: boolean
}

export interface MonsterAttack {
  name: string
  bonus: number
  damage: string
  damage_type: DamageType
  reach?: number
  description?: string
}

export interface Monster {
  name: string
  cr: number
  hp: number
  max_hp: number
  ac: number
  speed: number
  ability_scores: {
    str: number; dex: number; con: number
    int: number; wis: number; cha: number
  }
  attacks: MonsterAttack[]
  special_abilities?: { name: string; description: string }[]
  damage_resistances?: DamageType[]
  damage_immunities?: DamageType[]
  xp: number
}

export interface TurnAction {
  type: ActionType
  actorId: string
  targetId?: string
  weaponName?: string
  spellName?: string
  itemName?: string
  description?: string
}

export interface ActionResult {
  success: boolean
  description: string
  damage?: number
  healing?: number
  roll?: number
  dc?: number
  events: string[]
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