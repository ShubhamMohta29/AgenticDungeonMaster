export type DMMode = 'ai' | 'human'
export type CampaignStatus = 'active' | 'paused' | 'completed'

export interface Campaign {
  id: string
  name: string
  setting: string
  dm_mode: DMMode
  dm_user_id: string | null
  current_scene: string
  world_state: WorldState
  session_count: number
  status: CampaignStatus
  invite_code: string
  created_at: string
  updated_at: string
}

export interface MapToken {
  id: string
  x: number
  y: number
  name: string
  color: string
  imageUrl?: string
  isPlayer?: boolean
}

export interface MapState {
  gridSize: number // e.g., 20 means 20x20
  tokens: MapToken[]
  backgroundUrl?: string
  fog?: string[] // "x,y" of hidden/revealed cells
}

export interface WorldState {
  calendar?: { day: number; month: string; year: number }
  location?: { region: string; area: string; specific: string }
  factions?: { name: string; relationship: string; notes: string }[]
  major_events?: string[]
  secrets?: string[]
  weather?: string
  economy?: { gold_party_total: number; current_shop: string | null }
  map?: MapState
}

export interface CampaignMember {
  id: string
  campaign_id: string
  user_id: string
  joined_at: string
}