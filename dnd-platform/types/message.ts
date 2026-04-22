export type MessageType = 'narration' | 'player_action' | 'dice_roll' | 'system' | 'dm_whisper'

export interface DiceRollMetadata {
  notation: string
  rolls: number[]
  modifier: number
  total: number
  dc?: number
  success?: boolean
  skill?: string
  purpose?: string
}

export interface Message {
  id: string
  campaign_id: string
  character_id: string | null
  type: MessageType
  content: string
  metadata: DiceRollMetadata | Record<string, unknown>
  created_at: string
}