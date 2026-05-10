import type { Campaign } from '@/types/campaign'
import type { Character } from '@/types/character'
import type { NPC } from '@/types/npc'
import type { Quest } from '@/types/quest'

export interface SystemPromptContext {
  campaign: Campaign
  characters: Character[]
  npcs: NPC[]
  quests: Quest[]
  memorySummary: string
}

export function buildDMSystemPrompt(ctx: SystemPromptContext): string {
  const { campaign, characters, npcs, quests, memorySummary } = ctx

  return `You are an expert DM for D&D 5e. Narrate 1-2 vivid paragraphs.
SETTING: ${campaign.setting}
SCENE: ${campaign.current_scene}
STATS: ${characters.map(c => `${c.name}(${c.race} ${c.class} Lvl ${c.level}, HP:${c.hp}/${c.max_hp})`).join(', ')}
${memorySummary ? `HISTORY: ${memorySummary}` : ''}

TAGS (Embed inline):
- <game_event type='damage|heal|xp|loot|condition_add|inventory_add|feature_add|rest' target='Name' amount='X' condition='Y' item='Z' reason='...'/>
- <roll_request character='Name' type='skill' skill='Stealth' dc='15' reason='Summary'/>
- <new_npc name='...' description='...'/> <scene_update description='...'/> <start_combat monsters='...'/>

RULES:
1. Always end with a prompt for player action.
2. Only roll for uncertain outcomes.
3. Be reactive and dramatic.`
}