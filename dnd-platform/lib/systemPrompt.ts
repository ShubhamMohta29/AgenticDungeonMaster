import type { Campaign, WorldState } from '@/types/campaign'
import type { Character } from '@/types/character'
import type { NPC } from '@/types/npc'
import type { Quest } from '@/types/npc'

export interface SystemPromptContext {
  campaign: Campaign
  characters: Character[]
  npcs: NPC[]
  quests: Quest[]
  memorySummary: string
}

/** @deprecated use SystemPromptBuilder for new callers */
export function buildDMSystemPrompt(ctx: SystemPromptContext): string {
  return new SystemPromptBuilder()
    .withCampaign(ctx.campaign)
    .withCharacters(ctx.characters)
    .withQuests(ctx.quests)
    .withNPCs(ctx.npcs)
    .withMemory(ctx.memorySummary)
    .build()
}

/**
 * Builder pattern — assembles a DM system prompt section by section.
 * Each section is one responsibility (SRP).
 * Adding a new section never modifies existing ones (OCP).
 *
 * @example
 * const prompt = new SystemPromptBuilder()
 *   .withCampaign(campaign)
 *   .withCharacters(characters)
 *   .withMemory(summary)
 *   .build()
 */
export class SystemPromptBuilder {
  private sections: string[] = []

  withCampaign(campaign: Campaign): this {
    this.sections.push(`You are an expert Dungeon Master running a D&D 5e campaign. You are creative, dramatic, and deeply reactive to player choices. Every decision the players make should have meaningful consequences.

CAMPAIGN SETTING:
${campaign.setting}

CURRENT WORLD STATE:
${JSON.stringify(campaign.world_state, null, 2)}

CURRENT SCENE:
${campaign.current_scene}`)
    return this
  }

  withCharacters(characters: Character[]): this {
    this.sections.push(`ACTIVE CHARACTERS:
${characters.map(c =>
  `- ${c.name} (${c.race} ${c.class} Level ${c.level}, HP: ${c.hp}/${c.max_hp}${c.conditions.length ? ', Conditions: ' + c.conditions.join(', ') : ''})`
).join('\n')}`)
    return this
  }

  withQuests(quests: Quest[]): this {
    const active = quests.filter(q => q.status === 'active')
    this.sections.push(`ACTIVE QUESTS:
${active.length ? active.map(q => `- ${q.title}: ${q.objectives.filter(o => !o.completed).map(o => o.description).join(', ')}`).join('\n') : 'None yet'}`)
    return this
  }

  withNPCs(npcs: NPC[]): this {
    const alive = npcs.filter(n => n.is_alive)
    this.sections.push(`KNOWN NPCS:
${alive.length ? alive.map(n => `- ${n.name} (${n.disposition}): ${n.description}`).join('\n') : 'None yet'}`)
    return this
  }

  withMemory(summary: string): this {
    if (summary) this.sections.push(`CAMPAIGN HISTORY SUMMARY:\n${summary}`)
    return this
  }

  withOutputRules(): this {
    this.sections.push(`OUTPUT RULES — follow these exactly:
1. Narrate in 2-4 vivid paragraphs. Make the world feel alive. Address characters by name.
2. Always end with a clear situation that prompts the players to act.
3. Never break character or mention being an AI.
4. Embed game events using these XML tags inline in your narration:

For damage:    <game_event type='damage' target='CharacterName' amount='8' damage_type='fire'/>
For healing:   <game_event type='heal' target='CharacterName' amount='12'/>
For XP:        <game_event type='xp' amount='150' reason='Defeated the goblin patrol'/>
For loot:      <loot target='CharacterName' item='Gold' quantity='50'/>
For purchase:  <game_event type='pay' target='CharacterName' item='Gold' quantity='10'/>
For new NPC:   <new_npc name='Brother Aldric' description='A nervous monk' disposition='neutral'/>
For scene:     <scene_update description='A dimly lit tavern with rough-hewn tables.'/>
For combat:    <start_combat monsters='Goblin,Goblin,Hobgoblin'/>
For rolls:     <roll_request character='CharacterName' type='skill' skill='Stealth' dc='14'/>
For quests:    <new_quest title='The Missing Acolyte' description='...' xp_reward='200'/>

5. Only call for rolls when the outcome is genuinely uncertain and the stakes matter.
6. Award XP after meaningful encounters — combat, clever roleplay, quest milestones.
7. Keep tags minimal — only embed what actually happened in the narrative.`)
    return this
  }

  build(): string {
    // If no output rules section was explicitly added, include them by default
    const hasRules = this.sections.some(s => s.startsWith('OUTPUT RULES'))
    if (!hasRules) this.withOutputRules()
    return this.sections.join('\n\n')
  }
}